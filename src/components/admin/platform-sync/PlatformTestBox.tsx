import React, { useState } from 'react';
import {
  RefreshCw,
  Check,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  FileCheck2,
  HelpCircle,
  X,
  Zap,
  Play,
} from 'lucide-react';
import { PlatformTestBoxProps } from './types';

export const PlatformTestBox: React.FC<PlatformTestBoxProps> = ({
  platformName,
  isLoading,
  testResult,
  onRunTest,
  onClear,
  onApplyToDiff,
}) => {
  const [appliedToast, setAppliedToast] = useState(false);
  const [previewTimeframe, setPreviewTimeframe] = useState<'28d' | '60d' | 'lifetime'>('60d');

  const handleApply = () => {
    if (testResult?.data && onApplyToDiff) {
      onApplyToDiff(testResult.data);
      setAppliedToast(true);
      setTimeout(() => setAppliedToast(false), 2500);
    }
  };

  return (
    <div className="pt-3 border-t border-slate-200/80 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-violet-600" />
          <span>ทดสอบเฉพาะ {platformName} (Individual Test)</span>
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onRunTest(true)}
            className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
            title="ทดสอบดูตัวอย่างผลลัพธ์จำลองก่อนใส่ API Key จริง"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>จำลองทดสอบ</span>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => onRunTest(false)}
            className="px-3 py-1 rounded-lg text-[11px] font-bold bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>กำลังทดสอบ...</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>ทดสอบเชื่อมต่อสด</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Test Results Display */}
      {testResult && (
        <div
          className={`p-3 rounded-xl border transition-all text-xs space-y-2 animate-in fade-in duration-200 ${
            testResult.success
              ? 'bg-emerald-50/70 border-emerald-200 text-slate-800'
              : 'bg-rose-50/70 border-rose-200 text-slate-800'
          }`}
        >
          {/* Header row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-bold">
              {testResult.success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-emerald-900">ทดสอบ {platformName} ผ่านสำเร็จ</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="text-rose-900">ทดสอบ {platformName} ไม่ผ่าน</span>
                </>
              )}
              <span className="text-[10px] font-mono font-normal px-1.5 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-600">
                ⚡ {testResult.latencyMs}ms
              </span>
              <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                {testResult.timestamp}
              </span>
            </div>

            <button
              type="button"
              onClick={onClear}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded hover:bg-slate-200/50 cursor-pointer"
              title="ปิดผลการทดสอบนี้"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Success details */}
          {testResult.success && testResult.data && (
            <div className="space-y-2 pt-1">
              {/* Timeframe Switcher inside Test Box */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-white/90 border border-emerald-200/80">
                <span className="text-[10px] font-semibold text-slate-600">
                  เลือกดูสถิติตามช่วงเวลาที่ดึงมา (ครบทั้ง 3 ช่วงเวลา):
                </span>
                <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 border border-slate-200">
                  {(
                    [
                      { id: '28d', label: '28 วัน' },
                      { id: '60d', label: '60 วัน' },
                      { id: 'lifetime', label: 'สะสมทั้งหมด (Lifetime)' },
                    ] as const
                  ).map((tf) => {
                    const active = previewTimeframe === tf.id;
                    return (
                      <button
                        key={tf.id}
                        type="button"
                        onClick={() => setPreviewTimeframe(tf.id)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                          active
                            ? 'bg-violet-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {tf.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {(() => {
                const tfData = testResult.data.timeframes?.[previewTimeframe];
                const viewsVal = tfData?.views || testResult.data.viewsFormatted || '-';
                const likesVal = tfData?.likes || testResult.data.likesFormatted || '-';
                const commentsVal = tfData?.comments || testResult.data.commentsFormatted || '-';
                const sharesVal = tfData?.shares || testResult.data.sharesFormatted || '-';
                const erVal = tfData?.er || testResult.data.erFormatted;
                const viewsLabel =
                  previewTimeframe === '28d'
                    ? 'ยอดวิว (28 วัน)'
                    : previewTimeframe === '60d'
                    ? 'ยอดวิว (60 วัน)'
                    : 'ยอดวิวสะสม (Lifetime)';

                return (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-1.5 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                      <div className="text-[9px] font-semibold text-slate-500">ผู้ติดตามล่าสุด</div>
                      <div className="text-xs font-bold font-mono text-emerald-700 mt-0.5">
                        {testResult.data.followersFormatted}
                      </div>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                      <div className="text-[9px] font-semibold text-slate-500">{viewsLabel}</div>
                      <div className="text-xs font-bold font-mono text-slate-800 mt-0.5 truncate">
                        {viewsVal}
                      </div>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                      <div className="text-[9px] font-semibold text-slate-500">อัตรา ER</div>
                      <div className="text-xs font-bold font-mono text-violet-700 mt-0.5">
                        {erVal}
                      </div>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                      <div className="text-[9px] font-semibold text-slate-500">ยอดไลค์ (Likes)</div>
                      <div className="text-xs font-bold font-mono text-slate-800 mt-0.5 truncate">
                        {likesVal}
                      </div>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                      <div className="text-[9px] font-semibold text-slate-500">คอมเมนต์ (Comments)</div>
                      <div className="text-xs font-bold font-mono text-slate-800 mt-0.5 truncate">
                        {commentsVal}
                      </div>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                      <div className="text-[9px] font-semibold text-slate-500">ยอดแชร์ (Shares)</div>
                      <div className="text-xs font-bold font-mono text-slate-800 mt-0.5 truncate">
                        {sharesVal}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <span className="text-[10px] text-slate-600">
                  {testResult.statusMessage}
                </span>

                {onApplyToDiff && (
                  <button
                    type="button"
                    onClick={handleApply}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {appliedToast ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>ส่งเข้า Diff ครบทั้ง 3 ช่วงเวลาแล้ว!</span>
                      </>
                    ) : (
                      <>
                        <FileCheck2 className="w-3 h-3" />
                        <span>นำค่านี้เข้า Diff (บันทึกครบ 3 ช่วงเวลา)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Error & Advice details */}
          {!testResult.success && (
            <div className="space-y-1.5 pt-0.5">
              <p className="text-[11px] text-rose-800 font-semibold">
                {testResult.error || testResult.statusMessage}
              </p>
              {testResult.advice && (
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">คำแนะนำวิธีแก้ไข: </span>
                    <span>{testResult.advice}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
