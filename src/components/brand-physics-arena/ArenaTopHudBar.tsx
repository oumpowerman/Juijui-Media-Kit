/**
 * ArenaTopHudBar.tsx
 * Renders the top-left interactive instruction pill, 3-Tier Size Legend (XL / MD / SM),
 * and the top-right density toggle button.
 */

import React from 'react';
import { Move, Crown, Layers } from 'lucide-react';

interface ArenaTopHudBarProps {
  totalBrandsCount: number;
  showAllDensity: boolean;
  onToggleDensity: () => void;
}

export const ArenaTopHudBar: React.FC<ArenaTopHudBarProps> = ({
  totalBrandsCount,
  showAllDensity,
  onToggleDensity,
}) => {
  return (
    <div className="absolute top-3.5 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-450">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-900/90 border border-violet-400/30 text-white text-xs font-semibold shadow-md">
          <Move className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            หยิบโลโก้เหวี่ยงชนกันได้ · ชี้เมาส์ (Hover) เพื่อดูสถิติ · คลิกเพื่อดูคลิปตัวอย่าง
          </span>
        </div>

        {/* 3-Tier Size Legend Pill */}
        <div className="hidden xl:inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-950/85 border border-slate-700/80 text-[11px] font-semibold text-slate-300">
          <span className="inline-flex items-center gap-1 text-amber-300">
            <Crown className="w-3 h-3 text-amber-400" />
            <span>ขนาดใหญ่ XL: 5+ งาน</span>
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-300">ขนาดกลาง MD: 2–4 งาน</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300">ขนาดมาตรฐาน SM: 1 งาน</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pointer-events-auto">
        {totalBrandsCount > 36 && (
          <button
            type="button"
            onClick={onToggleDensity}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-violet-950 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-violet-400" />
            <span>
              {showAllDensity
                ? `กำลังแสดงครบ ${totalBrandsCount} แบรนด์ (สลับเป็น 36 แบรนด์เด่น)`
                : `กำลังแสดง 36 แบรนด์เด่น (กดเพื่อเทลงมาทั้ง ${totalBrandsCount} แบรนด์)`}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
