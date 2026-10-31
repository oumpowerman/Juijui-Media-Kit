import { buildCookie, getEffectiveCredentials } from './_utils';

async function tryRefreshTikTokToken(
  clientKey: string,
  clientSecret: string,
  refreshToken: string
): Promise<{
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  expiresAt?: number;
  error?: string;
}> {
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
  } catch (e: any) {
    return { error: e?.message || 'Network error refreshing token' };
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    const creds = getEffectiveCredentials(req);
    let token = creds.accessToken;
    let refreshedTokenPayload: {
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    } | null = null;

    if (!token && creds.refreshToken && creds.clientKey && creds.clientSecret) {
      const refreshed = await tryRefreshTikTokToken(
        creds.clientKey,
        creds.clientSecret,
        creds.refreshToken
      );
      if (refreshed.accessToken) {
        token = refreshed.accessToken;
        refreshedTokenPayload = {
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken || creds.refreshToken,
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

    // If 401 and we have a refresh token, attempt automatic token refresh once
    if (
      response.status === 401 &&
      creds.refreshToken &&
      creds.clientKey &&
      creds.clientSecret &&
      !refreshedTokenPayload
    ) {
      const refreshed = await tryRefreshTikTokToken(
        creds.clientKey,
        creds.clientSecret,
        creds.refreshToken
      );
      if (refreshed.accessToken) {
        token = refreshed.accessToken;
        refreshedTokenPayload = {
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken || creds.refreshToken,
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
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ TikTok Open API' });
  }
}
