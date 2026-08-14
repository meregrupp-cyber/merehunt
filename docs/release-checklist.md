# Release checklist

## Enne deploy’d

- `npm ci`
- `npm test`
- `npm run test:e2e`
- CI-s või täisbrauseritega keskkonnas `npm run test:e2e:full`
- kontrolli `git diff --check`
- kontrolli, et commit ei sisalda `dist/`, `node_modules/`, logisid, testeekraanipilte ega saladusi

## Deploy

- merge `main` haru — `.github/workflows/pages.yml` teeb build'i ja deploy'b Pages'i
- esimesel korral: Settings → Pages → Source `GitHub Actions`, custom domain `merehunt.ee`,
  linnuke **Enforce HTTPS** (vt `docs/launch.md`)
- oota, kuni Actions → Pages jooks on roheline

## Live kontroll

Automaatne kontroll käib kogu alloleva loendi HTTP-osa läbi:

```bash
npm run verify:live
```

Käsitsi samad päringud:

```bash
curl -I https://merehunt.ee/
curl -I http://merehunt.ee/
curl -I https://www.merehunt.ee/
curl -I https://merehunt.ee/forum/
curl -I https://merehunt.ee/robots.txt
curl -I https://merehunt.ee/sitemap.xml
curl -I https://merehunt.ee/see-peab-olema-404/
```

Oodatav:

- apex HTTPS vastab 200 ja sertifikaat sobib `merehunt.ee` hostiga;
- HTTP suundub HTTPS-ile;
- www suundub apexile;
- `/forum/` vastab 200 ja suunab `meta refresh` abil `/merehunt/` lehele;
- tundmatu URL vastab 404;
- vastusel on GitHubi HSTS päis ja HTML-i `<head>` sees CSP meta-tag;
- `robots.txt` lubab indekseerimise ja viitab apex sitemap’ile;
- sitemap’i kõik viis URL-i vastavad 200 ja canonical iseendale;
- avalikus HTML-is pole vorme, jälgimist ega linke keelatud domeenidele;
- e-post, telefon ja Facebook töötavad;
- brauserikonsoolis pole CSP-, asset- ega JavaScripti vigu.

Robotite servavastust kontrolli eraldi Googlebot’i, Bingbot’i, OAI-SearchBot’i ja Claude-SearchBot’i user-agent’iga.
