/**
 * src/hooks/platform-sync/usePlatformTester.ts
 * Manages live API connection testing, simulation triggers, and full-batch
 * sync execution across all active creator platforms.
 */

import { useState, useCallback } from 'react';
import { PlatformStat } from '../../data/types';
import {
  PlatformApiCredentials,
  SinglePlatformTestResult,
  FetchedPlatformData,
  testSinglePlatform,
  fetchYouTubeStats,
  fetchInstagramStats,
  fetchFacebookStats,
  fetchTikTokStats,
  generateSimulatedLiveStats,
  buildPlatformDiffList,
  PlatformDiffItem,
} from '../../services/platformApiService';

interface UsePlatformTesterOptions {
  credentials: PlatformApiCredentials;
  setActiveSyncMode: (mode: 'official' | 'simulation') => void;
  setDiffItems: (diff: PlatformDiffItem[] | null) => void;
}

export function usePlatformTester({
  credentials,
  setActiveSyncMode,
  setDiffItems,
}: UsePlatformTesterOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<string | null>(null);
  const [singleTestLoading, setSingleTestLoading] = useState<Record<string, boolean>>({});
  const [singleTestResults, setSingleTestResults] = useState<
    Record<string, SinglePlatformTestResult | null>
  >({});

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

  // Fetch stats from official APIs or verified simulation across all platforms
  const executeSync = useCallback(
    async (currentPlatforms: PlatformStat[], mode: 'official' | 'simulation' = 'simulation') => {
      setIsLoading(true);
      setSyncError(null);
      setActiveSyncMode(mode);

      try {
        let fetchedResults: FetchedPlatformData[] = [];

        if (mode === 'simulation') {
          // Small realistic delay for pleasant UX feedback
          await new Promise((r) => setTimeout(r, 650));
          fetchedResults = generateSimulatedLiveStats(currentPlatforms);
        } else {
          // Official API Mode: Fetch each platform with error containment
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
    [credentials, setActiveSyncMode, setDiffItems]
  );

  return {
    isLoading,
    syncError,
    lastSyncTimestamp,
    singleTestLoading,
    singleTestResults,
    testSinglePlatformFn,
    clearSingleTestResult,
    executeSync,
  };
}
