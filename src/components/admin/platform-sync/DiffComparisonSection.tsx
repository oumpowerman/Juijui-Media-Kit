import React, { useState } from 'react';
import {
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Clock,
} from 'lucide-react';
import { PlatformStat, StatsTimeframe } from '../../../data/types';
import { PlatformBrandIcon } from '../../ui/PlatformBrandIcon';
import { PlatformDiffItem } from '../../../services/platformApiService';

interface DiffComparisonSectionProps {
  diffItems: PlatformDiffItem[];
  activeSyncMode: 'official' | 'simulation';
  isApplying: boolean;
  onToggleDiffSelection: (platformId: PlatformStat['id']) => void;
  onToggleSelectAll: (selectAll: boolean) => void;
  onClearDiff: () => void;
  onApplyDiff: () => Promise<void>;
}

export const DiffComparisonSection: React.FC<DiffComparisonSectionProps> = ({
  diffItems,
  activeSyncMode,
  isApplying,
  onToggleDiffSelection,
  onToggleSelectAll,
  onClearDiff,
  onApplyDiff,
}) => {
  const [previewTimeframe, setPreviewTimeframe] = useState<StatsTimeframe>('60d');
  const selectedDiffs = diffItems.filter((d) => d.isSelected);
  const totalFollowerDelta = selectedDiffs.reduce((sum, d) => sum + d.followerDelta, 0);

  return (
    <div className="bg-white rounded-2xl border-2 border-violet-500/40 shadow-lg p-5 sm:p-6 space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-violet-100 text-violet-800 text-xs font-semibold mb-1">
            <FileCheck2 className="w-3.5 h-3.5 text-violet-700" />
            <span>พรีวิวการเปรียบเทียบข้อมูลครบ 3 ช่วงเวลา (Diff Review: 28d / 60d / Lifetime)</span>
          </div>
          <h4 className="text-base sm:text-lg font-bold text-slate-900">
            ตรวจสอบความเปลี่ยนแปลงก่อนบันทึกลงเว็บไซต์
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            ข้อมูลดึงมาจาก{' '}
            <strong className="text-slate-900">
              {activeSyncMode === 'official' ? 'Official Platform APIs' : 'Verified Sandbox Simulation'}
            </strong>
            . เมื่อกดยืนยันบันทึก ระบบจะจัดเก็บสถิติทั้ง 3 ช่วงเวลา (28 วัน, 60 วัน และ Lifetime) ลงฐานข้อมูลพร้อมกันทันที
          </p>
        </div>

        {/* Diff Summary Badges */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-right">
            <div className="text-[10px] text-slate-500 font-medium">ส่วนต่างผู้ติดตามรวม</div>
            <div
              className={`text-xs font-bold font-mono ${
                totalFollowerDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {totalFollowerDelta >= 0
                ? `+${totalFollowerDelta.toLocaleString()}`
                : totalFollowerDelta.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Diff Controls & 3-Timeframe Preview Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-600">
        <label className="flex items-center gap-2 cursor-pointer font-semibold select-none">
          <input
            type="checkbox"
            checked={selectedDiffs.length === diffItems.length}
            onChange={(e) => onToggleSelectAll(e.target.checked)}
            className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-slate-300"
          />
          <span>เลือกทั้งหมด ({selectedDiffs.length}/{diffItems.length} แพลตฟอร์ม)</span>
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-violet-600" />
            <span>พรีวิวเปรียบเทียบช่วงเวลา:</span>
          </span>
          <div className="inline-flex items-center gap-1 p-0.5 rounded-xl bg-white border border-slate-200">
            {(
              [
                { id: '28d', label: '28 วันล่าสุด' },
                { id: '60d', label: '60 วันล่าสุด' },
                { id: 'lifetime', label: 'สะสมทั้งหมด (Lifetime)' },
              ] as const
            ).map((tf) => {
              const active = previewTimeframe === tf.id;
              return (
                <button
                  key={tf.id}
                  type="button"
                  onClick={() => setPreviewTimeframe(tf.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    active
                      ? 'bg-violet-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tf.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Diff Rows */}
      <div className="space-y-3">
        {diffItems.map((item) => {
          const currTf = item.currentTimeframes?.[previewTimeframe];
          const newTf = item.timeframes?.[previewTimeframe];

          const displayCurrViews = currTf?.views || item.currentViews;
          const displayNewViews = newTf?.views || item.newViews;
          const displayCurrLikes = currTf?.likes || item.currentLikes || '-';
          const displayNewLikes = newTf?.likes || item.newLikes || '-';
          const displayCurrComments = currTf?.comments || item.currentComments || '-';
          const displayNewComments = newTf?.comments || item.newComments || '-';
          const displayCurrShares = currTf?.shares || item.currentShares || '-';
          const displayNewShares = newTf?.shares || item.newShares || '-';
          const displayCurrEr = currTf?.er || item.currentEr;
          const displayNewEr = newTf?.er || item.newEr;

          const viewsHeaderLabel =
            previewTimeframe === '28d'
              ? 'ยอดวิว (28 วันล่าสุด)'
              : previewTimeframe === '60d'
              ? 'ยอดวิว (60 วันล่าสุด)'
              : 'ยอดวิวสะสม (Lifetime)';

          return (
            <div
              key={item.platformId}
              className={`p-4 rounded-xl border transition-all ${
                item.isSelected
                  ? 'border-violet-300 bg-violet-50/20 shadow-xs'
                  : 'border-slate-200 bg-slate-50/40 opacity-70'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Platform & Handle */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  <input
                    type="checkbox"
                    checked={item.isSelected}
                    onChange={() => onToggleDiffSelection(item.platformId)}
                    className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-slate-300 cursor-pointer"
                  />
                  <PlatformBrandIcon platform={item.platformId} size="md" />
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{item.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          item.status === 'success'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'error'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status === 'success'
                          ? 'ดึงสำเร็จ'
                          : item.status === 'error'
                          ? 'ไม่สำเร็จ'
                          : 'แจ้งเตือน'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">{item.handle}</div>
                  </div>
                </div>

                {/* Center: Metric Comparison (Followers, Views, ER, Likes, Comments, Shares) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                  {/* Followers Comparison */}
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/90">
                    <div className="text-[10px] font-semibold text-slate-500">ผู้ติดตาม (Followers)</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-slate-500 line-through">
                        {item.currentFollowers}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-xs font-bold font-mono text-slate-900">
                        {item.newFollowers}
                      </span>
                    </div>
                    {item.followerDelta !== 0 && (
                      <div
                        className={`text-[10px] font-bold font-mono mt-0.5 ${
                          item.followerDelta > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {item.followerDelta > 0
                          ? `+${item.followerDelta.toLocaleString()}`
                          : item.followerDelta.toLocaleString()}{' '}
                        ({item.followerDeltaPercent > 0 ? `+${item.followerDeltaPercent}%` : `${item.followerDeltaPercent}%`})
                      </div>
                    )}
                  </div>

                  {/* Views Metric */}
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/90">
                    <div className="text-[10px] font-semibold text-slate-500">{viewsHeaderLabel}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-slate-500">
                        {displayCurrViews}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-xs font-bold font-mono text-slate-900">
                        {displayNewViews}
                      </span>
                    </div>
                  </div>

                  {/* ER Metric */}
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/90">
                    <div className="text-[10px] font-semibold text-slate-500">Engagement Rate (ER)</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-slate-500">
                        {displayCurrEr}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-xs font-bold font-mono text-slate-900">
                        {displayNewEr}
                      </span>
                    </div>
                  </div>

                  {/* Likes Metric */}
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/90">
                    <div className="text-[10px] font-semibold text-slate-500">ยอดไลค์ (Likes)</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-slate-500">
                        {displayCurrLikes}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-xs font-bold font-mono text-slate-900">
                        {displayNewLikes}
                      </span>
                    </div>
                  </div>

                  {/* Comments Metric */}
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/90">
                    <div className="text-[10px] font-semibold text-slate-500">คอมเมนต์ (Comments)</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-slate-500">
                        {displayCurrComments}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-xs font-bold font-mono text-slate-900">
                        {displayNewComments}
                      </span>
                    </div>
                  </div>

                  {/* Shares Metric */}
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/90">
                    <div className="text-[10px] font-semibold text-slate-500">ยอดแชร์ (Shares)</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-slate-500">
                        {displayCurrShares}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-xs font-bold font-mono text-slate-900">
                        {displayNewShares}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-status message */}
              <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                <span>{item.statusMessage}</span>
                <span className="text-slate-400 text-[10px]">
                  แหล่งข้อมูล: {item.source === 'official_api' ? 'Official Graph/Open API' : 'Sandbox Simulated Live Feed'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Diff Action Footer */}
      <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={onClearDiff}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          ปิดหน้าพรีวิว (ยกเลิกการซิงค์รอบนี้)
        </button>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            disabled={isApplying || selectedDiffs.length === 0}
            onClick={onApplyDiff}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isApplying ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>กำลังบันทึกและสร้างจุดสำรอง...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>
                  ยืนยันบันทึกสถิติ ({selectedDiffs.length} แพลตฟอร์ม) ลงเว็บไซต์
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
