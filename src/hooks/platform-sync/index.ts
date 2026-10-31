/**
 * src/hooks/platform-sync/index.ts
 * Unified Façade Hook for Platform Synchronization
 * Orchestrates domain sub-hooks while preserving 100% backwards-compatible API.
 */

import { useRef } from 'react';
import { usePlatformCredentials } from './usePlatformCredentials';
import { useTikTokOAuth } from './useTikTokOAuth';
import { usePlatformDiff } from './usePlatformDiff';
import { usePlatformSnapshots } from './usePlatformSnapshots';
import { usePlatformTester } from './usePlatformTester';
import { UsePlatformSyncReturn, StoredTikTokOAuthData } from '../../types/platformSync';

export * from './usePlatformCredentials';
export * from './useTikTokOAuth';
export * from './usePlatformDiff';
export * from './usePlatformSnapshots';
export * from './usePlatformTester';

/**
 * Enterprise-grade hook for managing live API platform data fetching,
 * diff review, selective application, and 5-version snapshot rollback ring buffer.
 */
export function usePlatformSync(): UsePlatformSyncReturn {
  // 1. Snapshot Ring Buffer
  const { syncHistory, pushToHistory, rollbackToSnapshot } = usePlatformSnapshots();

  // 2. Diff Reconciliation & Application
  const {
    diffItems,
    setDiffItems,
    activeSyncMode,
    setActiveSyncMode,
    toggleDiffSelection,
    toggleSelectAll,
    clearDiff,
    applySinglePlatformToDiff,
    applyDiff,
  } = usePlatformDiff({ pushToHistory });

  // 3. TikTok OAuth Domain Hook (pre-instantiated ref for credentials integration)
  const mockOAuthRef = useRef<StoredTikTokOAuthData>({
    clientKey: '',
    clientSecret: '',
    hasClientSecret: false,
    isConnected: false,
    accessToken: '',
    refreshToken: '',
    expiresAt: null,
    openId: null,
    displayName: null,
    avatarUrl: null,
    followerCount: null,
    likesCount: null,
    videoCount: null,
    lastSyncedAt: null,
    redirectUri: '',
  });

  const {
    credentials,
    credentialsRef,
    setCredentials,
    updateCredentials,
    syncPlatformConfigToFirestore,
  } = usePlatformCredentials(mockOAuthRef as any);

  // 4. TikTok OAuth with synchronized Firestore callback
  const {
    tiktokOAuth,
    tiktokOAuthRef,
    saveTikTokConfig,
    connectTikTok,
    disconnectTikTok,
    refreshTikTokToken,
  } = useTikTokOAuth({
    credentialsRef,
    setCredentials,
    syncPlatformConfigToFirestore,
  });

  // Keep mockOAuthRef in sync with actual tiktokOAuthRef
  mockOAuthRef.current = tiktokOAuthRef.current;

  // 5. Platform Live Tester & Batch Sync Runner
  const {
    isLoading,
    syncError,
    lastSyncTimestamp,
    singleTestLoading,
    singleTestResults,
    testSinglePlatformFn,
    clearSingleTestResult,
    executeSync,
  } = usePlatformTester({
    credentials,
    setActiveSyncMode,
    setDiffItems,
  });

  return {
    credentials,
    updateCredentials,
    syncHistory,
    isLoading,
    diffItems,
    syncError,
    lastSyncTimestamp,
    activeSyncMode,
    singleTestLoading,
    singleTestResults,
    testSinglePlatformFn,
    clearSingleTestResult,
    applySinglePlatformToDiff,
    executeSync,
    toggleDiffSelection,
    toggleSelectAll,
    clearDiff,
    applyDiff,
    rollbackToSnapshot,
    tiktokOAuth,
    saveTikTokConfig,
    connectTikTok,
    disconnectTikTok,
    refreshTikTokToken,
  };
}
