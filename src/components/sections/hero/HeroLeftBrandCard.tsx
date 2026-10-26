import React from 'react';
import { motion, MotionValue } from 'motion/react';
import {
  CalendarCheck,
  Sparkles,
  HeartHandshake,
  Clapperboard,
  TrendingUp,
} from 'lucide-react';
import { CreatorProfile } from '../../../data/creatorData';
import {
  EASE_OUT_EXPO,
  REPEAT_VIEWPORT,
  slideFromLeftVariant,
} from '../motionVariants';

interface HeroLeftBrandCardProps {
  currentCreator: CreatorProfile;
  parallaxY: MotionValue<number>;
  onOpenPdf?: () => void;
}

const STRENGTH_ICONS = [HeartHandshake, Clapperboard, TrendingUp];

export const HeroLeftBrandCard: React.FC<HeroLeftBrandCardProps> = ({
  currentCreator,
  parallaxY,
}) => {
  return (
    <motion.div
      key={`${currentCreator.id}-left`}
      style={{ y: parallaxY }}
      initial="hidden"
      whileInView="visible"
      viewport={REPEAT_VIEWPORT}
      variants={slideFromLeftVariant}
      custom={0.04}
      className="lg:col-span-7 flex flex-col justify-between bg-white/88 backdrop-blur-xl border border-white/95 rounded-3xl p-6 sm:p-8 2xl:p-10 shadow-[0_24px_60px_-15px_rgba(79,70,229,0.08),0_8px_20px_-6px_rgba(0,0,0,0.03),inset_0_1.5px_2px_rgba(255,255,255,1)] ring-1 ring-slate-900/[0.04] relative overflow-hidden text-left"
    >
      {/* 1.5px Top Specular Glass Bevel Highlight */}
      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-linear-to-r from-transparent via-white to-transparent pointer-events-none z-20" />

      {/* iOS Minimal Glass Shimmer Sweep Beam */}
      <motion.div
        aria-hidden="true"
        animate={{
          x: ['-150%', '550%'],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: [0.4, 0.0, 0.2, 1],
          repeatDelay: 3.5,
        }}
        className="absolute -top-32 -bottom-32 w-56 bg-linear-to-r from-transparent via-white/18 to-transparent skew-x-[-20deg] pointer-events-none z-20"
      />

      {/* Gentle Twinkling Micro-Sparkle Accents */}
      <motion.div
        animate={{
          scale: [0.8, 1.25, 0.8],
          opacity: [0.25, 0.7, 0.25],
        }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-6 right-8 w-1.5 h-1.5 rounded-full bg-violet-400/50 blur-[0.5px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.65, 0.2],
        }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute bottom-16 left-8 w-1.5 h-1.5 rounded-full bg-indigo-400/40 blur-[0.5px] pointer-events-none"
      />

      {/* Ambient Pastel Background Glow Refraction */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-linear-to-br from-violet-200/40 via-fuchsia-100/20 to-transparent blur-2xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-linear-to-tl from-sky-200/30 via-indigo-100/15 to-transparent blur-2xl pointer-events-none" />

      <div className="relative z-10">
        {/* Clean Unboxed Metadata Kicker with Glinting Sparkle */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-violet-700 tracking-wide">
          <motion.div
            animate={{
              scale: [1, 1.18, 1],
              rotate: [0, 10, 0],
              opacity: [0.85, 1, 0.85],
            }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center justify-center shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-700" />
          </motion.div>
          <span>{currentCreator.tierLabel || '01 · MEDIA KIT 2026'}</span>
          <span aria-hidden="true" className="text-violet-300">·</span>
          <span>{currentCreator.categories.join(' · ')}</span>
        </div>

        {/* Primary Display Headline */}
        <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-[#1E1B4B] leading-tight">
          {currentCreator.nameTh}{' '}
          <span className="text-slate-300 font-light mx-1">|</span>{' '}
          <span className="text-violet-700">{currentCreator.nameEn}</span>
        </h1>

        <p className="mt-2 text-sm sm:text-base font-semibold text-slate-600">
          {currentCreator.roleTitle}
        </p>

        {/* Signature Quote — Layered Frosted Glass Slab with Soft Ambient Shadows */}
        <motion.div
          whileHover={{ scale: 1.008 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="mt-5 p-4 sm:p-5 rounded-2xl bg-linear-to-r from-violet-50/70 via-indigo-50/35 to-white/75 backdrop-blur-md border border-violet-100/70 shadow-[0_8px_24px_-6px_rgba(124,58,237,0.06),inset_0_1px_1.5px_rgba(255,255,255,1)] flex items-start gap-4 relative overflow-hidden"
        >
          {/* Subtle Quote Box Ambient Accent */}
          <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-linear-to-bl from-violet-200/25 to-transparent blur-xl pointer-events-none" />

          {/* Floating Sparkle Icon Tile */}
          <motion.div
            animate={{
              y: [0, -3, 0],
              rotate: [0, 3, 0, -3, 0],
            }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-600 to-indigo-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-violet-600/20"
          >
            <Sparkles className="w-5 h-5" />
          </motion.div>

          <div className="relative z-10 flex-1">
            <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              “{currentCreator.quote}”
            </p>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              {currentCreator.bioDescription}
            </p>
          </div>
        </motion.div>

        {/* Key Strengths — Layered Glass Slabs with Floating Dedicated Icons & Clean Metadata */}
        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-600 shrink-0" />
              <h2 className="text-xs font-bold text-slate-700 tracking-wider uppercase">
                จุดเด่นสำคัญของช่อง (Why Brands Love Us)
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-violet-700">
              {currentCreator.moodAndTone.join(' · ')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 2xl:gap-4">
            {currentCreator.strengths.map((st, idx) => {
              const IconComp = STRENGTH_ICONS[idx % STRENGTH_ICONS.length];

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={REPEAT_VIEWPORT}
                  transition={{
                    duration: 0.45,
                    delay: 0.08 + idx * 0.07,
                    ease: EASE_OUT_EXPO,
                  }}
                  whileHover={{ y: -4, transition: { duration: 0.18, ease: 'easeOut' } }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 sm:p-4.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/50 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.03),inset_0_1px_1.5px_rgba(255,255,255,1)] hover:border-slate-300/80 hover:bg-white/95 hover:shadow-[0_10px_24px_-6px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,1)] transition-[border-color,background-color,box-shadow] duration-200 will-change-transform cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Frosted Slab Bevel Highlight */}
                  <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white to-transparent pointer-events-none" />

                  {/* Top: Dedicated Floating Glass Icon Tile & Unboxed Editorial Subtitle */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      {/* Floating Icon Tile with Soft Pastel Hover */}
                      <motion.div
                        animate={{
                          y: [0, -3, 0],
                        }}
                        transition={{
                          duration: 3.2 + idx * 0.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="w-10 h-10 rounded-xl bg-violet-50/90 text-violet-700 border border-violet-100/80 shadow-2xs flex items-center justify-center shrink-0 group-hover:bg-violet-100/70 group-hover:text-violet-800 group-hover:border-violet-200/90 transition-all duration-300"
                      >
                        <IconComp className="w-5 h-5 transition-transform duration-300 group-hover:scale-105" />
                      </motion.div>

                      {/* Clean Unboxed Editorial Metadata Kicker */}
                      <span className="text-[10px] font-bold text-violet-600/90 tracking-wider uppercase font-mono-num text-right">
                        {st.subtitle}
                      </span>
                    </div>

                    {/* Content Section */}
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-violet-800 transition-colors leading-snug">
                        {st.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {st.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Primary Hero CTAs */}
      <div className="mt-7 pt-5 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-4 relative z-10">
        <motion.a
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.97 }}
          href="#ratecard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-700 hover:bg-violet-800 text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 shadow-xs"
        >
          <motion.div
            animate={{ rotate: [0, 6, 0, -6, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <CalendarCheck className="w-4.5 h-4.5" />
          </motion.div>
          <span>ดูเรทราคา & เปรียบเทียบแพ็กเกจ</span>
        </motion.a>

        <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>พร้อมรับบรีฟงาน · ตอบกลับคิวงานรวดเร็ว</span>
        </div>
      </div>
    </motion.div>
  );
};
