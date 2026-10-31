/**
 * src/types/platformSync.ts
 * Enterprise-grade type definitions for platform synchronization, credentials,
 * diff reconciliation, snapshots, and extensible platform registries.
 */

import { CreatorProfile, PlatformStat } from '../data/types';
import {
  PlatformApiCredentials,
  PlatformDiffItem,
  SyncSnapshotHistoryItem,
  SinglePlatformTestResult,
  FetchedPlatformData,
} from '../services/platformApiService';

export type PlatformSyncMethod =
  | 'official_api'
  | 'simulation'
  | 'oauth'
  | 'smart_import'
  | 'scraping';

export interface PlatformFieldConfig {
  key: string;
  label: string;
  placeholder?: string;
  isSecret?: boolean;
  helpText?: string;
}

export interface PlatformDefinition {
  id: PlatformStat['id'];
  name: string;
  brandColor: string;
  iconName: string;
  supportedMethods: PlatformSyncMethod[];
  officialDocUrl?: string;
  credentialFields: PlatformFieldConfig[];
  description: string;
}

export interface TikTokOAuthState {
  clientKey: string;
  clientSecret?: string;
  hasClientSecret: boolean;
  isConnected: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt: number | null;
  openId: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  followerCount: number | null;
  likesCount: number | null;
  videoCount: number | null;
  lastSyncedAt: string | null;
  redirectUri: string;
  isConnecting: boolean;
  isRefreshing: boolean;
  error: string | null;
  successMessage: string | null;
}

export interface StoredTikTokOAuthData {
  clientKey: string;
  clientSecret?: string;
  hasClientSecret: boolean;
  isConnected: boolean;
  accessToken?: string;
  refreshToken?: string;
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

export interface UsePlatformSyncReturn {
  credentials: PlatformApiCredentials;
  updateCredentials: (newCreds: PlatformApiCredentials) => void;
  syncHistory: SyncSnapshotHistoryItem[];
  isLoading: boolean;
  diffItems: PlatformDiffItem[] | null;
  syncError: string | null;
  lastSyncTimestamp: string | null;
  activeSyncMode: 'official' | 'simulation';
  singleTestLoading: Record<string, boolean>;
  singleTestResults: Record<string, SinglePlatformTestResult | null>;
  testSinglePlatformFn: (
    platformId: PlatformStat['id'],
    currentPlatforms: PlatformStat[],
    customCreds?: PlatformApiCredentials,
    forceSimulation?: boolean
  ) => Promise<SinglePlatformTestResult>;
  clearSingleTestResult: (platformId: PlatformStat['id']) => void;
  applySinglePlatformToDiff: (
    fetchedData: FetchedPlatformData,
    currentPlatforms: PlatformStat[]
  ) => void;
  executeSync: (
    currentPlatforms: PlatformStat[],
    mode?: 'official' | 'simulation'
  ) => Promise<void>;
  toggleDiffSelection: (platformId: PlatformStat['id']) => void;
  toggleSelectAll: (selectAll: boolean) => void;
  clearDiff: () => void;
  applyDiff: (
    currentCreator: CreatorProfile,
    saveDraftChanges: (customDraft?: CreatorProfile, customMessage?: string) => Promise<void>
  ) => Promise<boolean>;
  rollbackToSnapshot: (
    snapshot: SyncSnapshotHistoryItem,
    currentCreator: CreatorProfile,
    saveDraftChanges: (customDraft?: CreatorProfile, customMessage?: string) => Promise<void>
  ) => Promise<void>;
  tiktokOAuth: TikTokOAuthState;
  loadTikTokOAuthStatus?: () => Promise<void>;
  saveTikTokConfig: (clientKey: string, clientSecret?: string) => Promise<boolean>;
  connectTikTok: (overrideClientKey?: string, overrideClientSecret?: string) => Promise<void>;
  disconnectTikTok: () => Promise<void>;
  refreshTikTokToken: () => Promise<void>;
}
