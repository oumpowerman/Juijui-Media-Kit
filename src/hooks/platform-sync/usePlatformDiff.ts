/**
 * src/hooks/platform-sync/usePlatformDiff.ts
 * Manages diff comparison state, selective platform toggles, and atomic multi-timeframe
 * batch application to creator profile with pre-save history snapshots.
 */

import { useState, useCallback } from 'react';
import {
  CreatorProfile,
  PlatformStat,
  StatsTimeframe,
  TimeframePlatformMetrics,
  TimeframeOverviewMetrics,
} from '../../data/types';
import {
  resolvePlatformMetricsForTimeframe,
  resolveOverviewForTimeframe,
  parseFormattedStatNumber,
  formatCompactStatNumber,
} from '../../data/helpers';
import {
  PlatformDiffItem,
  FetchedPlatformData,
  SyncSnapshotHistoryItem,
  buildPlatformDiffList,
  formatFollowerCount,
} from '../../services/platformApiService';

interface UsePlatformDiffOptions {
  pushToHistory: (snapshot: SyncSnapshotHistoryItem) => void;
}

export function usePlatformDiff({ pushToHistory }: UsePlatformDiffOptions) {
  const [diffItems, setDiffItems] = useState<PlatformDiffItem[] | null>(null);
  const [activeSyncMode, setActiveSyncMode] = useState<'official' | 'simulation'>('simulation');

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

  // Select / Deselect all diff items
  const toggleSelectAll = useCallback((selectAll: boolean) => {
    setDiffItems((prev) =>
      prev ? prev.map((item) => ({ ...item, isSelected: selectAll })) : null
    );
  }, []);

  // Clear diff state
  const clearDiff = useCallback(() => {
    setDiffItems(null);
  }, []);

  // Apply single platform fetched data to diff list
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
              timeframes: fetchedData.timeframes || item.timeframes,
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

  // Apply selected diff items to draftCreator and commit snapshot
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
          platformChangesSummary:
            diffItems
              .filter((d) => d.isSelected && d.followerDelta !== 0)
              .map(
                (d) =>
                  `${d.name}: ${d.followerDelta > 0 ? '+' : ''}${d.followerDelta.toLocaleString()}`
              )
              .join(', ') || 'อัปเดตสถิติตามรอบสด',
        },
        platformsSnapshot: JSON.parse(JSON.stringify(currentCreator.platforms)),
        overviewSnapshot: JSON.parse(JSON.stringify(currentCreator.overview)),
      };

      // 2. Build updated platforms array with all 3 timeframes (28d, 60d, lifetime)
      const updatedPlatforms: PlatformStat[] = currentCreator.platforms.map((curr) => {
        const diff = diffItems.find((d) => d.platformId === curr.id && d.isSelected);
        if (!diff) return curr;

        const nextTimeframes: Record<StatsTimeframe, TimeframePlatformMetrics> = {
          '28d': diff.timeframes?.['28d'] || resolvePlatformMetricsForTimeframe(curr, '28d'),
          '60d': diff.timeframes?.['60d'] || {
            views: diff.newViews || curr.views,
            likes: diff.newLikes || curr.likes,
            comments: diff.newComments || curr.comments,
            shares: diff.newShares || curr.shares,
            er: diff.newEr,
            erNum: parseFloat(diff.newEr.replace(/[^0-9.]/g, '')) || curr.erNum,
          },
          lifetime:
            diff.timeframes?.lifetime || resolvePlatformMetricsForTimeframe(curr, 'lifetime'),
        };

        const defaultTf = nextTimeframes['60d'];

        return {
          ...curr,
          handle: diff.handle || curr.handle,
          followers: diff.newFollowers,
          followersNum: diff.newFollowersNum,
          views: defaultTf.views || diff.newViews || curr.views,
          likes: defaultTf.likes || diff.newLikes || curr.likes,
          comments: defaultTf.comments || diff.newComments || curr.comments,
          shares: defaultTf.shares || diff.newShares || curr.shares,
          er: defaultTf.er || diff.newEr,
          erNum: defaultTf.erNum || parseFloat(diff.newEr.replace(/[^0-9.]/g, '')) || curr.erNum,
          timeframes: nextTimeframes,
        };
      });

      // Calculate new total followers
      const totalFollowersNum = updatedPlatforms.reduce(
        (sum, p) => sum + (p.followersNum || 0),
        0
      );
      const totalFollowersFormatted = formatFollowerCount(totalFollowersNum);

      // Recompute overviewTimeframes across all 3 timeframes (28d, 60d, lifetime)
      const buildOverviewForTf = (tf: StatsTimeframe): TimeframeOverviewMetrics => {
        const existingTf = resolveOverviewForTimeframe(currentCreator, tf);
        const tfPlatformMetrics = updatedPlatforms.map((p) =>
          resolvePlatformMetricsForTimeframe(p, tf)
        );
        const sumViews = tfPlatformMetrics.reduce(
          (s, m) => s + parseFormattedStatNumber(m.views),
          0
        );
        const sumLikes = tfPlatformMetrics.reduce(
          (s, m) => s + parseFormattedStatNumber(m.likes),
          0
        );
        const validErs = tfPlatformMetrics.filter((m) => m.erNum > 0);
        const avgErVal =
          validErs.length > 0
            ? (validErs.reduce((s, m) => s + m.erNum, 0) / validErs.length).toFixed(2) + '%'
            : existingTf.totalEr;

        return {
          ...existingTf,
          totalViews:
            sumViews > 0 ? formatCompactStatNumber(sumViews) : existingTf.totalViews,
          totalEr: avgErVal,
          monthlyLikes:
            sumLikes > 0 ? formatCompactStatNumber(sumLikes) : existingTf.monthlyLikes,
        };
      };

      const nextOverviewTimeframes: Record<StatsTimeframe, TimeframeOverviewMetrics> = {
        '28d': buildOverviewForTf('28d'),
        '60d': buildOverviewForTf('60d'),
        lifetime: buildOverviewForTf('lifetime'),
      };

      const updatedOverview = {
        ...currentCreator.overview,
        totalFollowers: totalFollowersFormatted,
        totalViews60d:
          nextOverviewTimeframes['60d'].totalViews || currentCreator.overview.totalViews60d,
        totalEr: nextOverviewTimeframes['60d'].totalEr || currentCreator.overview.totalEr,
        monthlyLikes:
          nextOverviewTimeframes['60d'].monthlyLikes || currentCreator.overview.monthlyLikes,
      };

      const updatedCreator: CreatorProfile = {
        ...currentCreator,
        platforms: updatedPlatforms,
        overview: updatedOverview,
        overviewTimeframes: nextOverviewTimeframes,
      };

      // Push previous snapshot to history ring buffer
      pushToHistory(beforeSnapshot);

      // Save to Firestore and state
      await saveDraftChanges(
        updatedCreator,
        `อัปเดตข้อมูลสถิติสดทั้ง 3 ช่วงเวลา (28d / 60d / Lifetime) สำเร็จ (${diffItems.filter((d) => d.isSelected).length} แพลตฟอร์ม)`
      );

      // Clear diff
      setDiffItems(null);
      return true;
    },
    [diffItems, activeSyncMode, pushToHistory]
  );

  return {
    diffItems,
    setDiffItems,
    activeSyncMode,
    setActiveSyncMode,
    toggleDiffSelection,
    toggleSelectAll,
    clearDiff,
    applySinglePlatformToDiff,
    applyDiff,
  };
}
