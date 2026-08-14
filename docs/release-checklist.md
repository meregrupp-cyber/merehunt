# Release checklist

## Enne deploy’d

- `npm ci`
- `npm test`
- `npm run test:e2e`
- CI-s või täisbrauseritega keskkonnas `npm run test:e2e:full`
- `npm run deploy:dry`
- kontrolli `git diff --check`
- kontrolli, et commit ei sisalda `dist/`, `node_modules/`, logisid, testeekraanipilte ega saladusi

## Deploy

- `npx wrangler whoami`
- `npm run deploy`
- oota, kuni custom domain’i sertifikaat ja DNS on aktiivsed

## Live kontroll

```bash
curl -I https://merehunt.ee/
curl -I http://merehunt.ee/
curl -I 'https://www.merehunt.ee/rummu/?source=test'
curl -I 'https://merehunt.ee/forum/forums.php?forum=4'
curl -I https://merehunt.ee/robots.txt
curl -I https://merehunt.ee/sitemap.xml
curl -I https://merehunt.ee/see-peab-olema-404/
```

Oodatav:

- apex HTTPS vastab 200 ja sertifikaat sobib `merehunt.ee` hostiga;
- HTTP suundub HTTPS-ile;
- www suundub 308-ga apexile ning säilitab path’i ja query;
- `/forum/*` suundub 301-ga `/merehunt/` lehele;
- tundmatu URL vastab 404;
- HTML-il ja 404-l on HSTS, CSP, `nosniff`, Referrer-Policy ning Permissions-Policy;
- `robots.txt` lubab indekseerimise ja viitab apex sitemap’ile;
- sitemap’i kõik viis URL-i vastavad 200 ja canonical iseendale;
- avalikus HTML-is pole vorme, jälgimist ega linke keelatud domeenidele;
- e-post, telefon ja Facebook töötavad;
- brauserikonsoolis pole CSP-, asset- ega JavaScripti vigu.

Robotite servavastust kontrolli eraldi Googlebot’i, Bingbot’i, OAI-SearchBot’i ja Claude-SearchBot’i user-agent’iga. Cloudflare võib repo `robots.txt` ette lisada oma hallatud ploki.
