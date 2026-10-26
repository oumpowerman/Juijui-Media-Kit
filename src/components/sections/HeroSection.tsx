import React, { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from 'motion/react';
import {
  Users,
  Eye,
  Flame,
  Play,
  Edit3,
} from 'lucide-react';
import { CreatorProfile } from '../../data/creatorData';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { PlatformBrandIcon } from '../ui/PlatformBrandIcon';
import {
  fadeUpVariant,
  staggerContainer,
  REPEAT_VIEWPORT,
} from './motionVariants';
import { HeroLeftBrandCard } from './hero/HeroLeftBrandCard';
import { HeroRightSpotlightCard } from './hero/HeroRightSpotlightCard';

interface HeroSectionProps {
  creators: CreatorProfile[];
  currentCreator: CreatorProfile;
  onSelectCreatorId: (id: string) => void;
  onOpenAdmin?: () => void;
  onOpenPdf: () => void;
  onOpenBooking: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  creators,
  currentCreator,
  onSelectCreatorId,
  onOpenAdmin,
  onOpenPdf,
  onOpenBooking,
}) => {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  // Scroll-linked parallax offsets
  const leftCardParallaxY = useTransform(smoothProgress, [0, 1], [0, -24]);
  const rightCardParallaxY = useTransform(smoothProgress, [0, 1], [0, 28]);
  const kpiStripParallaxY = useTransform(smoothProgress, [0, 1], [0, -16]);
  const bgOrbParallaxY = useTransform(smoothProgress, [0, 1], [0, 85]);

  return (
    <>
      <section
        ref={sectionRef}
        className="relative overflow-hidden bg-linear-to-b from-[#F5F3FF] via-[#FAFAFC] to-[#FAFAFC] pt-8 pb-12 border-b border-slate-200/80"
      >
        {/* THEMATIC BACKGROUND CANVAS 01: Warm Editorial Studio Spotlight & Grid */}
        <motion.div
          aria-hidden="true"
          style={{ y: bgOrbParallaxY }}
          className="pointer-events-none absolute inset-0 overflow-hidden select-none"
        >
          <div
            className="absolute inset-0 opacity-35"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(109, 40, 217, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(109, 40, 217, 0.06) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />

          <motion.div
            animate={{
              x: [0, 40, -20, 0],
              y: [0, -25, 15, 0],
              scale: [1, 1.08, 0.96, 1],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-28 -left-24 w-96 h-96 rounded-full bg-violet-400/15 blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -35, 25, 0],
              y: [0, 30, -20, 0],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 -right-24 w-96 h-96 rounded-full bg-amber-400/15 blur-3xl"
          />
        </motion.div>

        <div className="relative z-10 w-full max-w-7xl xl:max-w-[94vw] 2xl:max-w-[95vw] min-[2400px]:max-w-[2280px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-6 2xl:px-8">
          {/* Multi-Creator Roster Switcher */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={REPEAT_VIEWPORT}
            variants={fadeUpVariant}
            className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/70"
          >
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900">
                <Users className="w-3.5 h-3.5 text-violet-700" />
                <span>ครีเอเตอร์:</span>
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {creators.map((c) => {
                  const isActive = c.id === currentCreator.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onSelectCreatorId(c.id)}
                      className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="activeCreatorPill"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          className="absolute inset-0 rounded-lg bg-violet-700 -z-0"
                        />
                      )}
                      <span className="relative z-10">
                        {c.nameTh} ({c.overview.totalFollowers})
                      </span>
                    </button>
                  );
                })}
                {onOpenAdmin && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={onOpenAdmin}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-violet-700 hover:bg-violet-100/60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    + เพิ่ม/แก้ไขครีเอเตอร์
                  </motion.button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs text-slate-500 font-medium">
                {currentCreator.updatedLabel}
              </span>
              {onOpenAdmin && (
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-violet-200 hover:bg-violet-50 text-violet-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>แก้ไขส่วนนี้</span>
                </button>
              )}
            </div>
          </motion.div>

          {/* 2-Column Hero Split with Layered Frosted Glass & Floating Motion */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 2xl:gap-10 items-stretch">
            <HeroLeftBrandCard
              currentCreator={currentCreator}
              parallaxY={leftCardParallaxY}
              onOpenPdf={onOpenPdf}
            />

            <HeroRightSpotlightCard
              currentCreator={currentCreator}
              parallaxY={rightCardParallaxY}
              onOpenAdmin={onOpenAdmin}
              onOpenBooking={onOpenBooking}
            />
          </div>

          {/* Full-Width 4-Column KPI Strip Below Hero Split with Icons & Count-Up Numbers */}
          <motion.div
            style={{ y: kpiStripParallaxY }}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={REPEAT_VIEWPORT}
            className="mt-6 2xl:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 2xl:gap-6"
          >
            {(() => {
              const tiktokPlat = currentCreator.platforms.find((p) => p.id === 'tiktok');
              const tiktokErText = tiktokPlat?.er ? `TikTok สูงสุด ${tiktokPlat.er}` : 'TikTok สูงสุด 8.01%';
              return [
                {
                  icon: Users,
                  iconBg: 'bg-violet-100 text-violet-700',
                  label: 'ผู้ติดตามรวม (Total Followers)',
                  value: currentCreator.overview.totalFollowers,
                  sub: 'TikTok · FB · IG · YouTube',
                  showAllPlatforms: true,
                  color: 'text-[#1E1B4B]',
                },
                {
                  icon: Eye,
                  iconBg: 'bg-indigo-100 text-indigo-700',
                  label: 'ยอดวิวรวม 60 วัน (Total Views)',
                  value: currentCreator.overview.totalViews60d,
                  sub: `Reach ${currentCreator.overview.monthlyReach}/เดือน`,
                  showAllPlatforms: false,
                  color: 'text-violet-700',
                },
                {
                  icon: Flame,
                  iconBg: 'bg-emerald-100 text-emerald-700',
                  label: 'Engagement เฉลี่ย (Total ER)',
                  value: currentCreator.overview.totalEr,
                  sub: tiktokErText,
                  highlightPlatform: 'TikTok',
                  color: 'text-emerald-700',
                },
                {
                  icon: Play,
                  iconBg: 'bg-amber-100 text-amber-700',
                  label: 'ยอดดูเฉลี่ยต่อคลิป (Avg. Views)',
                  value: currentCreator.overview.avgViewsPerContent,
                  sub: `Likes ${currentCreator.overview.monthlyLikes}/เดือน`,
                  showAllPlatforms: false,
                  color: 'text-[#1E1B4B]',
                },
              ];
            })().map((kpi, idx) => {
              const KpiIcon = kpi.icon;
              return (
                <motion.div
                  key={idx}
                  variants={fadeUpVariant}
                  custom={idx * 0.07}
                  whileHover={{ y: -4, transition: { duration: 0.18, ease: 'easeOut' } }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white/88 backdrop-blur-md border border-white/95 rounded-2xl p-4 sm:p-5 2xl:p-6 hover:border-violet-300 hover:shadow-[0_16px_32px_-8px_rgba(79,70,229,0.12),inset_0_1px_1.5px_rgba(255,255,255,1)] transition-[border-color,box-shadow] duration-200 will-change-transform cursor-pointer flex flex-col justify-between relative overflow-hidden group shadow-[0_12px_28px_-8px_rgba(79,70,229,0.08),inset_0_1px_1.5px_rgba(255,255,255,1)]"
                >
                  {/* Subtle Top Specular Glass Line */}
                  <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/90 to-transparent pointer-events-none" />

                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-slate-500 font-semibold">{kpi.label}</p>
                    <motion.div
                      animate={{
                        y: [0, -3, 0],
                        scale: [1, 1.06, 1],
                      }}
                      transition={{
                        duration: 3.2 + idx * 0.4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${kpi.iconBg} shadow-2xs`}
                    >
                      <KpiIcon className="w-4 h-4" />
                    </motion.div>
                  </div>
                  <p className={`text-2xl sm:text-3xl font-bold font-mono-num mt-2 ${kpi.color}`}>
                    <AnimatedCounter value={kpi.value} duration={1.7} delay={idx * 0.08} />
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-1.5">
                    <p className="text-[11px] text-slate-500 font-medium">{kpi.sub}</p>
                    {kpi.showAllPlatforms && (
                      <div className="flex items-center gap-1 shrink-0">
                        <PlatformBrandIcon platform="TikTok" size="xs" />
                        <PlatformBrandIcon platform="Facebook" size="xs" />
                        <PlatformBrandIcon platform="Instagram" size="xs" />
                        <PlatformBrandIcon platform="YouTube" size="xs" />
                      </div>
                    )}
                    {kpi.highlightPlatform && (
                      <PlatformBrandIcon platform={kpi.highlightPlatform} size="xs" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* PRODUCTION SHOWREEL MARQUEE RIBBON DIVIDER WITH PLATFORM ICONS */}
      <div className="bg-[#1E1B4B] text-violet-200 py-2.5 overflow-hidden border-b border-slate-800 select-none">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          className="flex items-center gap-8 whitespace-nowrap text-xs font-semibold tracking-wider uppercase w-max"
        >
          {[...Array(4)].map((_, groupIdx) => (
            <div key={groupIdx} className="flex items-center gap-6">
              <span>{currentCreator.nameEn} PRODUCTION & {currentCreator.tierLabel || 'MEDIA KIT 2026'}</span>
              <span className="text-amber-400">·</span>
              {currentCreator.platforms.map((plat) => (
                <React.Fragment key={plat.id}>
                  <span className="inline-flex items-center gap-1.5">
                    <PlatformBrandIcon platform={plat.name} size="xs" />
                    <span>{plat.name.toUpperCase()} {plat.followers} (ER {plat.er})</span>
                  </span>
                  <span className="text-amber-400">·</span>
                </React.Fragment>
              ))}
              <span>{currentCreator.overview.totalViews60d} VIEWS IN 60 DAYS</span>
              <span className="text-amber-400">·</span>
            </div>
          ))}
        </motion.div>
      </div>
    </>
  );
};
