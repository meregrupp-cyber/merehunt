# Merehunt.ee

Iseseisev venekeelne Meregrupi freediving’u veeb domeenile `merehunt.ee`. Avalik sait tutvustab algkursust, sobiva ettevalmistusega osaleja Rummu sukeldumist ja Eestisse freediving’u reisi planeerimist. Koolitust saab läbi viia vene või inglise keeles.

Sait ei sõltu teistest Meregrupi veebidest. Avalikus build’is ei ole kontaktvorme, analüütikat, küpsiseid, kampaaniakoode ega kolmanda osapoole runtime-sõltuvusi. Ainus väline HTTP(S)-link on Meregrupi Facebooki leht; kontaktiks kasutatakse lisaks `mailto:` ja `tel:` linke.

## Lehed

| URL | Ülesanne |
|---|---|
| `/` | venekeelne koduleht ja kolme tee valik |
| `/kurs-fridajvinga/` | algaja Level 1 kursus |
| `/rummu/` | ettevalmistusega freediver’i Rummu sukeldumine |
| `/poezdka-v-estoniyu/` | Eestisse reisi planeerimine |
| `/merehunt/` | allveejahi huvilisele suunatud freediving’u oskuste ja ohutuse maandumisleht |
| `404.html` | venekeelne päris 404 |

Vana teadaolev `/forum/*` URL-muster suunatakse 301-ga `/merehunt/` lehele. Tundmatuid URL-e ei suunata avalehele; need jäävad 404-ks.

## Tehniline lahendus

- Node.js-i enda moodulitel põhinev staatiline generaator;
- üks faktide allikas `content/site.mjs`;
- lehtede sisu ja metaandmed `content/pages.mjs`;
- build-skript `tools/build.mjs`;
- Cloudflare Workers Static Assets koos väikese delivery Workeriga `src/worker.mjs`;
- build-output `dist/` (gitignore’is);
- kohalikud IBM Plex Sans, IBM Plex Mono ja Source Serif 4 kirillitsa/ladina WOFF2 alamkomplektid;
- nähtava sisuga kattuvad Schema.org mikroandmed ilma inline JSON-LD-ta;
- range CSP ja muud turvapäised Workerist;
- sitemap, robots, `llms.txt` ja web manifest genereeritakse build’i käigus.

Worker teeb ainult tarnekihi tööd: HTTPS/www canonical-redirect, kontrollitud legacy-redirect, turvapäised ning staatiliste varade serveerimine. See ei ole vormi- ega andmebackend.

## Kohalik töö

Nõuded: Node.js 22 või uuem.

```bash
npm ci
npm run build
npm test
```

Staatiline preview ilma Wranglerita:

```bash
node tools/serve.mjs
```

Cloudflare’i kohalik preview:

```bash
npm run dev
```

## Brauseritestid

Linuxis saab repo npm-paketina kaasatava headless Chromiumiga käivitada kiire mobiili- ja desktop-testi:

```bash
npm run test:e2e
```

Kõigi Playwrighti mootoritega kontroll (Chromium, Firefox, WebKit):

```bash
npx playwright install --with-deps chromium firefox webkit
npm run test:e2e:full
```

GitHub Actions kasutab täisvarianti. Ekraanipildid kirjutatakse lokaalselt `test-results/` kataloogi, mida ei commit’ita.

## Sisu muutmine

Ühiseid fakte muuda ainult `content/site.mjs` failis. Seal asuvad kontaktid, juriidilised andmed, kinnitatud Level 1 hind, keeled ja planeerimishorisont. Lehetekst, title, description, H1 ja canonical path asuvad `content/pages.mjs` failis.

Pärast muudatust käivita alati:

```bash
npm test
npm run test:e2e
```

Testid peatavad build’i, kui avalikku väljundisse jõuab vorm, jälgimiskood, inline script/style, vana vastuselubadus, keelatud domeenilink, katkine siselink, puuduva kirillitsaga font või sitemap’i/canonical’i vastuolu.

Kinnitamata kuupäeva, kestust, hinda, sertifikaati, vanusepiiri või kvalifikatsiooni ei lisata kohatäitena. Event schema lisatakse alles koos päris avaliku sündmuse, kuupäeva ja nähtava sisuga.

## Cloudflare’i deploy

Konfiguratsioon on `wrangler.jsonc` failis. See seob Workeri custom domain’idega `merehunt.ee` ja `www.merehunt.ee`; www suunatakse Workerist apexile.

Deploy on kahefaasiline, et domeeni ei saaks kogemata üle võtta:

```bash
npx wrangler whoami
npm run deploy:dry             # preview, ei puuduta merehunt.ee DNS-i
npm run deploy
npm run deploy:production:dry  # custom domain'id merehunt.ee ja www.merehunt.ee
npm run deploy:production
```

Top-level konfiguratsioonis ei ole ühtegi route’i; custom domain’id on ainult `env.production` all.
Preview-hostil lisab Worker vastusele `X-Robots-Tag: noindex, nofollow`.

Tokenit ei salvestata reposse. CI-s teeb deploy’d `.github/workflows/deploy.yml`, mis käivitub `main`
haru push’il või käsitsi ning kasutab GitHubi salajasi väärtusi `CLOUDFLARE_API_TOKEN` ja
`CLOUDFLARE_ACCOUNT_ID`. Faas tuleb workflow sisendist või repo muutujast `DEPLOY_PHASE`,
vaikimisi `preview`. `ci.yml` build ja testid töötavad edasi ilma Cloudflare’i saladusteta.

## HTTPS

Tsooni HTTPS-seaded lülitatakse sisse skriptiga, mitte käsitsi klikkides:

```bash
CLOUDFLARE_API_TOKEN=... npm run https:check    # ainult kontroll
CLOUDFLARE_API_TOKEN=... npm run https:enable   # rakendab
npm run verify:live                             # live-kontroll pärast deploy'd
```

Skript seab Full (strict) režiimi, Always Use HTTPS-i, Automatic HTTPS Rewrites’i, minimaalse
TLS 1.2 ja TLS 1.3 ning aastase HSTS-i koos alamdomeenidega. HTTPS-i sund on kahekihiline: lisaks
tsooni seadetele suunab ka Worker ise HTTP ja www päringud 308-ga apexi HTTPS-ile. Domeeni
üleviimine, tokeni õigused ja tõrkeotsing on kirjas failis `docs/https-setup.md`.

Pärast deploy’d järgi `docs/release-checklist.md` kontrolli. Sisu päritolu ja terminoloogiaallikad on failis `docs/sources.md` ning avalike väidete piirid failis `docs/content-policy.md`.
