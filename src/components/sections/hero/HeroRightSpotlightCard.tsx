import React, { useRef, useState } from 'react';
import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import {
  Users,
  Eye,
  Flame,
  MessageSquare,
  ArrowUpRight,
  Edit3,
  Sparkles,
  Clock,
} from 'lucide-react';
import { CreatorProfile } from '../../../data/creatorData';
import { AnimatedCounter } from '../../ui/AnimatedCounter';
import { PlatformBrandIcon } from '../../ui/PlatformBrandIcon';
import {
  EASE_OUT_EXPO,
  REPEAT_VIEWPORT,
  slideFromRightVariant,
} from '../motionVariants';

interface HeroRightSpotlightCardProps {
  currentCreator: CreatorProfile;
  parallaxY: MotionValue<number>;
  onOpenAdmin?: () => void;
  onOpenBooking: () => void;
}

// iOS Minimal 4-Point Geometric Twinkle Micro-Sparkle
const TwinkleSparkle: React.FC<{
  className?: string;
  size?: number;
  delay?: number;
  duration?: number;
}> = ({ className = '', size = 16, delay = 0, duration = 3.2 }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    animate={{
      scale: [0.65, 1.25, 0.65],
      opacity: [0.25, 0.95, 0.25],
      rotate: [0, 18, 0],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    className={`pointer-events-none absolute select-none ${className}`}
  >
    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
  </motion.svg>
);

export const HeroRightSpotlightCard: React.FC<HeroRightSpotlightCardProps> = ({
  currentCreator,
  parallaxY,
  onOpenAdmin,
  onOpenBooking,
}) => {
  const rightCardRef = useRef<HTMLDivElement>(null);

  // 3D Interactive Mouse-Tracking Tilt & Dynamic Spotlight
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const [spotlightPos, setSpotlightPos] = useState({ x: 240, y: 180 });

  const smoothMouseX = useSpring(mouseX, { stiffness: 220, damping: 24 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 220, damping: 24 });

  const rotateX = useTransform(smoothMouseY, [0, 1], [5.5, -5.5]);
  const rotateY = useTransform(smoothMouseX, [0, 1], [-6.5, 6.5]);

  const handleRightCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rightCardRef.current) return;
    const rect = rightCardRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    mouseX.set(relX);
    mouseY.set(relY);
    setSpotlightPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleRightCardMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const maxPlatformFollowers = Math.max(
    ...currentCreator.platforms.map((p) => p.followersNum || 100000),
    100000
  );

  return (
    <motion.div
      key={`${currentCreator.id}-right`}
      style={{ y: parallaxY, perspective: 1100 }}
      initial="hidden"
      whileInView="visible"
      viewport={REPEAT_VIEWPORT}
      variants={slideFromRightVariant}
      custom={0.12}
      className="lg:col-span-5 flex"
    >
      <motion.div
        ref={rightCardRef}
        onMouseMove={handleRightCardMouseMove}
        onMouseLeave={handleRightCardMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="w-full bg-linear-to-br from-[#231254]/95 via-[#2E1A68]/95 to-[#190D3F]/95 backdrop-blur-2xl text-white rounded-3xl p-6 sm:p-7 2xl:p-9 pt-12 sm:pt-7 2xl:pt-9 flex flex-col justify-between border border-violet-400/30 relative overflow-hidden shadow-[0_30px_70px_-15px_rgba(30,11,80,0.65),inset_0_1.5px_2px_rgba(255,255,255,0.22)] ring-1 ring-white/10"
      >
        {/* 1.5px Top Specular Rim Reflection */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-linear-to-r from-transparent via-white/45 to-transparent pointer-events-none z-30" />

        {/* iOS Specular Glass Shimmer Beam Sweep (Periodic ambient sheen) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-15 rounded-3xl select-none">
          <motion.div
            animate={{
              x: ['-180%', '580%'],
            }}
            transition={{
              duration: 4.8,
              repeat: Infinity,
              ease: [0.4, 0.0, 0.2, 1],
              repeatDelay: 3.2,
            }}
            style={{ transform: 'skewX(-26deg)' }}
            className="absolute inset-y-0 w-40 bg-linear-to-r from-transparent via-white/[0.09] to-transparent pointer-events-none"
          />
        </div>

        {/* Gentle Idle Ambient Studio Mesh Drift */}
        <motion.div
          animate={{
            x: [-18, 18, -18],
            y: [-12, 12, -12],
            opacity: [0.22, 0.42, 0.22],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 rounded-full bg-linear-to-br from-violet-400/25 via-fuchsia-500/15 to-transparent blur-3xl"
        />
        <motion.div
          animate={{
            x: [14, -14, 14],
            y: [10, -10, 10],
            opacity: [0.18, 0.38, 0.18],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="pointer-events-none absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-linear-to-tr from-indigo-500/25 via-sky-400/10 to-transparent blur-3xl"
        />

        {/* Interactive Mouse-Following Radial Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(380px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(167, 139, 250, 0.25), transparent 70%)`,
          }}
        />

        {/* TOP-RIGHT TIMEFRAME BADGE (iOS Minimal Frosted Glass Capsule) */}
        <div className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 z-25">
          <motion.div
            whileHover={{ scale: 1.04 }}
            transition={{ type: 'spring', stiffness: 350, damping: 24 }}
            className="group/timeframe relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/12 hover:bg-white/18 backdrop-blur-xl border border-white/20 text-[11px] text-violet-100 shadow-[0_4px_16px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.25)] transition-all cursor-default select-none"
            title="รอบสถิติ: ผู้ติดตาม & ER ย้อนหลัง 28 วัน · ยอดวิวสะสม 60 วันล่าสุด"
          >
            {/* Live Telemetry Ping Radar Dot */}
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>

            {/* Timeframe Label */}
            <div className="flex items-center gap-1 font-semibold whitespace-nowrap">
              <Clock className="w-3 h-3 text-amber-300 shrink-0" />
              <span className="text-white font-bold">28 วันล่าสุด</span>
              <span className="text-white/40">·</span>
              <span className="text-violet-200">วิว 60 วัน</span>
            </div>

            {/* Micro-sparkle right on the badge */}
            <TwinkleSparkle
              size={11}
              className="-top-1 -right-1 text-amber-300"
              duration={2.8}
              delay={0.2}
            />

            {/* Subtle Specular Top Rim */}
            <div className="absolute inset-x-2 top-0 h-px bg-linear-to-r from-transparent via-white/60 to-transparent pointer-events-none" />
          </motion.div>
        </div>

        {/* Top Avatar + Giant Live Count-Up Total Followers */}
        <div className="relative z-10 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-5">
          {/* Avatar with Soft Radial Breathing Aura & Floating Verified Badge */}
          <div className="relative shrink-0">
            {/* Micro-sparkle near avatar */}
            <TwinkleSparkle
              size={13}
              className="-top-1.5 -left-1.5 text-violet-300"
              duration={3.6}
              delay={0.8}
            />

            {/* Soft Radial Breathing Aura (Organic Neon-Pastel Pulsing Glow — No sharp rotating corners) */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.45, 0.85, 0.45],
              }}
              transition={{
                duration: 3.6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -inset-3 rounded-3xl bg-linear-to-tr from-violet-500/40 via-fuchsia-400/35 to-amber-300/30 blur-md pointer-events-none"
            />
            <motion.div
              animate={{
                scale: [1.05, 0.98, 1.05],
                opacity: [0.35, 0.7, 0.35],
              }}
              transition={{
                duration: 4.4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -inset-1.5 rounded-2xl bg-linear-to-br from-amber-300/35 via-violet-400/30 to-indigo-500/35 blur-xs pointer-events-none"
            />

            <motion.div
              whileHover={{ scale: 1.05, rotate: -2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-white/95 bg-violet-950 shadow-[0_0_24px_rgba(167,139,250,0.35)]"
            >
              <img
                src={currentCreator.avatarUrl}
                alt={currentCreator.nameTh}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/assets/juijui/page-1.png';
                }}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Floating Live Status Badge with Active Ping Radar */}
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold whitespace-nowrap shadow-md flex items-center gap-1.5"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-40" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950" />
              </span>
              <span>VERIFIED CREATOR</span>
            </motion.div>
          </div>

          {/* Giant Count-Up Total Followers + Icon Metric Chips */}
          <div className="text-center sm:text-left lg:text-center xl:text-left flex-1 relative">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 tracking-wide">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Users className="w-3.5 h-3.5" />
              </motion.div>
              <span>TOTAL FOLLOWERS</span>
            </div>

            <div className="relative inline-block">
              <div className="text-4xl sm:text-5xl font-bold font-mono-num tracking-tight mt-0.5 text-white">
                <AnimatedCounter
                  value={currentCreator.overview.totalFollowers}
                  duration={1.85}
                />
              </div>

              {/* Gold sparkle near follower count */}
              <TwinkleSparkle
                size={14}
                className="-top-1 -right-4 text-amber-300"
                duration={3.0}
                delay={0.4}
              />
            </div>

            {/* Visual Icon Metric Pills with Gentle Ambient Pulse */}
            <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start lg:justify-center xl:justify-start gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-violet-100 font-medium shadow-2xs">
                <motion.div
                  animate={{ scale: [1, 1.18, 1] }}
                  transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Eye className="w-3.5 h-3.5 text-amber-300" />
                </motion.div>
                <AnimatedCounter
                  value={currentCreator.overview.totalViews60d}
                  duration={1.6}
                />
                <span>Views (60d)</span>
              </span>

              <span className="relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-emerald-300 font-semibold shadow-2xs">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    y: [0, -1.5, 0],
                  }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Flame className="w-3.5 h-3.5 text-emerald-400" />
                </motion.div>
                <span>ER </span>
                <AnimatedCounter
                  value={currentCreator.overview.totalEr}
                  duration={1.6}
                />

                {/* Emerald sparkle on ER */}
                <TwinkleSparkle
                  size={9}
                  className="-bottom-1 -right-1 text-emerald-300"
                  duration={2.5}
                  delay={1.2}
                />
              </span>
            </div>
          </div>
        </div>

        {/* 4 Platforms Visual Breakdown Header + Quick Edit Action */}
        <div className="mt-6 border-t border-white/15 pt-4 relative z-10">
          <div className="relative flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-200">
              <motion.div
                animate={{ rotate: [0, 8, 0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </motion.div>
              <span>ช่องทางโซเชียลมีเดีย (คลิกเพื่อเข้าชมช่อง)</span>
            </div>

            {/* Subtle sparkle near platform header */}
            <TwinkleSparkle
              size={11}
              className="-top-0.5 right-20 text-fuchsia-300/80"
              duration={3.8}
              delay={1.6}
            />

            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-amber-300 hover:text-white transition-colors cursor-pointer border border-white/15 shadow-2xs"
                title="คลิกเพื่อแก้ไขลิงก์และสถิติแต่ละช่องทางในระบบจัดการข้อมูล"
              >
                <Edit3 className="w-3 h-3" />
                <span>แก้ไขลิงก์</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {currentCreator.platforms.map((plat, pIdx) => {
              const barPercent = Math.min(
                100,
                Math.max(16, Math.round(((plat.followersNum || 80000) / maxPlatformFollowers) * 100))
              );

              return (
                <motion.a
                  key={plat.id}
                  href={plat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={REPEAT_VIEWPORT}
                  transition={{
                    delay: 0.12 + pIdx * 0.07,
                    duration: 0.45,
                    ease: EASE_OUT_EXPO,
                  }}
                  whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.13)', transition: { duration: 0.18, ease: 'easeOut' } }}
                  whileTap={{ scale: 0.98 }}
                  className="p-2.5 rounded-2xl bg-white/[0.07] hover:bg-white/[0.13] backdrop-blur-md border border-white/12 hover:border-amber-400/40 flex items-center justify-between gap-3 group transition-[border-color,box-shadow] duration-200 will-change-transform cursor-pointer shadow-2xs relative"
                  title={`เปิดไปยังช่อง ${plat.name}: ${plat.url}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="relative shrink-0">
                      {/* Gentle Ambient Pulse and Float on Platform Brand Icon */}
                      <motion.div
                        animate={{
                          y: [0, -2, 0],
                          scale: [1, 1.04, 1],
                        }}
                        transition={{
                          duration: 3.2 + pIdx * 0.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        <PlatformBrandIcon platform={plat.name} size="md" />
                      </motion.div>
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-900/90 border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight className="w-2.5 h-2.5 text-amber-300" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                          {plat.name}
                        </span>
                        <span className="text-[11px] text-violet-300 group-hover:text-violet-100 transition-colors truncate">
                          {plat.handle}
                        </span>
                      </div>
                      {/* Animated Share Bar with Idle Micro-Shimmer */}
                      <div className="w-full max-w-[140px] xl:max-w-[220px] 2xl:max-w-[280px] h-1.5 bg-white/10 rounded-full mt-1.5 overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${barPercent}%` }}
                          viewport={REPEAT_VIEWPORT}
                          transition={{
                            duration: 1.1,
                            delay: 0.2 + pIdx * 0.08,
                            ease: EASE_OUT_EXPO,
                          }}
                          className="h-full rounded-full bg-linear-to-r from-amber-300 via-pink-400 to-violet-400 relative overflow-hidden"
                        >
                          {/* Subtle Ambient Idle Shimmer Bar */}
                          <motion.div
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{
                              duration: 2.8,
                              repeat: Infinity,
                              ease: 'easeInOut',
                              delay: pIdx * 0.4,
                            }}
                            className="absolute inset-y-0 w-1/2 bg-linear-to-r from-transparent via-white/40 to-transparent"
                          />
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-[11px] text-violet-200 font-mono-num">
                      <Flame className="w-3 h-3 text-amber-400" />
                      <AnimatedCounter value={plat.er} duration={1.5} />
                    </span>
                    <span className="text-base font-bold text-amber-300 font-mono-num w-16 text-right group-hover:scale-105 transition-transform">
                      <AnimatedCounter value={plat.followers} duration={1.7} />
                    </span>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>

        {/* Card Footer CTA with Ambient Pulse */}
        <div className="mt-5 pt-3.5 border-t border-white/15 flex items-center justify-between text-xs text-violet-200 relative z-10">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            </motion.div>
            <span>LINE: {currentCreator.contact.lineId}</span>
          </span>
          <motion.button
            whileHover={{ x: 3 }}
            type="button"
            onClick={onOpenBooking}
            className="inline-flex items-center gap-1 font-semibold text-amber-300 hover:underline cursor-pointer"
          >
            <span>ขอใบเสนอราคาทันที</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
