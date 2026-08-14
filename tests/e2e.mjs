#!/usr/bin/env node
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflate } from '@sparticuz/chromium';
import AxeBuilder from '@axe-core/playwright';
import { chromium, firefox, webkit } from 'playwright';
import { pages } from '../content/pages.mjs';

const port = 4173;
const base = `http://127.0.0.1:${port}`;
const output = new URL('../test-results/', import.meta.url).pathname;
mkdirSync(output, { recursive: true });
mkdirSync('/tmp/merehunt-font-cache', { recursive: true });
process.env.XDG_CACHE_HOME = '/tmp/merehunt-font-cache';
process.env.FONTCONFIG_PATH = '/etc/fonts';
process.env.FONTCONFIG_FILE = '/etc/fonts/fonts.conf';

const server = spawn(process.execPath, ['tools/serve.mjs'], {
  cwd: new URL('..', import.meta.url).pathname,
  env: { ...process.env, MEREHUNT_PORT: String(port) },
  stdio: ['ignore', 'pipe', 'inherit'],
});

await new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error('Preview server did not start.')), 10_000);
  server.once('exit', (code) => reject(new Error(`Preview server exited with ${code}.`)));
  server.stdout.on('data', (chunk) => {
    if (String(chunk).includes('preview listening')) {
      clearTimeout(timeout);
      resolve();
    }
  });
});

const full = process.argv.includes('--full');
async function fallbackChromiumPath() {
  const executable = join(tmpdir(), 'chromium');
  if (existsSync(executable) && statSync(executable).size > 1_000_000) return executable;
  rmSync(executable, { force: true });
  const packageEntry = fileURLToPath(import.meta.resolve('@sparticuz/chromium'));
  const compressed = resolve(dirname(packageEntry), '..', 'bin', 'chromium.br');
  return inflate(compressed);
}

const fallbackPath = full ? null : await fallbackChromiumPath();
const browsers = full
  ? [
      ['chromium', chromium, {}],
      ['firefox', firefox, {}],
      ['webkit', webkit, {}],
    ]
  : [
      ['chromium', chromium, {
        executablePath: fallbackPath,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      }],
    ];

try {
  for (const [name, engine, launchOptions] of browsers) {
    const browser = await engine.launch({ headless: true, ...launchOptions });
    try {
      for (const viewport of [{ width: 1366, height: 900 }, { width: 390, height: 844 }]) {
        const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
        const page = await context.newPage();
        const errors = [];
        page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('requestfailed', (request) => errors.push(`${request.url()}: ${request.failure()?.errorText}`));

        for (const route of pages) {
          const response = await page.goto(`${base}${route.path}`, { waitUntil: 'networkidle' });
          assert.equal(response?.status(), 200, `${name} ${viewport.width} ${route.path}`);
          assert.equal(await page.locator('h1').count(), 1);
          assert.equal(await page.locator('html').getAttribute('lang'), 'ru');
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), true, `${route.path} horizontal overflow`);
          const axe = await new AxeBuilder({ page }).analyze();
          const blocking = axe.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact));
          assert.equal(blocking.length, 0, `${name} ${viewport.width} ${route.path}: ${blocking.map((violation) => violation.id).join(', ')}`);
        }

        await page.goto(base, { waitUntil: 'networkidle' });
        const bodyFont = await page.locator('body').evaluate((element) => getComputedStyle(element).fontFamily);
        const headingFont = await page.locator('h1').evaluate((element) => getComputedStyle(element).fontFamily);
        assert.match(bodyFont, /IBM Plex Sans/);
        assert.match(headingFont, /Source Serif 4/);
        await page.locator('.person-card').last().scrollIntoViewIfNeeded();
        await page.waitForFunction(() => [...document.querySelectorAll('.person-card img')]
          .every((image) => image.complete && image.naturalWidth > 0));
        assert.equal(await page.locator('.person-card img').count(), 2);
        await page.evaluate(() => window.scrollTo(0, 0));
        assert.equal(errors.length, 0, `${name} ${viewport.width}: ${errors.join('; ')}`);

        if (viewport.width === 390) {
          const menu = page.locator('.nav-drawer');
          await menu.locator('summary').click();
          assert.equal(await menu.getAttribute('open'), '');
          await page.keyboard.press('Escape');
          assert.equal(await menu.getAttribute('open'), null);
        }

        if (name === 'chromium') {
          await page.screenshot({
            path: `${output}/home-${viewport.width}.png`,
            fullPage: true,
          });
          await page.goto(`${base}/merehunt/`, { waitUntil: 'networkidle' });
          await page.screenshot({
            path: `${output}/merehunt-${viewport.width}.png`,
            fullPage: true,
          });
        }
        await context.close();
      }
    } finally {
      await browser.close();
    }
  }

  const fallbackOptions = full ? {} : {
    executablePath: fallbackPath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  };
  const browser = await chromium.launch({ headless: true, ...fallbackOptions });
  try {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(base);
    assert.equal(await page.locator('h1').isVisible(), true);
    assert.equal(await page.locator('footer a[href="mailto:meregrupp@gmail.com"]').isVisible(), true);
    await context.close();
  } finally {
    await browser.close();
  }

  console.log(full
    ? 'Playwright E2E passed in Chromium, Firefox and WebKit at desktop/mobile widths.'
    : 'Playwright E2E passed in headless Chromium at desktop/mobile widths.');
} finally {
  server.kill('SIGTERM');
}
