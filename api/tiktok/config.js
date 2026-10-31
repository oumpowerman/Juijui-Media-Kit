function parseCookies(cookieHeader) {
  const list = {};
  if (!cookieHeader || typeof cookieHeader !== 'string') return list;
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

function parseBody(req) {
  if (!req || !req.body) return {};
  if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  try {
    const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf-8') : String(req.body);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function buildCookie(name, value, maxAgeSeconds = 2592000) {
  const encoded = encodeURIComponent(String(value ?? ''));
  return `${name}=${encoded}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

function getRedirectUri(req, body) {
  if (req?.query?.redirectUri && typeof req.query.redirectUri === 'string') {
    return req.query.redirectUri;
  }
  if (body?.redirectUri && typeof body.redirectUri === 'string') {
    return body.redirectUri;
  }
  if (process.env.APP_URL) {
    const baseUrl = process.env.APP_URL.replace(/\/$/, '');
    return `${baseUrl}/api/tiktok/callback`;
  }
  const host = req?.headers?.['x-forwarded-host'] || req?.headers?.host || 'localhost:3000';
  const protoHeader = req?.headers?.['x-forwarded-proto'];
  const protocol =
    protoHeader === 'https' ||
    String(host).includes('.vercel.app') ||
    !String(host).includes('localhost')
      ? 'https'
      : 'http';
  return `${protocol}://${host}/api/tiktok/callback`;
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    const cookies = parseCookies(req?.headers?.cookie);
    const query = req?.query || {};
    const body = parseBody(req);
    const redirectUri = getRedirectUri(req, body);

    const existingClientKey = String(
      query.clientKey || cookies.tiktok_ck || process.env.TIKTOK_CLIENT_KEY || ''
    ).trim();
    const existingClientSecret = String(
      query.clientSecret || cookies.tiktok_cs || process.env.TIKTOK_CLIENT_SECRET || ''
    ).trim();
    const existingAccessToken = String(cookies.tiktok_at || '').trim();

    if (req.method === 'POST') {
      const incomingKey = typeof body.clientKey === 'string' ? body.clientKey.trim() : '';
      const incomingSecret = typeof body.clientSecret === 'string' ? body.clientSecret.trim() : '';

      const cookiesToSet = [];
      if (incomingKey) {
        cookiesToSet.push(buildCookie('tiktok_ck', incomingKey));
      }
      if (incomingSecret) {
        cookiesToSet.push(buildCookie('tiktok_cs', incomingSecret));
      }
      if (cookiesToSet.length > 0) {
        res.setHeader('Set-Cookie', cookiesToSet);
      }

      const finalClientKey = incomingKey || existingClientKey;
      const finalHasSecret = Boolean(incomingSecret || existingClientSecret);

      return res.status(200).json({
        success: true,
        clientKey: finalClientKey,
        hasClientSecret: finalHasSecret,
        isConnected: Boolean(existingAccessToken),
        redirectUri,
      });
    }

    return res.status(200).json({
      clientKey: existingClientKey,
      hasClientSecret: Boolean(existingClientSecret),
      isConnected: Boolean(existingAccessToken),
      expiresAt: cookies.tiktok_exp ? Number(cookies.tiktok_exp) : null,
      openId: cookies.tiktok_oid || null,
      displayName: cookies.tiktok_dn || null,
      avatarUrl: cookies.tiktok_av || null,
      followerCount: cookies.tiktok_fc ? Number(cookies.tiktok_fc) : null,
      likesCount: cookies.tiktok_lc ? Number(cookies.tiktok_lc) : null,
      videoCount: cookies.tiktok_vc ? Number(cookies.tiktok_vc) : null,
      lastSyncedAt: cookies.tiktok_sync || null,
      redirectUri,
    });
  } catch (err) {
    return res.status(500).json({
      error: err?.message || 'เกิดข้อผิดพลาดในการโหลดการตั้งค่า TikTok',
    });
  }
}
