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
    const refreshTokenInput = String(
      body.refreshToken || query.refreshToken || cookies.tiktok_rt || ''
    ).trim();

    if (!refreshTokenInput || !clientKey || !clientSecret) {
      return res.status(400).json({
        error: 'ไม่พบ Refresh Token หรือข้อมูล Client Key / Client Secret สำหรับต่ออายุสิทธิ์',
      });
    }

    const resp = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshTokenInput,
      }),
    });

    const data = await resp.json().catch(() => ({}));
    const tokenObj = data.data || data;

    if (!resp.ok || !tokenObj?.access_token) {
      return res.status(400).json({
        error:
          data.error?.message ||
          data.error_description ||
          'ไม่สามารถรีเฟรช Access Token จาก TikTok ได้ กรุณากดเชื่อมต่อใหม่อีกครั้ง',
      });
    }

    const accessToken = tokenObj.access_token;
    const refreshToken = tokenObj.refresh_token || refreshTokenInput;
    const expiresIn = tokenObj.expires_in || 86400;
    const expiresAt = Date.now() + expiresIn * 1000;
    const lastSyncedAt = new Date().toISOString();

    res.setHeader('Set-Cookie', [
      buildCookie('tiktok_at', accessToken),
      buildCookie('tiktok_rt', refreshToken),
      buildCookie('tiktok_exp', String(expiresAt)),
      buildCookie('tiktok_sync', lastSyncedAt),
    ]);

    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      expiresIn,
      expiresAt,
      lastSyncedAt,
    });
  } catch (err) {
    return res.status(500).json({
      error: err?.message || 'เกิดข้อผิดพลาดขณะรีเฟรชสิทธิ์ TikTok',
    });
  }
}
