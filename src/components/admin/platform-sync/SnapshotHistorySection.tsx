import React from 'react';
import { History, Clock, RotateCcw } from 'lucide-react';
import { SyncSnapshotHistoryItem } from '../../../services/platformApiService';

interface SnapshotHistorySectionProps {
  syncHistory: SyncSnapshotHistoryItem[];
  isRollingBack: string | null;
  onRollback: (snapshot: SyncSnapshotHistoryItem) => Promise<void>;
}

export const SnapshotHistorySection: React.FC<SnapshotHistorySectionProps> = ({
  syncHistory,
  isRollingBack,
  onRollback,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-violet-700" />
            <span>ประวัติการซิงค์ข้อมูลย้อนหลัง (Snapshot Rollback History)</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            ระบบจัดเก็บจุดคืนค่าอัตโนมัติสูงสุด 5 เวอร์ชันล่าสุด สามารถกดปุ่ม Rollback เพื่อย้อนกลับไปใช้ตัวเลขเดิมได้ทันที
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          {syncHistory.length} / 5 สแนปช็อต
        </span>
      </div>

      {syncHistory.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 space-y-2">
          <Clock className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs font-semibold text-slate-700">ยังไม่มีประวัติการซิงค์ข้อมูลในหน่วยความจำ</p>
          <p className="text-[11px] text-slate-500 max-w-md mx-auto">
            เมื่อคุณกดดึงข้อมูลสดและกดยืนยันบันทึก ระบบจะบันทึกสถานะของตัวเลขปัจจุบันเก็บเป็นประวัติให้คุณสามารถย้อนกลับมาใช้ได้ทุกเมื่อ
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {syncHistory.map((item, index) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    เวอร์ชัน #{syncHistory.length - index} • {item.dateFormatted}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      item.triggerType === 'official_api'
                        ? 'bg-violet-100 text-violet-800'
                        : item.triggerType === 'simulation'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.triggerType === 'official_api'
                      ? 'Official API'
                      : item.triggerType === 'simulation'
                      ? 'Simulation Feed'
                      : 'Manual Restore'}
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  {item.summary.platformChangesSummary}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-mono mt-1">
                  <span>
                    ผู้ติดตามรวม:{' '}
                    <strong className="text-slate-800 font-bold">{item.summary.totalFollowers}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Reach ต่อเดือน:{' '}
                    <strong className="text-slate-800 font-bold">{item.summary.totalReach}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    ER เฉลี่ย:{' '}
                    <strong className="text-slate-800 font-bold">{item.summary.totalEr}</strong>
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                <button
                  type="button"
                  disabled={isRollingBack === item.id}
                  onClick={() => onRollback(item)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw
                    className={`w-3.5 h-3.5 text-slate-600 ${
                      isRollingBack === item.id ? 'animate-spin' : ''
                    }`}
                  />
                  <span>
                    {isRollingBack === item.id ? 'กำลังย้อนกลับ...' : '↺ ย้อนกลับไปใช้เวอร์ชันนี้'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
