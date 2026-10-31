/**
 * Core Types, Interfaces, and Default Credentials for Multi-Platform API Synchronization
 */

import {
  PlatformStat,
  StatsTimeframe,
  TimeframePlatformMetrics,
} from '../../data/types';

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
    refreshToken?: string;
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
  timeframes?: Record<StatsTimeframe, TimeframePlatformMetrics>;
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
  currentTimeframes?: Record<StatsTimeframe, TimeframePlatformMetrics>;
  timeframes?: Record<StatsTimeframe, TimeframePlatformMetrics>;
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
