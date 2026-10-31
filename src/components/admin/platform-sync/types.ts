import { CreatorProfile, PlatformStat } from '../../../data/types';
import {
  PlatformApiCredentials,
  PlatformDiffItem,
  SyncSnapshotHistoryItem,
  SinglePlatformTestResult,
  FetchedPlatformData,
} from '../../../services/platformApiService';

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

export interface PlatformSyncTabProps {
  draftCreator: CreatorProfile;
  credentials: PlatformApiCredentials;
  syncHistory: SyncSnapshotHistoryItem[];
  diffItems: PlatformDiffItem[] | null;
  isLoading: boolean;
  syncError: string | null;
  lastSyncTimestamp: string | null;
  activeSyncMode: 'official' | 'simulation';
  onUpdateCredentials: (creds: PlatformApiCredentials) => void;
  onExecuteSync: (
    currentPlatforms: PlatformStat[],
    mode: 'official' | 'simulation'
  ) => Promise<void>;
  onToggleDiffSelection: (platformId: PlatformStat['id']) => void;
  onToggleSelectAll: (selectAll: boolean) => void;
  onClearDiff: () => void;
  onApplyDiff: (
    currentCreator: CreatorProfile,
    saveDraftChanges: (customDraft?: CreatorProfile, customMessage?: string) => Promise<void>
  ) => Promise<boolean>;
  onRollbackToSnapshot: (
    snapshot: SyncSnapshotHistoryItem,
    currentCreator: CreatorProfile,
    saveDraftChanges: (customDraft?: CreatorProfile, customMessage?: string) => Promise<void>
  ) => Promise<void>;
  saveDraftChanges: (customDraft?: CreatorProfile, customMessage?: string) => Promise<void>;
  tiktokOAuth?: TikTokOAuthState;
  onConnectTikTok?: (overrideClientKey?: string, overrideClientSecret?: string) => Promise<void>;
  onDisconnectTikTok?: () => Promise<void>;
  onRefreshTikTokToken?: () => Promise<void>;
  onSaveTikTokConfig?: (clientKey: string, clientSecret?: string) => Promise<boolean>;
  singleTestLoading?: Record<string, boolean>;
  singleTestResults?: Record<string, SinglePlatformTestResult | null>;
  onTestSinglePlatform?: (
    platformId: PlatformStat['id'],
    currentPlatforms: PlatformStat[],
    customCreds?: PlatformApiCredentials,
    forceSimulation?: boolean
  ) => Promise<SinglePlatformTestResult>;
  onClearSingleTestResult?: (platformId: PlatformStat['id']) => void;
  onApplySinglePlatformToDiff?: (
    fetchedData: FetchedPlatformData,
    currentPlatforms: PlatformStat[]
  ) => void;
}

export interface PlatformTestBoxProps {
  platformId: PlatformStat['id'];
  platformName: string;
  isLoading: boolean;
  testResult: SinglePlatformTestResult | null;
  onRunTest: (forceSim: boolean) => void;
  onClear: () => void;
  onApplyToDiff?: (data: FetchedPlatformData) => void;
}
