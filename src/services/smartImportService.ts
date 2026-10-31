import {
  CreatorProfile,
  PlatformStat,
  StatsTimeframe,
  TimeframePlatformMetrics,
  DemographicAgeGroup,
  DemographicGender,
  DemographicLocation,
  parseFormattedStatNumber,
  formatCompactStatNumber,
  resolvePlatformMetricsForTimeframe,
  resolveOverviewForTimeframe,
  calculateFollowerWeightedDemographics,
} from '../data/creatorData';

export type SupportedPlatformId = PlatformStat['id'];

export interface SmartImportMetricItem {
  id: string;
  selected: boolean;
  platform: SupportedPlatformId;
  timeframe: StatsTimeframe | 'profile';
  field:
    | 'followers'
    | 'handle'
    | 'views'
    | 'reach'
    | 'likes'
    | 'comments'
    | 'shares'
    | 'er';
  labelTh: string;
  oldValue: string;
  newValue: string;
}

export interface SmartImportDemographicsPreview {
  selected: boolean;
  platform: SupportedPlatformId | 'overall';
  ageGroups: DemographicAgeGroup[];
  gender: DemographicGender[];
  locations: DemographicLocation[];
}

export interface SmartImportPreviewResult {
  sourceType: 'ocr' | 'csv' | 'username';
  summaryNote: string;
  avatarUrl?: string;
  displayName?: string;
  metrics: SmartImportMetricItem[];
  demographics?: SmartImportDemographicsPreview;
}

function normalizePlatformId(
  raw?: string,
  fallback: SupportedPlatformId = 'tiktok'
): SupportedPlatformId {
  const s = (raw || '').toLowerCase().trim();
  if (s.includes('tik') || s === 'tt') return 'tiktok';
  if (s.includes('face') || s === 'fb') return 'facebook';
  if (s.includes('insta') || s === 'ig') return 'instagram';
  if (s.includes('you') || s === 'yt') return 'youtube';
  return fallback;
}

function normalizeTimeframe(
  raw?: string,
  fallback: StatsTimeframe = '60d'
): StatsTimeframe {
  const s = (raw || '').toLowerCase().trim();
  if (s.includes('28') || s.includes('30') || s.includes('month')) return '28d';
  if (s.includes('60') || s.includes('2 เดือน')) return '60d';
  if (s.includes('life') || s.includes('all') || s.includes('สะสม') || s.includes('ทั้งหมด')) {
    return 'lifetime';
  }
  return fallback;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error(`ไม่สามารถอ่านไฟล์ ${file.name} ได้`));
    reader.readAsDataURL(file);
  });
}

export function fileToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error(`ไม่สามารถอ่านไฟล์ CSV ${file.name} ได้`));
    reader.readAsText(file, 'utf-8');
  });
}

/**
 * 1. Fetch Public Profile Stats via @username
 */
export async function fetchPublicProfilePreview(
  creator: CreatorProfile,
  platform: SupportedPlatformId,
  handleOrUrl: string
): Promise<SmartImportPreviewResult> {
  const response = await fetch('/api/smart-import/public-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform, handleOrUrl }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) {
    throw new Error(data.error || 'ไม่สามารถดึงข้อมูลจาก @username นี้ได้');
  }

  const targetPlat =
    creator.platforms.find((p) => p.id === platform) || creator.platforms[0];
  const lifetimeMetrics = resolvePlatformMetricsForTimeframe(targetPlat, 'lifetime');

  const metrics: SmartImportMetricItem[] = [];

  if (data.followersFormatted) {
    metrics.push({
      id: `${platform}-profile-followers`,
      selected: true,
      platform,
      timeframe: 'profile',
      field: 'followers',
      labelTh: 'ยอดผู้ติดตามล่าสุด (Followers)',
      oldValue: targetPlat.followers,
      newValue: data.followersFormatted,
    });
  }

  if (data.handle) {
    metrics.push({
      id: `${platform}-profile-handle`,
      selected: true,
      platform,
      timeframe: 'profile',
      field: 'handle',
      labelTh: 'ชื่อบัญชี (@username)',
      oldValue: targetPlat.handle,
      newValue: data.handle,
    });
  }

  if (data.likesFormatted) {
    metrics.push({
      id: `${platform}-lifetime-likes`,
      selected: true,
      platform,
      timeframe: 'lifetime',
      field: 'likes',
      labelTh: 'ยอดถูกใจสะสมทั้งหมด (Lifetime Likes)',
      oldValue: lifetimeMetrics.likes,
      newValue: data.likesFormatted,
    });
  }

  return {
    sourceType: 'username',
    summaryNote:
      data.notice ||
      `ดึงข้อมูลหน้าโปรไฟล์ ${data.displayName || data.handle} สำเร็จ${
        data.videoCount ? ` (พบคลิปทั้งหมด ${data.videoCount.toLocaleString()} คลิป)` : ''
      }`,
    avatarUrl: data.avatarUrl,
    displayName: data.displayName,
    metrics,
  };
}

/**
 * 2. Extract Stats from Uploaded Screenshots via Gemini Vision OCR
 */
export async function extractScreenshotOcrPreview(
  creator: CreatorProfile,
  files: File[],
  defaultPlatform: SupportedPlatformId | 'auto',
  defaultTimeframe: StatsTimeframe | 'auto'
): Promise<SmartImportPreviewResult> {
  const images = await Promise.all(
    files.map(async (f) => ({
      name: f.name,
      dataUrl: await fileToDataUrl(f),
    }))
  );

  const response = await fetch('/api/smart-import/ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      images,
      defaultPlatform,
      defaultTimeframe,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.error) {
    throw new Error(payload.error || 'ระบบ AI OCR ไม่สามารถอ่านภาพแคปหน้าจอได้');
  }

  const raw = payload.data || {};
  const fallbackPlat: SupportedPlatformId =
    defaultPlatform === 'auto'
      ? normalizePlatformId(raw.detectedPlatform, 'tiktok')
      : defaultPlatform;
  const fallbackTf: StatsTimeframe =
    defaultTimeframe === 'auto'
      ? normalizeTimeframe(raw.detectedTimeframe, '28d')
      : defaultTimeframe;

  const targetPlatObj =
    creator.platforms.find((p) => p.id === fallbackPlat) || creator.platforms[0];

  const metrics: SmartImportMetricItem[] = [];

  if (raw.followers) {
    metrics.push({
      id: `${fallbackPlat}-profile-followers`,
      selected: true,
      platform: fallbackPlat,
      timeframe: 'profile',
      field: 'followers',
      labelTh: 'ยอดผู้ติดตาม (Followers)',
      oldValue: targetPlatObj.followers,
      newValue: String(raw.followers),
    });
  }

  if (Array.isArray(raw.timeframeMetrics)) {
    for (const item of raw.timeframeMetrics) {
      const platId =
        defaultPlatform !== 'auto'
          ? defaultPlatform
          : normalizePlatformId(item.platform, fallbackPlat);
      const tfId =
        defaultTimeframe !== 'auto'
          ? defaultTimeframe
          : normalizeTimeframe(item.timeframe, fallbackTf);

      const platObj =
        creator.platforms.find((p) => p.id === platId) || targetPlatObj;
      const currentTf = resolvePlatformMetricsForTimeframe(platObj, tfId);
      const currentOv = resolveOverviewForTimeframe(creator, tfId);

      const pushIfPresent = (
        field: SmartImportMetricItem['field'],
        val: string | undefined,
        labelTh: string,
        oldVal: string
      ) => {
        if (!val || !String(val).trim() || String(val).trim() === '0') return;
        const id = `${platId}-${tfId}-${field}`;
        const existingIdx = metrics.findIndex((m) => m.id === id);
        const entry: SmartImportMetricItem = {
          id,
          selected: true,
          platform: platId,
          timeframe: tfId,
          field,
          labelTh,
          oldValue: oldVal,
          newValue: String(val).trim(),
        };
        if (existingIdx >= 0) {
          metrics[existingIdx] = entry;
        } else {
          metrics.push(entry);
        }
      };

      pushIfPresent('views', item.views, 'ยอดวิวรวม (Video Views)', currentTf.views);
      pushIfPresent('likes', item.likes, 'ยอดกดถูกใจ (Likes)', currentTf.likes);
      pushIfPresent('comments', item.comments, 'ความคิดเห็น (Comments)', currentTf.comments);
      pushIfPresent('shares', item.shares, 'การแชร์ (Shares)', currentTf.shares);
      pushIfPresent('er', item.er, 'Engagement Rate (ER%)', currentTf.er);
      pushIfPresent('reach', item.reach, 'การเข้าถึงผู้ชม (Reach)', currentOv.monthlyReach);
    }
  }

  let demographicsPreview: SmartImportDemographicsPreview | undefined;
  if (raw.demographics) {
    const demoPlat =
      defaultPlatform !== 'auto'
        ? defaultPlatform
        : normalizePlatformId(raw.demographics.platform, fallbackPlat);

    const existingDemo =
      creator.demographics.platformDemographics?.[demoPlat] || creator.demographics;

    const hasAge =
      Array.isArray(raw.demographics.ageGroups) && raw.demographics.ageGroups.length > 0;
    const hasGender =
      Array.isArray(raw.demographics.gender) && raw.demographics.gender.length > 0;
    const hasLoc =
      Array.isArray(raw.demographics.locations) && raw.demographics.locations.length > 0;

    if (hasAge || hasGender || hasLoc) {
      demographicsPreview = {
        selected: true,
        platform: demoPlat,
        ageGroups: hasAge
          ? raw.demographics.ageGroups.map((a: any) => ({
              range: String(a.range || '18 – 24 ปี'),
              percent: Math.round(Number(a.percent) || 0),
            }))
          : existingDemo.ageGroups.map((a) => ({ ...a })),
        gender: hasGender
          ? raw.demographics.gender.map((g: any) => ({
              label: String(g.label || 'ชาย (Male)'),
              percent: Number(Number(g.percent || 0).toFixed(1)),
            }))
          : existingDemo.gender.map((g) => ({ ...g })),
        locations: hasLoc
          ? raw.demographics.locations.map((l: any) => ({
              name: String(l.name || 'กรุงเทพมหานคร (Bangkok)'),
              percent: Number(Number(l.percent || 0).toFixed(1)),
            }))
          : existingDemo.locations.map((l) => ({ ...l })),
      };
    }
  }

  return {
    sourceType: 'ocr',
    summaryNote:
      raw.summaryNote ||
      `สกัดตัวเลขจากภาพแคปหน้าจอ ${files.length} ภาพเรียบร้อยแล้ว กรุณาตรวจสอบตัวเลขด้านล่างก่อนกดยืนยัน`,
    metrics,
    demographics: demographicsPreview,
  };
}

/**
 * 3. Client-side CSV Analytics Parser (Supports TikTok Studio / Meta / YouTube CSV exports)
 */
function parseCsvLines(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  for (const line of lines) {
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    cells.push(current.trim());
    rows.push(cells);
  }
  return rows;
}

export async function parseAnalyticsCsvPreview(
  creator: CreatorProfile,
  files: File[],
  targetPlatform: SupportedPlatformId,
  targetTimeframe: StatsTimeframe
): Promise<SmartImportPreviewResult> {
  const targetPlatObj =
    creator.platforms.find((p) => p.id === targetPlatform) || creator.platforms[0];
  const currentTf = resolvePlatformMetricsForTimeframe(targetPlatObj, targetTimeframe);
  const currentOv = resolveOverviewForTimeframe(creator, targetTimeframe);

  let totalViews = 0;
  let totalLikes = 0;
  let totalComments = 0;
  let totalShares = 0;
  let totalReach = 0;
  let latestFollowers = 0;
  let rowCount = 0;

  const extractedAge: DemographicAgeGroup[] = [];
  const extractedGender: DemographicGender[] = [];
  const extractedLocations: DemographicLocation[] = [];

  for (const file of files) {
    const content = await fileToText(file);
    const rows = parseCsvLines(content);
    if (rows.length < 2) continue;

    const headers = rows[0].map((h) => h.toLowerCase().trim());

    // Case A: Overview / Daily Traffic CSV (Date, Video Views, Profile Views, Likes, Comments, Shares, Reach, etc.)
    const viewsCol = headers.findIndex(
      (h) => h.includes('video views') || h === 'views' || h.includes('ยอดวิว') || h.includes('การดู')
    );
    const likesCol = headers.findIndex(
      (h) => h.includes('likes') || h.includes('ถูกใจ')
    );
    const commentsCol = headers.findIndex(
      (h) => h.includes('comments') || h.includes('ความคิดเห็น')
    );
    const sharesCol = headers.findIndex(
      (h) => h.includes('shares') || h.includes('แชร์')
    );
    const reachCol = headers.findIndex(
      (h) =>
        h.includes('reach') ||
        h.includes('unique viewers') ||
        h.includes('การเข้าถึง') ||
        h.includes('profile views')
    );
    const followersCol = headers.findIndex(
      (h) => h.includes('followers') || h.includes('ผู้ติดตาม') || h.includes('subscribers')
    );

    if (viewsCol >= 0 || likesCol >= 0 || commentsCol >= 0 || followersCol >= 0) {
      const dataRows = rows.slice(1);
      rowCount += dataRows.length;
      for (const r of dataRows) {
        // Skip "Total" / "รวม" summary row if daily rows exist to avoid double-counting
        const firstCell = (r[0] || '').toLowerCase();
        if (dataRows.length > 2 && (firstCell === 'total' || firstCell === 'รวม')) {
          continue;
        }
        if (viewsCol >= 0) totalViews += parseFormattedStatNumber(r[viewsCol]);
        if (likesCol >= 0) totalLikes += parseFormattedStatNumber(r[likesCol]);
        if (commentsCol >= 0) totalComments += parseFormattedStatNumber(r[commentsCol]);
        if (sharesCol >= 0) totalShares += parseFormattedStatNumber(r[sharesCol]);
        if (reachCol >= 0) totalReach += parseFormattedStatNumber(r[reachCol]);
        if (followersCol >= 0) {
          const fVal = parseFormattedStatNumber(r[followersCol]);
          if (fVal > latestFollowers) latestFollowers = fVal;
        }
      }
    }

    // Case B: Demographics CSV (Gender / Age / Territory / City rows)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 2) continue;
      const keyRaw = (row[0] || '').trim();
      const keyLower = keyRaw.toLowerCase();
      const valNum = parseFloat((row[1] || '').replace(/[^0-9.]/g, ''));
      if (Number.isNaN(valNum)) continue;
      const pct = valNum <= 1 && valNum > 0 ? Number((valNum * 100).toFixed(1)) : Number(valNum.toFixed(1));

      if (keyLower === 'male' || keyLower === 'ชาย' || keyLower.includes('ผู้ชาย')) {
        extractedGender.push({ label: 'ชาย (Male)', percent: pct });
      } else if (keyLower === 'female' || keyLower === 'หญิง' || keyLower.includes('ผู้หญิง')) {
        extractedGender.push({ label: 'หญิง (Female)', percent: pct });
      } else if (/^\d{2}\s*[-–]\s*\d{2}/.test(keyRaw) || /^\d{2}\+/.test(keyRaw)) {
        const cleanRange = keyRaw.includes('ปี') ? keyRaw : `${keyRaw.replace('-', ' – ')} ปี`;
        extractedAge.push({ range: cleanRange, percent: Math.round(pct) });
      } else if (
        headers[0]?.includes('territor') ||
        headers[0]?.includes('city') ||
        headers[0]?.includes('country') ||
        headers[0]?.includes('location') ||
        headers[0]?.includes('จังหวัด')
      ) {
        extractedLocations.push({ name: keyRaw, percent: pct });
      }
    }
  }

  const metrics: SmartImportMetricItem[] = [];

  if (latestFollowers > 0) {
    metrics.push({
      id: `${targetPlatform}-profile-followers`,
      selected: true,
      platform: targetPlatform,
      timeframe: 'profile',
      field: 'followers',
      labelTh: 'ยอดผู้ติดตาม (Followers)',
      oldValue: targetPlatObj.followers,
      newValue: formatCompactStatNumber(latestFollowers),
    });
  }

  if (totalViews > 0) {
    metrics.push({
      id: `${targetPlatform}-${targetTimeframe}-views`,
      selected: true,
      platform: targetPlatform,
      timeframe: targetTimeframe,
      field: 'views',
      labelTh: 'ยอดวิวรวม (Video Views)',
      oldValue: currentTf.views,
      newValue: formatCompactStatNumber(totalViews),
    });
  }

  if (totalLikes > 0) {
    metrics.push({
      id: `${targetPlatform}-${targetTimeframe}-likes`,
      selected: true,
      platform: targetPlatform,
      timeframe: targetTimeframe,
      field: 'likes',
      labelTh: 'ยอดกดถูกใจ (Likes)',
      oldValue: currentTf.likes,
      newValue: formatCompactStatNumber(totalLikes),
    });
  }

  if (totalComments > 0) {
    metrics.push({
      id: `${targetPlatform}-${targetTimeframe}-comments`,
      selected: true,
      platform: targetPlatform,
      timeframe: targetTimeframe,
      field: 'comments',
      labelTh: 'ความคิดเห็น (Comments)',
      oldValue: currentTf.comments,
      newValue: formatCompactStatNumber(totalComments),
    });
  }

  if (totalShares > 0) {
    metrics.push({
      id: `${targetPlatform}-${targetTimeframe}-shares`,
      selected: true,
      platform: targetPlatform,
      timeframe: targetTimeframe,
      field: 'shares',
      labelTh: 'การแชร์ (Shares)',
      oldValue: currentTf.shares,
      newValue: formatCompactStatNumber(totalShares),
    });
  }

  if (totalViews > 0 && (totalLikes > 0 || totalComments > 0 || totalShares > 0)) {
    const computedEr = (((totalLikes + totalComments + totalShares) / totalViews) * 100).toFixed(2);
    metrics.push({
      id: `${targetPlatform}-${targetTimeframe}-er`,
      selected: true,
      platform: targetPlatform,
      timeframe: targetTimeframe,
      field: 'er',
      labelTh: 'Engagement Rate คำนวณอัตโนมัติ (ER%)',
      oldValue: currentTf.er,
      newValue: `${computedEr}%`,
    });
  }

  if (totalReach > 0) {
    metrics.push({
      id: `${targetPlatform}-${targetTimeframe}-reach`,
      selected: true,
      platform: targetPlatform,
      timeframe: targetTimeframe,
      field: 'reach',
      labelTh: 'การเข้าถึงผู้ชม (Reach)',
      oldValue: currentOv.monthlyReach,
      newValue: formatCompactStatNumber(totalReach),
    });
  }

  const existingDemo =
    creator.demographics.platformDemographics?.[targetPlatform] || creator.demographics;

  let demographics: SmartImportDemographicsPreview | undefined;
  if (
    extractedAge.length > 0 ||
    extractedGender.length > 0 ||
    extractedLocations.length > 0
  ) {
    demographics = {
      selected: true,
      platform: targetPlatform,
      ageGroups:
        extractedAge.length > 0
          ? extractedAge
          : existingDemo.ageGroups.map((a) => ({ ...a })),
      gender:
        extractedGender.length > 0
          ? extractedGender
          : existingDemo.gender.map((g) => ({ ...g })),
      locations:
        extractedLocations.length > 0
          ? extractedLocations.slice(0, 5)
          : existingDemo.locations.map((l) => ({ ...l })),
    };
  }

  if (metrics.length === 0 && !demographics) {
    throw new Error(
      'ไม่พบคอลัมน์สถิติที่รองรับในไฟล์ CSV กรุณาตรวจสอบว่าเป็นไฟล์ CSV ที่ส่งออกจากหน้า Analytics (Views, Likes, Comments, Shares หรือ Audience)'
    );
  }

  return {
    sourceType: 'csv',
    summaryNote: `ประมวลผลไฟล์ CSV สำเร็จ (${files.length} ไฟล์ · รวมข้อมูล ${rowCount} แถว) คำนวณผลรวมและอัตราการมีส่วนร่วมเรียบร้อยแล้ว`,
    metrics,
    demographics,
  };
}

/**
 * 4. Apply Confirmed Smart Import Preview onto CreatorProfile
 */
export function applySmartImportToCreator(
  creator: CreatorProfile,
  preview: SmartImportPreviewResult,
  autoRecalculateWeightedDemo = true
): CreatorProfile {
  const selectedMetrics = preview.metrics.filter((m) => m.selected);
  const updatedPlatforms = creator.platforms.map((pl) => {
    const platClone: PlatformStat = {
      ...pl,
      timeframes: {
        '28d': { ...resolvePlatformMetricsForTimeframe(pl, '28d') },
        '60d': { ...resolvePlatformMetricsForTimeframe(pl, '60d') },
        lifetime: { ...resolvePlatformMetricsForTimeframe(pl, 'lifetime') },
      },
    };

    for (const m of selectedMetrics) {
      if (m.platform !== pl.id) continue;

      if (m.timeframe === 'profile') {
        if (m.field === 'followers') {
          platClone.followers = m.newValue;
          const parsedNum = parseFormattedStatNumber(m.newValue);
          if (parsedNum > 0) {
            platClone.followersNum = Math.round(parsedNum);
          }
        } else if (m.field === 'handle') {
          platClone.handle = m.newValue;
        }
      } else {
        const tf = platClone.timeframes![m.timeframe];
        if (m.field === 'views') tf.views = m.newValue;
        else if (m.field === 'likes') tf.likes = m.newValue;
        else if (m.field === 'comments') tf.comments = m.newValue;
        else if (m.field === 'shares') tf.shares = m.newValue;
        else if (m.field === 'er') {
          tf.er = m.newValue.includes('%') ? m.newValue : `${m.newValue}%`;
          const erNum = parseFloat(m.newValue.replace(/[^0-9.]/g, ''));
          if (!Number.isNaN(erNum)) tf.erNum = erNum;
        }
      }
    }

    // Keep base platform fields synced with '60d' timeframe
    const tf60 = platClone.timeframes!['60d'];
    platClone.views = tf60.views;
    platClone.likes = tf60.likes;
    platClone.comments = tf60.comments;
    platClone.shares = tf60.shares;
    platClone.er = tf60.er;
    platClone.erNum = tf60.erNum;

    return platClone;
  });

  // Recalculate overview timeframes & total followers
  const sumFollowers = updatedPlatforms.reduce((acc, p) => acc + (p.followersNum || 0), 0);
  const nextOverview = {
    ...creator.overview,
    totalFollowers:
      sumFollowers > 0
        ? formatCompactStatNumber(sumFollowers)
        : creator.overview.totalFollowers,
  };

  const nextOverviewTimeframes: Record<StatsTimeframe, any> = {
    '28d': { ...resolveOverviewForTimeframe(creator, '28d') },
    '60d': { ...resolveOverviewForTimeframe(creator, '60d') },
    lifetime: { ...resolveOverviewForTimeframe(creator, 'lifetime') },
  };

  for (const tfKey of ['28d', '60d', 'lifetime'] as StatsTimeframe[]) {
    const touchedInThisTf = selectedMetrics.some((m) => m.timeframe === tfKey);
    if (!touchedInThisTf) continue;

    const sumViews = updatedPlatforms.reduce(
      (s, p) => s + parseFormattedStatNumber(p.timeframes?.[tfKey]?.views),
      0
    );
    const sumLikes = updatedPlatforms.reduce(
      (s, p) => s + parseFormattedStatNumber(p.timeframes?.[tfKey]?.likes),
      0
    );
    const validErs = updatedPlatforms
      .map((p) => p.timeframes?.[tfKey]?.erNum || 0)
      .filter((n) => n > 0);
    const avgEr =
      validErs.length > 0
        ? `${(validErs.reduce((a, b) => a + b, 0) / validErs.length).toFixed(2)}%`
        : nextOverviewTimeframes[tfKey].totalEr;

    const reachItem = selectedMetrics.find(
      (m) => m.timeframe === tfKey && m.field === 'reach'
    );

    if (sumViews > 0) {
      nextOverviewTimeframes[tfKey].totalViews = formatCompactStatNumber(sumViews);
    }
    if (sumLikes > 0) {
      nextOverviewTimeframes[tfKey].monthlyLikes = formatCompactStatNumber(sumLikes);
    }
    nextOverviewTimeframes[tfKey].totalEr = avgEr;
    if (reachItem) {
      nextOverviewTimeframes[tfKey].monthlyReach = reachItem.newValue;
    }
  }

  // Sync 60d overview back to legacy root overview
  nextOverview.totalViews60d = nextOverviewTimeframes['60d'].totalViews;
  nextOverview.totalEr = nextOverviewTimeframes['60d'].totalEr;
  nextOverview.monthlyReach = nextOverviewTimeframes['60d'].monthlyReach;
  nextOverview.monthlyLikes = nextOverviewTimeframes['60d'].monthlyLikes;

  // Apply Demographics if selected
  let nextDemographics = {
    ...creator.demographics,
    platformDemographics: {
      ...(creator.demographics.platformDemographics || {}),
    },
  };

  if (preview.demographics && preview.demographics.selected) {
    const targetDemoPlat = preview.demographics.platform;
    if (targetDemoPlat === 'overall') {
      nextDemographics = {
        ...nextDemographics,
        ageGroups: preview.demographics.ageGroups,
        gender: preview.demographics.gender,
        locations: preview.demographics.locations,
      };
    } else {
      const existingPlatDemo =
        nextDemographics.platformDemographics?.[targetDemoPlat] || creator.demographics;
      nextDemographics.platformDemographics![targetDemoPlat] = {
        ...existingPlatDemo,
        ageGroups: preview.demographics.ageGroups,
        gender: preview.demographics.gender,
        locations: preview.demographics.locations,
      };
    }
  }

  let draftResult: CreatorProfile = {
    ...creator,
    platforms: updatedPlatforms,
    overview: nextOverview,
    overviewTimeframes: nextOverviewTimeframes,
    demographics: nextDemographics,
  };

  if (preview.demographics?.selected && autoRecalculateWeightedDemo) {
    const weighted = calculateFollowerWeightedDemographics(draftResult);
    draftResult = {
      ...draftResult,
      demographics: {
        ...draftResult.demographics,
        ageGroups: weighted.ageGroups,
        gender: weighted.gender,
        locations: weighted.locations,
      },
    };
  }

  return draftResult;
}
