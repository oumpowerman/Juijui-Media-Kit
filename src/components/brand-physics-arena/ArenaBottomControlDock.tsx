/**
 * ArenaBottomControlDock.tsx
 * Renders the unified bottom control dock for switching 3D physics modes (Zero-G, Gravity, Vortex)
 * and interactive helper tools (Magnetic Cursor, Neat Grid Formation, Shake 3D Logos, Reset).
 */

import React from 'react';
import {
  Sparkles,
  ArrowDownToLine,
  Orbit,
  Magnet,
  LayoutGrid,
  Shuffle,
  RotateCcw,
} from 'lucide-react';
import { PhysicsMode } from './types';

interface ArenaBottomControlDockProps {
  physicsMode: PhysicsMode;
  neatFormation: boolean;
  magneticCursor: boolean;
  onSelectPhysicsMode: (mode: PhysicsMode) => void;
  onToggleMagneticCursor: () => void;
  onToggleNeatFormation: () => void;
  onScatterImpulse: () => void;
  onResetBodies: () => void;
}

export const ArenaBottomControlDock: React.FC<ArenaBottomControlDockProps> = ({
  physicsMode,
  neatFormation,
  magneticCursor,
  onSelectPhysicsMode,
  onToggleMagneticCursor,
  onToggleNeatFormation,
  onScatterImpulse,
  onResetBodies,
}) => {
  return (
    <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-450 flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-950/92 border border-slate-700/90 text-white shadow-xl">
      {/* Physics Mode Selector */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold text-slate-400 mr-1 hidden sm:inline">
          โหมดฟิสิกส์ 3D:
        </span>
        <button
          type="button"
          onClick={() => onSelectPhysicsMode('zero-g')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            physicsMode === 'zero-g' && !neatFormation
              ? 'bg-violet-600 text-white shadow-xs'
              : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>ลอยตัวไร้น้ำหนัก (Zero-G)</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPhysicsMode('gravity')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            physicsMode === 'gravity' && !neatFormation
              ? 'bg-violet-600 text-white shadow-xs'
              : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <ArrowDownToLine className="w-3.5 h-3.5" />
          <span>กองบนโต๊ะ (Gravity Drop)</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPhysicsMode('vortex')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            physicsMode === 'vortex' && !neatFormation
              ? 'bg-violet-600 text-white shadow-xs'
              : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Orbit className="w-3.5 h-3.5" />
          <span>โคจร 3 ชั้นตามระดับ (Vortex)</span>
        </button>
      </div>

      {/* Interactive Impulse & Helper Controls */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={onToggleMagneticCursor}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            magneticCursor
              ? 'bg-amber-500/20 border-amber-400 text-amber-300'
              : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
          }`}
          title="เมื่อเปิดโหมดนี้ แค่เลื่อนเมาส์ผ่านการ์ดก็จะแหวกและหมุนตามแรงแม่เหล็ก"
        >
          <Magnet className="w-3.5 h-3.5" />
          <span>เมาส์แม่เหล็ก {magneticCursor ? 'ON' : 'OFF'}</span>
        </button>

        <button
          type="button"
          onClick={onToggleNeatFormation}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            neatFormation
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
              : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>{neatFormation ? 'ปลดล็อกให้ลอยอิสระ' : 'จัดเรียงเข้าแถว'}</span>
        </button>

        <button
          type="button"
          onClick={onScatterImpulse}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-xs"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>เขย่าโลโก้ 3D!</span>
        </button>

        <button
          type="button"
          onClick={onResetBodies}
          className="inline-flex items-center justify-center p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          title="รีเซ็ตตำแหน่งการ์ด"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
