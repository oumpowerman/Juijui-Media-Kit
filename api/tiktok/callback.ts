import { parseCookies, buildCookie, getRedirectUri, getEffectiveCredentials } from './_utils';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  const { code, state, error, error_description } = req.query || {};

  if (error) {
    const errDesc = String(error_description || error || 'ผู้ใช้ยกเลิกการเชื่อมต่อ TikTok');
    return res.status(200).send(`<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><title>TikTok Authentication</title></head>
  <body style="font-family: system-ui, sans-serif; background: #09090b; color: #f43f5e; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center;">
    <div style="padding: 24px; max-width: 460px; background: #18181b; border: 1px solid #27272a; border-radius: 12px; color: #fff;">
      <h3 style="margin-top: 0; color: #f43f5e;">การเชื่อมต่อไม่สำเร็จ</h3>
      <p style="color: #a1a1aa; font-size: 14px;">${errDesc}</p>
      <button onclick="window.close()" style="background: #27272a; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">ปิดหน้าต่างนี้</button>
    </div>
    <script>
      if (window.opener) {
        window.opener.postMessage({ type: 'TIKTOK_OAUTH_ERROR', error: ${JSON.stringify(errDesc)} }, '*');
        setTimeout(() => window.close(), 2500);
      }
    </script>
  </body>
</html>`);
  }

  if (!code) {
    return res.status(400).send('Missing authorization code from TikTok');
  }

  // Decode state fallback if cookies were stripped or cross-site
  let stateCreds: { ck?: string; cs?: string; ru?: string } = {};
  if (typeof state === 'string' && state.length > 10) {
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf-8'));
      if (decoded && typeof decoded === 'object') {
        stateCreds = decoded;
      }
    } catch {
      // Ignore if state was plain string
    }
  }

  const cookies = parseCookies(req?.headers?.cookie);
  const envCreds = getEffectiveCredentials(req);

  const clientKey = envCreds.clientKey || stateCreds.ck || '';
  const clientSecret = envCreds.clientSecret || stateCreds.cs || '';
  const redirectUri = cookies.tiktok_ru || stateCreds.ru || getRedirectUri(req);

  if (!clientKey || !clientSecret) {
    const missingMsg =
      'ไม่พบ TikTok Client Key หรือ Client Secret สำหรับแลกเปลี่ยน Access Token กรุณาบันทึก Client Key และ Client Secret ในหน้าตั้งค่าก่อนกดเชื่อมต่อ';
    return res.status(200).send(`<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><title>TikTok Authentication Failed</title></head>
  <body style="font-family: system-ui, sans-serif; background: #09090b; color: #f43f5e; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center;">
    <div style="padding: 24px; max-width: 480px; background: #18181b; border: 1px solid #27272a; border-radius: 12px; color: #fff;">
      <h3 style="margin-top: 0; color: #f43f5e;">ข้อมูล Client Secret ไม่ครบถ้วน</h3>
      <p style="color: #a1a1aa; font-size: 14px;">${missingMsg}</p>
      <button onclick="window.close()" style="background: #27272a; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">ปิดหน้าต่างนี้</button>
    </div>
    <script>
      if (window.opener) {
        window.opener.postMessage({ type: 'TIKTOK_OAUTH_ERROR', error: ${JSON.stringify(missingMsg)} }, '*');
      }
    </script>
  </body>
</html>`);
  }

  try {
    const tokenResp = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: String(code),
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResp.json().catch(() => ({}));
    const tokenObj = tokenData.data || tokenData;

    if (!tokenResp.ok || !tokenObj?.access_token) {
      const errMsg =
        tokenData.error?.message ||
        tokenData.error_description ||
        tokenObj?.description ||
        'ไม่สามารถแลกเปลี่ยน Access Token กับ TikTok Open API ได้ กรุณาตรวจสอบ Client Secret และ Redirect URI';
      return res.status(200).send(`<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><title>TikTok Authentication Failed</title></head>
  <body style="font-family: system-ui, sans-serif; background: #09090b; color: #f43f5e; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center;">
    <div style="padding: 24px; max-width: 480px; background: #18181b; border: 1px solid #27272a; border-radius: 12px; color: #fff;">
      <h3 style="margin-top: 0; color: #f43f5e;">ไม่สามารถแลกเปลี่ยน Access Token ได้</h3>
      <p style="color: #a1a1aa; font-size: 14px;">${errMsg}</p>
      <p style="color: #71717a; font-size: 12px;">ตรวจสอบว่า TikTok Developer App ของคุณได้เพิ่ม Sandbox Testers และตั้งค่า Redirect URI ตรงกับ ${redirectUri} แล้ว</p>
      <button onclick="window.close()" style="background: #27272a; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">ปิดหน้าต่างนี้</button>
    </div>
    <script>
      if (window.opener) {
        window.opener.postMessage({ type: 'TIKTOK_OAUTH_ERROR', error: ${JSON.stringify(errMsg)} }, '*');
      }
    </script>
  </body>
</html>`);
    }

    const accessToken = tokenObj.access_token;
    const refreshToken = tokenObj.refresh_token || '';
    const openId = tokenObj.open_id || '';
    const expiresIn = tokenObj.expires_in || 86400;
    const expiresAt = Date.now() + expiresIn * 1000;

    // Fetch user profile & stats immediately
    let displayName = '';
    let avatarUrl = '';
    let followerCount = 0;
    let likesCount = 0;
    let videoCount = 0;

    try {
      const userResp = await fetch(
        'https://open.tiktokapis.com/v2/user/info/?fields=avatar_url,display_name,follower_count,likes_count,video_count',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (userResp.ok) {
        const userData = await userResp.json().catch(() => ({}));
        const user = userData.data?.user;
        if (user) {
          displayName = user.display_name || '';
          avatarUrl = user.avatar_url || '';
          followerCount = user.follower_count ?? 0;
          likesCount = user.likes_count ?? 0;
          videoCount = user.video_count ?? 0;
        }
      }
    } catch {
      // Non-blocking profile fetch
    }

    const lastSyncedAt = new Date().toISOString();

    // Set cookies for subsequent stateless requests
    res.setHeader('Set-Cookie', [
      buildCookie('tiktok_ck', clientKey),
      buildCookie('tiktok_cs', clientSecret),
      buildCookie('tiktok_at', accessToken),
      buildCookie('tiktok_rt', refreshToken),
      buildCookie('tiktok_oid', openId),
      buildCookie('tiktok_exp', String(expiresAt)),
      buildCookie('tiktok_dn', displayName),
      buildCookie('tiktok_av', avatarUrl),
      buildCookie('tiktok_fc', String(followerCount)),
      buildCookie('tiktok_lc', String(likesCount)),
      buildCookie('tiktok_vc', String(videoCount)),
      buildCookie('tiktok_sync', lastSyncedAt),
    ]);

    const oauthResultPayload = {
      clientKey,
      hasClientSecret: true,
      isConnected: true,
      accessToken,
      refreshToken,
      openId,
      expiresIn,
      expiresAt,
      displayName,
      avatarUrl,
      followerCount,
      likesCount,
      videoCount,
      lastSyncedAt,
    };

    return res.status(200).send(`<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><title>TikTok Authentication Succeeded</title></head>
  <body style="font-family: system-ui, -apple-system, sans-serif; background: #09090b; color: #10b981; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center;">
    <div style="padding: 28px; max-width: 440px; background: #18181b; border: 1px solid #27272a; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
      <div style="width: 48px; height: 48px; background: rgba(16,185,129,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; font-size: 24px; color: #10b981;">✓</div>
      <h3 style="color: #ffffff; margin: 0 0 8px 0; font-size: 18px; font-weight: 700;">เชื่อมต่อ TikTok สำเร็จ!</h3>
      <p style="color: #a1a1aa; font-size: 14px; margin: 0 0 16px 0;">ระบบได้บันทึก Access Token และสิทธิ์ของ ${displayName || 'บัญชีของคุณ'} เรียบร้อยแล้ว</p>
      <p style="color: #71717a; font-size: 12px; margin: 0;">หน้าต่างนี้จะปิดตัวลงโดยอัตโนมัติ...</p>
    </div>
    <script>
      try {
        const resultData = ${JSON.stringify(oauthResultPayload)};
        try {
          localStorage.setItem('juijui_tiktok_oauth_state', JSON.stringify(resultData));
        } catch (err) {}
        if (window.opener) {
          window.opener.postMessage({
            type: 'TIKTOK_OAUTH_SUCCESS',
            data: resultData
          }, '*');
          setTimeout(() => window.close(), 700);
        } else {
          window.location.href = '/';
        }
      } catch(e) {
        window.close();
      }
    </script>
  </body>
</html>`);
  } catch (err: any) {
    return res
      .status(500)
      .send(`Authentication error: ${err?.message || 'Unknown error communicating with TikTok'}`);
  }
}
