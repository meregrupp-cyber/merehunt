const CANONICAL_HOST = 'merehunt.ee';
const LEGACY_PATHS = [
  /^\/forum(?:\/|$)/i,
];

export const SECURITY_HEADERS = Object.freeze({
  'Strict-Transport-Security': 'max-age=31536000',
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; img-src 'self' data:; font-src 'self'; style-src 'self'; script-src 'self'; connect-src 'none'; form-action 'none'; upgrade-insecure-requests",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
  'X-Frame-Options': 'DENY',
  'Cross-Origin-Opener-Policy': 'same-origin',
});

function secured(response, pathname = '') {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) headers.set(name, value);

  if (!headers.has('Cache-Control')) {
    const isDocument = !pathname.includes('.') || pathname.endsWith('.html') || pathname.endsWith('.xml') || pathname.endsWith('.txt');
    headers.set('Cache-Control', isDocument
      ? 'public, max-age=0, must-revalidate'
      : 'public, max-age=86400, stale-while-revalidate=604800');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function redirect(location, status, pathname = '') {
  return secured(Response.redirect(location, status), pathname);
}

export function isLegacyPath(pathname) {
  return LEGACY_PATHS.some((pattern) => pattern.test(pathname));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.protocol !== 'https:' || url.hostname.toLowerCase() === `www.${CANONICAL_HOST}`) {
      url.protocol = 'https:';
      url.hostname = CANONICAL_HOST;
      url.port = '';
      return redirect(url.toString(), 308, url.pathname);
    }

    if (isLegacyPath(url.pathname)) {
      return redirect(`https://${CANONICAL_HOST}/merehunt/`, 301, url.pathname);
    }

    const response = await env.ASSETS.fetch(request);
    return secured(response, url.pathname);
  },
};
