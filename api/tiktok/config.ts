import { parseCookies, buildCookie, getRedirectUri, getEffectiveCredentials } from './_utils';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const incomingKey = typeof body.clientKey === 'string' ? body.clientKey.trim() : '';
    const incomingSecret = typeof body.clientSecret === 'string' ? body.clientSecret.trim() : '';

    const cookiesToSet: string[] = [];
    if (incomingKey) {
      cookiesToSet.push(buildCookie('tiktok_ck', incomingKey));
    }
    if (incomingSecret) {
      cookiesToSet.push(buildCookie('tiktok_cs', incomingSecret));
    }
    if (cookiesToSet.length > 0) {
      res.setHeader('Set-Cookie', cookiesToSet);
    }

    const creds = getEffectiveCredentials(req);
    const finalClientKey = incomingKey || creds.clientKey;
    const finalHasSecret = Boolean(incomingSecret || creds.clientSecret);

    return res.status(200).json({
      success: true,
      clientKey: finalClientKey,
      hasClientSecret: finalHasSecret,
      isConnected: Boolean(creds.accessToken),
      redirectUri: getRedirectUri(req),
    });
  }

  // GET /api/tiktok/config
  const cookies = parseCookies(req?.headers?.cookie);
  const creds = getEffectiveCredentials(req);
  const redirectUri = getRedirectUri(req);

  return res.status(200).json({
    clientKey: creds.clientKey,
    hasClientSecret: Boolean(creds.clientSecret),
    isConnected: Boolean(creds.accessToken),
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
}
