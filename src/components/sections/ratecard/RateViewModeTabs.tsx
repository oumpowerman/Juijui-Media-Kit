import React from 'react';
import { motion } from 'motion/react';
import { Edit3 } from 'lucide-react';

export type RateViewMode = 'both' | 'cards' | 'matrix';

export interface RateViewModeTabsProps {
  rateViewMode: RateViewMode;
  onSelectRateViewMode: (mode: RateViewMode) => void;
  onOpenAdmin?: () => void;
}

export const RateViewModeTabs: React.FC<RateViewModeTabsProps> = ({
  rateViewMode,
  onSelectRateViewMode,
  onOpenAdmin,
}) => {
  const modes: { id: RateViewMode; label: string }[] = [
    { id: 'both', label: 'ทั้งการ์ดและตาราง' },
    { id: 'cards', label: 'ดูแบบการ์ด 3D' },
    { id: 'matrix', label: 'ดูตารางเปรียบเทียบ' },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs overflow-x-auto max-w-full">
      {modes.map((mode) => {
        const isActive = rateViewMode === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => onSelectRateViewMode(mode.id)}
            className={`relative px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              isActive ? 'text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="rateViewTabPill"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="absolute inset-0 bg-violet-700 rounded-lg -z-0"
              />
            )}
            <span className="relative z-10">{mode.label}</span>
          </button>
        );
      })}
      {onOpenAdmin && (
        <button
          type="button"
          onClick={onOpenAdmin}
          className="px-2.5 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 shrink-0"
        >
          <Edit3 className="w-3 h-3" />
          <span>แก้ไขเรทราคา</span>
        </button>
      )}
    </div>
  );
};
