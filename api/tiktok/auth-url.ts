import { buildCookie, getRedirectUri, getEffectiveCredentials } from './_utils';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const creds = getEffectiveCredentials(req);
  const redirectUri = getRedirectUri(req);

  if (!creds.clientKey) {
    return res.status(400).json({
      error:
        'กรุณาระบุ TikTok Client Key ในส่วน "ตั้งค่า TikTok Client Credentials" (หรือตั้งค่า TIKTOK_CLIENT_KEY ใน Environment Variables) ก่อนทำการเชื่อมต่อ OAuth',
    });
  }

  // Persist credentials and redirectUri in cookies so /api/tiktok/callback has them on stateless Vercel
  const cookiesToSet: string[] = [
    buildCookie('tiktok_ck', creds.clientKey, 3600),
    buildCookie('tiktok_ru', redirectUri, 3600),
  ];
  if (creds.clientSecret) {
    cookiesToSet.push(buildCookie('tiktok_cs', creds.clientSecret, 3600));
  }
  res.setHeader('Set-Cookie', cookiesToSet);

  // Encode state with random nonce + redirectUri & clientKey reference
  const nonce = Math.random().toString(36).substring(2, 12);
  const statePayload = Buffer.from(
    JSON.stringify({
      n: nonce,
      ck: creds.clientKey,
      cs: creds.clientSecret || '',
      ru: redirectUri,
    })
  ).toString('base64url');

  const params = new URLSearchParams({
    client_key: creds.clientKey,
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
}
