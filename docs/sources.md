# Sisu ja tehniliste otsuste allikad

## Projekti lähteinfo

- omaniku lisatud projektidokument `Meregrupp_diginahtavuse_projekt_I_etapp(1).pdf`;
- kujunduse ja kinnitatud sisu doonor: GitHubi repo `meregrupp-cyber/mgfreediving001-ee`, töö lähtecommit `97e73dc255ee85bb84d48f48ebfeede071806a77`;
- sihtrepo: `meregrupp-cyber/merehunt`.

Doonorist kasutati brändi visuaalset süsteemi, organisatsioonile kuuluvaid pilte, kontakte ja kolme tee sisuloogikat. Vormi-, analüütika-, kampaania- ja teistesse domeenidesse linkimise kihti ei toodud üle.

## Freediving’u vene terminoloogia

Terminoloogilise võrdluse allikas: [Molchanova kooli ja poe venekeelne sait](https://www.shop.molchanova.school/).

Saiti kasutati sõnakasutuse kontrolliks, mitte teksti kopeerimiseks. Avalikus tekstis on eelistatud näiteks `фридайвинг`, `обучение фридайвингу`, `компенсация давления`, `открытая вода`, `напарник`, `страховка на поверхности`, `гидрокостюм`, `ласты`, `маска и трубка`.

## Rummu faktikontroll

Rummu ajaloo kontrollallikas: [Visit Estonia — Rummu quarry](https://visitestonia.com/en/rummu-quarry).

Avalik tekst parafraseerib ainult põhifakti: Rummus tegutsesid lubjakivikarjäär ja vangla ning kaevandamise lõppemise järel täitus ala kiiresti veega, varjates osa rajatisi. Lehel ei avaldata kontrollimata sügavust, nähtavust ega muid muutuvaid arve.

## Tehnilised esmased allikad

- [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Cloudflare Workers Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Google Searchi AI-funktsioonid](https://developers.google.com/search/docs/appearance/ai-features)
- [OpenAI crawler’ite dokumentatsioon](https://developers.openai.com/api/docs/bots)
- [Anthropic crawler’ite dokumentatsioon](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)

Robotipoliitika on teadlikult minimaalne. Google Searchi/AI Overview’de leitavus sõltub Googlebotist, mitte Google-Extended treeningutokenist. `llms.txt` on lisainfo, mitte indekseerimise garantii.

## Fondid

Fondifailid pärinevad Fontsource 5.3.0 pakettidest:

- IBM Plex Sans;
- IBM Plex Mono;
- Source Serif 4.

Iga fondi litsents on `public/assets/fonts/` kataloogis. Test `tests/site.test.mjs` avab WOFF2 failid ja kontrollib vajalike vene ning ladina märkide olemasolu.
