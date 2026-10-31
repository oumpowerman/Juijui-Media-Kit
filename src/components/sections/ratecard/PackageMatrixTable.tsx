import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Video,
  Clock,
  Share2,
  QrCode,
  ShieldCheck,
  Check,
  Sparkles,
} from 'lucide-react';
import { RatePackage, FreeIncludedItem } from '../../../data/creatorData';
import { AnimatedCounter } from '../../ui/AnimatedCounter';
import { PlatformBadgeGroup } from '../../ui/PlatformBrandIcon';
import { fadeUpVariant, REPEAT_VIEWPORT } from '../motionVariants';

export interface PackageMatrixTableProps {
  packages: RatePackage[];
  freePerks?: FreeIncludedItem[];
  selectedPackageId: string;
  onSelectPackageId: (id: string) => void;
  onOpenBookingForPackage: (id: string) => void;
}

// Synchronized Spring Physics for the entire column pillar
const PILLAR_SPRING = {
  type: 'spring' as const,
  stiffness: 350,
  damping: 28,
  mass: 0.8,
};

export const PackageMatrixTable: React.FC<PackageMatrixTableProps> = ({
  packages,
  freePerks = [],
  selectedPackageId,
  onSelectPackageId,
  onOpenBookingForPackage,
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={REPEAT_VIEWPORT}
      variants={fadeUpVariant}
      className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-2xs"
    >
      {/* Header bar */}
      <div className="px-6 py-4.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0 shadow-2xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>ตารางเปรียบเทียบแพ็กเกจ (Side-by-Side Matrix)</span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 text-[10px] font-bold">
                <Sparkles className="w-3 h-3 text-violet-600" />
                Live Comparison
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              คลิกที่คอลัมน์เพื่อเลือกแพ็กเกจ หรือคลิกซ้ำเพื่อยกเลิกการเลือก
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          {/* Table Header: Generous Top Padding with Synchronized Header Pillar */}
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/60">
              <th className="pt-9 pb-5 px-5 font-bold text-slate-700 w-1/4 align-bottom">
                หัวข้อเปรียบเทียบ
              </th>
              {packages.map((pkg) => {
                const isSelected = pkg.id === selectedPackageId;

                return (
                  <th
                    key={pkg.id}
                    onClick={() => onSelectPackageId(isSelected ? '' : pkg.id)}
                    className={`relative pt-9 pb-5 px-5 font-bold text-center cursor-pointer select-none align-bottom transition-colors ${
                      isSelected
                        ? 'text-violet-950'
                        : 'text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    {/* Synchronized Header Background Pillar sliding across columns via layoutId */}
                    {isSelected && (
                      <motion.div
                        layoutId="matrixActiveHeaderBg"
                        transition={PILLAR_SPRING}
                        className="absolute inset-0 bg-violet-100/75 border-x-2 border-t-2 border-violet-600 shadow-[0_-4px_20px_rgba(124,58,237,0.15)] pointer-events-none"
                      />
                    )}

                    {/* Animated Neon Running Beam over the Top Border sliding with layoutId */}
                    {isSelected && (
                      <motion.div
                        layoutId="matrixActiveNeonBeam"
                        transition={PILLAR_SPRING}
                        className="absolute inset-x-0 top-0 h-[3px] overflow-hidden pointer-events-none z-10"
                      >
                        <motion.div
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{
                            duration: 2.2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className="w-1/2 h-full bg-linear-to-r from-transparent via-cyan-400 to-fuchsia-400 shadow-[0_0_8px_#38bdf8]"
                        />
                      </motion.div>
                    )}

                    {/* Floating Selection Badge Pill comfortably positioned inside top padding */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          layoutId="matrixActiveBadge"
                          initial={{ opacity: 0, scale: 0.85, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.85, y: -4 }}
                          transition={PILLAR_SPRING}
                          className="absolute top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap z-20 pointer-events-none"
                        >
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-700 text-white text-[10px] font-bold shadow-md shadow-violet-700/30 ring-2 ring-white">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>กำลังเลือก</span>
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Package Name and Price */}
                    <div className="relative z-10 pt-1">
                      <span className="text-sm block font-bold">{pkg.name}</span>
                      <span className="font-mono-num text-base font-bold text-violet-700">
                        <AnimatedCounter value={pkg.price} suffix=".-" duration={1.5} />
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body: Every row has synchronized sliding layoutId */}
          <tbody className="divide-y divide-slate-200 text-slate-700">
            {/* Row 1: Video Deliverables */}
            <tr className="hover:bg-slate-50/40 transition-colors">
              <td className="py-4 px-5 font-semibold text-slate-900">
                <span className="inline-flex items-center gap-2">
                  <Video className="w-4 h-4 text-violet-600 shrink-0" />
                  <span>จำนวนชิ้นงานวิดีโอ</span>
                </span>
              </td>
              {packages.map((pkg) => {
                const isSelected = pkg.id === selectedPackageId;
                return (
                  <td
                    key={pkg.id}
                    onClick={() => onSelectPackageId(isSelected ? '' : pkg.id)}
                    className="relative py-4 px-5 text-center cursor-pointer select-none transition-colors"
                  >
                    {/* Synchronized Row Pillar Background */}
                    {isSelected && (
                      <motion.div
                        layoutId="matrixRowHighlight_video"
                        transition={PILLAR_SPRING}
                        className="absolute inset-0 bg-violet-50/80 border-x-2 border-violet-600/40 pointer-events-none"
                      />
                    )}
                    <span
                      className={`relative z-10 transition-colors ${
                        isSelected ? 'font-bold text-violet-950' : 'font-semibold text-slate-700'
                      }`}
                    >
                      {pkg.videoCount}
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* Row 2: Duration */}
            <tr className="hover:bg-slate-50/40 transition-colors">
              <td className="py-4 px-5 font-semibold text-slate-900">
                <span className="inline-flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>ความยาววิดีโอสูงสุด</span>
                </span>
              </td>
              {packages.map((pkg) => {
                const isSelected = pkg.id === selectedPackageId;
                return (
                  <td
                    key={pkg.id}
                    onClick={() => onSelectPackageId(isSelected ? '' : pkg.id)}
                    className="relative py-4 px-5 text-center cursor-pointer select-none font-mono-num transition-colors"
                  >
                    {/* Synchronized Row Pillar Background */}
                    {isSelected && (
                      <motion.div
                        layoutId="matrixRowHighlight_duration"
                        transition={PILLAR_SPRING}
                        className="absolute inset-0 bg-violet-50/80 border-x-2 border-violet-600/40 pointer-events-none"
                      />
                    )}
                    <span
                      className={`relative z-10 transition-colors ${
                        isSelected ? 'font-bold text-violet-950' : 'font-semibold text-slate-700'
                      }`}
                    >
                      {pkg.maxDuration}
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* Row 3: Platforms */}
            <tr className="hover:bg-slate-50/40 transition-colors">
              <td className="py-4 px-5 font-semibold text-slate-900">
                <span className="inline-flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-pink-600 shrink-0" />
                  <span>ช่องทางเผยแพร่</span>
                </span>
              </td>
              {packages.map((pkg) => {
                const isSelected = pkg.id === selectedPackageId;
                return (
                  <td
                    key={pkg.id}
                    onClick={() => onSelectPackageId(isSelected ? '' : pkg.id)}
                    className="relative py-4 px-5 text-center cursor-pointer select-none transition-colors"
                  >
                    {/* Synchronized Row Pillar Background */}
                    {isSelected && (
                      <motion.div
                        layoutId="matrixRowHighlight_platforms"
                        transition={PILLAR_SPRING}
                        className="absolute inset-0 bg-violet-50/80 border-x-2 border-violet-600/40 pointer-events-none"
                      />
                    )}
                    <div className="relative z-10 inline-flex flex-col items-center gap-1">
                      <PlatformBadgeGroup platformsText={pkg.platforms} size="xs" />
                      <span
                        className={`transition-colors ${
                          isSelected ? 'text-violet-950 font-bold' : 'text-slate-800 font-semibold'
                        }`}
                      >
                        {pkg.platforms}
                      </span>
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Row 4: Total Posts */}
            <tr className="hover:bg-slate-50/40 transition-colors">
              <td className="py-4 px-5 font-semibold text-slate-900">
                <span className="inline-flex items-center gap-2">
                  <Layers className="w-4 h-4 text-violet-700 shrink-0" />
                  <span>จำนวนโพสต์รวม</span>
                </span>
              </td>
              {packages.map((pkg) => {
                const isSelected = pkg.id === selectedPackageId;
                return (
                  <td
                    key={pkg.id}
                    onClick={() => onSelectPackageId(isSelected ? '' : pkg.id)}
                    className="relative py-4 px-5 text-center cursor-pointer select-none transition-colors"
                  >
                    {/* Synchronized Row Pillar Background */}
                    {isSelected && (
                      <motion.div
                        layoutId="matrixRowHighlight_posts"
                        transition={PILLAR_SPRING}
                        className="absolute inset-0 bg-violet-50/80 border-x-2 border-violet-600/40 pointer-events-none"
                      />
                    )}
                    <span
                      className={`relative z-10 transition-colors ${
                        isSelected
                          ? 'font-bold text-violet-900 text-sm'
                          : 'font-bold text-violet-700'
                      }`}
                    >
                      {pkg.totalPosts}
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* Dynamic Free Perks Rows */}
            {(freePerks.length > 0
              ? freePerks
              : [
                  { id: 'free-1', name: 'Gencode / Boost + Insights 30 วัน', priceLabel: 'ฟรี (0.-)' },
                  { id: 'free-2', name: 'สิทธิ์เชิงพาณิชย์ 6 เดือน + แก้ไข 3 ครั้ง', priceLabel: 'ฟรี (0.-)' },
                ]
            ).map((perk, pIdx) => {
              const Icon = pIdx % 2 === 0 ? QrCode : ShieldCheck;
              return (
                <tr key={perk.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-4 px-5 font-semibold text-slate-900">
                    <span className="inline-flex items-center gap-2">
                      <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{perk.name}</span>
                    </span>
                  </td>
                  {packages.map((pkg) => {
                    const isSelected = pkg.id === selectedPackageId;
                    return (
                      <td
                        key={pkg.id}
                        onClick={() => onSelectPackageId(isSelected ? '' : pkg.id)}
                        className="relative py-4 px-5 text-center cursor-pointer select-none transition-colors font-semibold"
                      >
                        {isSelected && (
                          <motion.div
                            layoutId={`matrixRowHighlight_perk_${perk.id}`}
                            transition={PILLAR_SPRING}
                            className="absolute inset-0 bg-violet-50/80 border-x-2 border-violet-600/40 pointer-events-none"
                          />
                        )}
                        <span
                          className={`relative z-10 transition-colors ${
                            isSelected ? 'text-emerald-800 font-bold' : 'text-emerald-700'
                          }`}
                        >
                          ✓ {perk.priceLabel || 'ฟรี (0.-)'}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {/* Row 7: Action Buttons (Bottom Row) */}
            <tr className="bg-slate-50/80">
              <td className="py-5 px-5 font-bold text-slate-900">
                กดจองคิวงานทันที
              </td>
              {packages.map((pkg) => {
                const isSelected = pkg.id === selectedPackageId;
                return (
                  <td
                    key={pkg.id}
                    className="relative py-5 px-5 text-center select-none"
                  >
                    {/* Synchronized Bottom Pillar Background */}
                    {isSelected && (
                      <motion.div
                        layoutId="matrixRowHighlight_bottom"
                        transition={PILLAR_SPRING}
                        className="absolute inset-0 bg-violet-100/75 border-x-2 border-b-2 border-violet-600 shadow-[0_6px_20px_rgba(124,58,237,0.12)] pointer-events-none"
                      />
                    )}

                    <div className="relative z-10">
                      {isSelected ? (
                        <motion.button
                          layoutId="matrixActiveCtaButton"
                          transition={PILLAR_SPRING}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.96 }}
                          type="button"
                          onClick={() => onOpenBookingForPackage(pkg.id)}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-violet-700 hover:bg-violet-800 text-white font-bold text-xs shadow-md shadow-violet-600/30 ring-2 ring-violet-500/40 transition-all cursor-pointer whitespace-nowrap"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>จองคิว {pkg.name}</span>
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          type="button"
                          onClick={() => onSelectPackageId(pkg.id)}
                          className="inline-flex items-center justify-center gap-1 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 font-semibold text-xs transition-all cursor-pointer whitespace-nowrap shadow-2xs"
                        >
                          <span>เลือก {pkg.name}</span>
                        </motion.button>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
