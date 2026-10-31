/**
 * Live Simulation Generator & Platform Diff Comparison Builder
 */

import {
  PlatformStat,
  StatsTimeframe,
  TimeframePlatformMetrics,
} from '../../data/types';
import {
  resolvePlatformMetricsForTimeframe,
  parseFormattedStatNumber,
  formatCompactStatNumber,
} from '../../data/helpers';
import { FetchedPlatformData, PlatformDiffItem } from './types';
import { formatFollowerCount, parseCountToNumber } from './formatters';

function simulateTimeframeGrowth(
  base: TimeframePlatformMetrics,
  growthFactor: number,
  erBonus: number
): TimeframePlatformMetrics {
  const vNum = parseFormattedStatNumber(base.views);
  const lNum = parseFormattedStatNumber(base.likes);
  const cNum = parseFormattedStatNumber(base.comments);
  const sNum = parseFormattedStatNumber(base.shares);
  const nextEr = parseFloat(Math.min(18.0, (base.erNum || 5.0) + erBonus).toFixed(2));

  return {
    views: vNum > 0 ? formatCompactStatNumber(vNum * growthFactor) : base.views,
    likes: lNum > 0 ? formatCompactStatNumber(lNum * growthFactor) : base.likes,
    comments: cNum > 0 ? formatCompactStatNumber(cNum * growthFactor) : base.comments,
    shares: sNum > 0 ? formatCompactStatNumber(sNum * growthFactor) : base.shares,
    er: `${nextEr}%`,
    erNum: nextEr,
  };
}

/**
 * High-fidelity Live Simulation for Enterprise testing without API keys
 * Generates realistic growth deltas across 28d, 60d, and lifetime for creator "จุ๊ยจุ๊ย"
 */
export function generateSimulatedLiveStats(
  currentPlatforms: PlatformStat[]
): FetchedPlatformData[] {
  return currentPlatforms.map((pl) => {
    let followersNum = pl.followersNum;

    switch (pl.id) {
      case 'tiktok': {
        const delta = Math.floor(Math.random() * 4200) + 6400;
        followersNum = (pl.followersNum || 660_200) + delta;
        break;
      }
      case 'facebook': {
        const delta = Math.floor(Math.random() * 1400) + 1800;
        followersNum = (pl.followersNum || 130_000) + delta;
        break;
      }
      case 'instagram': {
        const delta = Math.floor(Math.random() * 650) + 850;
        followersNum = (pl.followersNum || 31_900) + delta;
        break;
      }
      case 'youtube': {
        const delta = Math.floor(Math.random() * 950) + 1200;
        followersNum = (pl.followersNum || 157_000) + delta;
        break;
      }
    }

    const curr28d = resolvePlatformMetricsForTimeframe(pl, '28d');
    const curr60d = resolvePlatformMetricsForTimeframe(pl, '60d');
    const currLt = resolvePlatformMetricsForTimeframe(pl, 'lifetime');

    const timeframes: Record<StatsTimeframe, TimeframePlatformMetrics> = {
      '28d': simulateTimeframeGrowth(curr28d, 1.045, 0.08),
      '60d': simulateTimeframeGrowth(curr60d, 1.038, 0.06),
      lifetime: simulateTimeframeGrowth(currLt, 1.015, 0.04),
    };

    return {
      platformId: pl.id,
      name: pl.name,
      handle: pl.handle,
      followersNum,
      followersFormatted: formatFollowerCount(followersNum),
      viewsFormatted: timeframes['60d'].views,
      likesFormatted: timeframes['60d'].likes,
      commentsFormatted: timeframes['60d'].comments,
      sharesFormatted: timeframes['60d'].shares,
      erNum: timeframes['60d'].erNum,
      erFormatted: timeframes['60d'].er,
      timeframes,
      source: 'verified_simulation',
      status: 'success',
      statusMessage: 'ดึงข้อมูลสดผ่าน Simulated Live Sandbox สำเร็จ (ครบทั้ง 28 วัน · 60 วัน · Lifetime)',
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
    const currentTimeframes: Record<StatsTimeframe, TimeframePlatformMetrics> = {
      '28d': resolvePlatformMetricsForTimeframe(curr, '28d'),
      '60d': resolvePlatformMetricsForTimeframe(curr, '60d'),
      lifetime: resolvePlatformMetricsForTimeframe(curr, 'lifetime'),
    };

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
        currentTimeframes,
        timeframes: currentTimeframes,
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

    const nextTimeframes: Record<StatsTimeframe, TimeframePlatformMetrics> = fetched.timeframes || {
      '28d': currentTimeframes['28d'],
      '60d': {
        views: fetched.viewsFormatted || curr.views,
        likes: fetched.likesFormatted || curr.likes,
        comments: fetched.commentsFormatted || curr.comments,
        shares: fetched.sharesFormatted || curr.shares,
        er: fetched.erFormatted || curr.er,
        erNum: fetched.erNum || curr.erNum,
      },
      lifetime: currentTimeframes.lifetime,
    };

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
      currentTimeframes,
      timeframes: nextTimeframes,
      status: fetched.status,
      statusMessage: fetched.statusMessage,
      source: fetched.source,
      isSelected: true,
    };
  });
}
