#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages } from '../content/pages.mjs';
import { BASE, facts, nav, org, routeSummaries, UPDATED } from '../content/site.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');
const distDir = join(root, 'dist');

if (distDir !== join(root, 'dist')) throw new Error('Refusing to clean an unexpected output directory.');
rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });
cpSync(publicDir, distDir, { recursive: true });

// GitHub Pages ei luba oma vastusepäiseid, seetõttu tuleb CSP meta-tag'ina.
// frame-ancestors on meelega välja jäetud: meta-tag'is on see direktiiv niikuinii ignoreeritud.
const CSP = "default-src 'self'; base-uri 'self'; object-src 'none'; img-src 'self' data:; font-src 'self'; style-src 'self'; script-src 'self'; connect-src 'none'; form-action 'none'; upgrade-insecure-requests";

const plain = (value) => String(value).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const attr = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');
const absolute = (path) => `${BASE}${path}`;

function head(page, { indexable = true } = {}) {
  const canonical = absolute(page.path);
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="Content-Security-Policy" content="${CSP}" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${page.title}</title>
  <meta name="description" content="${attr(page.description)}" />
  <meta name="robots" content="${indexable ? 'index, follow, max-image-preview:large, max-snippet:-1' : 'noindex, follow'}" />
  <meta name="author" content="MTÜ Meregrupp" />
  <meta name="theme-color" content="#06131d" />
  ${indexable ? `<link rel="canonical" href="${canonical}" />` : ''}
  <link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  ${indexable ? `<meta property="og:type" content="website" />
  <meta property="og:site_name" content="Merehunt · Meregrupp" />
  <meta property="og:locale" content="ru_RU" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${attr(page.title)}" />
  <meta property="og:description" content="${attr(page.ogDescription)}" />
  <meta property="og:image" content="${absolute('/assets/images/og-image.jpg')}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Meregrupp — обучение фридайвингу в Эстонии" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${attr(page.title)}" />
  <meta name="twitter:description" content="${attr(page.ogDescription)}" />
  <meta name="twitter:image" content="${absolute('/assets/images/og-image.jpg')}" />` : ''}
  <link rel="preload" href="/assets/fonts/source-serif-4-cyrillic-400-normal.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/assets/fonts/ibm-plex-sans-cyrillic-400-normal.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="/assets/css/fonts.css" />
  <link rel="stylesheet" href="/assets/css/site.css" />
  <script src="/assets/js/site.js" defer></script>
</head>`;
}

function header(currentPath = '') {
  const links = nav.map((item) => {
    const current = currentPath === item.href;
    return `<a href="${item.href}"${current ? ' aria-current="page"' : ''}>${item.label}</a>`;
  }).join('');

  return `<a class="skip-link" href="#content">Перейти к содержанию</a>
<header class="site-header">
  <a class="brand" href="/" aria-label="Merehunt — главная">
    <img src="/assets/icons/logo-156.png" width="52" height="52" alt="" />
    <span>Merehunt<small>Meregrupp · Aquatic Academy</small></span>
  </a>
  <nav class="desktop-nav" aria-label="Основная навигация">${links}</nav>
  <a class="btn btn-primary header-contact" href="mailto:${org.email}">Написать</a>
  <details class="nav-drawer">
    <summary>Меню</summary>
    <nav aria-label="Мобильная навигация">${links}<a href="mailto:${org.email}">Написать нам</a></nav>
  </details>
</header>`;
}

function breadcrumb(page) {
  if (page.path === '/') return '';
  return `<nav class="breadcrumb inner" aria-label="Навигационная цепочка" itemscope itemtype="https://schema.org/BreadcrumbList">
  <ol>
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a itemprop="item" href="/"><span itemprop="name">Главная</span></a><meta itemprop="position" content="1" />
    </li>
    <li aria-current="page" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <span itemprop="name">${plain(page.h1)}</span><meta itemprop="item" content="${absolute(page.path)}" /><meta itemprop="position" content="2" />
    </li>
  </ol>
</nav>`;
}

function pageSchema(page) {
  const extra = page.schemaType === 'Service'
    ? '<meta itemprop="areaServed" content="Estonia" /><meta itemprop="serviceType" content="Обучение и сопровождение во фридайвинге" />'
    : '';
  return `<meta itemprop="url" content="${absolute(page.path)}" />
  <meta itemprop="inLanguage" content="ru" />
  <meta itemprop="dateModified" content="${page.updated}" />
  ${extra}`;
}

function hero(page) {
  const orgProp = page.schemaType === 'Course' || page.schemaType === 'Service' ? 'provider' : 'about';
  return `<section class="hero" aria-labelledby="page-title">
  <div class="hero-media">
    <img src="${page.heroImage}" width="800" height="450" fetchpriority="high" decoding="async" alt="${attr(page.heroAlt)}" />
  </div>
  <div class="hero-depth" aria-hidden="true"><span></span><span></span><span></span></div>
  <div class="inner hero-content">
    <p class="hero-org" itemprop="${orgProp}" itemscope itemtype="https://schema.org/Organization"><span itemprop="name">${org.name}</span><meta itemprop="url" content="${BASE}/" /></p>
    <p class="eyebrow">${page.eyebrow}</p>
    <h1 id="page-title" itemprop="name">${page.h1}</h1>
    <p class="hero-lede" itemprop="description">${page.lede}</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="${page.primaryCta.href}">${page.primaryCta.label}</a>
      <a class="btn btn-ghost" href="${page.secondaryCta.href}">${page.secondaryCta.label}</a>
    </div>
  </div>
</section>`;
}

function footer() {
  return `<footer class="site-footer" itemscope itemtype="https://schema.org/Organization">
  <meta itemprop="url" content="${BASE}/" />
  <div class="inner footer-grid">
    <div class="footer-brand">
      <img src="/assets/icons/logo-156.png" width="64" height="64" alt="" />
      <p><strong itemprop="name">${org.name}</strong><span>Фридайвинг в Эстонии</span></p>
      <p class="small muted">Обучение: <span itemprop="knowsLanguage">русский</span> · <span itemprop="knowsLanguage">английский</span></p>
    </div>
    <div>
      <h2>Контакты</h2>
      <p><a itemprop="email" href="mailto:${org.email}">${org.email}</a></p>
      <p><a itemprop="telephone" href="tel:${org.phoneHref}">${org.phone}</a></p>
      <p><a itemprop="sameAs" href="${org.facebook}" target="_blank" rel="noopener noreferrer">Facebook <span aria-hidden="true">↗</span></a></p>
    </div>
    <div itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
      <h2>Адрес</h2>
      <p><span itemprop="streetAddress">${org.address.street}</span><br />
      <span itemprop="addressLocality">${org.address.locality}</span><br />
      <span itemprop="addressRegion">${org.address.region}</span>, <span itemprop="postalCode">${org.address.postalCode}</span><br />
      <span itemprop="addressCountry">${org.address.country}</span></p>
    </div>
    <div>
      <h2>Организация</h2>
      <p><span itemprop="legalName">${org.legalName}</span><br />Рег. код: <span itemprop="identifier">${org.registryCode}</span><br />EHIS ID: <span itemprop="identifier">${org.ehisId}</span></p>
    </div>
  </div>
  <div class="footer-bottom"><span>© 2026 Meregrupp</span><a href="/merehunt/">Фридайвинг и подводная охота</a></div>
</footer>`;
}

function renderPage(page) {
  return `${head(page)}
<body class="page-${page.kind}">
${header(page.path)}
${breadcrumb(page)}
<main id="content" itemscope itemtype="https://schema.org/${page.schemaType}">
  ${pageSchema(page)}
  ${hero(page)}
  ${page.body}
</main>
${footer()}
</body>
</html>
`;
}

function render404() {
  const page = {
    path: '/404.html',
    title: 'Страница не найдена | Merehunt',
    description: 'Такой страницы на merehunt.ee нет.',
    ogDescription: '',
  };
  return `${head(page, { indexable: false })}
<body class="page-404">
${header('')}
<main id="content" class="not-found">
  <div class="not-found-water" aria-hidden="true">404</div>
  <div class="inner narrow">
    <p class="eyebrow">Ошибка 404</p>
    <h1>Эта страница ушла под воду</h1>
    <p class="lede">Возможно, вы открыли старую ссылку Merehunt. На нынешнем сайте можно узнать, как навыки фридайвинга дополняют опыт подводной охоты, или выбрать подходящий формат обучения.</p>
    <div class="hero-actions"><a class="btn btn-primary" href="/">Перейти на главную</a><a class="btn" href="/merehunt/">Фридайвинг и подводная охота</a></div>
  </div>
</main>
${footer()}
</body>
</html>
`;
}

// Vana /forum/* asemel ei saa GitHub Pages'ist 301-vastust, seega tuleb suunata lehe enda seest.
function renderLegacyRedirect() {
  const target = '/merehunt/';
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="Content-Security-Policy" content="${CSP}" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="refresh" content="0; url=${target}" />
  <title>Форум Merehunt переехал | Merehunt</title>
  <meta name="robots" content="noindex, follow" />
  <link rel="stylesheet" href="/assets/css/fonts.css" />
  <link rel="stylesheet" href="/assets/css/site.css" />
</head>
<body class="page-404">
<main id="content" class="not-found">
  <div class="inner narrow">
    <h1>Форум Merehunt больше не работает</h1>
    <p class="lede">Материалы о фридайвинге и подводной охоте собраны на отдельной странице.</p>
    <div class="hero-actions"><a class="btn btn-primary" href="${target}">Открыть страницу</a></div>
  </div>
</main>
</body>
</html>
`;
}

function write(relativePath, contents) {
  const destination = join(distDir, relativePath);
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, contents, 'utf8');
}

for (const page of pages) write(page.output, renderPage(page));
write('404.html', render404());
write('forum/index.html', renderLegacyRedirect());

// GitHub Pages hoiab custom domain'i CNAME failis; ilma selleta kaob domeen deploy'ga ära.
write('CNAME', `${new URL(BASE).hostname}\n`);
write('.nojekyll', '');

write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`);

write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url><loc>${absolute(page.path)}</loc><lastmod>${page.updated}</lastmod></url>`).join('\n')}
</urlset>
`);

write('llms.txt', `# Merehunt — фридайвинг в Эстонии

> Самостоятельный русскоязычный сайт Meregrupp о курсах и практике фридайвинга в Эстонии. Обучение проводится на русском и английском языках.

## Основные страницы

${pages.map((page) => `- ${absolute(page.path)} — ${plain(page.h1)}. ${page.description}`).join('\n')}

## Проверенные факты

- Базовый курс Level 1 для начинающих: ${facts.level1PriceEur} €.
- Для начала предыдущий опыт во фридайвинге не нужен; участник должен уметь плавать и уверенно чувствовать себя в воде.
- Румму предназначен для фридайвера с пройденным обучением и недавней практикой. Проведение зависит от условий.
- Поездку в Эстонию удобно начинать планировать за ${facts.planningHorizon}.
- На сайте нет онлайн-записи и контактных форм. Контакт: ${org.email}, ${org.phone}.

## Три направления

${routeSummaries.map((route) => `- ${route.title}: ${absolute(route.href)} — ${route.fit} ${route.text}`).join('\n')}

Дата обновления: ${UPDATED}.
`);

write('site.webmanifest', JSON.stringify({
  name: 'Merehunt · Фридайвинг в Эстонии',
  short_name: 'Merehunt',
  lang: 'ru',
  start_url: '/',
  display: 'minimal-ui',
  background_color: '#06131d',
  theme_color: '#06131d',
  icons: [
    { src: '/assets/icons/logo-156.png', sizes: '156x156', type: 'image/png' },
    { src: '/assets/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  ],
}, null, 2) + '\n');

const expected = ['index.html', '404.html', 'robots.txt', 'sitemap.xml', 'llms.txt', 'CNAME', 'forum/index.html'];
for (const file of expected) {
  if (!existsSync(join(distDir, file))) throw new Error(`Build did not create ${file}`);
}

console.log(`Built ${pages.length} indexable pages plus 404 into ${distDir}`);
