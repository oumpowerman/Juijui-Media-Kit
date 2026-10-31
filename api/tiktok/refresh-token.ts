import { buildCookie, getEffectiveCredentials } from './_utils';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const creds = getEffectiveCredentials(req);
  if (!creds.refreshToken || !creds.clientKey || !creds.clientSecret) {
    return res.status(400).json({
      error: 'ไม่พบ Refresh Token หรือข้อมูล Client Key / Client Secret สำหรับต่ออายุสิทธิ์',
    });
  }

  try {
    const resp = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: creds.clientKey,
        client_secret: creds.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: creds.refreshToken,
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
    const refreshToken = tokenObj.refresh_token || creds.refreshToken;
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
  } catch (err: any) {
    return res.status(500).json({
      error: err?.message || 'เกิดข้อผิดพลาดขณะรีเฟรชสิทธิ์ TikTok',
    });
  }
}
