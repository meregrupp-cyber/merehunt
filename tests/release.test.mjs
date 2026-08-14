import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { pages } from '../content/pages.mjs';
import { BASE } from '../content/site.mjs';

const root = resolve(new URL('../dist/', import.meta.url).pathname);
const dist = (file) => readFileSync(join(root, file), 'utf8');
const workflow = readFileSync(new URL('../.github/workflows/pages.yml', import.meta.url), 'utf8');
const htmlFiles = [...pages.map((page) => page.output), '404.html', 'forum/index.html'];

test('the custom domain survives every deploy', () => {
  assert.equal(dist('CNAME').trim(), new URL(BASE).hostname);
});

test('every page carries the content security policy GitHub Pages cannot send as a header', () => {
  for (const file of htmlFiles) {
    const html = dist(file);
    const csp = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1];
    assert.ok(csp, `${file} has no CSP meta tag`);
    assert.match(csp, /default-src 'self'/);
    assert.match(csp, /upgrade-insecure-requests/);
    assert.match(csp, /form-action 'none'/);
    assert.doesNotMatch(csp, /https?:\/\//, `${file} CSP allows a third-party origin`);
    assert.doesNotMatch(csp, /frame-ancestors/, `${file} CSP uses a directive meta tags ignore`);
  }
});

test('the old forum URL lands on the merehunt page without being indexed', () => {
  const html = dist('forum/index.html');
  assert.match(html, /<meta http-equiv="refresh" content="0; url=\/merehunt\/"/);
  assert.match(html, /<meta name="robots" content="noindex/);
  assert.match(html, /<a class="btn btn-primary" href="\/merehunt\/">/, 'needs a working link when refresh is blocked');
  assert.doesNotMatch(html, /<link rel="canonical"/, 'a redirect stub must not claim a canonical URL');
});

test('the redirect stub stays out of the sitemap', () => {
  assert.doesNotMatch(dist('sitemap.xml'), /\/forum\//);
});

test('deploy workflow builds, tests and needs no secrets', () => {
  assert.match(workflow, /branches: \[main\]/);
  const tests = workflow.indexOf('- run: npm test');
  const upload = workflow.indexOf('actions/upload-pages-artifact');
  const deploy = workflow.indexOf('actions/deploy-pages');
  assert.ok(tests > 0 && upload > tests && deploy > upload, 'deploy must follow npm test and the artifact upload');

  assert.match(workflow, /pages: write/);
  assert.match(workflow, /id-token: write/);
  assert.doesNotMatch(workflow, /secrets\./, 'the Pages deploy must not depend on repository secrets');
  assert.match(workflow, /node tools\/verify-live\.mjs/);
});
