# Lansseerimine ja HTTPS

Sait tarnitakse GitHub Pages'ist. Tokeneid ega saladusi ei ole vaja: deploy'b GitHub Actions ise
ja sertifikaadi väljastab GitHub automaatselt.

## Lähteolukord

Kontroll 2026-08-14 seisuga:

| Kontroll | Tulemus |
|---|---|
| `merehunt.ee` nimeserverid | `dean.ns.cloudflare.com`, `eva.ns.cloudflare.com` |
| `merehunt.ee` A-kirjed | `185.199.108–111.153` — GitHub Pages, õiged |
| `www.merehunt.ee` | CNAME → `meregrupp-cyber.github.io`, õige |
| `http://merehunt.ee/` | GitHub Pages 404 — Pages ei ole selle repo jaoks sisse lülitatud |
| `https://merehunt.ee/` | sertifikaat ei kata hosti — HTTPS ei tööta |

**DNS-i ei ole vaja muuta.** Puudu on ainult see, et Pages ei ole selles repos sisse lülitatud ja
custom domain seadmata, mistõttu GitHub ei ole sertifikaati väljastanud.

## Lansseerimine

### 1. Merge

`main` haru push käivitab `.github/workflows/pages.yml`: `npm ci` → `npm test` → build → deploy.
Esimene deploy võtab paar minutit.

Pages lülitatakse vajadusel sisse jooksu enda poolt (`configure-pages` `enablement: true`),
seega repo seadetes ei ole vaja **Source**-valikut käsitsi teha.

Build kirjutab `dist/CNAME` faili sisuga `merehunt.ee`. Actions-deploy puhul loeb GitHub selle faili
artefaktist ja seab custom domain'i ise, seega domeen püsib iga deploy'ga.

### 2. Custom domain ja HTTPS

Repo → **Settings** → **Pages**:

- **Custom domain** peaks pärast esimest deploy'd juba näitama `merehunt.ee` (tuleb `CNAME` failist).
  Kui ei näita, sisesta see käsitsi ja vajuta **Save**. GitHub kontrollib DNS-i (kirjed on juba
  õiged) ja hakkab sertifikaati väljastama; tavaliselt võtab see mõne minuti, mõnikord kuni tunni.
- Kui sertifikaat on valmis, muutub aktiivseks **Enforce HTTPS** — pane linnuke. See on ainus samm,
  mida API kaudu teha ei saa.

Sellest hetkest suunab GitHub `http://` päringud HTTPS-ile ja `www.merehunt.ee` apexile.

Kui domeen on kirjas mõne teise repo Pages'i seadetes, tuleb see seal enne eemaldada — GitHub lubab
üht custom domain'i korraga ainult ühes repos.

### 3. Kontrolli

```bash
npm run verify:live
```

Kontrollitakse: avaleht 200, CSP meta-tag vastuses, HSTS päis (ehk „Enforce HTTPS" on peal),
HTTP → HTTPS, www → apex, `/forum/` viib `/merehunt/` lehele, kõik viis lehte ja `robots.txt`
ning `sitemap.xml` vastavad 200, tundmatu URL vastab 404. Sama käivitub automaatselt iga deploy
lõpus. Ebaõnnestumisel on iga viga eraldi real ja käsk lõpeb veakoodiga.

## Mida GitHub Pages ei tee

Pages serveerib staatilisi faile ega luba oma vastusepäiseid ega serveripoolseid redirect'e.
Sellest tulenevad kaks lahendust:

- **CSP** on iga lehe `<head>` sees `<meta http-equiv="Content-Security-Policy">` tag'ina.
  `frame-ancestors` on välja jäetud, sest meta-tag'is on see direktiiv niikuinii ignoreeritud.
  Clickjacking'u vastu ei ole seetõttu `X-Frame-Options` kaitset — staatilisel infolehel on see
  väike risk. Ka `upgrade-insecure-requests` on välja jäetud: kõik viited on suhtelised ja Pages
  sunnib HTTPS-i niigi, aga WebKit upgrade'iks selle peale ka kohaliku `http://127.0.0.1` preview
  päringud, mis lõhub `npm run dev` ja brauseritestid.
- **Vana `/forum/*`** ei saa 301-vastust. `/forum/` all on leht, mis suunab `meta refresh` abil
  `/merehunt/` lehele, on `noindex` ja sisaldab ka nähtavat linki, kui suunamine on blokeeritud.
  Sitemap'i see leht ei jõua.

HSTS-i saadab GitHub ise, kui **Enforce HTTPS** on peal.

## Tõrkeotsing

| Sümptom | Põhjus | Lahendus |
|---|---|---|
| Settings → Pages näitab „Domain's DNS record could not be verified" | DNS-i kontroll pole veel jõudnud | oota mõni minut ja vajuta uuesti **Save** |
| **Enforce HTTPS** on hall | sertifikaat on veel väljastamisel | oota kuni tund, siis proovi uuesti |
| Sait vastab 404-ga | deploy ei ole veel läbinud | vaata Actions → Pages jooksu |
| Domeen kaob pärast deploy'd ära | `CNAME` fail puudub build'is | `npm run build && cat dist/CNAME` |
| Custom domain'i ei saa salvestada | domeen on kasutusel teises repos | eemalda see teise repo Pages'i seadetest |
