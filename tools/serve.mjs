#!/usr/bin/env node
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(new URL('../dist/', import.meta.url).pathname);
const port = Number(process.env.MEREHUNT_PORT || 4173);

const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
};

function resolveRequest(pathname) {
  const decoded = decodeURIComponent(pathname);
  const relative = normalize(decoded).replace(/^[/\\]+/, '');
  let file = join(root, relative);
  if (!file.startsWith(root + sep) && file !== root) return null;
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!extname(file) && existsSync(`${file}.html`)) file = `${file}.html`;
  return file;
}

const server = createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  const file = resolveRequest(url.pathname);
  const available = file && existsSync(file) && statSync(file).isFile();
  const selected = available ? file : join(root, '404.html');
  response.statusCode = available ? 200 : 404;
  response.setHeader('Content-Type', types[extname(selected)] || 'application/octet-stream');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  createReadStream(selected).pipe(response);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Merehunt preview listening on http://127.0.0.1:${port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
