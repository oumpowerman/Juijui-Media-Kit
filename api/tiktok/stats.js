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

async function tryRefreshTikTokToken(clientKey, clientSecret, refreshToken) {
  if (!clientKey || !clientSecret || !refreshToken) {
    return { error: 'Missing refresh token or client credentials' };
  }
  try {
    const resp = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });
    const data = await resp.json().catch(() => ({}));
    const tokenObj = data.data || data;
    if (tokenObj?.access_token) {
      const expiresIn = tokenObj.expires_in || 86400;
      return {
        accessToken: tokenObj.access_token,
        refreshToken: tokenObj.refresh_token || refreshToken,
        expiresIn,
        expiresAt: Date.now() + expiresIn * 1000,
      };
    }
    return { error: data.error?.message || data.error_description || 'Refresh token failed' };
  } catch (e) {
    return { error: e?.message || 'Network error refreshing token' };
  }
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    const cookies = parseCookies(req?.headers?.cookie);
    const query = req?.query || {};
    const body = parseBody(req);

    let headerToken = '';
    const authHeader = req?.headers?.authorization || req?.headers?.Authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      headerToken = authHeader.substring(7).trim();
    }

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
    let token = String(
      headerToken || body.accessToken || query.accessToken || cookies.tiktok_at || ''
    ).trim();
    const refreshToken = String(
      body.refreshToken || query.refreshToken || cookies.tiktok_rt || ''
    ).trim();

    let refreshedTokenPayload = null;

    if (!token && refreshToken && clientKey && clientSecret) {
      const refreshed = await tryRefreshTikTokToken(clientKey, clientSecret, refreshToken);
      if (refreshed.accessToken) {
        token = refreshed.accessToken;
        refreshedTokenPayload = {
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken || refreshToken,
          expiresAt: refreshed.expiresAt || Date.now() + 86400000,
        };
      }
    }

    if (!token) {
      return res.status(401).json({
        error:
          'ยังไม่ได้เชื่อมต่อ TikTok OAuth 2.0 หรือยังไม่ได้ระบุ User Access Token สำรอง กรุณากดปุ่ม "เชื่อมต่อบัญชี TikTok" ด้านบนก่อนทดสอบ',
        requiresAuth: true,
      });
    }

    let response = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=avatar_url,display_name,follower_count,likes_count,video_count',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (
      response.status === 401 &&
      refreshToken &&
      clientKey &&
      clientSecret &&
      !refreshedTokenPayload
    ) {
      const refreshed = await tryRefreshTikTokToken(clientKey, clientSecret, refreshToken);
      if (refreshed.accessToken) {
        token = refreshed.accessToken;
        refreshedTokenPayload = {
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken || refreshToken,
          expiresAt: refreshed.expiresAt || Date.now() + 86400000,
        };
        response = await fetch(
          'https://open.tiktokapis.com/v2/user/info/?fields=avatar_url,display_name,follower_count,likes_count,video_count',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok || (data.error?.code && data.error.code !== 'ok')) {
      const errMsg =
        data.error?.message ||
        data.error_description ||
        `TikTok Open API ตอบกลับด้วยสถานะ ${response.status}`;
      return res
        .status(response.status >= 400 && response.status < 500 ? response.status : 502)
        .json({
          error: errMsg,
          raw: data,
        });
    }

    const user = data.data?.user;
    if (!user) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลบัญชีผู้ใช้จาก TikTok Open API' });
    }

    const lastSyncedAt = new Date().toISOString();
    const cookiesToSet = [
      buildCookie('tiktok_dn', user.display_name || ''),
      buildCookie('tiktok_av', user.avatar_url || ''),
      buildCookie('tiktok_fc', String(user.follower_count ?? 0)),
      buildCookie('tiktok_lc', String(user.likes_count ?? 0)),
      buildCookie('tiktok_vc', String(user.video_count ?? 0)),
      buildCookie('tiktok_sync', lastSyncedAt),
    ];
    if (refreshedTokenPayload) {
      cookiesToSet.push(buildCookie('tiktok_at', refreshedTokenPayload.accessToken));
      cookiesToSet.push(buildCookie('tiktok_rt', refreshedTokenPayload.refreshToken));
      cookiesToSet.push(buildCookie('tiktok_exp', String(refreshedTokenPayload.expiresAt)));
    }
    res.setHeader('Set-Cookie', cookiesToSet);

    return res.status(200).json({
      success: true,
      user: {
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        followerCount: user.follower_count,
        likesCount: user.likes_count,
        videoCount: user.video_count,
      },
      refreshedToken: refreshedTokenPayload || undefined,
      source: 'official_api',
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: err?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ TikTok Open API' });
  }
}
