import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, Layers, Edit3 } from 'lucide-react';
import { PlatformStat } from '../../../data/creatorData';
import { PlatformBrandIcon } from '../../ui/PlatformBrandIcon';
import {
  REPEAT_VIEWPORT,
  slideFromLeftVariant,
  slideFromRightVariant,
} from '../motionVariants';
import { IOS_TAB_SPRING } from './analyticsConstants';

interface AnalyticsHeaderTabsProps {
  platforms: PlatformStat[];
  activePlatformHighlight: string;
  onSelectPlatform: (platformId: string) => void;
  onOpenAdmin?: () => void;
}

export const AnalyticsHeaderTabs: React.FC<AnalyticsHeaderTabsProps> = ({
  platforms,
  activePlatformHighlight,
  onSelectPlatform,
  onOpenAdmin,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      {/* Title & Badge */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={REPEAT_VIEWPORT}
        variants={slideFromLeftVariant}
      >
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>02. PLATFORM ANALYTICS & AUDIENCE INSIGHTS</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1E1B4B] mt-1">
          สถิติสำคัญแยกตามแพลตฟอร์ม
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          ข้อมูลย้อนหลัง 60 วัน · แตะเลือกแพลตฟอร์มเพื่อเลื่อนดูการ์ดพร้อมเอฟเฟกต์เฉพาะตัว
        </p>
      </motion.div>

      {/* iOS-Style Segmented Control with Frosted Glass & Tactile Springs */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={REPEAT_VIEWPORT}
        variants={slideFromRightVariant}
        className="flex items-center gap-1.5 self-start flex-wrap"
      >
        <div className="p-1 bg-slate-200/60 backdrop-blur-xl border border-white/70 rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.06),0_4px_16px_-4px_rgba(0,0,0,0.05)] flex items-center gap-1">
          {[
            { id: 'all', name: 'ทุกแพลตฟอร์ม (4)' },
            ...platforms.map((p) => ({ id: p.id, name: p.name })),
          ].map((tab) => {
            const isActive = activePlatformHighlight === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={() => onSelectPlatform(tab.id)}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 select-none ${
                  isActive
                    ? 'text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="iosPlatformPill"
                    transition={IOS_TAB_SPRING}
                    className="absolute inset-0 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] border border-slate-200/50 -z-0"
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {tab.id === 'all' ? (
                    <Layers
                      className={`w-3.5 h-3.5 ${
                        isActive ? 'text-violet-600' : 'text-slate-500'
                      }`}
                    />
                  ) : (
                    <PlatformBrandIcon platform={tab.name} size="sm" />
                  )}
                  <span>{tab.name}</span>
                </span>
              </motion.button>
            );
          })}
        </div>

        {onOpenAdmin && (
          <button
            type="button"
            onClick={onOpenAdmin}
            className="px-2.5 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 shrink-0 shadow-2xs"
          >
            <Edit3 className="w-3 h-3" />
            <span>แก้ไขสถิติ</span>
          </button>
        )}
      </motion.div>
    </div>
  );
};
