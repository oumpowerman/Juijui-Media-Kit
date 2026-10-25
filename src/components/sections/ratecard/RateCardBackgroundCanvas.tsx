import React from 'react';
import { motion, MotionValue } from 'motion/react';
import {
  PiggyBank,
  Wallet,
  Coins,
  Banknote,
  Calculator,
  BadgePercent,
  TrendingUp,
  CircleDollarSign,
  Sparkles,
} from 'lucide-react';
import { EASE_OUT_EXPO, REPEAT_VIEWPORT } from '../motionVariants';

export interface RateCardBackgroundCanvasProps {
  numeralsParallaxY: MotionValue<number>;
  midIconsLeftY: MotionValue<number>;
  midIconsRightY: MotionValue<number>;
  coinsParallaxY: MotionValue<number>;
}

const DEEP_FINANCIAL_NUMERALS = [
  { text: '฿', top: '5%', left: '5%', size: 'text-5xl', color: 'text-emerald-900/[0.035]', rotate: -10 },
  { text: '+ROI', top: '7%', left: '44%', size: 'text-4xl', color: 'text-violet-900/[0.035]', rotate: 6 },
  { text: '100%', top: '6%', left: '86%', size: 'text-4xl', color: 'text-amber-900/[0.035]', rotate: -8 },
  { text: '×3', top: '40%', left: '2%', size: 'text-5xl', color: 'text-emerald-900/[0.03]', rotate: 12 },
  { text: '฿', top: '42%', left: '94%', size: 'text-6xl', color: 'text-violet-900/[0.03]', rotate: 10 },
  { text: '%', top: '70%', left: '3%', size: 'text-5xl', color: 'text-amber-900/[0.03]', rotate: -12 },
  { text: '฿', top: '88%', left: '92%', size: 'text-5xl', color: 'text-amber-900/[0.035]', rotate: 9 },
];

export const RateCardBackgroundCanvas: React.FC<RateCardBackgroundCanvasProps> = ({
  numeralsParallaxY,
  midIconsLeftY,
  midIconsRightY,
  coinsParallaxY,
}) => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0"
    >
      {/* =====================================================================
          LAYER 1 (DEEP PARALLAX): Soft Wealth Aura & Subtle Numerals
         ===================================================================== */}
      <motion.div
        style={{ y: numeralsParallaxY }}
        className="absolute -inset-y-24 inset-x-0"
      >
        {/* Soft Radial Ambient Lighting */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(720px circle at 15% 10%, rgba(16, 185, 129, 0.07), transparent 62%), ' +
              'radial-gradient(680px circle at 50% 8%, rgba(245, 158, 11, 0.08), transparent 60%), ' +
              'radial-gradient(680px circle at 85% 12%, rgba(124, 58, 237, 0.07), transparent 62%), ' +
              'radial-gradient(720px circle at 12% 52%, rgba(16, 185, 129, 0.05), transparent 60%), ' +
              'radial-gradient(720px circle at 88% 54%, rgba(245, 158, 11, 0.05), transparent 62%)',
          }}
        />

        {/* Deep Monospace Numerals */}
        {DEEP_FINANCIAL_NUMERALS.map((item, idx) => (
          <motion.div
            key={idx}
            animate={{
              y: [-6, 6, -6],
              rotate: [item.rotate - 2, item.rotate + 2, item.rotate - 2],
            }}
            transition={{
              duration: 6 + (idx % 3),
              delay: idx * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ top: item.top, left: item.left }}
            className={`hidden md:block absolute font-mono-num font-bold tracking-tighter ${item.size} ${item.color}`}
          >
            {item.text}
          </motion.div>
        ))}
      </motion.div>

      {/* =====================================================================
          LAYER 2 (UPPER HEADER ZONE): Exactly 3 Light & Subtle Floating Spots ("บางๆ แค่สองสามจุด")
         ===================================================================== */}
      <motion.div
        style={{ y: numeralsParallaxY }}
        className="absolute inset-x-0 top-0 h-[220px] pointer-events-none"
      >
        {/* SPOT 1 (Top-Left, above title): Light & Soft 🐷 Piggy Bank Pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          whileInView={{ opacity: 0.65, scale: 1, y: 0 }}
          viewport={REPEAT_VIEWPORT}
          transition={{ duration: 0.6, delay: 0.05, ease: EASE_OUT_EXPO }}
          className="hidden md:flex absolute top-4 left-6 xl:left-10 2xl:left-14 items-center justify-center"
        >
          <motion.div
            animate={{ y: [-4, 4, -4], rotate: [-2, 2, -2] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/70 backdrop-blur-xs border border-amber-200/60 shadow-xs"
          >
            <div className="w-5 h-5 rounded-lg bg-linear-to-br from-amber-400 to-orange-400 text-white flex items-center justify-center shadow-2xs">
              <PiggyBank className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-bold text-amber-800 font-mono-num">
              SAVE ฿
            </span>
          </motion.div>
        </motion.div>

        {/* SPOT 2 (Center gap between title and view mode tabs): Light 💰 Smart Budget Pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          whileInView={{ opacity: 0.58, scale: 1, y: 0 }}
          viewport={REPEAT_VIEWPORT}
          transition={{ duration: 0.6, delay: 0.15, ease: EASE_OUT_EXPO }}
          className="hidden lg:flex absolute top-4 left-[46%] xl:left-[48%] items-center justify-center"
        >
          <motion.div
            animate={{ y: [-5, 5, -5], rotate: [2, -2, 2] }}
            transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/70 backdrop-blur-xs border border-emerald-200/60 shadow-xs"
          >
            <div className="w-5 h-5 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-2xs">
              <CircleDollarSign className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-bold text-emerald-800 font-mono-num">
              SMART BUDGET
            </span>
          </motion.div>
        </motion.div>

        {/* SPOT 3 (Top-Right, above/near view mode tabs): Light 💳 Wallet Pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          whileInView={{ opacity: 0.62, scale: 1, y: 0 }}
          viewport={REPEAT_VIEWPORT}
          transition={{ duration: 0.6, delay: 0.22, ease: EASE_OUT_EXPO }}
          className="hidden md:flex absolute top-4 right-8 xl:right-14 2xl:right-20 items-center justify-center"
        >
          <motion.div
            animate={{ y: [-4, 4, -4], rotate: [2, -2, 2] }}
            transition={{ duration: 5.0, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/70 backdrop-blur-xs border border-violet-200/60 shadow-xs"
          >
            <div className="w-5 h-5 rounded-lg bg-linear-to-br from-violet-600 to-purple-600 text-white flex items-center justify-center shadow-2xs">
              <Wallet className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-bold text-violet-800 font-mono-num">
              FLEXIBLE
            </span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* =====================================================================
          LAYER 3 (OUTER EDGES): Subtle Floating Motifs on Wide Screens Only
         ===================================================================== */}
      <motion.div
        style={{ y: midIconsLeftY }}
        className="absolute inset-x-0 top-64 bottom-24 pointer-events-none"
      >
        {/* Left Side (Wide Screens): Soft Banknote Capsule */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          whileInView={{ opacity: 0.6, scale: 1 }}
          viewport={REPEAT_VIEWPORT}
          transition={{ duration: 0.7, delay: 0.15, ease: EASE_OUT_EXPO }}
          className="hidden 2xl:flex absolute top-[38%] left-3 items-center justify-center"
        >
          <motion.div
            animate={{ y: [5, -5, 5], rotate: [2, -2, 2] }}
            transition={{ duration: 5.4, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/75 backdrop-blur-xs border border-emerald-200/60 shadow-xs"
          >
            <Banknote className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[9px] font-mono-num font-bold text-emerald-700">
              ฿฿฿
            </span>
          </motion.div>
        </motion.div>

        {/* Left Lower: Calculator Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          whileInView={{ opacity: 0.55, scale: 1 }}
          viewport={REPEAT_VIEWPORT}
          transition={{ duration: 0.7, delay: 0.25, ease: EASE_OUT_EXPO }}
          className="hidden 2xl:flex absolute top-[74%] left-4 items-center justify-center"
        >
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 4.7, repeat: Infinity, ease: 'easeInOut' }}
            className="p-2 rounded-xl bg-white/75 backdrop-blur-xs border border-violet-200/60 shadow-xs"
          >
            <Calculator className="w-3.5 h-3.5 text-violet-600" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Right Side Perimeter */}
      <motion.div
        style={{ y: midIconsRightY }}
        className="absolute inset-x-0 top-64 bottom-24 pointer-events-none"
      >
        {/* Right Side (Wide Screens): Soft Coins / ROI */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          whileInView={{ opacity: 0.6, scale: 1 }}
          viewport={REPEAT_VIEWPORT}
          transition={{ duration: 0.7, delay: 0.2, ease: EASE_OUT_EXPO }}
          className="hidden 2xl:flex absolute top-[40%] right-3 items-center justify-center"
        >
          <motion.div
            animate={{ y: [-5, 5, -5], rotate: [-2, 2, -2] }}
            transition={{ duration: 4.9, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/75 backdrop-blur-xs border border-amber-200/60 shadow-xs"
          >
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[9px] font-mono-num font-bold text-amber-700">
              ROI+
            </span>
          </motion.div>
        </motion.div>

        {/* Right Lower: Discount % */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          whileInView={{ opacity: 0.55, scale: 1 }}
          viewport={REPEAT_VIEWPORT}
          transition={{ duration: 0.7, delay: 0.3, ease: EASE_OUT_EXPO }}
          className="hidden 2xl:flex absolute top-[75%] right-4 items-center justify-center"
        >
          <motion.div
            animate={{ y: [4, -4, 4] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
            className="p-2 rounded-xl bg-white/75 backdrop-blur-xs border border-emerald-200/60 shadow-xs"
          >
            <BadgePercent className="w-3.5 h-3.5 text-emerald-600" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* =====================================================================
          LAYER 4 (FAST PARALLAX): Subtle Shimmering ฿ Coins
         ===================================================================== */}
      <motion.div
        style={{ y: coinsParallaxY }}
        className="absolute inset-x-0 top-72 bottom-24 pointer-events-none"
      >
        {[
          { top: '38%', left: '6%', delay: 0.2, duration: 4.6, type: 'baht' as const },
          { top: '44%', left: '94%', delay: 0.6, duration: 5.0, type: 'sparkle' as const },
          { top: '80%', left: '5%', delay: 0.4, duration: 4.8, type: 'baht' as const },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            animate={{
              y: [-8, 8, -8],
              scale: [0.92, 1.12, 0.92],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ top: item.top, left: item.left }}
            className="hidden 2xl:flex absolute items-center justify-center"
          >
            {item.type === 'baht' ? (
              <div className="w-5 h-5 rounded-full bg-linear-to-br from-amber-300 to-yellow-400 border border-white/80 shadow-xs flex items-center justify-center text-[10px] font-mono-num font-bold text-amber-950">
                ฿
              </div>
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-400/60" />
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
