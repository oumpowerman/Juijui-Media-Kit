/**
 * usePlatformSync.ts
 * Enterprise-grade hook for managing live API platform data fetching,
 * diff review, selective application, and 5-version snapshot rollback ring buffer.
 */

import { useState, useEffect, useCallback } from 'react';
import { CreatorProfile, PlatformStat } from '../data/types';
import {
  PlatformApiCredentials,
  DEFAULT_API_CREDENTIALS,
  PlatformDiffItem,
  SyncSnapshotHistoryItem,
  FetchedPlatformData,
  fetchYouTubeStats,
  fetchInstagramStats,
  fetchFacebookStats,
  fetchTikTokStats,
  generateSimulatedLiveStats,
  buildPlatformDiffList,
  formatFollowerCount,
  SinglePlatformTestResult,
  testSinglePlatform,
} from '../services/platformApiService';

const CREDENTIALS_STORAGE_KEY = 'juijui_platform_api_credentials';
const HISTORY_STORAGE_KEY = 'juijui_platform_sync_history';
const MAX_HISTORY_ITEMS = 5;

export function usePlatformSync() {
  // Credentials state with localStorage persistence
  const [credentials, setCredentials] = useState<PlatformApiCredentials>(() => {
    try {
      const stored = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_API_CREDENTIALS, ...JSON.parse(stored) };
      }
    } catch {
      // Fallback to default
    }
    return DEFAULT_API_CREDENTIALS;
  });

  // History ring buffer (max 5 items)
  const [syncHistory, setSyncHistory] = useState<SyncSnapshotHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.slice(0, MAX_HISTORY_ITEMS);
      }
    } catch {
      // Fallback
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [diffItems, setDiffItems] = useState<PlatformDiffItem[] | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<string | null>(null);
  const [activeSyncMode, setActiveSyncMode] = useState<'official' | 'simulation'>('simulation');
  const [singleTestLoading, setSingleTestLoading] = useState<Record<string, boolean>>({});
  const [singleTestResults, setSingleTestResults] = useState<Record<string, SinglePlatformTestResult | null>>({});

  // TikTok Official OAuth 2.0 State
  const [tiktokOAuth, setTiktokOAuth] = useState<{
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
    isConnecting: boolean;
    isRefreshing: boolean;
    error: string | null;
    successMessage: string | null;
  }>({
    clientKey: '',
    hasClientSecret: false,
    isConnected: false,
    expiresAt: null,
    openId: null,
    displayName: null,
    avatarUrl: null,
    followerCount: null,
    likesCount: null,
    videoCount: null,
    lastSyncedAt: null,
    redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/api/tiktok/callback` : '',
    isConnecting: false,
    isRefreshing: false,
    error: null,
    successMessage: null,
  });

  // Fetch TikTok OAuth status from server
  const loadTikTokOAuthStatus = useCallback(async () => {
    try {
      const resp = await fetch('/api/tiktok/config');
      if (resp.ok) {
        const data = await resp.json();
        setTiktokOAuth((prev) => ({
          ...prev,
          clientKey: data.clientKey || prev.clientKey,
          hasClientSecret: Boolean(data.hasClientSecret),
          isConnected: Boolean(data.isConnected),
          expiresAt: data.expiresAt,
          openId: data.openId,
          displayName: data.displayName,
          avatarUrl: data.avatarUrl,
          followerCount: data.followerCount,
          likesCount: data.likesCount,
          videoCount: data.videoCount,
          lastSyncedAt: data.lastSyncedAt,
          redirectUri:
            data.redirectUri ||
            (typeof window !== 'undefined'
              ? `${window.location.origin}/api/tiktok/callback`
              : prev.redirectUri),
        }));
      }
    } catch {
      // Ignore background fetch failure
    }
  }, []);

  // Run on mount
  useEffect(() => {
    loadTikTokOAuthStatus();
  }, [loadTikTokOAuthStatus]);

  // Listen to popup postMessage events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'TIKTOK_OAUTH_SUCCESS') {
        loadTikTokOAuthStatus();
        setTiktokOAuth((prev) => ({
          ...prev,
          isConnecting: false,
          error: null,
          successMessage: 'เชื่อมต่อบัญชี TikTok สำเร็จแล้ว!',
        }));
        setTimeout(() => {
          setTiktokOAuth((prev) => ({ ...prev, successMessage: null }));
        }, 5000);
      } else if (event.data?.type === 'TIKTOK_OAUTH_ERROR') {
        setTiktokOAuth((prev) => ({
          ...prev,
          isConnecting: false,
          error: event.data.error || 'การเชื่อมต่อ TikTok ล้มเหลว',
        }));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [loadTikTokOAuthStatus]);

  // Save TikTok clientKey and clientSecret
  const saveTikTokConfig = useCallback(
    async (clientKey: string, clientSecret?: string) => {
      try {
        const resp = await fetch('/api/tiktok/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientKey, clientSecret }),
        });
        if (!resp.ok) throw new Error('บันทึกการตั้งค่าไม่สำเร็จ');
        await loadTikTokOAuthStatus();
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'บันทึกการตั้งค่าไม่สำเร็จ';
        setTiktokOAuth((prev) => ({ ...prev, error: msg }));
        return false;
      }
    },
    [loadTikTokOAuthStatus]
  );

  // Launch TikTok OAuth popup
  const connectTikTok = useCallback(async () => {
    setTiktokOAuth((prev) => ({ ...prev, isConnecting: true, error: null }));
    try {
      const redirectUri = `${window.location.origin}/api/tiktok/callback`;
      const resp = await fetch(
        `/api/tiktok/auth-url?redirectUri=${encodeURIComponent(redirectUri)}`
      );
      const data = await resp.json();
      if (!resp.ok || !data.authUrl) {
        throw new Error(data.error || 'ไม่สามารถสร้าง URL สำหรับยืนยันสิทธิ์ TikTok ได้');
      }

      // Open popup directly to TikTok authorization URL
      const popupWidth = 600;
      const popupHeight = 720;
      const left = window.screenX + (window.outerWidth - popupWidth) / 2;
      const top = window.screenY + (window.outerHeight - popupHeight) / 2;
      const popup = window.open(
        data.authUrl,
        'tiktok_oauth_window',
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},status=no,menubar=no,toolbar=no`
      );

      if (!popup) {
        throw new Error('เบราว์เซอร์บล็อกป๊อปอัป กรุณาอนุญาตป๊อปอัปสำหรับเว็บไซต์นี้');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ไม่สามารถเปิดหน้าต่างเชื่อมต่อได้';
      setTiktokOAuth((prev) => ({ ...prev, isConnecting: false, error: msg }));
    }
  }, []);

  // Disconnect TikTok
  const disconnectTikTok = useCallback(async () => {
    try {
      await fetch('/api/tiktok/disconnect', { method: 'POST' });
      setTiktokOAuth((prev) => ({
        ...prev,
        isConnected: false,
        expiresAt: null,
        openId: null,
        displayName: null,
        avatarUrl: null,
        successMessage: 'ตัดการเชื่อมต่อ TikTok เรียบร้อยแล้ว',
      }));
      setTimeout(() => {
        setTiktokOAuth((prev) => ({ ...prev, successMessage: null }));
      }, 4000);
    } catch {
      // Ignore
    }
  }, []);

  // Refresh token
  const refreshTikTokToken = useCallback(async () => {
    setTiktokOAuth((prev) => ({ ...prev, isRefreshing: true, error: null }));
    try {
      const resp = await fetch('/api/tiktok/refresh-token', { method: 'POST' });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'รีเฟรชสิทธิ์ไม่สำเร็จ');
      }
      await loadTikTokOAuthStatus();
      setTiktokOAuth((prev) => ({
        ...prev,
        isRefreshing: false,
        successMessage: 'รีเฟรชสิทธิ์การเข้าถึง TikTok สำเร็จแล้ว',
      }));
      setTimeout(() => {
        setTiktokOAuth((prev) => ({ ...prev, successMessage: null }));
      }, 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'รีเฟรชสิทธิ์ไม่สำเร็จ';
      setTiktokOAuth((prev) => ({ ...prev, isRefreshing: false, error: msg }));
    }
  }, [loadTikTokOAuthStatus]);

  // Persist credentials
  const updateCredentials = useCallback((newCreds: PlatformApiCredentials) => {
    setCredentials(newCreds);
    try {
      localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(newCreds));
    } catch {
      // Ignore storage error
    }
  }, []);

  // Persist history ring buffer
  const pushToHistory = useCallback((item: SyncSnapshotHistoryItem) => {
    setSyncHistory((prev) => {
      const updated = [item, ...prev.filter((h) => h.id !== item.id)].slice(0, MAX_HISTORY_ITEMS);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage error
      }
      return updated;
    });
  }, []);

  // Fetch stats from official APIs or verified simulation
  const executeSync = useCallback(
    async (currentPlatforms: PlatformStat[], mode: 'official' | 'simulation' = 'simulation') => {
      setIsLoading(true);
      setSyncError(null);
      setActiveSyncMode(mode);

      try {
        let fetchedResults: FetchedPlatformData[] = [];

        if (mode === 'simulation') {
          // Add small realistic delay to feel authentic
          await new Promise((r) => setTimeout(r, 650));
          fetchedResults = generateSimulatedLiveStats(currentPlatforms);
        } else {
          // Official API Mode: Fetch each platform sequentially or in parallel with graceful error handling
          const promises = currentPlatforms.map(async (pl): Promise<FetchedPlatformData> => {
            try {
              if (pl.id === 'youtube') {
                return await fetchYouTubeStats(credentials.youtube, pl);
              }
              if (pl.id === 'instagram') {
                return await fetchInstagramStats(credentials.instagram, pl);
              }
              if (pl.id === 'facebook') {
                return await fetchFacebookStats(credentials.facebook, pl);
              }
              if (pl.id === 'tiktok') {
                return await fetchTikTokStats(credentials.tiktok, pl);
              }
            } catch (err: unknown) {
              const errMsg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล';
              return {
                platformId: pl.id,
                name: pl.name,
                handle: pl.handle,
                followersNum: pl.followersNum,
                followersFormatted: pl.followers,
                viewsFormatted: pl.views,
                erNum: pl.erNum,
                erFormatted: pl.er,
                source: 'official_api',
                status: 'error',
                statusMessage: errMsg,
                rawTimestamp: new Date().toISOString(),
              };
            }
            return {
              platformId: pl.id,
              name: pl.name,
              handle: pl.handle,
              followersNum: pl.followersNum,
              followersFormatted: pl.followers,
              viewsFormatted: pl.views,
              erNum: pl.erNum,
              erFormatted: pl.er,
              source: 'official_api',
              status: 'warning',
              statusMessage: 'ไม่มีการกำหนดค่าสำหรับแพลตฟอร์มนี้',
              rawTimestamp: new Date().toISOString(),
            };
          });

          fetchedResults = await Promise.all(promises);
        }

        const diff = buildPlatformDiffList(currentPlatforms, fetchedResults);
        setDiffItems(diff);
        setLastSyncTimestamp(new Date().toLocaleTimeString('th-TH'));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลสด';
        setSyncError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [credentials]
  );

  // Toggle selection checkbox for diff review
  const toggleDiffSelection = useCallback((platformId: PlatformStat['id']) => {
    setDiffItems((prev) =>
      prev
        ? prev.map((item) =>
            item.platformId === platformId ? { ...item, isSelected: !item.isSelected } : item
          )
        : null
    );
  }, []);

  const toggleSelectAll = useCallback((selectAll: boolean) => {
    setDiffItems((prev) =>
      prev ? prev.map((item) => ({ ...item, isSelected: selectAll })) : null
    );
  }, []);

  const clearDiff = useCallback(() => {
    setDiffItems(null);
  }, []);

  // Apply selected diff changes to draftCreator and record snapshot in history
  const applyDiff = useCallback(
    async (
      currentCreator: CreatorProfile,
      saveDraftChanges: (customDraft?: CreatorProfile, customMessage?: string) => Promise<void>
    ): Promise<boolean> => {
      if (!diffItems || diffItems.length === 0) return false;

      // 1. Create snapshot of current state before applying
      const beforeSnapshot: SyncSnapshotHistoryItem = {
        id: `snap-${Date.now()}`,
        timestamp: new Date().toISOString(),
        dateFormatted: new Date().toLocaleString('th-TH', {
          dateStyle: 'short',
          timeStyle: 'medium',
        }),
        triggerType: activeSyncMode === 'official' ? 'official_api' : 'simulation',
        summary: {
          totalFollowers: currentCreator.overview.totalFollowers,
          totalReach: currentCreator.overview.monthlyReach,
          totalEr: currentCreator.overview.totalEr,
          totalPlatformsCount: currentCreator.platforms.length,
          platformChangesSummary: diffItems
            .filter((d) => d.isSelected && d.followerDelta !== 0)
            .map((d) => `${d.name}: ${d.followerDelta > 0 ? '+' : ''}${d.followerDelta.toLocaleString()}`)
            .join(', ') || 'อัปเดตสถิติตามรอบสด',
        },
        platformsSnapshot: JSON.parse(JSON.stringify(currentCreator.platforms)),
        overviewSnapshot: JSON.parse(JSON.stringify(currentCreator.overview)),
      };

      // 2. Build updated platforms array
      const updatedPlatforms: PlatformStat[] = currentCreator.platforms.map((curr) => {
        const diff = diffItems.find((d) => d.platformId === curr.id && d.isSelected);
        if (!diff) return curr;

        return {
          ...curr,
          handle: diff.handle || curr.handle,
          followers: diff.newFollowers,
          followersNum: diff.newFollowersNum,
          views: diff.newViews || curr.views,
          likes: diff.newLikes || curr.likes,
          comments: diff.newComments || curr.comments,
          shares: diff.newShares || curr.shares,
          er: diff.newEr,
          erNum: parseFloat(diff.newEr.replace(/[^0-9.]/g, '')) || curr.erNum,
        };
      });

      // Calculate new total followers & average ER
      const totalFollowersNum = updatedPlatforms.reduce((sum, p) => sum + (p.followersNum || 0), 0);
      const totalFollowersFormatted = formatFollowerCount(totalFollowersNum);
      const validErCount = updatedPlatforms.filter((p) => p.erNum > 0).length;
      const avgEr =
        validErCount > 0
          ? (
              updatedPlatforms.reduce((sum, p) => sum + (p.erNum || 0), 0) / validErCount
            ).toFixed(1) + '%'
          : currentCreator.overview.totalEr;

      const updatedOverview = {
        ...currentCreator.overview,
        totalFollowers: totalFollowersFormatted,
        totalEr: avgEr,
      };

      const updatedCreator: CreatorProfile = {
        ...currentCreator,
        platforms: updatedPlatforms,
        overview: updatedOverview,
      };

      // Push previous snapshot to history
      pushToHistory(beforeSnapshot);

      // Save to Firestore and state
      await saveDraftChanges(
        updatedCreator,
        `อัปเดตข้อมูลสถิติสดสำเร็จ (${diffItems.filter((d) => d.isSelected).length} แพลตฟอร์ม)`
      );

      // Clear diff
      setDiffItems(null);
      return true;
    },
    [diffItems, activeSyncMode, pushToHistory]
  );

  // Rollback to a historical snapshot
  const rollbackToSnapshot = useCallback(
    async (
      snapshot: SyncSnapshotHistoryItem,
      currentCreator: CreatorProfile,
      saveDraftChanges: (customDraft?: CreatorProfile, customMessage?: string) => Promise<void>
    ): Promise<void> => {
      // Create a snapshot of right now before rollback so user can jump forward again if needed
      const currentBeforeRollback: SyncSnapshotHistoryItem = {
        id: `snap-${Date.now()}`,
        timestamp: new Date().toISOString(),
        dateFormatted: new Date().toLocaleString('th-TH', {
          dateStyle: 'short',
          timeStyle: 'medium',
        }),
        triggerType: 'manual_rollback',
        summary: {
          totalFollowers: currentCreator.overview.totalFollowers,
          totalReach: currentCreator.overview.monthlyReach,
          totalEr: currentCreator.overview.totalEr,
          totalPlatformsCount: currentCreator.platforms.length,
          platformChangesSummary: 'บันทึกก่อนทำการย้อนกลับ (Pre-Rollback State)',
        },
        platformsSnapshot: JSON.parse(JSON.stringify(currentCreator.platforms)),
        overviewSnapshot: JSON.parse(JSON.stringify(currentCreator.overview)),
      };

      const restoredCreator: CreatorProfile = {
        ...currentCreator,
        platforms: snapshot.platformsSnapshot,
        overview: snapshot.overviewSnapshot,
      };

      pushToHistory(currentBeforeRollback);

      await saveDraftChanges(
        restoredCreator,
        `ย้อนกลับข้อมูลสถิติไปยังเวอร์ชัน ${snapshot.dateFormatted} เรียบร้อยแล้ว`
      );
    },
    [pushToHistory]
  );

  // Test single platform connection & data independently
  const testSinglePlatformFn = useCallback(
    async (
      platformId: PlatformStat['id'],
      currentPlatforms: PlatformStat[],
      customCreds?: PlatformApiCredentials,
      forceSimulation: boolean = false
    ): Promise<SinglePlatformTestResult> => {
      setSingleTestLoading((prev) => ({ ...prev, [platformId]: true }));
      try {
        const currentPl = currentPlatforms.find((p) => p.id === platformId) || {
          id: platformId,
          name: platformId,
          handle: '',
          url: '',
          followers: '0',
          followersNum: 0,
          views: '0',
          likes: '0',
          comments: '0',
          shares: '0',
          er: '0%',
          erNum: 0,
          accentColor: '#6366f1',
        };

        const credsToUse = customCreds || credentials;
        const result = await testSinglePlatform(platformId, credsToUse, currentPl, forceSimulation);

        setSingleTestResults((prev) => ({ ...prev, [platformId]: result }));
        return result;
      } finally {
        setSingleTestLoading((prev) => ({ ...prev, [platformId]: false }));
      }
    },
    [credentials]
  );

  const clearSingleTestResult = useCallback((platformId: PlatformStat['id']) => {
    setSingleTestResults((prev) => ({ ...prev, [platformId]: null }));
  }, []);

  // Send single platform fetched data to Diff Preview
  const applySinglePlatformToDiff = useCallback(
    (fetchedData: FetchedPlatformData, currentPlatforms: PlatformStat[]) => {
      setDiffItems((prev) => {
        if (!prev) {
          const fullDiff = buildPlatformDiffList(currentPlatforms, [fetchedData]);
          return fullDiff.map((d) => ({
            ...d,
            isSelected: d.platformId === fetchedData.platformId,
          }));
        }
        return prev.map((item) => {
          if (item.platformId === fetchedData.platformId) {
            const currentNum = item.currentFollowersNum;
            const newNum = fetchedData.followersNum;
            const delta = newNum - currentNum;
            const deltaPercent =
              currentNum > 0 ? parseFloat(((delta / currentNum) * 100).toFixed(2)) : 0;
            const currentErVal = parseFloat(item.currentEr.replace(/[^0-9.]/g, '')) || 0;
            const erDelta = parseFloat((fetchedData.erNum - currentErVal).toFixed(2));
            return {
              ...item,
              handle: fetchedData.handle || item.handle,
              newFollowersNum: newNum,
              newFollowers: fetchedData.followersFormatted,
              followerDelta: delta,
              followerDeltaPercent: deltaPercent,
              newViews: fetchedData.viewsFormatted || item.currentViews,
              newLikes: fetchedData.likesFormatted || item.currentLikes,
              newComments: fetchedData.commentsFormatted || item.currentComments,
              newShares: fetchedData.sharesFormatted || item.currentShares,
              newEr: fetchedData.erFormatted,
              erDelta,
              status: fetchedData.status,
              statusMessage: fetchedData.statusMessage,
              source: fetchedData.source,
              isSelected: true,
            };
          }
          return item;
        });
      });
    },
    []
  );

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
    loadTikTokOAuthStatus,
    saveTikTokConfig,
    connectTikTok,
    disconnectTikTok,
    refreshTikTokToken,
  };
}

