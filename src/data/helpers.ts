import type {
  CreatorProfile,
  PlatformStat,
  StatsTimeframe,
  TimeframeOverviewMetrics,
  TimeframePlatformMetrics,
  PlatformDemographicsData,
  DemographicAgeGroup,
  DemographicGender,
  DemographicLocation,
} from './types';

export const STATS_TIMEFRAME_OPTIONS: {
  id: StatsTimeframe;
  label: string;
  labelTh: string;
  shortLabel: string;
  shortBadge: string;
  badgeLabel: string;
  viewsLabel: string;
  viewsLabelTh: string;
  viewsLabelEn: string;
  cardViewsLabel: string;
  kpiViewsTitle: string;
}[] = [
  {
    id: '28d',
    label: 'ย้อนหลัง 28 วัน (28d)',
    labelTh: '28 วันล่าสุด',
    shortLabel: '28 วันล่าสุด',
    shortBadge: '28 วัน',
    badgeLabel: 'สถิติย้อนหลัง 28 วันล่าสุด',
    viewsLabel: 'Views (28d)',
    viewsLabelTh: 'ยอดวิวรวม 28 วัน',
    viewsLabelEn: 'Views (28d)',
    cardViewsLabel: 'Views (28 วัน)',
    kpiViewsTitle: 'ยอดวิวรวม 28 วัน (Views 28d)',
  },
  {
    id: '60d',
    label: 'ย้อนหลัง 60 วัน (60d)',
    labelTh: '60 วันล่าสุด',
    shortLabel: '60 วันล่าสุด',
    shortBadge: '60 วัน',
    badgeLabel: '28 วันล่าสุด · วิว 60 วัน',
    viewsLabel: 'Views (60d)',
    viewsLabelTh: 'ยอดวิวรวม 60 วัน',
    viewsLabelEn: 'Views (60d)',
    cardViewsLabel: 'Views (60 วัน)',
    kpiViewsTitle: 'ยอดวิวรวม 60 วัน (Views 60d)',
  },
  {
    id: 'lifetime',
    label: 'สะสมทั้งหมด (Lifetime)',
    labelTh: 'สะสมทั้งหมด (Lifetime)',
    shortLabel: 'สะสมทั้งหมด (Lifetime)',
    shortBadge: 'Lifetime',
    badgeLabel: 'สถิติสะสมทั้งหมด (Lifetime)',
    viewsLabel: 'Views (Lifetime)',
    viewsLabelTh: 'ยอดวิวสะสมทั้งหมด',
    viewsLabelEn: 'Lifetime Views',
    cardViewsLabel: 'Views (Lifetime)',
    kpiViewsTitle: 'ยอดวิวสะสมทั้งหมด (Lifetime Views)',
  },
];

export function parseFormattedStatNumber(val?: string | number): number {
  if (typeof val === 'number') return val;
  if (!val || typeof val !== 'string') return 0;
  const clean = val.trim().toUpperCase().replace(/,/g, '');
  const match = clean.match(/[\d.]+/);
  if (!match) return 0;
  let num = parseFloat(match[0]);
  if (Number.isNaN(num)) return 0;
  if (clean.includes('B')) num *= 1_000_000_000;
  else if (clean.includes('M')) num *= 1_000_000;
  else if (clean.includes('K')) num *= 1_000;
  return num;
}

export function formatCompactStatNumber(num: number): string {
  if (!Number.isFinite(num) || num <= 0) return '0';
  if (num >= 1_000_000) {
    const m = num / 1_000_000;
    return `${parseFloat(m.toFixed(m >= 100 ? 1 : 2))}M`;
  }
  if (num >= 1_000) {
    const k = num / 1_000;
    return `${parseFloat(k.toFixed(k >= 100 ? 1 : 1))}K`;
  }
  return Math.round(num).toLocaleString();
}

export function resolvePlatformMetricsForTimeframe(
  plat: PlatformStat,
  timeframe: StatsTimeframe
): TimeframePlatformMetrics {
  const existing = plat.timeframes?.[timeframe];
  if (existing && existing.views) {
    return existing;
  }

  // Fallback synthesis from base (60d) fields if document predates multi-timeframe schema
  const baseViews = parseFormattedStatNumber(plat.views);
  const baseLikes = parseFormattedStatNumber(plat.likes);
  const baseComments = parseFormattedStatNumber(plat.comments);
  const baseShares = parseFormattedStatNumber(plat.shares);
  const baseEr = plat.erNum || parseFloat((plat.er || '0').replace(/[^0-9.]/g, '')) || 4.5;

  if (timeframe === '60d') {
    return {
      views: plat.views || '0',
      likes: plat.likes || '0',
      comments: plat.comments || '0',
      shares: plat.shares || '0',
      er: plat.er || `${baseEr}%`,
      erNum: baseEr,
    };
  }

  if (timeframe === '28d') {
    const factor = 0.48;
    const er28 = parseFloat((baseEr * 1.02).toFixed(2));
    return {
      views: baseViews > 0 ? formatCompactStatNumber(baseViews * factor) : plat.views,
      likes: baseLikes > 0 ? formatCompactStatNumber(baseLikes * factor) : plat.likes,
      comments: baseComments > 0 ? formatCompactStatNumber(baseComments * factor) : plat.comments,
      shares: baseShares > 0 ? formatCompactStatNumber(baseShares * factor) : plat.shares,
      er: `${er28}%`,
      erNum: er28,
    };
  }

  // lifetime fallback
  const ltFactor = plat.id === 'youtube' ? 18 : plat.id === 'tiktok' ? 15 : 9.5;
  const erLt = parseFloat((baseEr * 1.08).toFixed(2));
  return {
    views: baseViews > 0 ? formatCompactStatNumber(baseViews * ltFactor) : plat.views,
    likes: baseLikes > 0 ? formatCompactStatNumber(baseLikes * ltFactor) : plat.likes,
    comments: baseComments > 0 ? formatCompactStatNumber(baseComments * ltFactor) : plat.comments,
    shares: baseShares > 0 ? formatCompactStatNumber(baseShares * ltFactor) : plat.shares,
    er: `${erLt}%`,
    erNum: erLt,
  };
}

export function resolveOverviewForTimeframe(
  creator: CreatorProfile,
  timeframe: StatsTimeframe
): TimeframeOverviewMetrics & { totalFollowers: string } {
  const existing = creator.overviewTimeframes?.[timeframe];
  if (existing && existing.totalViews) {
    return {
      totalFollowers: creator.overview.totalFollowers,
      ...existing,
    };
  }

  if (timeframe === '60d') {
    return {
      totalFollowers: creator.overview.totalFollowers,
      totalViews: creator.overview.totalViews60d,
      totalEr: creator.overview.totalEr,
      avgViewsPerContent: creator.overview.avgViewsPerContent,
      monthlyReach: creator.overview.monthlyReach,
      monthlyLikes: creator.overview.monthlyLikes,
      periodBadgeLabel: creator.heroTimeframeBadge || '28 วันล่าสุด · วิว 60 วัน',
    };
  }

  // Compute from platforms for 28d or lifetime if not explicitly saved yet
  const platMetrics = creator.platforms.map((p) =>
    resolvePlatformMetricsForTimeframe(p, timeframe)
  );
  const sumViews = platMetrics.reduce(
    (sum, m) => sum + parseFormattedStatNumber(m.views),
    0
  );
  const sumLikes = platMetrics.reduce(
    (sum, m) => sum + parseFormattedStatNumber(m.likes),
    0
  );
  const validErs = platMetrics.filter((m) => m.erNum > 0);
  const avgEr =
    validErs.length > 0
      ? `${(validErs.reduce((s, m) => s + m.erNum, 0) / validErs.length).toFixed(2)}%`
      : creator.overview.totalEr;

  const baseReach = parseFormattedStatNumber(creator.overview.monthlyReach);
  const baseAvgViews = parseFormattedStatNumber(creator.overview.avgViewsPerContent);

  if (timeframe === '28d') {
    return {
      totalFollowers: creator.overview.totalFollowers,
      totalViews: sumViews > 0 ? formatCompactStatNumber(sumViews) : creator.overview.totalViews60d,
      totalEr: avgEr,
      avgViewsPerContent:
        baseAvgViews > 0
          ? formatCompactStatNumber(baseAvgViews * 1.02)
          : creator.overview.avgViewsPerContent,
      monthlyReach: creator.overview.monthlyReach,
      monthlyLikes: sumLikes > 0 ? formatCompactStatNumber(sumLikes) : creator.overview.monthlyLikes,
      periodBadgeLabel: 'สถิติย้อนหลัง 28 วันล่าสุด',
    };
  }

  return {
    totalFollowers: creator.overview.totalFollowers,
    totalViews: sumViews > 0 ? formatCompactStatNumber(sumViews) : creator.overview.totalViews60d,
    totalEr: avgEr,
    avgViewsPerContent:
      baseAvgViews > 0
        ? formatCompactStatNumber(baseAvgViews * 1.18)
        : creator.overview.avgViewsPerContent,
    monthlyReach:
      baseReach > 0 ? `${formatCompactStatNumber(baseReach * 14)}+` : creator.overview.monthlyReach,
    monthlyLikes: sumLikes > 0 ? formatCompactStatNumber(sumLikes) : creator.overview.monthlyLikes,
    periodBadgeLabel: 'สถิติสะสมทั้งหมด (Lifetime)',
  };
}

/**
 * Calculates demographic metrics averaged across all 4 platforms,
 * weighted proportionally by each platform's follower count.
 * Form: W_i = Followers_i / Sum(Followers)
 */
export function calculateFollowerWeightedDemographics(
  creator: CreatorProfile
): PlatformDemographicsData {
  const rootDemo = creator.demographics;
  const platformDemos = rootDemo.platformDemographics;

  // Fallback if no per-platform demographic records exist
  if (!platformDemos || Object.keys(platformDemos).length === 0) {
    return {
      ageGroups: rootDemo.ageGroups || [],
      gender: rootDemo.gender || [],
      locations: rootDemo.locations || [],
      ageBadge: rootDemo.ageBadge,
      ageSubtitle: rootDemo.ageSubtitle,
      ageFooterLeft: rootDemo.ageFooterLeft,
      ageFooterRight: rootDemo.ageFooterRight,
      ageTooltipStrategy: rootDemo.ageTooltipStrategy,
      ageTooltipProducts: rootDemo.ageTooltipProducts,
      genderBadge: rootDemo.genderBadge,
      genderSubtitle: rootDemo.genderSubtitle,
      genderFooter: rootDemo.genderFooter,
      genderTooltipStrategy: rootDemo.genderTooltipStrategy,
      genderTooltipProducts: rootDemo.genderTooltipProducts,
      locationBadge: rootDemo.locationBadge,
      locationSubtitle: rootDemo.locationSubtitle,
      locationFooter: rootDemo.locationFooter,
      locationTooltipStrategy: rootDemo.locationTooltipStrategy,
      locationTooltipProducts: rootDemo.locationTooltipProducts,
    };
  }

  // Calculate platform weights based on follower counts
  const platformEntries = (creator.platforms || []).map((p) => {
    const rawCount = p.followersNum || parseFormattedStatNumber(p.followers) || 1000;
    const demo = platformDemos[p.id];
    return { id: p.id, followers: rawCount, demo };
  }).filter((entry) => !!entry.demo);

  if (platformEntries.length === 0) {
    return {
      ageGroups: rootDemo.ageGroups,
      gender: rootDemo.gender,
      locations: rootDemo.locations,
      ageBadge: rootDemo.ageBadge,
      ageSubtitle: rootDemo.ageSubtitle,
      genderBadge: rootDemo.genderBadge,
      genderSubtitle: rootDemo.genderSubtitle,
      locationBadge: rootDemo.locationBadge,
      locationSubtitle: rootDemo.locationSubtitle,
    };
  }

  const totalFollowers = platformEntries.reduce((sum, e) => sum + e.followers, 0) || 1;

  // 1. Weighted Age Groups
  // Collect all unique age bracket ranges
  const rangeOrder: string[] = [];
  platformEntries.forEach((e) => {
    e.demo?.ageGroups?.forEach((ag) => {
      if (!rangeOrder.includes(ag.range)) {
        rangeOrder.push(ag.range);
      }
    });
  });

  const rawWeightedAge = rangeOrder.map((range) => {
    let weightedSum = 0;
    platformEntries.forEach((e) => {
      const match = e.demo?.ageGroups?.find((ag) => ag.range === range);
      const val = match ? match.percent : 0;
      weightedSum += val * (e.followers / totalFollowers);
    });
    return { range, percent: Math.round(weightedSum) };
  });

  // Normalize age groups to sum to 100
  const ageSum = rawWeightedAge.reduce((s, a) => s + a.percent, 0);
  if (ageSum !== 100 && rawWeightedAge.length > 0) {
    const diff = 100 - ageSum;
    // Add diff to the highest bracket to preserve natural look
    let maxIdx = 0;
    rawWeightedAge.forEach((a, i) => {
      if (a.percent > rawWeightedAge[maxIdx].percent) maxIdx = i;
    });
    rawWeightedAge[maxIdx].percent = Math.max(0, rawWeightedAge[maxIdx].percent + diff);
  }

  // 2. Weighted Gender
  const genderLabels: string[] = [];
  platformEntries.forEach((e) => {
    e.demo?.gender?.forEach((g) => {
      if (!genderLabels.includes(g.label)) {
        genderLabels.push(g.label);
      }
    });
  });

  const rawWeightedGender = genderLabels.map((label) => {
    let weightedSum = 0;
    platformEntries.forEach((e) => {
      const match = e.demo?.gender?.find((g) => g.label === label);
      const val = match ? match.percent : 0;
      weightedSum += val * (e.followers / totalFollowers);
    });
    return { label, percent: parseFloat(weightedSum.toFixed(1)) };
  });

  // Normalize gender to 100.0%
  const genderSum = rawWeightedGender.reduce((s, g) => s + g.percent, 0);
  if (Math.abs(genderSum - 100) > 0.01 && rawWeightedGender.length > 0) {
    const diff = parseFloat((100 - genderSum).toFixed(1));
    rawWeightedGender[0].percent = parseFloat(
      Math.max(0, rawWeightedGender[0].percent + diff).toFixed(1)
    );
  }

  // 3. Weighted Locations
  const locationNames: string[] = [];
  platformEntries.forEach((e) => {
    e.demo?.locations?.forEach((loc) => {
      if (!locationNames.includes(loc.name)) {
        locationNames.push(loc.name);
      }
    });
  });

  const rawWeightedLocations = locationNames.map((name) => {
    let weightedSum = 0;
    platformEntries.forEach((e) => {
      const match = e.demo?.locations?.find((loc) => loc.name === name);
      const val = match ? match.percent : 0;
      weightedSum += val * (e.followers / totalFollowers);
    });
    return { name, percent: parseFloat(weightedSum.toFixed(1)) };
  });

  // Sort locations by percentage descending
  rawWeightedLocations.sort((a, b) => b.percent - a.percent);

  // Normalize locations to 100.0%
  const locSum = rawWeightedLocations.reduce((s, l) => s + l.percent, 0);
  if (Math.abs(locSum - 100) > 0.01 && rawWeightedLocations.length > 0) {
    const diff = parseFloat((100 - locSum).toFixed(1));
    rawWeightedLocations[0].percent = parseFloat(
      Math.max(0, rawWeightedLocations[0].percent + diff).toFixed(1)
    );
  }

  return {
    ageGroups: rawWeightedAge,
    gender: rawWeightedGender,
    locations: rawWeightedLocations,
    ageBadge: rootDemo.ageBadge || 'ค่าเฉลี่ยทุกช่องทาง',
    ageSubtitle: rootDemo.ageSubtitle || 'ถ่วงน้ำหนักตามสัดส่วนผู้ติดตามจริง',
    ageFooterLeft: rootDemo.ageFooterLeft,
    ageFooterRight: rootDemo.ageFooterRight,
    ageTooltipStrategy: rootDemo.ageTooltipStrategy,
    ageTooltipProducts: rootDemo.ageTooltipProducts,
    genderBadge: rootDemo.genderBadge,
    genderSubtitle: rootDemo.genderSubtitle || 'สัดส่วนเฉลี่ยรวม 4 แพลตฟอร์ม',
    genderFooter: rootDemo.genderFooter,
    genderTooltipStrategy: rootDemo.genderTooltipStrategy,
    genderTooltipProducts: rootDemo.genderTooltipProducts,
    locationBadge: rootDemo.locationBadge,
    locationSubtitle: rootDemo.locationSubtitle || 'พื้นที่ผู้ชมสูงสุดจากทุกแพลตฟอร์ม',
    locationFooter: rootDemo.locationFooter,
    locationTooltipStrategy: rootDemo.locationTooltipStrategy,
    locationTooltipProducts: rootDemo.locationTooltipProducts,
  };
}

/**
 * Resolves demographic data for a given view ('overall' or specific platform id)
 */
export function resolveDemographicsForView(
  creator: CreatorProfile,
  view?: string
): PlatformDemographicsData {
  const rootDemo = creator.demographics;
  const target = (view || rootDemo.defaultDemographicView || 'overall').toLowerCase();

  if (target === 'overall') {
    if (rootDemo.platformDemographics && Object.keys(rootDemo.platformDemographics).length > 0) {
      return calculateFollowerWeightedDemographics(creator);
    }
    return rootDemo;
  }

  const platformSpecific = rootDemo.platformDemographics?.[target];
  if (platformSpecific && platformSpecific.ageGroups && platformSpecific.ageGroups.length > 0) {
    return platformSpecific;
  }

  // Fallback to overall or root
  if (rootDemo.platformDemographics && Object.keys(rootDemo.platformDemographics).length > 0) {
    return calculateFollowerWeightedDemographics(creator);
  }
  return rootDemo;
}

/**
 * Helper to convert Google Drive share URLs into direct image URLs
 */
export function resolveGoogleDriveImage(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  // Match /file/d/FILE_ID/ or id=FILE_ID
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}=w1200`;
  }
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${idParamMatch[1]}=w1200`;
  }
  return trimmed;
}

/**
 * Extract Google Drive File ID if present
 */
export function extractGoogleDriveId(url: string): string | null {
  if (!url) return null;
  const m1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m1?.[1]) return m1[1];
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2?.[1]) return m2[1];
  return null;
}

export type VideoSourceInfo =
  | { type: 'drive'; embedUrl: string; fileId: string; rawUrl: string }
  | { type: 'direct'; src: string; rawUrl: string }
  | { type: 'youtube'; embedUrl: string; rawUrl: string }
  | { type: 'none' };

/**
 * Resolve video source from URL (Google Drive embed, direct mp4/webm, or YouTube)
 */
export function resolveVideoSource(url?: string): VideoSourceInfo {
  if (!url || typeof url !== 'string') return { type: 'none' };
  const trimmed = url.trim();
  if (!trimmed) return { type: 'none' };

  // 1. Google Drive link
  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    return {
      type: 'drive',
      embedUrl: `https://drive.google.com/file/d/${driveId}/preview`,
      fileId: driveId,
      rawUrl: trimmed,
    };
  }

  // 2. YouTube Shorts or Video
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&loop=1&playsinline=1&playlist=${ytMatch[1]}`,
      rawUrl: trimmed,
    };
  }

  // 3. Direct HTML5 video link (mp4, webm, mov, ogg, blob, or common cdn video)
  const isDirect =
    /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(trimmed) ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:video');
  if (isDirect) {
    return {
      type: 'direct',
      src: trimmed,
      rawUrl: trimmed,
    };
  }

  // Fallback: If it's a URL starting with http/https, try direct player or preview
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // If it contains "drive.google.com", ensure we construct preview
    if (trimmed.includes('drive.google.com')) {
      const parts = trimmed.split('/');
      const dIndex = parts.indexOf('d');
      if (dIndex !== -1 && parts[dIndex + 1]) {
        const id = parts[dIndex + 1];
        return {
          type: 'drive',
          embedUrl: `https://drive.google.com/file/d/${id}/preview`,
          fileId: id,
          rawUrl: trimmed,
        };
      }
    }

    return {
      type: 'direct',
      src: trimmed,
      rawUrl: trimmed,
    };
  }

  return { type: 'none' };
}
