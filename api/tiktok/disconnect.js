function buildCookie(name, value, maxAgeSeconds = 2592000) {
  const encoded = encodeURIComponent(String(value ?? ''));
  return `${name}=${encoded}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

export default async function handler(_req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Set-Cookie', [
    buildCookie('tiktok_at', '', 0),
    buildCookie('tiktok_rt', '', 0),
    buildCookie('tiktok_oid', '', 0),
    buildCookie('tiktok_exp', '', 0),
    buildCookie('tiktok_dn', '', 0),
    buildCookie('tiktok_av', '', 0),
    buildCookie('tiktok_fc', '', 0),
    buildCookie('tiktok_lc', '', 0),
    buildCookie('tiktok_vc', '', 0),
    buildCookie('tiktok_sync', '', 0),
  ]);
  return res.status(200).json({ success: true, isConnected: false });
}
