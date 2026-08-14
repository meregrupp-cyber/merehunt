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
| `/merehunt/` | vana poe ja foorumi külastaja üleminekuleht |
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

Autenditud keskkonnas:

```bash
npx wrangler whoami
npm run deploy:dry
npm run deploy
```

Tokenit ei salvestata reposse. GitHubi CI ei deploy production’isse ega vaja Cloudflare’i saladusi.

Pärast deploy’d järgi `docs/release-checklist.md` kontrolli. Sisu päritolu ja terminoloogiaallikad on failis `docs/sources.md` ning avalike väidete piirid failis `docs/content-policy.md`.
