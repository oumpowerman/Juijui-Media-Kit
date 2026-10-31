/**
 * src/hooks/platform-sync/usePlatformSnapshots.ts
 * Manages 5-version snapshot ring buffer history and instant rollback logic
 * with pre-rollback snapshot capture for reversible state restoration.
 */

import { useState, useCallback } from 'react';
import { CreatorProfile } from '../../data/types';
import { SyncSnapshotHistoryItem } from '../../services/platformApiService';

export const HISTORY_STORAGE_KEY = 'juijui_platform_sync_history';
export const MAX_HISTORY_ITEMS = 5;

export function usePlatformSnapshots() {
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

  // Push new snapshot into ring buffer
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

  // Rollback to a historical snapshot
  const rollbackToSnapshot = useCallback(
    async (
      snapshot: SyncSnapshotHistoryItem,
      currentCreator: CreatorProfile,
      saveDraftChanges: (customDraft?: CreatorProfile, customMessage?: string) => Promise<void>
    ): Promise<void> => {
      // Create a snapshot of current state before rollback so user can reverse if needed
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

  return {
    syncHistory,
    setSyncHistory,
    pushToHistory,
    rollbackToSnapshot,
  };
}
