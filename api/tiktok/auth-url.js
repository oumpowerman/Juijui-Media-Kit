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

    const clientKey = String(
      body.clientKey || query.clientKey || cookies.tiktok_ck || process.env.TIKTOK_CLIENT_KEY || ''
    ).trim();
    const clientSecret = String(
      body.clientSecret ||
        query.clientSecret ||
        cookies.tiktok_cs ||
        process.env.TIKTOK_CLIENT_SECRET ||
        ''
    ).trim();

    const redirectUri = getRedirectUri(req, body);

    if (!clientKey) {
      return res.status(400).json({
        error:
          'กรุณาระบุ TikTok Client Key ในส่วน "ตั้งค่า TikTok Client Credentials & Redirect URI" (หรือตั้งค่า TIKTOK_CLIENT_KEY ใน Environment Variables) ก่อนทำการเชื่อมต่อ OAuth',
      });
    }

    const cookiesToSet = [
      buildCookie('tiktok_ck', clientKey, 3600),
      buildCookie('tiktok_ru', redirectUri, 3600),
    ];
    if (clientSecret) {
      cookiesToSet.push(buildCookie('tiktok_cs', clientSecret, 3600));
    }
    res.setHeader('Set-Cookie', cookiesToSet);

    const nonce = Math.random().toString(36).substring(2, 12);
    const statePayload = Buffer.from(
      JSON.stringify({
        n: nonce,
        ck: clientKey,
        cs: clientSecret || '',
        ru: redirectUri,
      })
    ).toString('base64url');

    const params = new URLSearchParams({
      client_key: clientKey,
      scope: 'user.info.basic,user.info.stats',
      response_type: 'code',
      redirect_uri: redirectUri,
      state: statePayload,
    });

    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
    return res.status(200).json({
      authUrl,
      state: statePayload,
      redirectUri,
    });
  } catch (err) {
    return res.status(500).json({
      error: err?.message || 'เกิดข้อผิดพลาดในการสร้าง URL สำหรับเชื่อมต่อ TikTok OAuth',
    });
  }
}
