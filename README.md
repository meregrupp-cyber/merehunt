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

Vana teadaolev `/forum/` URL suunatakse `/merehunt/` lehele. Tundmatuid URL-e ei suunata avalehele; need jäävad 404-ks.

## Tehniline lahendus

- Node.js-i enda moodulitel põhinev staatiline generaator;
- üks faktide allikas `content/site.mjs`;
- lehtede sisu ja metaandmed `content/pages.mjs`;
- build-skript `tools/build.mjs`;
- tarne GitHub Pages'ist, deploy `.github/workflows/pages.yml` kaudu;
- build-output `dist/` (gitignore’is);
- kohalikud IBM Plex Sans, IBM Plex Mono ja Source Serif 4 kirillitsa/ladina WOFF2 alamkomplektid;
- nähtava sisuga kattuvad Schema.org mikroandmed ilma inline JSON-LD-ta;
- range CSP iga lehe `<head>` sees meta-tag'ina;
- sitemap, robots, `llms.txt` ja web manifest genereeritakse build’i käigus.

Tarnekiht on GitHub Pages: HTTPS-i sund, www → apex suunamine ja sertifikaat tulevad GitHubilt, ülejäänu on staatilised failid. Backendi ei ole.

## Kohalik töö

Nõuded: Node.js 22 või uuem.

```bash
npm ci
npm run build
npm test
```

Kohalik preview:

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

## Deploy ja HTTPS

Sait tarnitakse GitHub Pages'ist. Tokeneid ega repo saladusi ei ole vaja.

1. Repo → **Settings** → **Pages** → **Source:** `GitHub Actions`.
2. `main` haru push käivitab `.github/workflows/pages.yml`: `npm ci` → `npm test` → build → deploy.
3. Repo → **Settings** → **Pages** → **Custom domain:** `merehunt.ee` → **Save**, seejärel pane
   linnuke **Enforce HTTPS** (aktiveerub, kui GitHub on sertifikaadi väljastanud).

DNS on juba õige: apex osutab GitHub Pages'i IP-dele ja `www` on CNAME `meregrupp-cyber.github.io`
peale. Build kirjutab `dist/CNAME` faili, seega custom domain püsib iga deploy'ga.

HTTPS-i sund, `www` → apex suunamine ja sertifikaat tulevad GitHubilt. Kuna Pages ei saada
omi vastusepäiseid, on CSP iga lehe `<head>` sees meta-tag'ina ja vana `/forum/` suunab
`meta refresh` abil. Sammud, piirangud ja tõrkeotsing on failis `docs/launch.md`.

Live-kontroll pärast deploy'd (käivitub ka automaatselt CI-s):

```bash
npm run verify:live
```

Pärast deploy’d järgi `docs/release-checklist.md` kontrolli. Sisu päritolu ja terminoloogiaallikad on failis `docs/sources.md` ning avalike väidete piirid failis `docs/content-policy.md`.
