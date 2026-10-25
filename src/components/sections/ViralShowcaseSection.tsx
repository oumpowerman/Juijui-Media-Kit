import React, { useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
} from 'motion/react';
import {
  Play,
  Plus,
  ArrowUpRight,
  Flame,
  LayoutGrid,
  Clapperboard,
  Heart,
  Share2,
  MessageCircle,
  CalendarCheck,
  MonitorPlay,
  Smartphone,
  List,
  Clock,
  Eye,
  ExternalLink,
} from 'lucide-react';
import {
  CreatorProfile,
  ViralWorkItem,
  resolveGoogleDriveImage,
} from '../../data/creatorData';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { PlatformBrandIcon } from '../ui/PlatformBrandIcon';
import {
  EASE_OUT_EXPO,
  REPEAT_VIEWPORT,
  fadeUpVariant,
  slideFromLeftVariant,
  slideFromRightVariant,
} from './motionVariants';

interface ViralShowcaseSectionProps {
  currentCreator: CreatorProfile;
  portfolioFilter: string;
  onSelectPortfolioFilter: (filter: string) => void;
  onOpenAdmin?: () => void;
  onSelectLightboxItem: (item: ViralWorkItem) => void;
  onBookSimilarClip: (clipTitle: string) => void;
}

export const ViralShowcaseSection: React.FC<ViralShowcaseSectionProps> = ({
  currentCreator,
  portfolioFilter,
  onSelectPortfolioFilter,
  onOpenAdmin,
  onSelectLightboxItem,
  onBookSimilarClip,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [viewLayout, setViewLayout] = useState<'showcase' | 'list'>('showcase');

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 95,
    damping: 24,
    restDelta: 0.001,
  });

  // Scroll-driven cinema dark glow & ambient spotlight transitions
  // As user scrolls into section (0 -> 0.25 -> 0.75 -> 1.0), gradually transitions into rich cinema screening room
  const cinemaBgOpacity = useTransform(smoothProgress, [0, 0.22, 0.8, 1], [0.15, 1, 1, 0.2]);
  const ambientSpotlightScale = useTransform(smoothProgress, [0, 0.35, 0.75, 1], [0.85, 1.2, 1.1, 0.85]);
  const ambientSpotlightY = useTransform(smoothProgress, [0, 1], [-90, 90]);
  const ambientSpotlightOpacity = useTransform(smoothProgress, [0, 0.25, 0.75, 1], [0.2, 0.95, 0.95, 0.25]);

  // Scroll-linked continuous parallax for full-height seamless film strip tracks & grid
  const leftFilmParallaxY = useTransform(smoothProgress, [0, 1], [-70, 70]);
  const rightFilmParallaxY = useTransform(smoothProgress, [0, 1], [70, -70]);
  const showcaseGridParallaxY = useTransform(smoothProgress, [0, 1], [24, -20]);

  const allWorks = currentCreator.viralWorks;
  const horizontalTotalCount = allWorks.filter((w) => w.orientation === 'horizontal').length;
  const verticalTotalCount = allWorks.filter((w) => w.orientation !== 'horizontal').length;

  // Match platform helper
  const matchesPlatform = (item: ViralWorkItem, platKey: string) => {
    if (platKey === 'all') return true;
    const p = item.platform.toLowerCase();
    if (platKey === 'tiktok') return p.includes('tiktok');
    if (platKey === 'youtube') return p.includes('youtube') || p.includes('yt');
    if (platKey === 'facebook') return p.includes('facebook') || p.includes('fb');
    if (platKey === 'instagram') return p.includes('instagram') || p.includes('ig');
    return true;
  };

  // Filtered works combining Orientation/Category + Platform filter
  const filteredViralWorks = allWorks.filter((item) => {
    if (!matchesPlatform(item, platformFilter)) return false;
    if (portfolioFilter === 'all') return true;
    if (portfolioFilter === 'horizontal') return item.orientation === 'horizontal';
    if (portfolioFilter === 'vertical') return item.orientation !== 'horizontal';
    if (portfolioFilter === 'pinned') return Boolean(item.isPinned || item.isFeatured);
    return item.category.toLowerCase().includes(portfolioFilter.toLowerCase());
  });

  const horizontalFiltered = filteredViralWorks.filter((w) => w.orientation === 'horizontal');
  const verticalFiltered = filteredViralWorks.filter((w) => w.orientation !== 'horizontal');

  const FILTER_TABS = [
    {
      id: 'all',
      label: `ทั้งหมด (${allWorks.length})`,
      icon: LayoutGrid,
    },
    {
      id: 'horizontal',
      label: `คลิปแนวนอน 16:9 (${horizontalTotalCount})`,
      icon: MonitorPlay,
    },
    {
      id: 'vertical',
      label: `คลิปแนวตั้ง 9:16 (${verticalTotalCount})`,
      icon: Smartphone,
    },
    {
      id: 'pinned',
      label: 'ท็อปไวรัล',
      icon: Flame,
    },
  ];

  const PLATFORM_FILTERS = [
    { id: 'all', label: 'ทุกแพลตฟอร์ม', platformName: null },
    { id: 'tiktok', label: 'TikTok', platformName: 'TikTok' },
    { id: 'youtube', label: 'YouTube', platformName: 'YouTube' },
    { id: 'facebook', label: 'Facebook', platformName: 'Facebook' },
    { id: 'instagram', label: 'IG Reels', platformName: 'Instagram' },
  ];

  return (
    <section
      ref={sectionRef}
      id="portfolio"
      className="relative py-20 bg-[#F5F2FD] border-b border-slate-200/80 overflow-hidden text-white transition-colors"
    >
      {/* THEMATIC BACKGROUND CANVAS 03: Cinema Dark Glow Scroll Transition */}
      {/* 1. Deep Cinema Gradient Backdrop (Transitions gradually into dark as user scrolls in) */}
      <motion.div
        aria-hidden="true"
        style={{ opacity: cinemaBgOpacity }}
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-[#09061A] via-[#120D2C] to-[#0A071A] select-none"
      />

      {/* 2. Dynamic Ambient Cinema Spotlight (Floats & Scales on Scroll) */}
      <motion.div
        aria-hidden="true"
        style={{
          scale: ambientSpotlightScale,
          y: ambientSpotlightY,
          opacity: ambientSpotlightOpacity,
        }}
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] sm:w-[1100px] 2xl:w-[1450px] h-[650px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.24)_0%,rgba(99,102,241,0.12)_45%,transparent_70%)] blur-3xl select-none"
      />

      {/* 3. Subtle Warm Studio Rim Light (Right-side warm reflection) */}
      <motion.div
        aria-hidden="true"
        style={{ opacity: cinemaBgOpacity }}
        className="pointer-events-none absolute top-2/3 right-4 w-[600px] h-[550px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.10)_0%,transparent_65%)] blur-3xl select-none"
      />

      {/* 4. Film Strip Subtle Floor Grid Pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-15 select-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* 5. FULL-HEIGHT SEAMLESS FILM STRIP TRACKS (LEFT & RIGHT) */}
      {/* Left Full-Height Film Strip with Top/Bottom Gradient Mask Feathering */}
      <div
        aria-hidden="true"
        className="hidden xl:block pointer-events-none absolute left-1 2xl:left-2 inset-y-0 w-8 2xl:w-9 select-none overflow-hidden"
        style={{
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 140px, black calc(100% - 140px), transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, black 140px, black calc(100% - 140px), transparent 100%)',
        }}
      >
        <motion.div
          style={{ y: leftFilmParallaxY }}
          className="absolute -top-32 -bottom-32 left-0 w-full flex flex-col justify-around py-4"
        >
          {/* Repeating continuous sprocket holes spanning full section height */}
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='48' viewBox='0 0 36 48'%3E%3Cpath d='M2 0 L2 48 M34 0 L34 48' stroke='rgba(167,139,250,0.22)' stroke-width='1.5' stroke-dasharray='48'/%3E%3Crect x='7' y='8' width='22' height='32' rx='4' fill='rgba(255,255,255,0.04)' stroke='rgba(167,139,250,0.32)' stroke-width='1.5'/%3E%3Cline x1='0' y1='24' x2='4' y2='24' stroke='rgba(245,158,11,0.35)' stroke-width='1.5'/%3E%3Cline x1='32' y1='24' x2='36' y2='24' stroke='rgba(245,158,11,0.35)' stroke-width='1.5'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat-y',
              backgroundSize: '36px 48px',
            }}
          />
        </motion.div>
      </div>

      {/* Right Full-Height Film Strip with Top/Bottom Gradient Mask Feathering */}
      <div
        aria-hidden="true"
        className="hidden xl:block pointer-events-none absolute right-1 2xl:right-2 inset-y-0 w-8 2xl:w-9 select-none overflow-hidden"
        style={{
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 140px, black calc(100% - 140px), transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, black 140px, black calc(100% - 140px), transparent 100%)',
        }}
      >
        <motion.div
          style={{ y: rightFilmParallaxY }}
          className="absolute -top-32 -bottom-32 left-0 w-full flex flex-col justify-around py-4"
        >
          {/* Repeating continuous sprocket holes spanning full section height */}
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='48' viewBox='0 0 36 48'%3E%3Cpath d='M2 0 L2 48 M34 0 L34 48' stroke='rgba(167,139,250,0.22)' stroke-width='1.5' stroke-dasharray='48'/%3E%3Crect x='7' y='8' width='22' height='32' rx='4' fill='rgba(255,255,255,0.04)' stroke='rgba(167,139,250,0.32)' stroke-width='1.5'/%3E%3Cline x1='0' y1='24' x2='4' y2='24' stroke='rgba(245,158,11,0.35)' stroke-width='1.5'/%3E%3Cline x1='32' y1='24' x2='36' y2='24' stroke='rgba(245,158,11,0.35)' stroke-width='1.5'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat-y',
              backgroundSize: '36px 48px',
            }}
          />
        </motion.div>
      </div>

      {/* 6. Cinematic Frame Marker Badges */}
      <div className="absolute top-6 left-14 hidden lg:block text-[11px] font-mono-num tracking-widest text-amber-300/40 font-semibold select-none">
        [ REC ● 16:9 WIDESCREEN & 9:16 VERTICAL MASTER ]
      </div>
      <div className="absolute bottom-6 right-14 hidden lg:block text-[11px] font-mono-num tracking-widest text-violet-300/40 font-semibold select-none">
        [ SHOWREEL ARCHIVE · 4K MASTER · TIKTOK · YT · FB · IG ]
      </div>

      {/* 7. Soft Seam Feathering at Top & Bottom */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-[#FAFAFC] via-[#FAFAFC]/30 to-transparent select-none z-1"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-[#FAFAFC] via-[#FAFAFC]/30 to-transparent select-none z-1"
      />

      <div className="relative z-10 w-full max-w-7xl xl:max-w-[94vw] 2xl:max-w-[95vw] min-[2400px]:max-w-[2280px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-7 2xl:space-y-9">
        {/* Top Row: Section Header + Add Clip CTA */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={REPEAT_VIEWPORT}
            variants={slideFromLeftVariant}
          >
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 drop-shadow-xs tracking-wider uppercase">
              <Clapperboard className="w-3.5 h-3.5 text-amber-400" />
              <span>03. VIRAL PORTFOLIO (16:9 WIDESCREEN & 9:16 SHORT-FORM)</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                ผลงานไวรัล & ตัวอย่างคอนเทนต์ยอดนิยม
              </h2>
              {/* Decorative Platform Icons Badge Strip */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 shadow-2xs">
                <PlatformBrandIcon platform="TikTok" size="xs" />
                <PlatformBrandIcon platform="YouTube" size="xs" />
                <PlatformBrandIcon platform="Facebook" size="xs" />
                <PlatformBrandIcon platform="Instagram" size="xs" />
                <span className="text-[11px] font-bold text-amber-300 ml-0.5">
                  ครบทั้งแนวตั้ง & แนวนอน
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              เลือกกรองดูเฉพาะคลิปแนวนอน 16:9, คลิปสั้นแนวตั้ง 9:16 หรือสลับเป็นมุมมองตารางดูง่ายเพื่อเปรียบเทียบสถิติทันที
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={REPEAT_VIEWPORT}
            variants={slideFromRightVariant}
            className="flex flex-wrap items-center gap-2"
          >
            {/* View Layout Switcher: Showcase Cards vs Easy List */}
            <div className="inline-flex items-center gap-1 p-1 bg-white/10 backdrop-blur-md border border-white/15 rounded-xl text-xs shadow-2xs">
              <button
                type="button"
                onClick={() => setViewLayout('showcase')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewLayout === 'showcase'
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>มุมมองการ์ดแยกสัดส่วน</span>
              </button>
              <button
                type="button"
                onClick={() => setViewLayout('list')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewLayout === 'list'
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>มุมมองรายการดูง่าย</span>
              </button>
            </div>

            {onOpenAdmin && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-violet-400/35 text-amber-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-2xs backdrop-blur-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>แนบคลิป / Google Drive</span>
              </motion.button>
            )}
          </motion.div>
        </div>

        {/* Control Bar: Orientation Filter Tabs + Platform Brand Icon Filter Pills */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={REPEAT_VIEWPORT}
          variants={fadeUpVariant}
          className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-xl"
        >
          {/* Left: Orientation & Featured Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {FILTER_TABS.map((tab) => {
              const isActive = portfolioFilter === tab.id;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectPortfolioFilter(tab.id)}
                  className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-white'
                      : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="portfolioFilterTab"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      className="absolute inset-0 bg-violet-600 rounded-xl shadow-xs -z-0"
                    />
                  )}
                  <TabIcon className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Social Platform Filter with TikTok / YouTube / Facebook / IG Icons */}
          <div className="flex items-center gap-1.5 flex-wrap border-t lg:border-t-0 pt-2.5 lg:pt-0 border-white/10">
            <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase tracking-wider">
              แพลตฟอร์ม:
            </span>
            {PLATFORM_FILTERS.map((pf) => {
              const isSelected = platformFilter === pf.id;
              return (
                <button
                  key={pf.id}
                  type="button"
                  onClick={() => setPlatformFilter(pf.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-violet-600/40 border-violet-400 text-white shadow-2xs backdrop-blur-md'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:border-white/20'
                  }`}
                >
                  {pf.platformName && (
                    <PlatformBrandIcon platform={pf.platformName} size="xs" />
                  )}
                  <span>{pf.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* VIEW MODE 1: COMPACT SCANNABLE LIST VIEW (ดูรายการได้ง่ายขึ้น เปรียบเทียบไว) */}
        <AnimatePresence mode="wait">
          {viewLayout === 'list' ? (
            <motion.div
              key={`list-${portfolioFilter}-${platformFilter}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
              className="bg-[#130F2E]/95 backdrop-blur-md border border-white/15 rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="px-5 py-3.5 bg-white/5 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-white">
                  <List className="w-4 h-4 text-amber-400" />
                  <span>
                    ตารางสรุปรายการผลงานทั้งหมด ({filteredViralWorks.length} รายการ) — คลิกที่แถวเพื่อดูคอมเมนต์และคลิปตัวอย่าง
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-300">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/35 font-semibold">
                    <MonitorPlay className="w-3 h-3" /> แนวนอน 16:9 ({horizontalFiltered.length})
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/35 font-semibold">
                    <Smartphone className="w-3 h-3" /> แนวตั้ง 9:16 ({verticalFiltered.length})
                  </span>
                </div>
              </div>

              <div className="divide-y divide-white/10">
                {filteredViralWorks.map((item, idx) => {
                  const imgSrc = item.driveImageUrl
                    ? resolveGoogleDriveImage(item.driveImageUrl)
                    : item.thumbnailUrl;
                  const isHorizontal = item.orientation === 'horizontal';

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.26,
                        delay: Math.min(idx * 0.025, 0.18),
                        ease: EASE_OUT_EXPO,
                      }}
                      onClick={() => onSelectLightboxItem(item)}
                      className="p-3.5 sm:px-5 hover:bg-white/10 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                    >
                    {/* Left: Thumbnail + Platform Icon + Orientation Badge + Title */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <span className="text-xs font-mono-num font-bold text-amber-300/80 w-5 shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>

                      <div
                        className={`relative rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-white/20 ${
                          isHorizontal ? 'w-28 aspect-video' : 'w-14 aspect-[4/5]'
                        }`}
                      >
                        <img
                          src={imgSrc}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              '/assets/juijui/viral-2.jpg';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-4 h-4 text-white fill-current" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <PlatformBrandIcon
                            platform={item.platform}
                            size="xs"
                            withLabel
                          />
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isHorizontal
                                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                                : 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                            }`}
                          >
                            {isHorizontal ? (
                              <>
                                <MonitorPlay className="w-3 h-3" />
                                <span>แนวนอน 16:9</span>
                              </>
                            ) : (
                              <>
                                <Smartphone className="w-3 h-3" />
                                <span>แนวตั้ง 9:16</span>
                              </>
                            )}
                          </span>
                          {item.duration && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300 text-[10px] font-mono-num font-semibold">
                              <Clock className="w-2.5 h-2.5" />
                              {item.duration}
                            </span>
                          )}
                          <span className="text-[11px] font-semibold text-slate-400">
                            · {item.category}
                          </span>
                          {item.isPinned && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-400">
                              <Flame className="w-3 h-3 fill-current" /> Pinned
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-300 truncate">{item.subtitle}</p>
                      </div>
                    </div>

                    {/* Right: Metrics Pillars + Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-white/10 shrink-0">
                      <div className="flex items-center gap-4 text-xs font-mono-num">
                        <div className="text-left md:text-right">
                          <span className="text-[10px] text-slate-400 block font-sans">
                            ยอดวิว
                          </span>
                          <span className="font-bold text-amber-300 inline-flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <AnimatedCounter value={item.views} duration={1.2} />
                          </span>
                        </div>
                        <div className="text-left md:text-right">
                          <span className="text-[10px] text-slate-400 block font-sans">
                            ถูกใจ
                          </span>
                          <span className="font-bold text-pink-300 inline-flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 text-pink-400 fill-current" />
                            <AnimatedCounter value={item.likes} duration={1.2} />
                          </span>
                        </div>
                        <div className="text-left md:text-right">
                          <span className="text-[10px] text-slate-400 block font-sans">
                            แชร์
                          </span>
                          <span className="font-bold text-emerald-300 inline-flex items-center gap-1">
                            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                            <AnimatedCounter value={item.sharesCount} duration={1.2} />
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.tiktokUrl && (
                          <a
                            href={item.tiktokUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-lg border border-white/15 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
                            title="เปิดดูคลิปต้นฉบับ"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onBookSimilarClip(item.title);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                        >
                          <CalendarCheck className="w-3.5 h-3.5 text-amber-300" />
                          <span>จองสไตล์นี้</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* VIEW MODE 2: VISUAL SHOWCASE GRID (Separated 16:9 Horizontal Widescreen & 9:16 Vertical Reels) */
          <motion.div
            key={`showcase-${portfolioFilter}-${platformFilter}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
            style={{ y: showcaseGridParallaxY }}
            className="space-y-12"
          >
            {filteredViralWorks.length === 0 && (
              <div className="py-16 px-6 text-center rounded-2xl bg-[#130F2E]/60 border border-white/10 backdrop-blur-md max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Clapperboard className="w-6 h-6 text-violet-400" />
                </div>
                <h4 className="text-base font-bold text-white mb-1">ไม่พบคลิปในตัวกรองนี้</h4>
                <p className="text-xs text-slate-300 mb-4">
                  ลองเลือกแพลตฟอร์มอื่น หรือรีเซ็ตการกรองเพื่อดูผลงานทั้งหมด
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onSelectPortfolioFilter('all');
                    setPlatformFilter('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                >
                  แสดงผลงานทั้งหมด
                </button>
              </div>
            )}

            {/* SUBSECTION A: 16:9 WIDESCREEN HORIZONTAL CLIPS */}
            {horizontalFiltered.length > 0 && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/15">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
                      <MonitorPlay className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-white">
                          คลิปไวรัลแนวนอน 16:9 (Widescreen Vlog & Full Review)
                        </h3>
                        <div className="hidden sm:flex items-center gap-1">
                          <PlatformBrandIcon platform="YouTube" size="xs" />
                          <PlatformBrandIcon platform="Facebook" size="xs" />
                        </div>
                      </div>
                      <p className="text-xs text-slate-300">
                        เหมาะสำหรับงานรีวิวเจาะลึก, ทริปท่องเที่ยว,รายการ Q&A และแคมเปญที่ต้องการเล่าเรื่องครบทุกมิติบน YouTube & Facebook
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold">
                    16:9 Widescreen · {horizontalFiltered.length} คลิป
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 2xl:gap-7">
                  <AnimatePresence mode="popLayout">
                    {horizontalFiltered.map((item, idx) => {
                      const imgSrc = item.driveImageUrl
                        ? resolveGoogleDriveImage(item.driveImageUrl)
                        : item.thumbnailUrl;
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 16, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{
                            duration: 0.32,
                            delay: Math.min((idx % 6) * 0.04, 0.18),
                            ease: EASE_OUT_EXPO,
                          }}
                          whileHover={{ y: -6 }}
                          onClick={() => onSelectLightboxItem(item)}
                          className="group bg-[#130F2E]/90 hover:bg-[#18133B]/95 backdrop-blur-md rounded-2xl border border-white/15 hover:border-amber-400/80 overflow-hidden transition-colors cursor-pointer flex flex-col justify-between shadow-lg hover:shadow-2xl"
                        >
                          <div>
                            {/* 16:9 Widescreen Video Frame */}
                            <div className="relative aspect-video bg-slate-950 overflow-hidden">
                              <img
                                src={imgSrc}
                                alt={item.title}
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src =
                                    '/assets/juijui/page-6.png';
                                }}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                              />

                              {/* Top Widescreen Bar: Platform Icon + 16:9 Badge + Duration */}
                              <div className="absolute inset-x-0 top-0 p-3 bg-linear-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between text-white text-xs">
                                <div className="flex items-center gap-1.5">
                                  <PlatformBrandIcon platform={item.platform} size="sm" />
                                  <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-bold flex items-center gap-1 shadow-xs">
                                    <MonitorPlay className="w-3 h-3" />
                                    <span>16:9 WIDESCREEN</span>
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  {item.duration && (
                                    <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[11px] font-mono-num font-semibold flex items-center gap-1 border border-white/15">
                                      <Clock className="w-3 h-3 text-amber-300" />
                                      <span>{item.duration}</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Center Play Button */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-85 group-hover:opacity-100 transition-opacity bg-black/15 group-hover:bg-black/25">
                                <div className="w-13 h-13 rounded-full bg-white/95 text-violet-950 flex items-center justify-center shadow-2xl transform scale-95 group-hover:scale-105 transition-transform duration-300">
                                  <Play className="w-5 h-5 fill-current ml-0.5 text-violet-900" />
                                </div>
                              </div>

                              {/* Bottom Scrim with Count-Up Stats */}
                              <div className="absolute inset-x-0 bottom-0 p-3.5 bg-linear-to-t from-black/95 via-black/55 to-transparent text-white flex items-end justify-between">
                                <div>
                                  <div className="flex items-center gap-1.5 text-base font-bold font-mono-num text-amber-300">
                                    <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
                                    <AnimatedCounter value={item.views} duration={1.5} />
                                    <span className="text-white">Views</span>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-slate-300 font-mono-num mt-0.5">
                                    <span className="inline-flex items-center gap-1">
                                      <Heart className="w-3 h-3 text-pink-400 fill-current" />
                                      <AnimatedCounter value={item.likes} duration={1.4} />
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                      <Share2 className="w-3 h-3 text-emerald-400" />
                                      <AnimatedCounter value={item.sharesCount} duration={1.4} />
                                    </span>
                                  </div>
                                </div>

                                <span className="p-1.5 rounded-full bg-white/20 backdrop-blur-xs text-white group-hover:bg-violet-600 transition-colors">
                                  <ArrowUpRight className="w-4 h-4" />
                                </span>
                              </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-4">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-[11px] font-bold text-amber-300">
                                  {item.platform} · {item.category}
                                </span>
                                {item.isPinned && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                                    <Flame className="w-3 h-3 fill-current" /> Pinned
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                                {item.title}
                              </h4>
                              <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                                {item.subtitle}
                              </p>

                              {item.topComments && item.topComments.length > 0 && (
                                <div className="mt-3 p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-200 flex items-start gap-2">
                                  <MessageCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                  <div className="line-clamp-1">
                                    <span className="font-semibold text-amber-300">
                                      {item.topComments[0].user}:{' '}
                                    </span>
                                    <span>“{item.topComments[0].text}”</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="px-4 py-3 border-t border-white/10 bg-white/[0.03] flex items-center justify-between text-xs text-slate-300">
                            <span className="text-slate-400 font-medium">
                              คลิกดูสถิติ & คอมเมนต์
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onBookSimilarClip(item.title);
                              }}
                              className="inline-flex items-center gap-1 font-semibold text-amber-300 hover:text-white transition-colors cursor-pointer"
                            >
                              <CalendarCheck className="w-3.5 h-3.5" />
                              <span>จองคลิปแนวนอน →</span>
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* SUBSECTION B: 9:16 VERTICAL SHORT-FORM CLIPS */}
            {verticalFiltered.length > 0 && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/15">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-300 flex items-center justify-center">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-white">
                          คลิปไวรัลแนวตั้ง 9:16 (Short-Form TikTok / Reels / Shorts)
                        </h3>
                        <div className="hidden sm:flex items-center gap-1">
                          <PlatformBrandIcon platform="TikTok" size="xs" />
                          <PlatformBrandIcon platform="Instagram" size="xs" />
                          <PlatformBrandIcon platform="Facebook" size="xs" />
                          <PlatformBrandIcon platform="YouTube" size="xs" />
                        </div>
                      </div>
                      <p className="text-xs text-slate-300">
                        คลิปสั้นกระชับ ฮุกไวภายใน 3 วินาทีแรก สร้างยอดวิวหลักล้านและกระตุ้นยอดขายปักตะกร้า
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40 text-xs font-bold">
                    9:16 Vertical · {verticalFiltered.length} คลิป
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 2xl:gap-7">
                  <AnimatePresence mode="popLayout">
                    {verticalFiltered.map((item, idx) => {
                      const imgSrc = item.driveImageUrl
                        ? resolveGoogleDriveImage(item.driveImageUrl)
                        : item.thumbnailUrl;
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 16, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{
                            duration: 0.32,
                            delay: Math.min((idx % 6) * 0.04, 0.18),
                            ease: EASE_OUT_EXPO,
                          }}
                          whileHover={{ y: -8 }}
                          onClick={() => onSelectLightboxItem(item)}
                          className="group bg-[#130F2E]/90 hover:bg-[#18133B]/95 backdrop-blur-md rounded-2xl border border-white/15 hover:border-violet-400/80 overflow-hidden transition-colors cursor-pointer flex flex-col justify-between shadow-lg hover:shadow-2xl"
                        >
                          <div>
                            {/* Thumbnail Container with Measured Scrim */}
                            <div className="relative aspect-[4/5] bg-slate-950 overflow-hidden">
                              <img
                                src={imgSrc}
                                alt={item.title}
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src =
                                    '/assets/juijui/viral-2.jpg';
                                }}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                              />

                              {/* Top Bar on Media with Platform Icon & 9:16 Badge */}
                              <div className="absolute inset-x-0 top-0 p-3.5 bg-linear-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between text-white text-xs">
                                <div className="flex items-center gap-2">
                                  <PlatformBrandIcon platform={item.platform} size="sm" />
                                  <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-xs text-[10px] font-bold border border-white/20">
                                    9:16
                                  </span>
                                  <span className="font-semibold truncate max-w-[120px] text-slate-200">
                                    {item.category}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {item.duration && (
                                    <span className="px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-mono-num border border-white/15">
                                      {item.duration}
                                    </span>
                                  )}
                                  {item.isPinned && (
                                    <span className="inline-flex items-center gap-0.5 font-bold text-amber-300">
                                      <Flame className="w-3.5 h-3.5 fill-current" />
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Center Play Button Reveal on Hover */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/25">
                                <div className="w-14 h-14 rounded-full bg-white/95 text-violet-950 flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                                  <Play className="w-6 h-6 fill-current ml-0.5 text-violet-900" />
                                </div>
                              </div>

                              {/* Bottom Scrim with Count-Up Views & Icon Stats */}
                              <div className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-black/95 via-black/55 to-transparent text-white flex items-end justify-between">
                                <div>
                                  <div className="flex items-center gap-1.5 text-lg font-bold font-mono-num text-amber-300">
                                    <Play className="w-4 h-4 fill-current text-amber-400" />
                                    <AnimatedCounter value={item.views} duration={1.6} />
                                    <span className="text-white">Views</span>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-slate-300 font-mono-num mt-1">
                                    <span className="inline-flex items-center gap-1">
                                      <Heart className="w-3.5 h-3.5 text-pink-400 fill-current" />
                                      <AnimatedCounter value={item.likes} duration={1.5} />
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                      <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                                      <AnimatedCounter value={item.sharesCount} duration={1.5} />
                                    </span>
                                  </div>
                                </div>

                                <span className="p-2 rounded-full bg-white/20 backdrop-blur-xs text-white group-hover:bg-violet-600 transition-colors">
                                  <ArrowUpRight className="w-4 h-4" />
                                </span>
                              </div>
                            </div>

                            {/* Card Body (Concise & Icon-Guided) */}
                            <div className="p-4">
                              <h4 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                                {item.title}
                              </h4>
                              <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                                {item.subtitle}
                              </p>

                              {/* Preview of Top Comment with Message Icon */}
                              {item.topComments && item.topComments.length > 0 && (
                                <div className="mt-3 p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-200 flex items-start gap-2">
                                  <MessageCircle className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                                  <div className="line-clamp-1">
                                    <span className="font-semibold text-violet-300">
                                      {item.topComments[0].user}:{' '}
                                    </span>
                                    <span>“{item.topComments[0].text}”</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="px-4 py-3 border-t border-white/10 bg-white/[0.03] flex items-center justify-between text-xs text-slate-300">
                            <span className="text-slate-400 font-medium">ดูสถิติ & คอมเมนต์</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onBookSimilarClip(item.title);
                              }}
                              className="inline-flex items-center gap-1 font-semibold text-violet-300 hover:text-white transition-colors cursor-pointer"
                            >
                              <CalendarCheck className="w-3.5 h-3.5 text-amber-300" />
                              <span>จองสไตล์นี้ →</span>
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </section>
  );
};
