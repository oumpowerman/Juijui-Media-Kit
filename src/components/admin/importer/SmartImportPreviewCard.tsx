import React from 'react';
import { CheckCircle2, BarChart3, ArrowRight, Users, Check } from 'lucide-react';
import { StatsTimeframe } from '../../../data/creatorData';
import { SupportedPlatformId } from '../../../services/smartImportService';
import { PLATFORM_OPTIONS, SmartImportPreviewCardProps } from './types';

export const SmartImportPreviewCard: React.FC<SmartImportPreviewCardProps> = ({
  previewResult,
  autoRecalcWeighted,
  setAutoRecalcWeighted,
  onCancelPreview,
  onToggleMetricItem,
  onChangeMetricNewValue,
  onChangeMetricTimeframe,
  onChangeMetricPlatform,
  onChangeDemographicsPlatform,
  onToggleDemographicsSelected,
  onConfirmApply,
}) => {
  return (
    <div className="bg-white rounded-2xl border-2 border-violet-600/80 shadow-lg p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-700 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs sm:text-sm font-bold text-slate-900">
              ตรวจสอบตัวอย่างตัวเลขที่ดึงได้ก่อนกดยืนยัน (Preview & Confirm)
            </h5>
            <p className="text-[11px] text-violet-700 font-semibold">
              {previewResult.summaryNote}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancelPreview}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer self-end sm:self-auto"
        >
          ยกเลิกพรีวิว
        </button>
      </div>

      {/* Section A: Extracted Metrics Table */}
      {previewResult.metrics.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <BarChart3 className="w-3.5 h-3.5 text-violet-700" />
            <span>รายการตัวเลขสถิติที่พร้อมอัปเดต (สามารถแก้ตัวเลขหรือเปลี่ยนช่วงเวลาได้ก่อนกดยืนยัน)</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                  <th className="py-2 px-3 w-10 text-center">เลือก</th>
                  <th className="py-2 px-3">แพลตฟอร์ม</th>
                  <th className="py-2 px-3">ช่วงเวลาเป้าหมาย</th>
                  <th className="py-2 px-3">หัวข้อสถิติ</th>
                  <th className="py-2 px-3 text-right">ค่าเดิม</th>
                  <th className="py-2 px-3 w-8 text-center"></th>
                  <th className="py-2 px-3">ค่าใหม่ที่ดึงได้ (แก้ไขได้)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewResult.metrics.map((item) => (
                  <tr
                    key={item.id}
                    className={item.selected ? 'bg-violet-50/30' : 'opacity-50 bg-slate-50/40'}
                  >
                    <td className="py-2 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => onToggleMetricItem(item.id)}
                        className="w-4 h-4 rounded accent-violet-700 cursor-pointer"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={item.platform}
                        onChange={(e) =>
                          onChangeMetricPlatform(
                            item.id,
                            e.target.value as SupportedPlatformId
                          )
                        }
                        className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800"
                      >
                        {PLATFORM_OPTIONS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      {item.timeframe === 'profile' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                          โปรไฟล์หลัก (ทุกช่วงเวลา)
                        </span>
                      ) : (
                        <select
                          value={item.timeframe}
                          onChange={(e) =>
                            onChangeMetricTimeframe(
                              item.id,
                              e.target.value as StatsTimeframe
                            )
                          }
                          className="px-2 py-1 rounded-lg bg-violet-50 border border-violet-200 text-xs font-bold text-violet-900"
                        >
                          <option value="28d">28 วันล่าสุด (28d)</option>
                          <option value="60d">60 วันล่าสุด (60d)</option>
                          <option value="lifetime">สะสมทั้งหมด (Lifetime)</option>
                        </select>
                      )}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-800">
                      {item.labelTh}
                    </td>
                    <td className="py-2 px-3 text-right font-mono-num text-slate-500">
                      {item.oldValue}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <ArrowRight className="w-3.5 h-3.5 text-violet-500 mx-auto" />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.newValue}
                        onChange={(e) =>
                          onChangeMetricNewValue(item.id, e.target.value)
                        }
                        className="w-32 px-2.5 py-1 rounded-lg bg-white border border-violet-300 font-mono-num font-bold text-violet-900 text-xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section B: Extracted Audience Demographics Preview */}
      {previewResult.demographics && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={previewResult.demographics.selected}
                onChange={onToggleDemographicsSelected}
                className="w-4 h-4 rounded accent-violet-700"
              />
              <Users className="w-4 h-4 text-violet-700" />
              <span className="text-xs font-bold text-slate-900">
                อัปเดตข้อมูลกลุ่มผู้ชม (อายุ / เพศ / จังหวัด) ที่ตรวจพบ
              </span>
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-600">
                บันทึกเข้าช่องทาง:
              </span>
              <select
                value={previewResult.demographics.platform}
                onChange={(e) =>
                  onChangeDemographicsPlatform(
                    e.target.value as SupportedPlatformId | 'overall'
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-white border border-violet-300 text-xs font-bold text-violet-900"
              >
                {PLATFORM_OPTIONS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
                <option value="overall">ภาพรวมทั้งหมด (Overall)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Age Groups */}
            <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-800 border-b border-slate-100 pb-1">
                ช่วงอายุ (Age Groups)
              </div>
              {previewResult.demographics.ageGroups.map((ag, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2">
                  <span className="text-slate-600">{ag.range}</span>
                  <span className="font-mono-num font-bold text-violet-700">
                    {ag.percent}%
                  </span>
                </div>
              ))}
            </div>

            {/* Gender */}
            <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-800 border-b border-slate-100 pb-1">
                สัดส่วนเพศ (Gender)
              </div>
              {previewResult.demographics.gender.map((g, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2">
                  <span className="text-slate-600">{g.label}</span>
                  <span className="font-mono-num font-bold text-violet-700">
                    {g.percent}%
                  </span>
                </div>
              ))}
            </div>

            {/* Locations */}
            <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-800 border-b border-slate-100 pb-1">
                จังหวัด/พื้นที่หลัก (Top Locations)
              </div>
              {previewResult.demographics.locations.map((loc, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2">
                  <span className="text-slate-600 truncate">{loc.name}</span>
                  <span className="font-mono-num font-bold text-violet-700">
                    {loc.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={autoRecalcWeighted}
              onChange={(e) => setAutoRecalcWeighted(e.target.checked)}
              className="w-3.5 h-3.5 rounded accent-violet-700"
            />
            <span className="font-semibold">
              คำนวณค่าเฉลี่ยถ่วงน้ำหนักภาพรวม (Follower-Weighted Audience DNA) ใหม่อัตโนมัติหลังนำเข้า
            </span>
          </label>
        </div>
      )}

      {/* Confirm / Cancel Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
        <span className="text-[11px] text-slate-500">
          * เมื่อกดยืนยันแล้ว ตัวเลขในฟอร์มจะถูกอัปเดตทันที และสามารถกดปุ่ม &ldquo;บันทึกการเปลี่ยนแปลงทั้งหมด&rdquo; ด้านล่างเพื่อขึ้น Cloud ได้เลย
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancelPreview}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={onConfirmApply}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>ยืนยันการนำเข้าข้อมูลที่เลือก</span>
          </button>
        </div>
      </div>
    </div>
  );
};
