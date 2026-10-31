import React, { useRef } from 'react';
import { Download, FileSpreadsheet, Check, RefreshCw, X } from 'lucide-react';
import { STATS_TIMEFRAME_OPTIONS } from '../../../data/creatorData';
import { PlatformBrandIcon } from '../../ui/PlatformBrandIcon';
import { PLATFORM_OPTIONS, CsvAnalyticsTabProps } from './types';

export const CsvAnalyticsTab: React.FC<CsvAnalyticsTabProps> = ({
  selectedPlatform,
  setSelectedPlatform,
  csvTimeframe,
  setCsvTimeframe,
  csvFiles,
  isProcessing,
  onSelectCsvFiles,
  onRemoveCsvFile,
  onDownloadSampleCsv,
  onRunCsvImport,
}) => {
  const csvInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3.5">
      {/* Platform & Timeframe selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
            1. เลือกแพลตฟอร์มของไฟล์ CSV:
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            {PLATFORM_OPTIONS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPlatform(p.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
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

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
            2. เลือกช่วงเวลาของไฟล์ CSV ที่ส่งออกมา:
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            {STATS_TIMEFRAME_OPTIONS.map((tf) => (
              <button
                key={tf.id}
                type="button"
                onClick={() => setCsvTimeframe(tf.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  csvTimeframe === tf.id
                    ? 'bg-violet-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tf.labelTh}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CSV Dropzone / Select & Sample Download */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-800">
            อัปโหลดไฟล์ .CSV จากปุ่ม Export Data ใน TikTok Studio / Meta Business Suite / YouTube Studio
          </p>
          <p className="text-[11px] text-slate-500">
            ระบบจะบวกรวมยอด Views, Likes, Comments, Shares, คำนวณ ER% และดึงสัดส่วนเพศ/อายุ/จังหวัดให้อัตโนมัติ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onDownloadSampleCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>ดาวน์โหลด CSV ตัวอย่าง</span>
          </button>

          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            multiple
            className="hidden"
            onChange={(e) => onSelectCsvFiles(e.target.files)}
          />
          <button
            type="button"
            onClick={() => csvInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>เลือกไฟล์ .CSV</span>
          </button>
        </div>
      </div>

      {/* Selected CSV File Chips & Process Button */}
      {csvFiles.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            {csvFiles.map((f, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>{f.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveCsvFile(idx)}
                  className="text-slate-400 hover:text-rose-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <button
            type="button"
            disabled={isProcessing}
            onClick={onRunCsvImport}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-700 hover:bg-violet-800 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>กำลังประมวลผล CSV...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>อ่านและคำนวณตัวเลขจาก CSV</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
