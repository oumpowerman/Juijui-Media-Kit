export function parseCookies(cookieHeader?: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const key = parts.shift()?.trim();
    if (key) {
      const value = parts.join('=').trim();
      try {
        list[key] = decodeURIComponent(value);
      } catch {
        list[key] = value;
      }
    }
  });
  return list;
}

export function buildCookie(name: string, value: string, maxAgeSeconds = 2592000): string {
  const encoded = encodeURIComponent(value);
  return `${name}=${encoded}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

export function getRedirectUri(req: any): string {
  if (req?.query?.redirectUri && typeof req.query.redirectUri === 'string') {
    return req.query.redirectUri;
  }
  if (req?.body?.redirectUri && typeof req.body.redirectUri === 'string') {
    return req.body.redirectUri;
  }
  if (process.env.APP_URL) {
    const baseUrl = process.env.APP_URL.replace(/\/$/, '');
    return `${baseUrl}/api/tiktok/callback`;
  }
  const host = req?.headers?.['x-forwarded-host'] || req?.headers?.host || 'localhost:3000';
  const protoHeader = req?.headers?.['x-forwarded-proto'];
  const protocol =
    protoHeader === 'https' || String(host).includes('.vercel.app') || !String(host).includes('localhost')
      ? 'https'
      : 'http';
  return `${protocol}://${host}/api/tiktok/callback`;
}

export function getEffectiveCredentials(req: any): {
  clientKey: string;
  clientSecret: string;
  accessToken: string;
  refreshToken: string;
} {
  const cookies = parseCookies(req?.headers?.cookie);
  const query = req?.query || {};
  const body = typeof req?.body === 'object' && req.body !== null ? req.body : {};

  let headerToken = '';
  const authHeader = req?.headers?.authorization || req?.headers?.Authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    headerToken = authHeader.substring(7).trim();
  }

  const clientKey =
    (body.clientKey || query.clientKey || cookies.tiktok_ck || process.env.TIKTOK_CLIENT_KEY || '').trim();
  const clientSecret =
    (
      body.clientSecret ||
      query.clientSecret ||
      cookies.tiktok_cs ||
      process.env.TIKTOK_CLIENT_SECRET ||
      ''
    ).trim();
  const accessToken = (
    headerToken ||
    body.accessToken ||
    query.accessToken ||
    cookies.tiktok_at ||
    ''
  ).trim();
  const refreshToken = (
    body.refreshToken ||
    query.refreshToken ||
    cookies.tiktok_rt ||
    ''
  ).trim();

  return { clientKey, clientSecret, accessToken, refreshToken };
}
