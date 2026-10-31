import React from 'react';
import {
  RefreshCw,
  AlertCircle,
  History,
  ShieldCheck,
  Sparkles,
  Clock,
} from 'lucide-react';
import { PlatformStat } from '../../../data/types';

interface SyncHeaderHeroProps {
  isLoading: boolean;
  lastSyncTimestamp: string | null;
  syncHistoryCount: number;
  syncError: string | null;
  platforms: PlatformStat[];
  onExecuteSync: (
    currentPlatforms: PlatformStat[],
    mode: 'official' | 'simulation'
  ) => Promise<void>;
}

export const SyncHeaderHero: React.FC<SyncHeaderHeroProps> = ({
  isLoading,
  lastSyncTimestamp,
  syncHistoryCount,
  syncError,
  platforms,
  onExecuteSync,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Enterprise API Auto-Sync Ready</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <RefreshCw className={`w-6 h-6 text-violet-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span>ดึงข้อมูลสด 4 แพลตฟอร์ม (Official API & Sandbox)</span>
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              เชื่อมต่อดึงสถิติช่อง <strong className="text-white font-bold">"จุ๊ยจุ๊ย"</strong>{' '}
              ทั้งผู้ติดตาม, ยอดวิว, และ Engagement Rate แสดงผลพรีวิวเปรียบเทียบ (Diff) ก่อนบันทึก
              พร้อมระบบย้อนกลับประวัติ (Rollback) สูงสุด 5 เวอร์ชัน
            </p>
          </div>

          {/* Quick Trigger Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onExecuteSync(platforms, 'simulation')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="ทดสอบดึงข้อมูลสดจำลองที่เสมือนจริงโดยไม่ต้องระบุ API Key"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>จำลองดึงสดแบบทดสอบ</span>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => onExecuteSync(platforms, 'official')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-900/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'กำลังดึงข้อมูลสด...' : 'ดึงข้อมูลสดผ่าน Official API'}</span>
            </button>
          </div>
        </div>

        {/* Status info bar */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>ดึงล่าสุด: </span>
              <span className="text-white font-semibold font-mono">
                {lastSyncTimestamp || 'ยังไม่มีการซิงค์ในรอบนี้'}
              </span>
            </span>
            <span className="hidden sm:inline-block text-slate-600">•</span>
            <span className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>ประวัติย้อนหลัง: </span>
              <span className="text-white font-semibold">{syncHistoryCount}/5 เวอร์ชัน</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>ความปลอดภัย: เก็บ API Token ในเบราว์เซอร์ส่วนตัว (Local Encrypted)</span>
          </div>
        </div>
      </div>

      {/* Global Error Banner */}
      {syncError && (
        <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">เกิดข้อผิดพลาดในการดึงข้อมูลจากแพลตฟอร์ม</p>
            <p className="mt-0.5 text-rose-700">{syncError}</p>
          </div>
        </div>
      )}
    </div>
  );
};
