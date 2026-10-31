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

function formatCompactServerNumber(num) {
  if (!Number.isFinite(num) || num <= 0) return '0';
  if (num >= 1000000) {
    const m = num / 1000000;
    return `${parseFloat(m.toFixed(m >= 100 ? 1 : 2))}M`;
  }
  if (num >= 1000) {
    const k = num / 1000;
    return `${parseFloat(k.toFixed(k >= 100 ? 1 : 1))}K`;
  }
  return Math.round(num).toLocaleString();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = parseBody(req);
    const rawPlatform = String(body?.platform || 'tiktok').toLowerCase();
    const rawInput = String(body?.handleOrUrl || '').trim();

    if (!rawInput) {
      return res.status(400).json({ error: 'กรุณาระบุ @username หรือลิงก์หน้าโปรไฟล์' });
    }

    let cleanHandle = rawInput
      .replace(/^https?:\/\/(www\.|m\.|vm\.)?(tiktok|instagram|facebook|youtube)\.com\/?/i, '')
      .replace(/\?.*$/, '')
      .replace(/\/+$/, '')
      .trim();

    if (cleanHandle.startsWith('@')) {
      cleanHandle = cleanHandle.substring(1);
    }
    if (cleanHandle.includes('/')) {
      const segments = cleanHandle.split('/').filter(Boolean);
      cleanHandle = segments[segments.length - 1]?.replace(/^@/, '') || cleanHandle;
    }

    const browserHeaders = {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7',
      'Cache-Control': 'no-cache',
    };

    if (rawPlatform === 'tiktok') {
      const profileUrl = `https://www.tiktok.com/@${encodeURIComponent(cleanHandle)}`;
      const response = await fetch(profileUrl, { headers: browserHeaders });
      const html = await response.text();

      let followerCount = null;
      let likesCount = null;
      let videoCount = null;
      let displayName = cleanHandle;
      let avatarUrl = '';

      const rehydrationMatch = html.match(
        /<script\s+id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/i
      );
      if (rehydrationMatch && rehydrationMatch[1]) {
        try {
          const parsed = JSON.parse(rehydrationMatch[1]);
          const userDetail =
            parsed?.['__DEFAULT_SCOPE__']?.['webapp.user-detail']?.userInfo ||
            parsed?.['__DEFAULT_SCOPE__']?.['webapp.user-detail'];
          const stats = userDetail?.stats || userDetail?.statsV2;
          const userObj = userDetail?.user;

          if (stats) {
            followerCount = Number(stats.followerCount ?? stats.follower_count ?? 0);
            likesCount = Number(stats.heartCount ?? stats.heart ?? stats.likes ?? 0);
            videoCount = Number(stats.videoCount ?? stats.video_count ?? 0);
          }
          if (userObj?.nickname) displayName = userObj.nickname;
          if (userObj?.avatarLarger || userObj?.avatarMedium || userObj?.avatarThumb) {
            avatarUrl = userObj.avatarLarger || userObj.avatarMedium || userObj.avatarThumb;
          }
        } catch {
          // fallback to regex
        }
      }

      if (followerCount === null) {
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        const metaDescMatch = html.match(
          /<meta\s+(?:name|property)=["'](?:description|og:description)["']\s+content=["']([^"']+)["']/i
        );
        const textContent = (metaDescMatch?.[1] || '') + ' ' + (titleMatch?.[1] || '');

        const followRegex = /([0-9.,]+[KkMmBb]?)\s*(?:Followers|ผู้ติดตาม)/i;
        const match = textContent.match(followRegex);
        if (match && match[1]) {
          const numStr = match[1].toUpperCase();
          let mult = 1;
          if (numStr.endsWith('M')) mult = 1000000;
          else if (numStr.endsWith('K')) mult = 1000;
          else if (numStr.endsWith('B')) mult = 1000000000;
          const parsedNum = parseFloat(numStr.replace(/[^\d.]/g, '')) * mult;
          if (!isNaN(parsedNum)) followerCount = Math.round(parsedNum);
        }
      }

      if (followerCount !== null && followerCount > 0) {
        return res.status(200).json({
          platform: 'tiktok',
          handle: `@${cleanHandle}`,
          displayName: displayName || `@${cleanHandle}`,
          avatarUrl: avatarUrl || undefined,
          followerCount,
          followersFormatted: formatCompactServerNumber(followerCount),
          likesCount: likesCount || undefined,
          likesFormatted: likesCount ? formatCompactServerNumber(likesCount) : undefined,
          videoCount: videoCount || undefined,
          notice: `ดึงข้อมูลสาธารณะจาก TikTok (@${cleanHandle}) สำเร็จแบบ Real-time`,
        });
      }

      return res.status(200).json({
        platform: 'tiktok',
        handle: `@${cleanHandle}`,
        displayName: `@${cleanHandle}`,
        followerCount: null,
        followersFormatted: undefined,
        notice: `ไม่สามารถดึงตัวเลขของ @${cleanHandle} ได้โดยตรง (อาจเนื่องมาจาก TikTok Bot Protection) แนะนำให้อัปโหลดภาพแคปหน้าจอหลังบ้านในแท็บ AI OCR แทน`,
      });
    }

    // Generic fallback for other platforms
    return res.status(200).json({
      platform: rawPlatform,
      handle: `@${cleanHandle}`,
      displayName: `@${cleanHandle}`,
      followerCount: null,
      notice: `ระบบบันทึก @${cleanHandle} แล้ว แนะนำให้อัปโหลดภาพแคปหน้าจอเพื่อดึงตัวเลขสถิติอัตโนมัติ`,
    });
  } catch (err) {
    return res.status(500).json({
      error: err?.message || 'ไม่สามารถดึงข้อมูลหน้าโปรไฟล์ได้',
    });
  }
}
