import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Flame,
  ExternalLink,
  TrendingUp,
} from 'lucide-react';
import {
  PlatformStat,
  StatsTimeframe,
  STATS_TIMEFRAME_OPTIONS,
  resolvePlatformMetricsForTimeframe,
} from '../../../data/creatorData';
import { AnimatedCounter } from '../../ui/AnimatedCounter';
import { PlatformBrandIcon } from '../../ui/PlatformBrandIcon';
import {
  IOS_CARD_SPRING,
  IOS_TAB_SPRING,
  PLATFORM_THEMES,
} from './analyticsConstants';

interface PlatformPerformanceCardProps {
  platform: PlatformStat;
  activeStatsTimeframe: StatsTimeframe;
  isActive: boolean;
  isDimmed: boolean;
  onSelect: () => void;
}

export const PlatformPerformanceCard = forwardRef<
  HTMLDivElement,
  PlatformPerformanceCardProps
>(({ platform: plat, activeStatsTimeframe, isActive, isDimmed, onSelect }, ref) => {
  const theme = PLATFORM_THEMES[plat.id] || PLATFORM_THEMES.tiktok;
  const tfMetrics = resolvePlatformMetricsForTimeframe(plat, activeStatsTimeframe);
  const tfOption =
    STATS_TIMEFRAME_OPTIONS.find((o) => o.id === activeStatsTimeframe) ||
    STATS_TIMEFRAME_OPTIONS[1];

  return (
    <motion.div
      ref={ref}
      animate={{
        scale: isActive ? 1.03 : isDimmed ? 0.96 : 1,
        y: isActive ? -10 : 0,
        opacity: isDimmed ? 0.45 : 1,
      }}
      whileHover={
        isDimmed
          ? { opacity: 0.8, scale: 0.98 }
          : { y: isActive ? -12 : -4, scale: isActive ? 1.038 : 1.015 }
      }
      whileTap={{ scale: 0.97 }}
      transition={IOS_CARD_SPRING}
      onClick={onSelect}
      style={{ willChange: 'transform, opacity' }}
      className={`snap-center shrink-0 w-[290px] sm:w-auto relative isolate cursor-pointer select-none ${
        isActive ? 'z-30' : isDimmed ? 'z-0' : 'z-10'
      }`}
    >
      {/* Multi-Tier Dual-Layer iOS Ambient Aura Glow (Elevates synchronously with the card!) */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            key={`aura-${plat.id}`}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 pointer-events-none -z-10"
          >
            {/* 1. Outer Broad Atmospheric Bloom: Radiates far beyond the card boundaries */}
            <div
              className={`absolute -inset-5 sm:-inset-7 rounded-[38px] bg-linear-to-r ${theme.glowGradient} blur-2xl sm:blur-3xl opacity-75`}
            />
            {/* 2. Inner Intense Halo: Sharp, radiant border energy */}
            <div
              className={`absolute -inset-2.5 rounded-[30px] bg-linear-to-r ${theme.glowGradient} blur-lg opacity-85`}
            />
            {/* 3. Directional Bottom Drop Ambient Projection: Enhances bottom elevation */}
            <div
              className={`absolute -inset-x-3 -bottom-6 h-14 rounded-full bg-linear-to-b ${theme.glowGradient} blur-xl opacity-65`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Container with Pure Color Transition (No CSS Transform Conflicts) */}
      <div
        className={`relative h-full bg-white/95 backdrop-blur-xl rounded-3xl border p-5 flex flex-col justify-between transition-colors duration-200 ${
          isActive
            ? `${theme.activeBorder} ring-2 ${theme.activeRing} shadow-[0_24px_50px_-12px_rgba(15,23,42,0.22)]`
            : 'border-slate-200/90 hover:border-slate-300 shadow-2xs'
        }`}
      >
        {/* Subtle Glass Specular Sheen Highlight on Active Card */}
        {isActive && (
          <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-3xl bg-linear-to-r from-transparent via-white/80 to-transparent pointer-events-none" />
        )}

        {/* Card Content Top */}
        <div>
          {/* Top Row: Brand Header + Dynamic Island Status / External Link */}
          <div className="flex items-start justify-between pb-3.5 border-b border-slate-100/90">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <PlatformBrandIcon platform={plat.name} size="lg" />
                {isActive && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={IOS_TAB_SPRING}
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-2xs"
                  />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-bold text-slate-900 truncate">
                    {plat.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 truncate font-mono">
                  {plat.handle}
                </p>
              </div>
            </div>

            {/* iOS Dynamic Island Status Pill & Channel Link */}
            <div className="flex items-center gap-1.5 shrink-0">
              {isActive ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -2 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={IOS_TAB_SPRING}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold shadow-md ring-1 ring-white/20"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                  <span>โฟกัส</span>
                </motion.div>
              ) : (
                <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                  แตะดูสถิติ
                </span>
              )}

              {plat.url && (
                <a
                  href={plat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                  title={`เปิดหน้า ${plat.name} จริง`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Creative Growth Tag Banner */}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-violet-600" />
              <span>ผลงานช่องทาง</span>
            </span>
            <span className="text-[11px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-lg border border-violet-200/60">
              {theme.growthTag}
            </span>
          </div>

          {/* Icon-Labeled Metric Rows with Animated Count-Up */}
          <dl className="mt-3 space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 px-2 rounded-xl hover:bg-slate-50/80 transition-colors">
              <dt className="flex items-center gap-2 text-slate-600 font-medium">
                <Users className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                <span>Followers</span>
              </dt>
              <dd className="font-bold text-slate-900 font-mono-num text-sm">
                <AnimatedCounter value={plat.followers} duration={1.5} />
              </dd>
            </div>

            <div className="flex items-center justify-between py-1.5 px-2 rounded-xl hover:bg-slate-50/80 transition-colors">
              <dt className="flex items-center gap-2 text-slate-600 font-medium">
                <Eye className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>{tfOption.cardViewsLabel}</span>
              </dt>
              <dd className="font-bold text-slate-900 font-mono-num text-sm">
                <AnimatedCounter value={tfMetrics.views} duration={1.45} />
              </dd>
            </div>

            <div className="flex items-center justify-between py-1 px-2 rounded-xl hover:bg-slate-50/80 transition-colors">
              <dt className="flex items-center gap-2 text-slate-600 font-medium">
                <Heart className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                <span>Likes ({tfOption.shortBadge})</span>
              </dt>
              <dd className="font-semibold text-slate-800 font-mono-num">
                <AnimatedCounter value={tfMetrics.likes} duration={1.4} />
              </dd>
            </div>

            <div className="flex items-center justify-between py-1 px-2 rounded-xl hover:bg-slate-50/80 transition-colors">
              <dt className="flex items-center gap-2 text-slate-600 font-medium">
                <MessageCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Comments ({tfOption.shortBadge})</span>
              </dt>
              <dd className="font-semibold text-slate-800 font-mono-num">
                <AnimatedCounter value={tfMetrics.comments} duration={1.4} />
              </dd>
            </div>

            <div className="flex items-center justify-between py-1 px-2 rounded-xl hover:bg-slate-50/80 transition-colors">
              <dt className="flex items-center gap-2 text-slate-600 font-medium">
                <Share2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Shares ({tfOption.shortBadge})</span>
              </dt>
              <dd className="font-semibold text-slate-800 font-mono-num">
                <AnimatedCounter value={tfMetrics.shares} duration={1.4} />
              </dd>
            </div>
          </dl>
        </div>

        {/* ER Box at Bottom of Platform Card with iOS Frosted Feel */}
        <div
          className={`mt-4 pt-3 border-t -mx-5 -mb-5 p-4 rounded-b-3xl flex items-center justify-between transition-colors ${
            isActive
              ? 'bg-linear-to-r from-violet-50/90 to-indigo-50/60 border-violet-200/80'
              : 'bg-slate-50/80 border-slate-100'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                isActive
                  ? 'bg-violet-700 text-white shadow-2xs'
                  : 'bg-violet-100 text-violet-700'
              }`}
            >
              <Flame className="w-4 h-4" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">
                Engagement Rate ({tfOption.shortBadge})
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                เฉลี่ยต่อคอนเทนต์
              </p>
            </div>
          </div>
          <p className="text-2xl font-bold text-[#1E1B4B] font-mono-num shrink-0 ml-2">
            <AnimatedCounter value={tfMetrics.er} duration={1.5} />
          </p>
        </div>
      </div>
    </motion.div>
  );
});

PlatformPerformanceCard.displayName = 'PlatformPerformanceCard';
