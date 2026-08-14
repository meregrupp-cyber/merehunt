# Sisu ja tehniliste otsuste allikad

## Projekti lähteinfo

- omaniku lisatud projektidokument `Meregrupp_diginahtavuse_projekt_I_etapp(1).pdf`;
- kujunduse ja kinnitatud sisu doonor: GitHubi repo `meregrupp-cyber/mgfreediving001-ee`, töö lähtecommit `97e73dc255ee85bb84d48f48ebfeede071806a77`;
- sihtrepo: `meregrupp-cyber/merehunt`.

Doonorist kasutati brändi visuaalset süsteemi, organisatsioonile kuuluvaid pilte, kontakte ja kolme tee sisuloogikat. Vormi-, analüütika-, kampaania- ja teistesse domeenidesse linkimise kihti ei toodud üle.

## Freediving’u vene terminoloogia

Terminoloogilise võrdluse allikas: [Molchanova kooli ja poe venekeelne sait](https://www.shop.molchanova.school/).

Saiti kasutati sõnakasutuse kontrolliks, mitte teksti kopeerimiseks. Avalikus tekstis on eelistatud näiteks `фридайвинг`, `обучение фридайвингу`, `компенсация давления`, `открытая вода`, `напарник`, `страховка на поверхности`, `гидрокостюм`, `ласты`, `маска и трубка`.

## Hinge kinni hoidmise ja allveejahi ohutus

- [Molchanova kool — „Фридайвинг на суше“](https://molchanova.school/tpost/c3h83j1pr1-fridaiving-na-sushe): venekeelsed terminid `потеря сознания (блэкаут)`, `гипоксия`, ohutu treeningu korraldus ja partnerlus;
- [Molchanovs — väljaõppinud turvapaari nõuded](https://www.molchanovs.com/blogs/latest/5-things-you-absolutely-need-from-a-freediving-buddy): üksnes kaaslase kohalolekust ei piisa; turvapaar vajab väljaõpet ning päästepraktikat;
- [Divers Alert Network — spearfishing safety](https://dan.org/alert-diver/article/public-safety-announcement-spearfishing-safety/): korduvad hinge kinni hoides sukeldumised allveejahil võivad soodustada blackout’i; soovitatud on tähelepanelik turvapaar ja freediving’u väljaõpe.

Avalik tekst ei väida, et teooria või kursus kõrvaldab blackout’i ohu. Sõnastus piirneb riski mõistmise, ohtlike stsenaariumide vältimise ning praktiliste turva- ja abistamisoskuste õppimisega.

## Rummu faktikontroll

Rummu ajaloo kontrollallikas: [Visit Estonia — Rummu quarry](https://visitestonia.com/en/rummu-quarry).

Avalik tekst parafraseerib ainult põhifakti: Rummus tegutsesid lubjakivikarjäär ja vangla ning kaevandamise lõppemise järel täitus ala kiiresti veega, varjates osa rajatisi. Lehel ei avaldata kontrollimata sügavust, nähtavust ega muid muutuvaid arve.

## Tehnilised esmased allikad

- [GitHub Pages — custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [GitHub Pages — HTTPS enforcement](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)
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
