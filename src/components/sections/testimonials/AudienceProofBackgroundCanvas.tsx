import React from 'react';
import { motion, MotionValue } from 'motion/react';
import {
  Heart,
  ThumbsUp,
  Bookmark,
  Share2,
  Send,
  Star,
  Sparkles,
} from 'lucide-react';
import { EASE_OUT_EXPO, REPEAT_VIEWPORT } from '../motionVariants';

interface AudienceProofBackgroundCanvasProps {
  waveParallaxY: MotionValue<number>;
  leftBubblesParallaxY: MotionValue<number>;
  rightBubblesParallaxY: MotionValue<number>;
}

const RAINBOW_SPARKLE_MOTES = [
  { top: '18%', left: '16%', size: 10, color: 'text-rose-400/55', delay: 0.1, duration: 4.2 },
  { top: '28%', left: '46%', size: 12, color: 'text-amber-400/60', delay: 0.5, duration: 4.8 },
  { top: '22%', left: '82%', size: 11, color: 'text-sky-400/55', delay: 0.9, duration: 4.5 },
  { top: '54%', left: '24%', size: 10, color: 'text-emerald-400/55', delay: 0.3, duration: 5.1 },
  { top: '62%', left: '52%', size: 13, color: 'text-violet-400/50', delay: 0.7, duration: 4.6 },
  { top: '58%', left: '78%', size: 11, color: 'text-pink-400/55', delay: 1.1, duration: 5.0 },
  { top: '76%', left: '34%', size: 10, color: 'text-amber-400/55', delay: 0.4, duration: 4.4 },
  { top: '74%', left: '68%', size: 11, color: 'text-teal-400/55', delay: 0.8, duration: 4.9 },
];

export const AudienceProofBackgroundCanvas: React.FC<
  AudienceProofBackgroundCanvasProps
> = ({ waveParallaxY, leftBubblesParallaxY, rightBubblesParallaxY }) => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0"
    >
      {/* 1. SOFT PASTEL RAINBOW AMBIENT MESH (Zero Lines, Pure Luminous Rainbow Aura) */}
      <motion.div
        style={{ y: waveParallaxY }}
        className="absolute -inset-y-20 inset-x-0"
      >
        {/* Multi-Stop Soft Pastel Rainbow Wash */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(680px circle at 14% 26%, rgba(251, 113, 133, 0.11), transparent 62%), ' +
              'radial-gradient(640px circle at 36% 20%, rgba(251, 191, 36, 0.10), transparent 60%), ' +
              'radial-gradient(700px circle at 64% 28%, rgba(52, 211, 153, 0.09), transparent 62%), ' +
              'radial-gradient(680px circle at 86% 24%, rgba(56, 189, 248, 0.10), transparent 62%), ' +
              'radial-gradient(760px circle at 50% 66%, rgba(167, 139, 250, 0.09), transparent 65%), ' +
              'radial-gradient(640px circle at 22% 72%, rgba(244, 114, 182, 0.08), transparent 62%), ' +
              'radial-gradient(640px circle at 78% 72%, rgba(250, 204, 21, 0.08), transparent 62%)',
          }}
        />

        {/* Soft Breathing Pastel Rainbow Diffused Glow Blobs */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.45, 0.7, 0.45],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[22%] left-[8%] w-[420px] h-[260px] rounded-full blur-3xl"
          style={{
            background:
              'linear-gradient(135deg, rgba(251,113,133,0.16) 0%, rgba(251,191,36,0.14) 50%, rgba(52,211,153,0.12) 100%)',
          }}
        />

        <motion.div
          animate={{
            scale: [1.05, 0.96, 1.05],
            opacity: [0.4, 0.65, 0.4],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-[36%] right-[8%] w-[440px] h-[280px] rounded-full blur-3xl"
          style={{
            background:
              'linear-gradient(135deg, rgba(52,211,153,0.13) 0%, rgba(56,189,248,0.15) 50%, rgba(167,139,250,0.14) 100%)',
          }}
        />

        {/* Ambient Rainbow Sparkle Motes */}
        {RAINBOW_SPARKLE_MOTES.map((mote, i) => (
          <motion.div
            key={i}
            animate={{
              scale: [0.8, 1.25, 0.8],
              opacity: [0.25, 0.7, 0.25],
              y: [-6, 6, -6],
            }}
            transition={{
              duration: mote.duration,
              delay: mote.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ top: mote.top, left: mote.left }}
            className={`absolute ${mote.color}`}
          >
            <Sparkles style={{ width: mote.size, height: mote.size }} />
          </motion.div>
        ))}
      </motion.div>

      {/* 2. LEFT SAFE-ZONE PARALLAX: Frosted Glass Like, Heart & Bookmark/Save Action Icons */}
      <motion.div
        style={{ y: leftBubblesParallaxY }}
        className="absolute inset-x-0 top-56 bottom-32"
      >
        {/* Left Upper: Heart Like Glass Orb with Tactile Tap Ripple */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 18 }}
          whileInView={{ opacity: 0.78, scale: 1, y: 0 }}
          viewport={REPEAT_VIEWPORT}
          transition={{ duration: 0.65, delay: 0.08, ease: EASE_OUT_EXPO }}
          className="hidden lg:flex absolute top-[8%] left-3 xl:left-7 2xl:left-12 items-center justify-center"
        >
          <motion.div
            animate={{ y: [-6, 6, -6], rotate: [-4, 3, -4] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
            className="relative flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/80 backdrop-blur-md border border-rose-200/80 shadow-[0_12px_28px_-8px_rgba(244,63,94,0.20),inset_0_1px_1px_rgba(255,255,255,1)]"
          >
            {/* Expanding Heart Tap Ripple */}
            <motion.span
              animate={{ scale: [0.9, 1.65], opacity: [0.45, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
              className="absolute left-3 w-7 h-7 rounded-xl bg-rose-400/30 pointer-events-none"
            />
            <motion.div
              animate={{ scale: [1, 1.22, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-7 h-7 rounded-xl bg-linear-to-br from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-2xs"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
            </motion.div>
            <div className="hidden xl:flex flex-col gap-1 pr-1">
              <div className="flex items-center gap-0.5">
                <span className="w-2 h-2 rounded-full bg-rose-400/70" />
                <span className="w-2 h-2 rounded-full bg-amber-400/70" />
                <span className="w-2 h-2 rounded-full bg-emerald-400/70" />
              </div>
              <div className="h-1.5 w-10 rounded-full bg-rose-200/80" />
            </div>
          </motion.div>
        </motion.div>

        {/* Left Middle: Bookmark / Save Post Glass Capsule */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, x: -16 }}
          whileInView={{ opacity: 0.76, scale: 1, x: 0 }}
          viewport={REPEAT_VIEWPORT}
          transition={{ duration: 0.7, delay: 0.18, ease: EASE_OUT_EXPO }}
          className="hidden lg:flex absolute top-[42%] left-2 xl:left-5 2xl:left-10 items-center justify-center"
        >
          <motion.div
            animate={{ y: [6, -6, 6], rotate: [3, -3, 3] }}
            transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
            className="relative flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/80 backdrop-blur-md border border-amber-200/80 shadow-[0_12px_28px_-8px_rgba(245,158,11,0.18),inset_0_1px_1px_rgba(255,255,255,1)]"
          >
            <motion.span
              animate={{ scale: [0.9, 1.6], opacity: [0.4, 0] }}
              transition={{
                duration: 2.8,
                delay: 0.6,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              className="absolute left-3 w-7 h-7 rounded-xl bg-amber-400/30 pointer-events-none"
            />
            <motion.div
              animate={{ scale: [1, 1.18, 1], y: [0, -2, 0] }}
              transition={{
                duration: 2.8,
                delay: 0.6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-7 h-7 rounded-xl bg-linear-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-2xs"
            >
              <Bookmark className="w-3.5 h-3.5 fill-white" />
            </motion.div>
            <div className="hidden xl:flex flex-col gap-1 pr-1">
              <div className="h-1.5 w-11 rounded-full bg-amber-200/80" />
              <div className="h-1.5 w-7 rounded-full bg-slate-200/80" />
            </div>
          </motion.div>
        </motion.div>

        {/* Left Lower-Mid: Thumbs-Up Like Glass Orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 16 }}
          whileInView={{ opacity: 0.74, scale: 1, y: 0 }}
          viewport={REPEAT_VIEWPORT}
          transition={{ duration: 0.7, delay: 0.28, ease: EASE_OUT_EXPO }}
          className="hidden lg:flex absolute top-[72%] left-4 xl:left-8 2xl:left-14 items-center justify-center"
        >
          <motion.div
            animate={{ y: [-5, 5, -5], rotate: [-3, 4, -3] }}
            transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
            className="relative flex items-center gap-2 p-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-sky-200/80 shadow-[0_12px_26px_-8px_rgba(14,165,233,0.18),inset_0_1px_1px_rgba(255,255,255,1)]"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 0] }}
              transition={{
                duration: 2.6,
                delay: 0.3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-7 h-7 rounded-xl bg-linear-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center shadow-2xs"
            >
              <ThumbsUp className="w-3.5 h-3.5 fill-white" />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* 3. RIGHT SAFE-ZONE PARALLAX: Frosted Glass Share, Save, 5-Star & Send Action Icons */}
      <motion.div
        style={{ y: rightBubblesParallaxY }}
        className="absolute inset-x-0 top-56 bottom-32"
      >
        {/* Right Upper: Share / Repost Glass Capsule */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 18 }}
          whileInView={{ opacity: 0.78, scale: 1, y: 0 }}
          viewport={REPEAT_VIEWPORT}
          transition={{ duration: 0.65, delay: 0.12, ease: EASE_OUT_EXPO }}
          className="hidden lg:flex absolute top-[10%] right-3 xl:right-7 2xl:right-12 items-center justify-center"
        >
          <motion.div
            animate={{ y: [5, -5, 5], rotate: [4, -3, 4] }}
            transition={{ duration: 5.0, repeat: Infinity, ease: 'easeInOut' }}
            className="relative flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/80 backdrop-blur-md border border-emerald-200/80 shadow-[0_12px_28px_-8px_rgba(16,185,129,0.18),inset_0_1px_1px_rgba(255,255,255,1)]"
          >
            <motion.span
              animate={{ scale: [0.9, 1.6], opacity: [0.4, 0] }}
              transition={{
                duration: 2.7,
                delay: 0.4,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              className="absolute left-3 w-7 h-7 rounded-xl bg-emerald-400/30 pointer-events-none"
            />
            <motion.div
              animate={{ scale: [1, 1.18, 1], x: [0, 2, 0] }}
              transition={{
                duration: 2.7,
                delay: 0.4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-7 h-7 rounded-xl bg-linear-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5" />
            </motion.div>
            <div className="hidden xl:flex flex-col gap-1 pr-1">
              <div className="h-1.5 w-10 rounded-full bg-emerald-200/80" />
              <div className="h-1.5 w-7 rounded-full bg-slate-200/80" />
            </div>
          </motion.div>
        </motion.div>

        {/* Right Middle: 5-Star Rainbow Shimmer Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, x: 16 }}
          whileInView={{ opacity: 0.76, scale: 1, x: 0 }}
          viewport={REPEAT_VIEWPORT}
          transition={{ duration: 0.7, delay: 0.22, ease: EASE_OUT_EXPO }}
          className="hidden lg:flex absolute top-[44%] right-2 xl:right-5 2xl:right-10 items-center justify-center"
        >
          <motion.div
            animate={{ y: [-6, 6, -6], rotate: [-3, 3, -3] }}
            transition={{ duration: 4.9, repeat: Infinity, ease: 'easeInOut' }}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/80 backdrop-blur-md border border-violet-200/80 shadow-[0_12px_28px_-8px_rgba(139,92,246,0.18),inset_0_1px_1px_rgba(255,255,255,1)]"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 12, 0] }}
              transition={{
                duration: 2.5,
                delay: 0.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-7 h-7 rounded-xl bg-linear-to-br from-amber-400 via-pink-500 to-violet-500 text-white flex items-center justify-center shadow-2xs"
            >
              <Star className="w-3.5 h-3.5 fill-white" />
            </motion.div>
            <div className="hidden xl:flex items-center gap-0.5 pr-1">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={idx}
                  className="w-2.5 h-2.5 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Right Lower-Mid: Direct Share / Send Paper-Plane Glass Orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 16 }}
          whileInView={{ opacity: 0.74, scale: 1, y: 0 }}
          viewport={REPEAT_VIEWPORT}
          transition={{ duration: 0.7, delay: 0.32, ease: EASE_OUT_EXPO }}
          className="hidden lg:flex absolute top-[72%] right-4 xl:right-8 2xl:right-14 items-center justify-center"
        >
          <motion.div
            animate={{ y: [5, -5, 5], rotate: [3, -4, 3] }}
            transition={{ duration: 4.7, repeat: Infinity, ease: 'easeInOut' }}
            className="relative flex items-center gap-2 p-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-violet-200/80 shadow-[0_12px_26px_-8px_rgba(168,85,247,0.18),inset_0_1px_1px_rgba(255,255,255,1)]"
          >
            <motion.div
              animate={{
                scale: [1, 1.18, 1],
                x: [0, 2, 0],
                y: [0, -2, 0],
              }}
              transition={{
                duration: 2.6,
                delay: 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-7 h-7 rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};
