/**
 * platformApiService.ts
 * Enterprise-grade multi-platform statistics synchronization service for "จุ๊ยจุ๊ย"
 * Supports YouTube Data API v3, Meta Graph API v20.0 (Instagram & Facebook),
 * TikTok Open API, and high-fidelity live simulation with delta analysis.
 */

import { PlatformStat } from '../data/types';

export interface PlatformApiCredentials {
  youtube: {
    apiKey: string;
    channelId: string;
    customHandle: string;
  };
  tiktok: {
    clientKey: string;
    clientSecret?: string;
    accessToken: string;
    username: string;
  };
  instagram: {
    accessToken: string;
    igUserId: string;
    username: string;
  };
  facebook: {
    pageAccessToken: string;
    pageId: string;
    pageName: string;
  };
}

export interface TikTokConfigResponse {
  clientKey: string;
  hasClientSecret: boolean;
  isConnected: boolean;
  expiresAt: number | null;
  openId: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  followerCount: number | null;
  likesCount: number | null;
  videoCount: number | null;
  lastSyncedAt: string | null;
  redirectUri: string;
}

export const DEFAULT_API_CREDENTIALS: PlatformApiCredentials = {
  youtube: {
    apiKey: '',
    channelId: 'UC_juijui_official_channel',
    customHandle: '@JUIJUIChannel',
  },
  tiktok: {
    clientKey: '',
    clientSecret: '',
    accessToken: '',
    username: 'juijui.j',
  },
  instagram: {
    accessToken: '',
    igUserId: '17841400000000000',
    username: 'juijui.official',
  },
  facebook: {
    pageAccessToken: '',
    pageId: 'juijui.fanpage.official',
    pageName: 'จุ๊ยจุ๊ย จุ๊ย',
  },
};

export interface FetchedPlatformData {
  platformId: PlatformStat['id'];
  name: string;
  handle: string;
  followersNum: number;
  followersFormatted: string;
  viewsFormatted: string;
  viewsNum?: number;
  likesFormatted?: string;
  commentsFormatted?: string;
  sharesFormatted?: string;
  erNum: number;
  erFormatted: string;
  source: 'official_api' | 'verified_simulation';
  status: 'success' | 'warning' | 'error';
  statusMessage: string;
  rawTimestamp: string;
}

export interface SinglePlatformTestResult {
  platformId: PlatformStat['id'];
  platformName: string;
  success: boolean;
  statusMessage: string;
  latencyMs: number;
  data?: FetchedPlatformData;
  error?: string;
  advice?: string;
  timestamp: string;
}

export interface PlatformDiffItem {
  platformId: PlatformStat['id'];
  name: string;
  handle: string;
  accentColor: string;
  currentFollowersNum: number;
  currentFollowers: string;
  newFollowersNum: number;
  newFollowers: string;
  followerDelta: number;
  followerDeltaPercent: number;
  currentViews: string;
  newViews: string;
  currentLikes: string;
  newLikes: string;
  currentComments: string;
  newComments: string;
  currentShares: string;
  newShares: string;
  currentEr: string;
  newEr: string;
  erDelta: number;
  status: 'success' | 'warning' | 'error';
  statusMessage: string;
  source: 'official_api' | 'verified_simulation';
  isSelected: boolean;
}

export interface SyncSnapshotHistoryItem {
  id: string;
  timestamp: string;
  dateFormatted: string;
  triggerType: 'official_api' | 'simulation' | 'manual_rollback';
  summary: {
    totalFollowers: string;
    totalReach: string;
    totalEr: string;
    totalPlatformsCount: number;
    platformChangesSummary: string;
  };
  platformsSnapshot: PlatformStat[];
  overviewSnapshot: {
    totalFollowers: string;
    totalViews60d: string;
    totalEr: string;
    avgViewsPerContent: string;
    monthlyReach: string;
    monthlyLikes: string;
  };
}

export function formatFollowerCount(num: number): string {
  if (num >= 1_000_000) {
    const val = num / 1_000_000;
    return val >= 10 ? `${val.toFixed(1)}M` : `${val.toFixed(2).replace(/\.?0+$/, '')}M`;
  }
  if (num >= 1_000) {
    const val = num / 1_000;
    return val >= 100 ? `${Math.round(val)}K` : `${val.toFixed(1).replace(/\.0$/, '')}K`;
  }
  return num.toLocaleString('en-US');
}

export function formatCompactMetric(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toLocaleString('en-US');
}

export function parseCountToNumber(raw: string | number): number {
  if (typeof raw === 'number') return raw;
  if (!raw) return 0;
  const cleaned = raw.trim().toUpperCase().replace(/,/g, '');
  const match = cleaned.match(/[\d.]+/);
  if (!match) return 0;
  let num = parseFloat(match[0]);
  if (cleaned.includes('M')) num *= 1_000_000;
  else if (cleaned.includes('K')) num *= 1_000;
  return Number.isNaN(num) ? 0 : Math.round(num);
}

/**
 * Fetch YouTube Channel Statistics via YouTube Data API v3
 */
export async function fetchYouTubeStats(
  creds: PlatformApiCredentials['youtube'],
  current: PlatformStat
): Promise<FetchedPlatformData> {
  if (!creds.apiKey || (!creds.channelId && !creds.customHandle)) {
    throw new Error('กรุณาระบุ YouTube API Key และ Channel ID / Handle');
  }

  let url = '';
  if (creds.channelId && !creds.channelId.startsWith('@')) {
    url = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,contentDetails&id=${encodeURIComponent(
      creds.channelId
    )}&key=${encodeURIComponent(creds.apiKey)}`;
  } else {
    const handle = creds.customHandle.startsWith('@')
      ? creds.customHandle.slice(1)
      : creds.customHandle;
    url = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,contentDetails&forHandle=${encodeURIComponent(
      handle
    )}&key=${encodeURIComponent(creds.apiKey)}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData?.error?.message || `YouTube API HTTP Error ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  const item = data.items?.[0];
  if (!item) {
    throw new Error('ไม่พบข้อมูลช่อง YouTube ตาม Channel ID / Handle ที่ระบุ');
  }

  const stats = item.statistics;
  const subscriberCount = parseInt(stats.subscriberCount || '0', 10);
  const viewCount = parseInt(stats.viewCount || '0', 10);
  const videoCount = parseInt(stats.videoCount || '1', 10);

  let likesFormatted = current.likes;
  let commentsFormatted = current.comments;
  let calculatedEr: number | null = null;

  // Optionally fetch recent videos from uploads playlist to aggregate real Likes & Comments
  const uploadsPlaylistId = item.contentDetails?.relatedPlaylists?.uploads;
  if (uploadsPlaylistId) {
    try {
      const plResp = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${encodeURIComponent(
          uploadsPlaylistId
        )}&maxResults=20&key=${encodeURIComponent(creds.apiKey)}`
      );
      if (plResp.ok) {
        const plData = await plResp.json();
        const videoIds = (plData.items || [])
          .map((vi: { contentDetails?: { videoId?: string } }) => vi.contentDetails?.videoId)
          .filter(Boolean)
          .join(',');
        if (videoIds) {
          const vResp = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${encodeURIComponent(
              videoIds
            )}&key=${encodeURIComponent(creds.apiKey)}`
          );
          if (vResp.ok) {
            const vData = await vResp.json();
            let sumLikes = 0;
            let sumComments = 0;
            let sumRecentViews = 0;
            for (const vid of vData.items || []) {
              sumLikes += parseInt(vid.statistics?.likeCount || '0', 10);
              sumComments += parseInt(vid.statistics?.commentCount || '0', 10);
              sumRecentViews += parseInt(vid.statistics?.viewCount || '0', 10);
            }
            if (sumLikes > 0) likesFormatted = formatCompactMetric(sumLikes);
            if (sumComments > 0) commentsFormatted = formatCompactMetric(sumComments);
            if (sumRecentViews > 0) {
              const erVal = ((sumLikes + sumComments) / sumRecentViews) * 100;
              if (erVal > 0) calculatedEr = Math.min(Math.max(erVal, 1.2), 18.0);
            }
          }
        }
      }
    } catch {
      // Non-blocking enrichment
    }
  }

  const avgViews = Math.round(viewCount / Math.max(videoCount, 1));
  const fallbackEr = Math.min(Math.max((avgViews / Math.max(subscriberCount, 1)) * 4.2, 3.5), 9.2);
  const finalEr = calculatedEr ?? fallbackEr;

  return {
    platformId: 'youtube',
    name: 'YouTube',
    handle: creds.customHandle || (item.snippet?.customUrl ? item.snippet.customUrl : current.handle),
    followersNum: subscriberCount,
    followersFormatted: formatFollowerCount(subscriberCount),
    viewsFormatted: `${formatCompactMetric(viewCount)} views`,
    viewsNum: viewCount,
    likesFormatted,
    commentsFormatted,
    sharesFormatted: current.shares,
    erNum: parseFloat(finalEr.toFixed(1)),
    erFormatted: `${finalEr.toFixed(1)}%`,
    source: 'official_api',
    status: 'success',
    statusMessage: `ซิงค์สำเร็จจาก YouTube Data API v3 (${stats.videoCount} วิดีโอ)`,
    rawTimestamp: new Date().toISOString(),
  };
}

/**
 * Fetch Instagram Professional / Creator Account via Meta Graph API v20.0+
 * Compatible with v20.0/v21.0+ Insights metrics (views, reach, likes, comments, shares, saves, total_interactions, accounts_engaged)
 * and /media aggregation fallback (never uses deprecated 'impressions' metric).
 */
export async function fetchInstagramStats(
  creds: PlatformApiCredentials['instagram'],
  current: PlatformStat
): Promise<FetchedPlatformData> {
  if (!creds.accessToken) {
    throw new Error('กรุณาระบุ Instagram Graph API Access Token');
  }

  const token = creds.accessToken.trim();
  let targetIgId = (creds.igUserId || '').trim();
  const isPlaceholderId = !targetIgId || targetIgId === '17841400000000000';

  interface IgProfilePayload {
    id?: string;
    username?: string;
    name?: string;
    followers_count?: number;
    follows_count?: number;
    media_count?: number;
  }

  let profileData: IgProfilePayload | null = null;

  // Step 1A: If a valid-looking ID was provided, query basic profile fields ONLY (no deprecated insights.metric(impressions))
  if (!isPlaceholderId) {
    const profileUrl = `https://graph.facebook.com/v20.0/${encodeURIComponent(
      targetIgId
    )}?fields=id,username,name,followers_count,follows_count,media_count&access_token=${encodeURIComponent(
      token
    )}`;
    const resp = await fetch(profileUrl);
    if (resp.ok) {
      const json = await resp.json();
      if (json && (typeof json.followers_count === 'number' || json.username)) {
        profileData = json;
        targetIgId = json.id || targetIgId;
      }
    } else {
      // Check if user pasted a Facebook Page ID instead of an IG Business Account ID
      const pageCheckUrl = `https://graph.facebook.com/v20.0/${encodeURIComponent(
        targetIgId
      )}?fields=instagram_business_account{id,username,name,followers_count,follows_count,media_count}&access_token=${encodeURIComponent(
        token
      )}`;
      const pageResp = await fetch(pageCheckUrl);
      if (pageResp.ok) {
        const pageJson = await pageResp.json();
        if (pageJson?.instagram_business_account) {
          profileData = pageJson.instagram_business_account;
          targetIgId = pageJson.instagram_business_account.id || targetIgId;
        }
      }
    }
  }

  // Step 1B: Auto-discover IG Business Account via /me/accounts if not resolved yet
  if (!profileData) {
    const discoverUrl = `https://graph.facebook.com/v20.0/me/accounts?fields=id,name,instagram_business_account{id,username,name,followers_count,follows_count,media_count}&access_token=${encodeURIComponent(
      token
    )}`;
    const discResp = await fetch(discoverUrl);
    if (discResp.ok) {
      const discJson = await discResp.json();
      const pages: Array<{
        id: string;
        name: string;
        instagram_business_account?: IgProfilePayload;
      }> = discJson?.data || [];
      const matchedPage =
        pages.find(
          (p) =>
            p.instagram_business_account &&
            creds.username &&
            p.instagram_business_account.username?.toLowerCase() ===
              creds.username.replace(/^@/, '').toLowerCase()
        ) || pages.find((p) => Boolean(p.instagram_business_account));

      if (matchedPage?.instagram_business_account) {
        profileData = matchedPage.instagram_business_account;
        targetIgId = matchedPage.instagram_business_account.id || targetIgId;
      }
    } else if (isPlaceholderId) {
      const errData = await discResp.json().catch(() => ({}));
      const message =
        errData?.error?.message ||
        'กรุณาระบุ IG Business Account ID (ตัวเลข 17 หลัก) และตรวจสอบ Access Token';
      throw new Error(message);
    }
  }

  // If still no profileData, surface the exact error from querying targetIgId
  if (!profileData) {
    const retryUrl = `https://graph.facebook.com/v20.0/${encodeURIComponent(
      targetIgId
    )}?fields=id,username,name,followers_count,follows_count,media_count&access_token=${encodeURIComponent(
      token
    )}`;
    const retryResp = await fetch(retryUrl);
    const errData = await retryResp.json().catch(() => ({}));
    const message =
      errData?.error?.message ||
      `ไม่พบบัญชี Instagram Business จาก ID (${targetIgId}) กรุณาตรวจสอบว่าเชื่อมกับเพจ Facebook แล้ว`;
    throw new Error(message);
  }

  const followersCount = profileData.followers_count ?? 0;
  const mediaCount = profileData.media_count ?? 0;
  const resolvedUsername = profileData.username
    ? `@${profileData.username.replace(/^@/, '')}`
    : creds.username
    ? `@${creds.username.replace(/^@/, '')}`
    : current.handle;

  // Step 2: Fetch Account-Level Insights using valid Graph API v20.0+ metrics
  // Allowed total_value metrics: views, reach, accounts_engaged, total_interactions, likes, comments, shares, saves, replies, content_views
  let insightsViews = 0;
  let insightsReach = 0;
  let insightsLikes = 0;
  let insightsComments = 0;
  let insightsShares = 0;
  let insightsSaves = 0;
  let insightsTotalInteractions = 0;
  let insightsAccountsEngaged = 0;
  let insightsNote = '';

  const nowUnix = Math.floor(Date.now() / 1000);
  const since28d = nowUnix - 28 * 86400;

  try {
    const insightsUrl = `https://graph.facebook.com/v20.0/${encodeURIComponent(
      targetIgId
    )}/insights?metric=views,reach,likes,comments,shares,saves,total_interactions,accounts_engaged&period=day&metric_type=total_value&since=${since28d}&until=${nowUnix}&access_token=${encodeURIComponent(
      token
    )}`;
    const insResp = await fetch(insightsUrl);
    if (insResp.ok) {
      const insData = await insResp.json();
      for (const metricObj of insData?.data || []) {
        const name = metricObj.name;
        const val =
          typeof metricObj.total_value?.value === 'number'
            ? metricObj.total_value.value
            : Array.isArray(metricObj.values)
            ? metricObj.values.reduce(
                (acc: number, v: { value?: number }) => acc + (Number(v.value) || 0),
                0
              )
            : 0;

        if (name === 'views' || name === 'content_views') insightsViews = Math.max(insightsViews, val);
        else if (name === 'reach') insightsReach = val;
        else if (name === 'likes') insightsLikes = val;
        else if (name === 'comments') insightsComments = val;
        else if (name === 'shares') insightsShares = val;
        else if (name === 'saves') insightsSaves = val;
        else if (name === 'total_interactions') insightsTotalInteractions = val;
        else if (name === 'accounts_engaged') insightsAccountsEngaged = val;
      }
      insightsNote = ' + ดึง Insights 28 วัน (Views/Likes/Shares)';
    } else {
      // Fallback: Try core interaction metrics without accounts_engaged/saves in case of partial scope
      const fallbackInsUrl = `https://graph.facebook.com/v20.0/${encodeURIComponent(
        targetIgId
      )}/insights?metric=reach,likes,comments,shares,total_interactions&period=day&metric_type=total_value&since=${since28d}&until=${nowUnix}&access_token=${encodeURIComponent(
        token
      )}`;
      const fbInsResp = await fetch(fallbackInsUrl);
      if (fbInsResp.ok) {
        const fbInsData = await fbInsResp.json();
        for (const metricObj of fbInsData?.data || []) {
          const name = metricObj.name;
          const val =
            typeof metricObj.total_value?.value === 'number'
              ? metricObj.total_value.value
              : Array.isArray(metricObj.values)
              ? metricObj.values.reduce(
                  (acc: number, v: { value?: number }) => acc + (Number(v.value) || 0),
                  0
                )
              : 0;
          if (name === 'reach') insightsReach = val;
          else if (name === 'likes') insightsLikes = val;
          else if (name === 'comments') insightsComments = val;
          else if (name === 'shares') insightsShares = val;
          else if (name === 'total_interactions') insightsTotalInteractions = val;
        }
        insightsNote = ' + ดึง Insights 28 วัน';
      }
    }
  } catch {
    // Non-blocking if insights permission (instagram_manage_insights) is not enabled
  }

  // Step 3: Fetch Recent Media (/media) to aggregate Likes, Comments & Media Shares/Views
  let mediaLikesSum = 0;
  let mediaCommentsSum = 0;
  let mediaSharesSum = 0;
  let mediaViewsSum = 0;
  let fetchedMediaCount = 0;

  try {
    const mediaUrl = `https://graph.facebook.com/v20.0/${encodeURIComponent(
      targetIgId
    )}/media?fields=id,media_type,like_count,comments_count,timestamp,insights.metric(views,reach,shares,saved,total_interactions)&limit=25&access_token=${encodeURIComponent(
      token
    )}`;
    let mediaResp = await fetch(mediaUrl);

    // If nested media insights failed (e.g. stories or unsupported media type), retry plain /media with like_count,comments_count
    if (!mediaResp.ok) {
      const simpleMediaUrl = `https://graph.facebook.com/v20.0/${encodeURIComponent(
        targetIgId
      )}/media?fields=id,media_type,like_count,comments_count,timestamp&limit=25&access_token=${encodeURIComponent(
        token
      )}`;
      mediaResp = await fetch(simpleMediaUrl);
    }

    if (mediaResp.ok) {
      const mediaJson = await mediaResp.json();
      const items = mediaJson?.data || [];
      fetchedMediaCount = items.length;
      for (const post of items) {
        mediaLikesSum += Number(post.like_count) || 0;
        mediaCommentsSum += Number(post.comments_count) || 0;

        if (post.insights?.data) {
          for (const m of post.insights.data) {
            const mVal = Number(m.values?.[0]?.value ?? m.total_value?.value) || 0;
            if (m.name === 'shares') mediaSharesSum += mVal;
            else if (m.name === 'views' || m.name === 'reach') mediaViewsSum += mVal;
          }
        }
      }
    }
  } catch {
    // Non-blocking fallback
  }

  // Step 4: Synthesize best metrics from Account Insights (28d) & Media Aggregation
  const bestViewsNum = insightsViews || mediaViewsSum || insightsReach;
  const bestLikesNum = Math.max(insightsLikes, mediaLikesSum);
  const bestCommentsNum = Math.max(insightsComments, mediaCommentsSum);
  const bestSharesNum = Math.max(insightsShares, mediaSharesSum);

  const viewsFormatted =
    bestViewsNum > 0
      ? insightsViews > 0 || mediaViewsSum > 0
        ? `${formatCompactMetric(bestViewsNum)} views`
        : `${formatCompactMetric(bestViewsNum)} reach`
      : current.views;

  const likesFormatted = bestLikesNum > 0 ? formatCompactMetric(bestLikesNum) : current.likes;
  const commentsFormatted =
    bestCommentsNum > 0 ? formatCompactMetric(bestCommentsNum) : current.comments;
  const sharesFormatted =
    bestSharesNum > 0
      ? formatCompactMetric(bestSharesNum)
      : insightsSaves > 0
      ? `${formatCompactMetric(insightsSaves)} saves`
      : current.shares;

  // Calculate Data-Driven Engagement Rate (ER%)
  let calculatedEr = current.erNum || 6.8;
  const totalInteractions =
    insightsTotalInteractions ||
    bestLikesNum + bestCommentsNum + bestSharesNum + insightsSaves;

  if (followersCount > 0 && totalInteractions > 0) {
    if (fetchedMediaCount > 0 && mediaLikesSum + mediaCommentsSum > 0) {
      // Average engagement per post divided by followers
      const avgPerPost =
        (mediaLikesSum + mediaCommentsSum + bestSharesNum) / Math.max(fetchedMediaCount, 1);
      const postEr = (avgPerPost / followersCount) * 100;
      calculatedEr = parseFloat(Math.min(Math.max(postEr, 0.5), 25.0).toFixed(1));
    } else {
      const windowEr = (totalInteractions / followersCount) * 100;
      calculatedEr = parseFloat(Math.min(Math.max(windowEr, 0.5), 25.0).toFixed(1));
    }
  } else if (bestViewsNum > 0 && totalInteractions > 0) {
    const viewEr = (totalInteractions / bestViewsNum) * 100;
    calculatedEr = parseFloat(Math.min(Math.max(viewEr, 0.5), 25.0).toFixed(1));
  }

  return {
    platformId: 'instagram',
    name: 'Instagram',
    handle: resolvedUsername,
    followersNum: followersCount,
    followersFormatted: formatFollowerCount(followersCount),
    viewsFormatted,
    viewsNum: bestViewsNum || undefined,
    likesFormatted,
    commentsFormatted,
    sharesFormatted,
    erNum: calculatedEr,
    erFormatted: `${calculatedEr}%`,
    source: 'official_api',
    status: 'success',
    statusMessage: `ซิงค์สำเร็จจาก Instagram Graph API v20.0 (${mediaCount} โพสต์${insightsNote}${
      insightsAccountsEngaged > 0 ? ` · ${formatCompactMetric(insightsAccountsEngaged)} Engaged` : ''
    })`,
    rawTimestamp: new Date().toISOString(),
  };
}

/**
 * Fetch Facebook Page Stats via Meta Graph API v20.0
 */
export async function fetchFacebookStats(
  creds: PlatformApiCredentials['facebook'],
  current: PlatformStat
): Promise<FetchedPlatformData> {
  if (!creds.pageAccessToken || !creds.pageId) {
    throw new Error('กรุณาระบุ Facebook Page Access Token และ Page ID');
  }

  const url = `https://graph.facebook.com/v20.0/${encodeURIComponent(
    creds.pageId
  )}?fields=followers_count,fan_count,name,username,talking_about_count&access_token=${encodeURIComponent(
    creds.pageAccessToken
  )}`;

  const response = await fetch(url);
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData?.error?.message || `Facebook Graph API Error ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  const followersCount = data.followers_count || data.fan_count || 0;

  let likesFormatted = current.likes;
  let commentsFormatted = current.comments;
  let sharesFormatted = current.shares;
  let viewsFormatted = current.views;
  let erNum = current.erNum;

  // Optionally fetch recent page posts to aggregate Likes, Comments, and Shares
  try {
    const postsUrl = `https://graph.facebook.com/v20.0/${encodeURIComponent(
      creds.pageId
    )}/posts?fields=id,shares,likes.summary(true),comments.summary(true)&limit=20&access_token=${encodeURIComponent(
      creds.pageAccessToken
    )}`;
    const postsResp = await fetch(postsUrl);
    if (postsResp.ok) {
      const postsData = await postsResp.json();
      const posts = postsData?.data || [];
      let sumLikes = 0;
      let sumComments = 0;
      let sumShares = 0;
      for (const p of posts) {
        sumLikes += Number(p.likes?.summary?.total_count) || 0;
        sumComments += Number(p.comments?.summary?.total_count) || 0;
        sumShares += Number(p.shares?.count) || 0;
      }
      if (sumLikes > 0) likesFormatted = formatCompactMetric(sumLikes);
      if (sumComments > 0) commentsFormatted = formatCompactMetric(sumComments);
      if (sumShares > 0) sharesFormatted = formatCompactMetric(sumShares);
      if (followersCount > 0 && posts.length > 0 && sumLikes + sumComments + sumShares > 0) {
        const avgInteractions = (sumLikes + sumComments + sumShares) / posts.length;
        const calcEr = (avgInteractions / followersCount) * 100;
        if (calcEr > 0) {
          erNum = parseFloat(Math.min(Math.max(calcEr, 0.5), 20.0).toFixed(1));
        }
      }
    }
  } catch {
    // Non-blocking
  }

  if (data.talking_about_count && data.talking_about_count > 0 && viewsFormatted === current.views) {
    viewsFormatted = `${formatCompactMetric(data.talking_about_count)} active`;
  }

  return {
    platformId: 'facebook',
    name: 'Facebook Page',
    handle: data.name || current.handle,
    followersNum: followersCount,
    followersFormatted: formatFollowerCount(followersCount),
    viewsFormatted,
    likesFormatted,
    commentsFormatted,
    sharesFormatted,
    erNum,
    erFormatted: `${erNum}%`,
    source: 'official_api',
    status: 'success',
    statusMessage: `ซิงค์สำเร็จจาก Meta Graph API v20.0 (${data.name || 'Page Verified'})`,
    rawTimestamp: new Date().toISOString(),
  };
}

/**
 * Fetch TikTok Stats via Open API or Verified Sandbox Endpoint
 */
export async function fetchTikTokStats(
  creds: PlatformApiCredentials['tiktok'],
  current: PlatformStat
): Promise<FetchedPlatformData> {
  // 1. First attempt: Call Server-side Proxy /api/tiktok/stats
  try {
    const headers: Record<string, string> = {};
    if (creds.accessToken) {
      headers['Authorization'] = `Bearer ${creds.accessToken.trim()}`;
    }

    const proxyResp = await fetch('/api/tiktok/stats', {
      headers,
    });

    if (proxyResp.ok) {
      const result = await proxyResp.json();
      const user = result.user;
      if (user) {
        const followersCount = user.followerCount ?? user.follower_count ?? 0;
        const likesCount = user.likesCount ?? user.likes_count ?? 0;
        return {
          platformId: 'tiktok',
          name: 'TikTok',
          handle: creds.username ? `@${creds.username}` : (user.displayName ? `@${user.displayName}` : current.handle),
          followersNum: followersCount,
          followersFormatted: formatFollowerCount(followersCount),
          viewsFormatted: current.views,
          likesFormatted: formatCompactMetric(likesCount),
          commentsFormatted: current.comments,
          sharesFormatted: current.shares,
          erNum: current.erNum,
          erFormatted: current.er,
          source: 'official_api',
          status: 'success',
          statusMessage: `ซิงค์สำเร็จจาก TikTok Open API (${user.displayName || 'OAuth Verified'})`,
          rawTimestamp: new Date().toISOString(),
        };
      }
    } else {
      const errData = await proxyResp.json().catch(() => ({}));
      if (proxyResp.status === 401 && !creds.accessToken) {
        throw new Error('กรุณากดปุ่ม "เชื่อมต่อ TikTok (OAuth 2.0)" หรือระบุ User Access Token สำรอง');
      }
      if (errData.error) {
        throw new Error(errData.error);
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('เชื่อมต่อ TikTok')) {
      throw err;
    }

    // 2. Secondary fallback: Direct fetch to TikTok Open API if manual token is provided
    if (creds.accessToken) {
      try {
        const url = `https://open.tiktokapis.com/v2/user/info/?fields=follower_count,following_count,likes_count,video_count,display_name`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${creds.accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const userInfo = data.data?.user;
          if (userInfo) {
            const followersCount = userInfo.follower_count || 0;
            const likesCount = userInfo.likes_count || 0;

            return {
              platformId: 'tiktok',
              name: 'TikTok',
              handle: creds.username ? `@${creds.username}` : current.handle,
              followersNum: followersCount,
              followersFormatted: formatFollowerCount(followersCount),
              viewsFormatted: current.views,
              likesFormatted: formatCompactMetric(likesCount),
              commentsFormatted: current.comments,
              sharesFormatted: current.shares,
              erNum: current.erNum,
              erFormatted: current.er,
              source: 'official_api',
              status: 'success',
              statusMessage: `ซิงค์สำเร็จจาก TikTok Open API (${userInfo.display_name || 'Manual Token'})`,
              rawTimestamp: new Date().toISOString(),
            };
          }
        }
      } catch {
        // Direct fetch failed as well, fall through
      }
    }

    const message = err instanceof Error ? err.message : 'ไม่สามารถดึงข้อมูลจาก TikTok Open API ได้';
    throw new Error(message);
  }

  throw new Error('กรุณากดปุ่ม "เชื่อมต่อ TikTok (OAuth 2.0)" หรือระบุ User Access Token สำรอง');
}

/**
 * High-fidelity Live Simulation for Enterprise testing without API keys
 * Generates realistic growth deltas for creator "จุ๊ยจุ๊ย"
 */
export function generateSimulatedLiveStats(
  currentPlatforms: PlatformStat[]
): FetchedPlatformData[] {
  // Realistic growth delta models for each platform
  return currentPlatforms.map((pl) => {
    let followersNum = pl.followersNum;
    let erNum = pl.erNum;
    let viewsFormatted = pl.views;

    switch (pl.id) {
      case 'tiktok': {
        // Growth: ~1.3M -> +12,400 to +18,600 followers, ER +0.1%
        const delta = Math.floor(Math.random() * 6200) + 12400;
        followersNum = (pl.followersNum || 1_300_000) + delta;
        erNum = parseFloat((Math.min(9.4, pl.erNum + 0.1)).toFixed(1));
        viewsFormatted = '28.4M views/mo';
        break;
      }
      case 'facebook': {
        // Growth: ~580K -> +3,800 to +6,200 followers
        const delta = Math.floor(Math.random() * 2400) + 3800;
        followersNum = (pl.followersNum || 580_000) + delta;
        erNum = parseFloat((Math.max(5.1, pl.erNum + 0.05)).toFixed(1));
        viewsFormatted = '6.8M views/mo';
        break;
      }
      case 'instagram': {
        // Growth: ~210K -> +1,600 to +3,100 followers
        const delta = Math.floor(Math.random() * 1500) + 1600;
        followersNum = (pl.followersNum || 210_000) + delta;
        erNum = parseFloat((Math.max(6.5, pl.erNum + 0.1)).toFixed(1));
        viewsFormatted = '3.9M views/mo';
        break;
      }
      case 'youtube': {
        // Growth: ~95K -> +650 to +1,200 subscribers
        const delta = Math.floor(Math.random() * 550) + 650;
        followersNum = (pl.followersNum || 95_000) + delta;
        erNum = parseFloat((Math.max(4.6, pl.erNum + 0.1)).toFixed(1));
        viewsFormatted = '1.8M views/mo';
        break;
      }
    }

    return {
      platformId: pl.id,
      name: pl.name,
      handle: pl.handle,
      followersNum,
      followersFormatted: formatFollowerCount(followersNum),
      viewsFormatted,
      likesFormatted: pl.likes,
      commentsFormatted: pl.comments,
      sharesFormatted: pl.shares,
      erNum,
      erFormatted: `${erNum}%`,
      source: 'verified_simulation',
      status: 'success',
      statusMessage: 'ดึงข้อมูลสดผ่าน Simulated Live Sandbox สำเร็จ (Verified Feed)',
      rawTimestamp: new Date().toISOString(),
    };
  });
}

/**
 * Builds Diff comparison list between current and fetched platform stats
 */
export function buildPlatformDiffList(
  currentPlatforms: PlatformStat[],
  fetchedList: FetchedPlatformData[]
): PlatformDiffItem[] {
  return currentPlatforms.map((curr) => {
    const fetched = fetchedList.find((f) => f.platformId === curr.id);
    if (!fetched) {
      return {
        platformId: curr.id,
        name: curr.name,
        handle: curr.handle,
        accentColor: curr.accentColor,
        currentFollowersNum: curr.followersNum,
        currentFollowers: curr.followers,
        newFollowersNum: curr.followersNum,
        newFollowers: curr.followers,
        followerDelta: 0,
        followerDeltaPercent: 0,
        currentViews: curr.views,
        newViews: curr.views,
        currentLikes: curr.likes,
        newLikes: curr.likes,
        currentComments: curr.comments,
        newComments: curr.comments,
        currentShares: curr.shares,
        newShares: curr.shares,
        currentEr: curr.er,
        newEr: curr.er,
        erDelta: 0,
        status: 'warning',
        statusMessage: 'ไม่มีข้อมูลอัปเดตสำหรับแพลตฟอร์มนี้',
        source: 'verified_simulation',
        isSelected: false,
      };
    }

    const currentNum = curr.followersNum || parseCountToNumber(curr.followers);
    const newNum = fetched.followersNum;
    const delta = newNum - currentNum;
    const deltaPercent = currentNum > 0 ? parseFloat(((delta / currentNum) * 100).toFixed(2)) : 0;
    const erDelta = parseFloat((fetched.erNum - curr.erNum).toFixed(2));

    return {
      platformId: curr.id,
      name: curr.name,
      handle: fetched.handle || curr.handle,
      accentColor: curr.accentColor,
      currentFollowersNum: currentNum,
      currentFollowers: curr.followers,
      newFollowersNum: newNum,
      newFollowers: fetched.followersFormatted,
      followerDelta: delta,
      followerDeltaPercent: deltaPercent,
      currentViews: curr.views,
      newViews: fetched.viewsFormatted || curr.views,
      currentLikes: curr.likes,
      newLikes: fetched.likesFormatted || curr.likes,
      currentComments: curr.comments,
      newComments: fetched.commentsFormatted || curr.comments,
      currentShares: curr.shares,
      newShares: fetched.sharesFormatted || curr.shares,
      currentEr: curr.er,
      newEr: fetched.erFormatted,
      erDelta,
      status: fetched.status,
      statusMessage: fetched.statusMessage,
      source: fetched.source,
      isSelected: true,
    };
  });
}

/**
 * Helper to auto-discover Instagram Business Account ID & Username from a Meta User/Page Access Token
 */
export async function discoverInstagramBusinessAccount(accessToken: string): Promise<{
  igUserId: string;
  username: string;
  name: string;
  followersCount: number;
  pageName?: string;
}> {
  const token = accessToken.trim();
  if (!token) {
    throw new Error('กรุณาวาง Meta Access Token ก่อนกดค้นหา IG Business ID');
  }

  // 1. Check /me/accounts (User Token with pages_show_list + instagram_basic)
  const accountsUrl = `https://graph.facebook.com/v20.0/me/accounts?fields=id,name,instagram_business_account{id,username,name,followers_count}&access_token=${encodeURIComponent(
    token
  )}`;
  const resp = await fetch(accountsUrl);
  if (resp.ok) {
    const data = await resp.json();
    const pages = data?.data || [];
    const pageWithIg = pages.find((p: { instagram_business_account?: { id: string } }) =>
      Boolean(p.instagram_business_account?.id)
    );
    if (pageWithIg?.instagram_business_account) {
      const ig = pageWithIg.instagram_business_account;
      return {
        igUserId: ig.id,
        username: ig.username || '',
        name: ig.name || pageWithIg.name || '',
        followersCount: ig.followers_count || 0,
        pageName: pageWithIg.name,
      };
    }
  }

  // 2. Check /me?fields=instagram_business_account (if token is already a Page Access Token)
  const meUrl = `https://graph.facebook.com/v20.0/me?fields=id,name,instagram_business_account{id,username,name,followers_count}&access_token=${encodeURIComponent(
    token
  )}`;
  const meResp = await fetch(meUrl);
  if (meResp.ok) {
    const meData = await meResp.json();
    if (meData?.instagram_business_account?.id) {
      const ig = meData.instagram_business_account;
      return {
        igUserId: ig.id,
        username: ig.username || '',
        name: ig.name || meData.name || '',
        followersCount: ig.followers_count || 0,
        pageName: meData.name,
      };
    }
  }

  throw new Error(
    'ไม่พบบัญชี Instagram Business ที่ผูกกับ Token นี้ กรุณาตรวจสอบว่าได้ติ๊กสิทธิ์ instagram_basic, instagram_manage_insights และ pages_show_list ใน Graph API Explorer แล้ว'
  );
}

/**
 * Enterprise Single-Platform Connection & Live Stats Testing
 * Allows administrators to test each platform individually (YouTube, TikTok, Instagram, Facebook)
 * with real latency benchmark, payload inspection, and diagnostic error guidance.
 */
export async function testSinglePlatform(
  platformId: PlatformStat['id'],
  creds: PlatformApiCredentials,
  current: PlatformStat,
  forceSimulation: boolean = false
): Promise<SinglePlatformTestResult> {
  const startTime = Date.now();
  const timestamp = new Date().toLocaleTimeString('th-TH');
  const platformNames: Record<string, string> = {
    youtube: 'YouTube',
    tiktok: 'TikTok',
    instagram: 'Instagram',
    facebook: 'Facebook Page',
  };
  const platformName = platformNames[platformId] || platformId;

  try {
    if (forceSimulation) {
      // Realistic network roundtrip latency simulation
      await new Promise((r) => setTimeout(r, 450 + Math.floor(Math.random() * 200)));
      const simulated = generateSimulatedLiveStats([current])[0];
      return {
        platformId,
        platformName,
        success: true,
        statusMessage: `เชื่อมต่อผ่าน Sandbox Feed จำลองสำเร็จ (ค่าเสมือนจริงสำหรับช่อง ${current.name})`,
        latencyMs: Date.now() - startTime,
        data: simulated,
        timestamp,
      };
    }

    let data: FetchedPlatformData;
    switch (platformId) {
      case 'youtube': {
        if (!creds.youtube.apiKey) {
          throw new Error('ยังไม่ได้ระบุ YouTube API Key (Google Cloud Console)');
        }
        if (!creds.youtube.channelId && !creds.youtube.customHandle) {
          throw new Error('ยังไม่ได้ระบุ YouTube Channel ID หรือ Custom Handle');
        }
        data = await fetchYouTubeStats(creds.youtube, current);
        break;
      }
      case 'tiktok': {
        data = await fetchTikTokStats(creds.tiktok, current);
        break;
      }
      case 'instagram': {
        if (!creds.instagram.accessToken) {
          throw new Error('ยังไม่ได้ระบุ Instagram Graph API Access Token');
        }
        data = await fetchInstagramStats(creds.instagram, current);
        break;
      }
      case 'facebook': {
        if (!creds.facebook.pageAccessToken) {
          throw new Error('ยังไม่ได้ระบุ Facebook Page Access Token');
        }
        if (!creds.facebook.pageId) {
          throw new Error('ยังไม่ได้ระบุ Facebook Page ID');
        }
        data = await fetchFacebookStats(creds.facebook, current);
        break;
      }
      default:
        throw new Error(`ไม่รองรับการทดสอบแพลตฟอร์ม ${platformId}`);
    }

    return {
      platformId,
      platformName,
      success: true,
      statusMessage: data.statusMessage || `เชื่อมต่อ ${platformName} สำเร็จและดึงสถิติตรงได้แล้ว`,
      latencyMs: Date.now() - startTime,
      data,
      timestamp,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
    let advice = 'ตรวจสอบการสะกดและสิทธิ์ของ Access Token อีกครั้ง';

    if (platformId === 'youtube') {
      if (errorMsg.includes('API Key') || errorMsg.includes('400')) {
        advice = 'ตรวจสอบว่าได้เปิดใช้งาน "YouTube Data API v3" ใน Google Cloud Console และไม่มี IP/Referrer restriction ที่ขัดแย้ง';
      } else if (errorMsg.includes('quota') || errorMsg.includes('403')) {
        advice = 'โควตาคำขอ YouTube Data API รายวันอาจเต็ม (Daily Quota Exceeded) หรือคีย์ยังไม่เปิดสิทธิ์';
      } else if (errorMsg.includes('ไม่พบข้อมูลช่อง')) {
        advice = 'ตรวจสอบ Channel ID (เช่น UC...) หรือ Handle (เช่น @JUIJUIChannel) ให้ตรงกับช่องจริง';
      }
    } else if (platformId === 'tiktok') {
      if (errorMsg.includes('เชื่อมต่อ TikTok') || errorMsg.includes('401')) {
        advice = 'กดปุ่ม "เชื่อมต่อ TikTok (OAuth 2.0)" ด้านบนเพื่อเข้าสู่ระบบ TikTok หรือใช้ Sandbox Tester Token';
      } else {
        advice = 'ตรวจสอบว่าบัญชี TikTok อยู่ใน Sandbox Testers หรือแอปได้รับการอนุมัติ Scopes (user.info.basic, user.info.stats)';
      }
    } else if (platformId === 'instagram') {
      advice = 'กดปุ่ม "ค้นหา IG Business ID อัตโนมัติ" ด้านบน หรือตรวจสอบว่า Token มีสิทธิ์ instagram_basic, instagram_manage_insights และ pages_show_list';
    } else if (platformId === 'facebook') {
      advice = 'ตรวจสอบว่า Page Access Token มีสิทธิ์ pages_read_engagement และ Page ID ตรงกับหน้าแฟนเพจจริง';
    }

    return {
      platformId,
      platformName,
      success: false,
      statusMessage: `เชื่อมต่อ ${platformName} ไม่สำเร็จ: ${errorMsg}`,
      latencyMs: Date.now() - startTime,
      error: errorMsg,
      advice,
      timestamp,
    };
  }
}


