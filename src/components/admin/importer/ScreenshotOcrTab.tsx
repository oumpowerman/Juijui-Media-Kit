import React, { useRef } from 'react';
import { Upload, Sparkles, RefreshCw, X } from 'lucide-react';
import { STATS_TIMEFRAME_OPTIONS } from '../../../data/creatorData';
import { PlatformBrandIcon } from '../../ui/PlatformBrandIcon';
import { PLATFORM_OPTIONS, ScreenshotOcrTabProps } from './types';

export const ScreenshotOcrTab: React.FC<ScreenshotOcrTabProps> = ({
  ocrPlatformMode,
  setOcrPlatformMode,
  ocrTimeframeMode,
  setOcrTimeframeMode,
  screenshotFiles,
  screenshotPreviews,
  isProcessing,
  onSelectScreenshots,
  onRemoveScreenshot,
  onClearScreenshots,
  onRunOcr,
}) => {
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3.5">
      {/* Platform & Timeframe Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
            เลือกแพลตฟอร์มของภาพแคปหน้าจอ:
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setOcrPlatformMode('auto')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                ocrPlatformMode === 'auto'
                  ? 'bg-violet-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              AI ตรวจจับอัตโนมัติ
            </button>
            {PLATFORM_OPTIONS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setOcrPlatformMode(p.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  ocrPlatformMode === p.id
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

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
            เลือกช่วงเวลาที่ต้องการนำตัวเลขไปใส่:
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setOcrTimeframeMode('auto')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                ocrTimeframeMode === 'auto'
                  ? 'bg-violet-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              อ่านตามในรูป (Auto)
            </button>
            {STATS_TIMEFRAME_OPTIONS.map((tf) => (
              <button
                key={tf.id}
                type="button"
                onClick={() => setOcrTimeframeMode(tf.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  ocrTimeframeMode === tf.id
                    ? 'bg-violet-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tf.shortBadge}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Drag & Drop Dropzone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onSelectScreenshots(e.dataTransfer.files);
        }}
        onClick={() => screenshotInputRef.current?.click()}
        className="border-2 border-dashed border-violet-300 hover:border-violet-500 bg-white/90 hover:bg-violet-50/40 rounded-xl p-5 text-center transition-all cursor-pointer"
      >
        <input
          ref={screenshotInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => onSelectScreenshots(e.target.files)}
        />
        <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mx-auto mb-2">
          <Upload className="w-5 h-5" />
        </div>
        <p className="text-xs font-bold text-slate-800">
          คลิกเพื่อเลือกรูปแคปหน้าจอ หรือลากไฟล์ภาพมาวางที่นี่ (เลือกพร้อมกันได้สูงสุด 8 ภาพ)
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          รองรับภาพแคปหน้าจอจากมือถือและคอมพิวเตอร์: หน้า Overview (28 วัน / 60 วัน / Lifetime) และหน้าข้อมูลผู้ชม (เพศ / อายุ / จังหวัด)
        </p>
      </div>

      {/* Selected Screenshot Thumbnails & Actions */}
      {screenshotFiles.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
          <div className="flex flex-wrap items-center gap-2.5">
            {screenshotPreviews.map((src, idx) => (
              <div
                key={idx}
                className="relative group w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100"
              >
                <img
                  src={src}
                  alt={screenshotFiles[idx]?.name || 'screenshot'}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveScreenshot(idx);
                  }}
                  className="absolute top-0.5 right-0.5 p-1 rounded-md bg-slate-900/80 text-white hover:bg-rose-600 cursor-pointer"
                  title="ลบภาพนี้"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <span className="text-xs font-semibold text-slate-600 ml-1">
              เลือกแล้ว {screenshotFiles.length} ภาพ
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClearScreenshots}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              ล้างทั้งหมด
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={onRunOcr}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-700 hover:bg-violet-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังใช้ AI อ่านตัวเลขจากภาพ...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>สกัดตัวเลขจากรูปแคปหน้าจอ ({screenshotFiles.length} ภาพ)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
