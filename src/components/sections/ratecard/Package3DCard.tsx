import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Video, Clock, Check, CalendarCheck, Sparkles } from 'lucide-react';
import { RatePackage } from '../../../data/creatorData';
import { AnimatedCounter } from '../../ui/AnimatedCounter';
import { PlatformBadgeGroup } from '../../ui/PlatformBrandIcon';
import { EASE_OUT_EXPO, REPEAT_VIEWPORT } from '../motionVariants';

export interface Package3DCardProps {
  pkg: RatePackage;
  idx: number;
  isSelected: boolean;
  onSelect: () => void;
  onBook: () => void;
}

export const Package3DCard: React.FC<Package3DCardProps> = ({
  pkg,
  idx,
  isSelected,
  onSelect,
  onBook,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const isPopular = idx === 1;

  const headerBg =
    idx === 0
      ? 'bg-linear-to-r from-violet-600 via-indigo-600 to-purple-600 text-white'
      : idx === 1
      ? 'bg-linear-to-r from-indigo-700 via-violet-700 to-fuchsia-700 text-white'
      : 'bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white';

  const initialX = idx === 0 ? -36 : idx === 2 ? 36 : 0;

  // 2.5D Elevation Dynamic Shadows (Vector-crisp font rendering without 3D texture blur)
  const dynamicShadow = isSelected
    ? '0 22px 45px -10px rgba(124, 58, 237, 0.32), 0 0 0 2px rgba(124, 58, 237, 0.65)'
    : isPopular
    ? isHovered
      ? '0 24px 45px -10px rgba(99, 102, 241, 0.28), 0 0 0 2px rgba(129, 140, 248, 0.9)'
      : '0 16px 36px -12px rgba(99, 102, 241, 0.18), 0 0 0 2px rgba(129, 140, 248, 0.65)'
    : isHovered
    ? '0 20px 35px -10px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(148, 163, 184, 0.5)'
    : '0 4px 16px -4px rgba(15, 23, 42, 0.05), 0 0 0 1px rgba(226, 232, 240, 0.9)';

  return (
    <motion.div
      initial={{ opacity: 0, x: initialX, y: 32, scale: 0.96 }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={REPEAT_VIEWPORT}
      transition={{
        duration: 0.65,
        delay: idx * 0.08,
        ease: EASE_OUT_EXPO,
      }}
      className={`relative flex flex-col ${
        isPopular ? 'lg:-translate-y-4 lg:scale-[1.03] z-20' : 'z-10'
      }`}
    >
      {/* Popular Elevated Top Badge */}
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30">
          <motion.span
            animate={{
              y: [0, -2, 0],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="px-3.5 py-1 rounded-full text-[11px] font-bold bg-linear-to-r from-amber-500 via-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/35 flex items-center gap-1.5 whitespace-nowrap border border-white/40 ring-2 ring-violet-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>MOST POPULAR · แนะนำสูงสุด</span>
          </motion.span>
        </div>
      )}

      {/* Main 2.5D Elevation Interactive Card (100% Vector-Sharp Fonts) */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onSelect}
        style={{
          transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
          boxShadow: dynamicShadow,
          transition:
            'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={`rounded-3xl bg-white flex flex-col justify-between overflow-hidden cursor-pointer relative h-full select-none ${
          isSelected
            ? 'border-2 border-violet-600'
            : isPopular
            ? 'border-2 border-indigo-400/90'
            : 'border border-slate-200/90'
        }`}
      >
        {/* 1.5px Top Specular Bevel Line strictly on the top edge */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-linear-to-r from-transparent via-white/80 to-transparent pointer-events-none z-20" />

        <div>
          {/* Package Banner Header */}
          <div className={`px-6 py-6 text-center ${headerBg} relative overflow-hidden`}>
            {/* Header Ambient Refraction */}
            <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-white/10 blur-lg pointer-events-none" />
            <p className="text-xs font-semibold opacity-90 tracking-wide">{pkg.badgeText}</p>
            <h3 className="text-2xl font-bold tracking-wide mt-0.5">{pkg.name}</h3>
          </div>

          <div className="p-6 space-y-4">
            {/* Scannable Visual Deliverable Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">จำนวนคลิป</span>
                  <span className="text-xs font-bold text-slate-900">{pkg.videoCount}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">ความยาวคลิป</span>
                  <span className="text-xs font-bold text-slate-900">{pkg.maxDuration}</span>
                </div>
              </div>

              {/* 2-Line Structured Platform Deliverables Container (Zero Overlapping) */}
              <div className="col-span-2 p-3.5 rounded-xl bg-violet-50/70 border border-violet-200/80 space-y-2.5 shadow-2xs">
                {/* Line 1: Platform Icons & Channel Scope */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <PlatformBadgeGroup platformsText={pkg.platforms} size="xs" wrap={false} />
                    <span className="text-xs font-bold text-violet-950 truncate">
                      {pkg.id === 'pkg-starter' ? 'ช่องทาง TikTok' : 'ทุกช่องทางโซเชียล'}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                    {pkg.id === 'pkg-starter' ? '1 แพลตฟอร์ม' : '4 แพลตฟอร์ม'}
                  </span>
                </div>

                {/* Line 2: Distribution Output & Post Count Badge */}
                <div className="flex items-center justify-between pt-2 border-t border-violet-200/60 text-xs">
                  <span className="text-[11px] text-slate-600 font-medium truncate mr-2">
                    {pkg.id === 'pkg-starter'
                      ? 'เผยแพร่เฉพาะหน้าโปรไฟล์'
                      : pkg.id === 'pkg-standard'
                      ? 'กระจายครบทุกแพลตฟอร์ม'
                      : '3 คลิป × ครบ 4 แพลตฟอร์ม'}
                  </span>
                  <span className="text-[11px] font-bold text-violet-700 bg-white px-2.5 py-0.5 rounded-full border border-violet-200 shadow-2xs font-mono-num shrink-0 whitespace-nowrap">
                    {pkg.id === 'pkg-starter'
                      ? '1 โพสต์'
                      : pkg.id === 'pkg-standard'
                      ? '4 โพสต์'
                      : 'รวม 12 โพสต์'}
                  </span>
                </div>
              </div>
            </div>

            {/* Checklist Features */}
            <div>
              <p className="text-xs font-bold text-slate-900 mb-2.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-600" />
                <span>สิ่งที่แบรนด์จะได้รับ:</span>
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                {pkg.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Price with Animated Count-Up & Direct Booking Button */}
        <div className="p-6 pt-4 border-t border-slate-100 bg-slate-50/70 text-center space-y-3">
          <div>
            <span className="text-xs text-slate-500 block">เริ่มต้นเพียง</span>
            <span className="text-3xl font-bold text-[#1E1B4B] font-mono-num">
              <AnimatedCounter
                value={pkg.price}
                suffix=" .-"
                duration={1.6}
                delay={idx * 0.08}
              />
            </span>
            <span className="text-[11px] text-violet-700 font-semibold block mt-0.5">
              {pkg.costEfficiency}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBook();
            }}
            className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center justify-center gap-2 shadow-xs ${
              isSelected || isPopular
                ? 'bg-violet-700 hover:bg-violet-800 text-white shadow-violet-700/25 shadow-md'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>จองแพ็กเกจ {pkg.name}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
