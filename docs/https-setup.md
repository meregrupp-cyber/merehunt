# HTTPS ja lansseerimine

Selle dokumendi ülesanne on viia `merehunt.ee` GitHub Pages’i pealt Cloudflare Workers’ile ja lülitada
sisse töötav HTTPS. Kõik sammud on korratavad ja kontrollitavad.

## Lähteolukord

Kontroll 2026-08-14 seisuga:

| Kontroll | Tulemus |
|---|---|
| `merehunt.ee` nimeserverid | `dean.ns.cloudflare.com`, `eva.ns.cloudflare.com` — tsoon on juba Cloudflare’is |
| `merehunt.ee` A-kirjed | `185.199.108–111.153` — GitHub Pages, mitte Cloudflare Workers |
| `www.merehunt.ee` | CNAME → `meregrupp-cyber.github.io` |
| `http://merehunt.ee/` | 200-asemel GitHub Pages 404, `server: GitHub.com` |
| `https://merehunt.ee/` | sertifikaat ei kata hosti `merehunt.ee` — HTTPS ei tööta |
| Cloudflare’i kontos olevad Workerid | 0 — seda saiti ei ole veel deploy’tud |

HTTPS ei ole seega „katki“ vaid puudub: domeen osutab endiselt vanale GitHub Pages’i sihtkohale,
millel ei ole `merehunt.ee` jaoks sertifikaati. HTTPS lülitub sisse siis, kui domeen osutab
Cloudflare’i Workerile ja tsooni HTTPS-seaded on peal.

## Nõutav Cloudflare’i token

Loo Cloudflare’is API-token (My Profile → API Tokens → Create Token → Custom token) õigustega:

| Ulatus | Õigus | Milleks |
|---|---|---|
| Account | Workers Scripts: Edit | Workeri deploy |
| Zone (`merehunt.ee`) | Workers Routes: Edit | custom domain’ide sidumine |
| Zone (`merehunt.ee`) | Zone: Read | tsooni leidmine |
| Zone (`merehunt.ee`) | Zone Settings: Edit | HTTPS-seadete sisselülitamine |
| Zone (`merehunt.ee`) | DNS: Edit | vanade GitHub Pages’i kirjete asendamine |
| Zone (`merehunt.ee`) | SSL and Certificates: Edit | custom domain’i sertifikaadi väljastus |

Tokenit ei salvestata reposse. CI kasutab GitHubi salajasi väärtusi `CLOUDFLARE_API_TOKEN` ja
`CLOUDFLARE_ACCOUNT_ID` (Settings → Secrets and variables → Actions).

## Lansseerimine kahes faasis

Domeen jääb esialgu GitHub Pages’i peale, seetõttu on lansseerimine jagatud kaheks. Kumbki faas
on eraldi käivitatav ja teine ei juhtu kogemata: `wrangler.jsonc` top-level konfiguratsioonis ei ole
ühtegi route’i, custom domain’id on ainult `env.production` all.

| Faas | Käsk | Mida puudutab |
|---|---|---|
| preview | `npm run deploy` | ainult `merehunt-ru.<subdomain>.workers.dev` |
| production | `npm run deploy:production` | custom domain’id `merehunt.ee` ja `www.merehunt.ee` |

### Faas 1 — preview (DNS jääb puutumata)

```bash
npx wrangler whoami
npm test
npm run deploy:dry
npm run deploy
npm run verify:live -- --base=https://merehunt-ru.<subdomain>.workers.dev
```

Sait läheb elama workers.dev aadressil, `merehunt.ee` vastab endiselt GitHub Pages’ist ja midagi
avalikult ei muutu. Worker lisab mitte-canonical hostidel vastusele `X-Robots-Tag: noindex, nofollow`,
nii et preview ei jõua otsingutulemustesse. CI teeb sama automaatselt igal `main` haru push’il.

### Faas 2 — cutover (domeen läheb Workerile)

1. **Vabasta DNS.** Cloudflare’i DNS-vaates kustuta `merehunt.ee` neli GitHub Pages’i A-kirjet ja
   `www.merehunt.ee` CNAME-kirje. Ilma selleta ei saa Wrangler custom domain’i luua — Cloudflare
   keeldub olemasoleva kirje ülekirjutamisest. Kui domeen on seotud GitHub Pages’i projektiga,
   eemalda seal custom domain, et Pages ei taastaks kirjeid.
2. **Deploy production’isse.**

   ```bash
   npm run deploy:production:dry
   npm run deploy:production
   ```

   Wrangler loob custom domain’id `merehunt.ee` ja `www.merehunt.ee` ning lisab vajalikud proxy’tud
   DNS-kirjed. Sertifikaadi väljastus võtab tavaliselt mõne minuti, kuni umbes 15.
3. **Lülita HTTPS sisse** (järgmine peatükk) ja käivita `npm run verify:live`.

CI-s teeb sama töö `.github/workflows/deploy.yml`. Faas valitakse workflow käivitamisel
(Actions → Deploy → Run workflow → `production`) või püsivalt repo muutujaga `DEPLOY_PHASE`.
Vaikeväärtus on `preview`, seega `main` haru push ei saa domeeni kogemata üle võtta.

## Lülita HTTPS sisse

```bash
CLOUDFLARE_API_TOKEN=... npm run https:enable
```

Skript `tools/cloudflare-https.mjs` seab tsoonis:

- SSL/TLS režiim **Full (strict)** — Cloudflare’i ja Workeri vahel kehtiv sertifikaat;
- **Always Use HTTPS** — HTTP-päring suunatakse HTTPS-ile juba serva peal, enne Workerit;
- **Automatic HTTPS Rewrites**;
- **minimaalne TLS 1.2** ja **TLS 1.3** sees;
- **HSTS** üheks aastaks koos alamdomeenidega, `preload` väljas.

Skript on idempotentne: juba korras seaded jäetakse puutumata. Ainult kontrolliks:

```bash
CLOUDFLARE_API_TOKEN=... npm run https:check
```

Seaded mõjutavad ainult Cloudflare’i kaudu proxy’tud liiklust. Seni kuni `merehunt.ee` osutab
DNS-only kirjetega GitHub Pages’ile, ei muuda skript avalikku käitumist — see valmistab cutover’i
ette. Päriselt hakkab HTTPS domeenil tööle faasis 2.

`preload` jäetakse teadlikult välja. Preload-nimekirja kandmine on praktikas raskesti tagasi
pööratav ja seob kogu `merehunt.ee` tsooni, sealhulgas tulevased alamdomeenid, igaveseks HTTPS-iga.
Lülita see sisse alles siis, kui apex ja kõik alamdomeenid on kuude kaupa stabiilselt HTTPS-il.

## Kontrolli tulemust

```bash
npm run verify:live
```

`tools/verify-live.mjs` käib läbi `docs/release-checklist.md` live-kontrolli: apex 200,
HTTP → HTTPS, www → apex 308 koos path’i ja query’ga, `/forum/*` → `/merehunt/` 301,
kõik viis sitemap’i URL-i 200, tundmatu URL 404 ning HSTS, CSP ja ülejäänud turvapäised olemas.
Ebaõnnestumisel on väljundis iga vigane kontroll eraldi real ja käsk lõpeb veakoodiga.

## Kahekihiline HTTPS-sund

HTTPS on jõustatud kahes kohas ja mõlemad on vajalikud:

1. **Cloudflare’i serv** — Always Use HTTPS vastab HTTP-päringule enne, kui see Workerini jõuab.
2. **Worker** (`src/worker.mjs`) — suunab 308-ga HTTPS-i ja apexi peale ning lisab igale vastusele
   HSTS-i, CSP `upgrade-insecure-requests` direktiiviga ja ülejäänud turvapäised.

Teine kiht katab olukorra, kus tsooni seade on kogemata välja lülitatud või Worker vastab mõne muu
route’i kaudu. Seetõttu ei tohi Workeri redirect’i eemaldada ka pärast tsooni seadete sisselülitamist.

## Tõrkeotsing

| Sümptom | Põhjus | Lahendus |
|---|---|---|
| `wrangler deploy` teatab, et DNS-kirje on olemas | vanad GitHub Pages’i kirjed alles | tee samm 1 |
| Sait vastab endiselt GitHub Pages’i 404-ga | vana kirje veel vahemälus | oota TTL 300 s, siis kontrolli uuesti |
| Sertifikaadi viga kohe pärast deploy’d | custom domain’i sertifikaat on väljastamisel | oota kuni ~15 min, siis `npm run verify:live` |
| `https:enable` vastab `Zone Settings: Edit` veaga | tokenil puudub õigus | lisa tokenile puuduv õigus |
| `verify-live` kurdab HSTS-i puudumise üle | vastus tuli mitte-Workeri sihtkohalt | kontrolli, et apex osutab Workerile |
