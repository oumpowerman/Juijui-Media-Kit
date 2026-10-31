import React from 'react';
import { AtSign, RefreshCw } from 'lucide-react';
import { PlatformBrandIcon } from '../../ui/PlatformBrandIcon';
import { PLATFORM_OPTIONS, PublicProfileTabProps } from './types';

export const PublicProfileTab: React.FC<PublicProfileTabProps> = ({
  selectedPlatform,
  onSelectPlatform,
  usernameInput,
  setUsernameInput,
  isProcessing,
  onRunSync,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-bold text-slate-800">
          เลือกแพลตฟอร์มและกรอก @username เพื่อดึงยอดผู้ติดตาม & ยอดถูกใจสะสมหน้าโปรไฟล์
        </label>
        <div className="flex flex-wrap items-center gap-1.5">
          {PLATFORM_OPTIONS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPlatform(p.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                selectedPlatform === p.id
                  ? 'bg-violet-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <PlatformBrandIcon platform={p.id} size="xs" />
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <AtSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="เช่น @juijuinetwork หรือวางลิงก์ https://www.tiktok.com/@juijuinetwork"
            className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:border-violet-600 focus:outline-hidden"
          />
        </div>

        <button
          type="button"
          disabled={isProcessing}
          onClick={onRunSync}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-violet-700 hover:bg-violet-800 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-60 shrink-0"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>กำลังดึงข้อมูลโปรไฟล์...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ดึงยอดผู้ติดตาม & Likes สะสม</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
