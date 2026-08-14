import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import test from 'node:test';
import Ajv from 'ajv';

const require = createRequire(import.meta.url);
const schemaPath = join(dirname(require.resolve('wrangler')), '..', 'config-schema.json');
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
const config = JSON.parse(readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));

test('wrangler configuration matches the installed Wrangler schema', () => {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
  assert.equal(validate(config), true, ajv.errorsText(validate.errors, { separator: '\n' }));
});

test('wrangler uses static assets and real 404 handling', () => {
  assert.equal(config.assets.directory, './dist');
  assert.equal(config.assets.binding, 'ASSETS');
  assert.equal(config.assets.not_found_handling, '404-page');
  assert.equal(config.assets.html_handling, 'auto-trailing-slash');
  assert.equal(config.assets.run_worker_first, true);
});

test('only the production environment claims the custom domains', () => {
  assert.equal(config.routes, undefined, 'top-level deploy must not take over merehunt.ee');
  assert.equal(config.route, undefined);
  assert.equal(config.workers_dev, true);

  const production = config.env.production;
  assert.equal(production.name, config.name, 'both environments deploy the same Worker script');
  assert.equal(production.workers_dev, false);
  assert.deepEqual(production.routes, [
    { pattern: 'merehunt.ee', custom_domain: true },
    { pattern: 'www.merehunt.ee', custom_domain: true },
  ]);
});
