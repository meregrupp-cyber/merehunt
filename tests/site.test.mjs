import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { openSync } from 'fontkit';
import { pages } from '../content/pages.mjs';
import { BASE, org } from '../content/site.mjs';

const root = resolve(new URL('../dist/', import.meta.url).pathname);
const read = (file) => readFileSync(join(root, file), 'utf8');
const htmlFiles = [...pages.map((page) => page.output), '404.html'];

test('all indexable pages have unique Russian metadata and self canonicals', () => {
  const titles = new Set();
  const descriptions = new Set();

  for (const page of pages) {
    const html = read(page.output);
    assert.match(html, /<html lang="ru">/);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${page.output} H1 count`);
    assert.match(html, new RegExp(`<link rel="canonical" href="${BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}${page.path}"`));
    assert.doesNotMatch(html, /<meta name="robots" content="noindex/);

    const title = html.match(/<title>(.*?)<\/title>/)?.[1];
    const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
    assert.ok(title && !titles.has(title), `${page.output} unique title`);
    assert.ok(description && !descriptions.has(description), `${page.output} unique description`);
    titles.add(title);
    descriptions.add(description);
  }
});

test('public build has no forms, tracking, inline code, stale promises or forbidden domains', () => {
  const allText = htmlFiles.map(read).join('\n') + read('llms.txt');
  const forbidden = [
    /<form[\s>]/i,
    /formEndpoint/i,
    /Google Tag Manager|GTM-[A-Z0-9]+|Google Analytics|Meta Pixel/i,
    /\banalytics\b/i,
    /\butm_(source|medium|campaign)\b/i,
    /document\.cookie|cookie consent/i,
    /two working days|kahe tööpäeva|два рабочих дня|двух рабочих дней/i,
    /https?:\/\/(?:www\.)?freedive\.ee/i,
    /https?:\/\/(?:www\.)?meregrupp\.ee/i,
    /https?:\/\/freediving\.meregrupp\.ee/i,
    /\sstyle="/i,
    /\son(?:click|load|error|submit)="/i,
  ];
  for (const pattern of forbidden) assert.doesNotMatch(allText, pattern, String(pattern));

  for (const file of htmlFiles) {
    const html = read(file);
    const inlineScripts = [...html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>[\s\S]*?<\/script>/gi)];
    assert.equal(inlineScripts.length, 0, `${file} has no inline scripts`);
  }
});

test('spearfishing visitors receive a tactful skills and safety bridge', () => {
  const publicText = htmlFiles.map(read).join('\n') + read('llms.txt');
  const home = read('index.html');
  const merehunt = read('merehunt/index.html');

  assert.doesNotMatch(publicText, /Merehunt изменился|Старый магазин и форум закрыты|магазин и старый форум больше не работают|Старые магазин и форум больше не работают/i);
  assert.match(home, /Подводная охота во многом опирается на фридайвинг/);
  assert.match(merehunt, /Фридайвинг для <em>подводного охотника<\/em>/);
  assert.match(merehunt, /Потеря сознания возможна при нырянии на задержке дыхания/);
  assert.match(merehunt, /Напарник, который умеет страховать/);
});

test('every clickable http link is canonical self or the one allowed Facebook page', () => {
  for (const file of htmlFiles) {
    const html = read(file);
    const links = [...html.matchAll(/href="(https?:\/\/[^"#]+[^\"]*)"/g)].map((match) => match[1]);
    for (const link of links) {
      assert.ok(link.startsWith(`${BASE}/`) || link === org.facebook, `${file}: unexpected external link ${link}`);
    }
  }
});

test('local asset and internal page references resolve', () => {
  for (const file of htmlFiles) {
    const html = read(file);
    for (const match of html.matchAll(/(?:href|src)="(\/[^"?#]+)(?:[?#][^"]*)?"/g)) {
      const href = match[1];
      if (href === '/') {
        assert.ok(existsSync(join(root, 'index.html')));
        continue;
      }
      let target = join(root, href);
      if (href.endsWith('/')) target = join(target, 'index.html');
      assert.ok(existsSync(target), `${file}: missing ${href}`);
    }
  }
});

test('sitemap, robots and llms contain the same canonical routes', () => {
  const sitemap = read('sitemap.xml');
  const robots = read('robots.txt');
  const llms = read('llms.txt');
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  assert.deepEqual(locations, pages.map((page) => `${BASE}${page.path}`));
  assert.doesNotMatch(sitemap, /404|thanks/i);
  assert.match(robots, /^User-agent: \*\nAllow: \/\n/m);
  assert.match(robots, new RegExp(`Sitemap: ${BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/sitemap\\.xml`));
  for (const page of pages) assert.match(llms, new RegExp(`${BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}${page.path}`));
});

test('structured microdata matches visible page types', () => {
  for (const page of pages) {
    const html = read(page.output);
    assert.match(html, new RegExp(`<main id="content" itemscope itemtype="https://schema\\.org/${page.schemaType}">`));
    assert.match(html, /itemscope itemtype="https:\/\/schema\.org\/Organization"/);
    if (page.kind === 'course') {
      assert.match(html, /itemprop="offers" itemscope itemtype="https:\/\/schema\.org\/Offer"/);
      assert.match(html, /itemprop="price" content="180">180 €<\/span>/);
    } else {
      assert.doesNotMatch(html, /itemtype="https:\/\/schema\.org\/Offer"/);
    }
  }

  const home = read('index.html');
  const visibleQuestions = (home.match(/<summary><span itemprop="name">/g) || []).length;
  assert.equal(visibleQuestions, 8);
  assert.equal((home.match(/itemtype="https:\/\/schema\.org\/Question"/g) || []).length, visibleQuestions);
});

test('404 is noindex and absent from sitemap', () => {
  const html = read('404.html');
  assert.match(html, /<meta name="robots" content="noindex, follow"/);
  assert.doesNotMatch(html, /rel="canonical"/);
  assert.doesNotMatch(read('sitemap.xml'), /404/);
});

test('self-hosted font subsets contain the required Russian and Latin glyphs', () => {
  const russian = 'ЁёЖжЙйЦцЩщЪъЫыЬьЭэЮюЯя';
  const latin = 'Merehunt Tallinn õü€';
  const checks = [
    ['assets/fonts/ibm-plex-sans-cyrillic-400-normal.woff2', russian],
    ['assets/fonts/source-serif-4-cyrillic-400-normal.woff2', russian],
    ['assets/fonts/ibm-plex-sans-latin-400-normal.woff2', latin],
    ['assets/fonts/source-serif-4-latin-400-normal.woff2', latin],
  ];
  for (const [file, sample] of checks) {
    const font = openSync(join(root, file));
    for (const character of sample) {
      assert.ok(font.hasGlyphForCodePoint(character.codePointAt(0)), `${file} missing ${character}`);
    }
  }
});
