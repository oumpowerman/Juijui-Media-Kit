import React from 'react';
import { BarChart3, Clock } from 'lucide-react';
import {
  STATS_TIMEFRAME_OPTIONS,
  resolvePlatformMetricsForTimeframe,
  resolveOverviewForTimeframe,
} from '../../../data/creatorData';
import { PlatformBrandIcon } from '../../ui/PlatformBrandIcon';
import { SmartMediaKitImporter } from '../SmartMediaKitImporter';
import { TimeframeStatsEditorProps } from './types';

export const TimeframeStatsEditor: React.FC<TimeframeStatsEditorProps> = ({
  draftCreator,
  editingTimeframe,
  onChangeEditingTimeframe,
  onUpdateDefaultStatsTimeframe,
  onUpdateOverviewStat,
  onUpdateOverviewTimeframeStat,
  onUpdatePlatformStat,
  onUpdatePlatformTimeframeStat,
  onApplySmartImport,
}) => {
  const activeOv = resolveOverviewForTimeframe(draftCreator, editingTimeframe);
  const tfInfo =
    STATS_TIMEFRAME_OPTIONS.find((o) => o.id === editingTimeframe) ||
    STATS_TIMEFRAME_OPTIONS[1];

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/90 space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-violet-700" />
          <span>3. อัปเดตสถิติภาพรวม & สถิติแยก 4 แพลตฟอร์ม (รองรับ 3 ช่วงเวลา: 28 วัน / 60 วัน / Lifetime)</span>
        </h4>
        <p className="text-xs text-slate-500 mt-0.5">
          ตั้งค่าช่วงเวลาเริ่มต้นที่ลูกค้าเห็นเมื่อเปิดเรทการ์ด และสลับแก้ไขตัวเลขสถิติทั้ง 3 ช่วงเวลาได้อย่างอิสระ
        </p>
      </div>

      {/* Default Client Timeframe & Admin Editing Timeframe Switcher Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200/90">
        {/* Left: Default Timeframe when client opens page */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>1. ค่าเริ่มต้นเมื่อลูกค้าเปิดเรทการ์ด (Default Client Timeframe)</span>
          </label>
          <p className="text-[11px] text-slate-500">
            เมื่อลูกค้าเปิดเข้าเว็บครั้งแรก ระบบจะแสดงตัวเลขของช่วงเวลานี้ก่อน (ลูกค้ากดสลับดูช่วงอื่นเองได้)
          </p>
          <div className="inline-flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white border border-slate-200 mt-1">
            {STATS_TIMEFRAME_OPTIONS.map((opt) => {
              const isDefault = (draftCreator.defaultStatsTimeframe || '60d') === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onUpdateDefaultStatsTimeframe(opt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    isDefault
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {opt.labelTh} {isDefault && '✓ (ค่าเริ่มต้น)'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active Timeframe being edited in Admin Studio right now */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-violet-700" />
            <span>2. เลือกช่วงเวลาที่กำลังแก้ไขตัวเลขด้านล่าง (Admin Editing Mode)</span>
          </label>
          <p className="text-[11px] text-slate-500">
            คลิกสลับเพื่อตรวจดูหรือแก้ไขตัวเลข ยอดวิว, Likes, Comments, Shares และ ER ของแต่ละช่วงเวลา
          </p>
          <div className="inline-flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white border border-violet-200 mt-1">
            {STATS_TIMEFRAME_OPTIONS.map((opt) => {
              const isEditingThis = editingTimeframe === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeEditingTimeframe(opt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    isEditingThis
                      ? 'bg-violet-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  กำลังแก้: {opt.labelTh}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Smart Media Kit Importer (AI Screenshot OCR + CSV Importer + @username Public Profile Sync) */}
      {onApplySmartImport && (
        <SmartMediaKitImporter
          draftCreator={draftCreator}
          onApplyUpdatedCreator={onApplySmartImport}
        />
      )}

      {/* Overview KPI Row for Active Editing Timeframe */}
      <div className="space-y-2.5 p-4 rounded-xl bg-slate-50/70 border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-violet-900">
            ตัวเลขภาพรวมด้านบน (Overview KPIs) — ช่วงเวลา: {tfInfo.labelTh}
          </span>
          <span className="text-[11px] text-slate-500">
            * ผู้ติดตามรวมใช้ค่าร่วมกันทุกช่วงเวลา ส่วนยอดวิว/ER/Reach เปลี่ยนตามช่วงเวลาที่เลือก
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-1">
              ผู้ติดตามรวม (ทุกช่อง)
            </label>
            <input
              type="text"
              value={draftCreator.overview.totalFollowers}
              onChange={(e) => onUpdateOverviewStat('totalFollowers', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-bold font-mono-num rounded-lg bg-white border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-violet-700 mb-1">
              {tfInfo.viewsLabelTh}
            </label>
            <input
              type="text"
              value={activeOv.totalViews}
              onChange={(e) =>
                onUpdateOverviewTimeframeStat(editingTimeframe, 'totalViews', e.target.value)
              }
              className="w-full px-2.5 py-1.5 text-xs font-bold font-mono-num rounded-lg bg-white border border-violet-300"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-violet-700 mb-1">
              ER เฉลี่ยรวม ({tfInfo.shortBadge})
            </label>
            <input
              type="text"
              value={activeOv.totalEr}
              onChange={(e) =>
                onUpdateOverviewTimeframeStat(editingTimeframe, 'totalEr', e.target.value)
              }
              className="w-full px-2.5 py-1.5 text-xs font-bold font-mono-num rounded-lg bg-white border border-violet-300"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-violet-700 mb-1">
              ยอดดูเฉลี่ยต่อคลิป ({tfInfo.shortBadge})
            </label>
            <input
              type="text"
              value={activeOv.avgViewsPerContent}
              onChange={(e) =>
                onUpdateOverviewTimeframeStat(
                  editingTimeframe,
                  'avgViewsPerContent',
                  e.target.value
                )
              }
              className="w-full px-2.5 py-1.5 text-xs font-bold font-mono-num rounded-lg bg-white border border-violet-300"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-violet-700 mb-1">
              Reach ({tfInfo.shortBadge})
            </label>
            <input
              type="text"
              value={activeOv.monthlyReach}
              onChange={(e) =>
                onUpdateOverviewTimeframeStat(
                  editingTimeframe,
                  'monthlyReach',
                  e.target.value
                )
              }
              className="w-full px-2.5 py-1.5 text-xs font-mono-num rounded-lg bg-white border border-violet-300"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-violet-700 mb-1">
              Likes รวม ({tfInfo.shortBadge})
            </label>
            <input
              type="text"
              value={activeOv.monthlyLikes}
              onChange={(e) =>
                onUpdateOverviewTimeframeStat(
                  editingTimeframe,
                  'monthlyLikes',
                  e.target.value
                )
              }
              className="w-full px-2.5 py-1.5 text-xs font-mono-num rounded-lg bg-white border border-violet-300"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] font-semibold text-violet-700 mb-1">
              ป้ายกำกับมุมการ์ด ({tfInfo.shortBadge})
            </label>
            <input
              type="text"
              value={activeOv.periodBadgeLabel}
              onChange={(e) =>
                onUpdateOverviewTimeframeStat(
                  editingTimeframe,
                  'periodBadgeLabel',
                  e.target.value
                )
              }
              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-violet-300"
            />
          </div>
        </div>
      </div>

      {/* 4 Platform Cards Editor for Active Editing Timeframe */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {draftCreator.platforms.map((plat) => {
          const tfMetrics = resolvePlatformMetricsForTimeframe(plat, editingTimeframe);
          const tfOption =
            STATS_TIMEFRAME_OPTIONS.find((o) => o.id === editingTimeframe) ||
            STATS_TIMEFRAME_OPTIONS[1];

          return (
            <div
              key={plat.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5"
            >
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <div className="flex items-center gap-1.5">
                  <PlatformBrandIcon platform={plat.name} size="xs" />
                  <span className="text-xs font-bold text-slate-900">{plat.name}</span>
                </div>
                <input
                  type="text"
                  value={plat.handle}
                  onChange={(e) => onUpdatePlatformStat(plat.id, 'handle', e.target.value)}
                  className="w-28 px-2 py-0.5 text-[11px] text-right text-slate-600 bg-white rounded border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-500">Follower (รวม)</label>
                  <input
                    type="text"
                    value={plat.followers}
                    onChange={(e) =>
                      onUpdatePlatformStat(plat.id, 'followers', e.target.value)
                    }
                    className="w-full px-2 py-1 text-xs font-mono-num font-semibold bg-white rounded border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-violet-700">
                    {tfOption.cardViewsLabel}
                  </label>
                  <input
                    type="text"
                    value={tfMetrics.views}
                    onChange={(e) =>
                      onUpdatePlatformTimeframeStat(
                        plat.id,
                        editingTimeframe,
                        'views',
                        e.target.value
                      )
                    }
                    className="w-full px-2 py-1 text-xs font-mono-num font-semibold bg-white rounded border border-violet-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-violet-700">
                    Likes ({tfOption.shortBadge})
                  </label>
                  <input
                    type="text"
                    value={tfMetrics.likes}
                    onChange={(e) =>
                      onUpdatePlatformTimeframeStat(
                        plat.id,
                        editingTimeframe,
                        'likes',
                        e.target.value
                      )
                    }
                    className="w-full px-2 py-1 text-xs font-mono-num bg-white rounded border border-violet-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-violet-700">
                    ER (%) ({tfOption.shortBadge})
                  </label>
                  <input
                    type="text"
                    value={tfMetrics.er}
                    onChange={(e) =>
                      onUpdatePlatformTimeframeStat(
                        plat.id,
                        editingTimeframe,
                        'er',
                        e.target.value
                      )
                    }
                    className="w-full px-2 py-1 text-xs font-mono-num font-bold text-violet-700 bg-white rounded border border-violet-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-violet-700">
                    Comments ({tfOption.shortBadge})
                  </label>
                  <input
                    type="text"
                    value={tfMetrics.comments}
                    onChange={(e) =>
                      onUpdatePlatformTimeframeStat(
                        plat.id,
                        editingTimeframe,
                        'comments',
                        e.target.value
                      )
                    }
                    className="w-full px-2 py-1 text-xs font-mono-num bg-white rounded border border-violet-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-violet-700">
                    Shares ({tfOption.shortBadge})
                  </label>
                  <input
                    type="text"
                    value={tfMetrics.shares}
                    onChange={(e) =>
                      onUpdatePlatformTimeframeStat(
                        plat.id,
                        editingTimeframe,
                        'shares',
                        e.target.value
                      )
                    }
                    className="w-full px-2 py-1 text-xs font-mono-num bg-white rounded border border-violet-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500">ลิงก์ไปยังช่อง (URL)</label>
                <input
                  type="text"
                  value={plat.url}
                  onChange={(e) => onUpdatePlatformStat(plat.id, 'url', e.target.value)}
                  className="w-full px-2 py-1 text-[11px] text-slate-600 bg-white rounded border border-slate-200"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
