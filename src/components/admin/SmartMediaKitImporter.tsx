import React, { useState } from 'react';
import {
  Camera,
  FileSpreadsheet,
  AtSign,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { CreatorProfile, StatsTimeframe } from '../../data/creatorData';
import {
  SupportedPlatformId,
  SmartImportPreviewResult,
  fetchPublicProfilePreview,
  extractScreenshotOcrPreview,
  parseAnalyticsCsvPreview,
  applySmartImportToCreator,
} from '../../services/smartImportService';
import {
  SmartMediaKitImporterProps,
} from './importer/types';
import { ScreenshotOcrTab } from './importer/ScreenshotOcrTab';
import { CsvAnalyticsTab } from './importer/CsvAnalyticsTab';
import { PublicProfileTab } from './importer/PublicProfileTab';
import { SmartImportPreviewCard } from './importer/SmartImportPreviewCard';

export type { SmartMediaKitImporterProps };

export const SmartMediaKitImporter: React.FC<SmartMediaKitImporterProps> = ({
  draftCreator,
  onApplyUpdatedCreator,
  defaultMode = 'ocr',
  compactHeader = false,
}) => {
  const [activeMode, setActiveMode] = useState<'ocr' | 'csv' | 'username'>(defaultMode);

  // Shared platform & timeframe selectors
  const [selectedPlatform, setSelectedPlatform] = useState<SupportedPlatformId>('tiktok');
  const [ocrPlatformMode, setOcrPlatformMode] = useState<SupportedPlatformId | 'auto'>('tiktok');
  const [ocrTimeframeMode, setOcrTimeframeMode] = useState<StatsTimeframe | 'auto'>('auto');
  const [csvTimeframe, setCsvTimeframe] = useState<StatsTimeframe>('28d');

  // Mode 1: Screenshot OCR state
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);

  // Mode 2: CSV files state
  const [csvFiles, setCsvFiles] = useState<File[]>([]);

  // Mode 3: @username handle input state
  const currentPlatObj =
    draftCreator.platforms.find((p) => p.id === selectedPlatform) ||
    draftCreator.platforms[0];
  const [usernameInput, setUsernameInput] = useState<string>(
    currentPlatObj?.handle || '@juijuinetwork'
  );

  // Processing & Preview feedback states
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [previewResult, setPreviewResult] = useState<SmartImportPreviewResult | null>(null);
  const [autoRecalcWeighted, setAutoRecalcWeighted] = useState(true);

  const handleSelectPlatformForUsername = (platId: SupportedPlatformId) => {
    setSelectedPlatform(platId);
    const found = draftCreator.platforms.find((p) => p.id === platId);
    if (found?.handle) {
      setUsernameInput(found.handle);
    }
  };

  // Screenshot file handlers
  const handleSelectScreenshots = (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    const incoming = Array.from(filesList).filter((f) => f.type.startsWith('image/'));
    if (incoming.length === 0) {
      setErrorNotice('กรุณาเลือกไฟล์รูปภาพ (.png, .jpg, .webp)');
      return;
    }
    const nextFiles = [...screenshotFiles, ...incoming].slice(0, 8);
    setScreenshotFiles(nextFiles);
    setScreenshotPreviews(nextFiles.map((f) => URL.createObjectURL(f)));
    setErrorNotice(null);
  };

  const handleRemoveScreenshot = (idx: number) => {
    const nextFiles = screenshotFiles.filter((_, i) => i !== idx);
    setScreenshotFiles(nextFiles);
    setScreenshotPreviews(nextFiles.map((f) => URL.createObjectURL(f)));
  };

  const handleClearScreenshots = () => {
    setScreenshotFiles([]);
    setScreenshotPreviews([]);
  };

  // CSV file handlers
  const handleSelectCsvFiles = (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    const incoming = Array.from(filesList);
    setCsvFiles((prev) => [...prev, ...incoming].slice(0, 6));
    setErrorNotice(null);
  };

  const handleRemoveCsvFile = (idx: number) => {
    setCsvFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDownloadSampleCsv = () => {
    const sampleContent = [
      'Date,Video Views,Profile Views,Likes,Comments,Shares,Followers',
      '2026-10-01,450000,18500,34200,820,410,660200',
      '2026-10-02,520000,21400,41000,960,530,660500',
      '2026-10-03,680000,29000,56000,1240,890,661200',
      'Male,64.3%',
      'Female,35.7%',
      '18-24,32%',
      '25-34,44%',
      '35-54,16%',
      '55+,8%',
    ].join('\n');
    const blob = new Blob(['\uFEFF' + sampleContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tiktok-studio-sample-${csvTimeframe}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Trigger Actions
  const handleRunScreenshotOcr = async () => {
    if (screenshotFiles.length === 0) {
      setErrorNotice('กรุณาอัปโหลดภาพแคปหน้าจอหลังบ้านอย่างน้อย 1 ภาพก่อนกดสกัดตัวเลข');
      return;
    }
    setIsProcessing(true);
    setErrorNotice(null);
    setSuccessToast(null);
    try {
      const result = await extractScreenshotOcrPreview(
        draftCreator,
        screenshotFiles,
        ocrPlatformMode,
        ocrTimeframeMode
      );
      setPreviewResult(result);
    } catch (err: any) {
      setErrorNotice(err?.message || 'เกิดข้อผิดพลาดในการสกัดตัวเลขจากรูปภาพ');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRunCsvImport = async () => {
    if (csvFiles.length === 0) {
      setErrorNotice('กรุณาเลือกไฟล์ .CSV จากหลังบ้านก่อนกดประมวลผล');
      return;
    }
    setIsProcessing(true);
    setErrorNotice(null);
    setSuccessToast(null);
    try {
      const result = await parseAnalyticsCsvPreview(
        draftCreator,
        csvFiles,
        selectedPlatform,
        csvTimeframe
      );
      setPreviewResult(result);
    } catch (err: any) {
      setErrorNotice(err?.message || 'ไม่สามารถอ่านไฟล์ CSV ได้');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRunUsernameSync = async () => {
    if (!usernameInput.trim()) {
      setErrorNotice('กรุณากรอก @username หรือลิงก์หน้าโปรไฟล์');
      return;
    }
    setIsProcessing(true);
    setErrorNotice(null);
    setSuccessToast(null);
    try {
      const result = await fetchPublicProfilePreview(
        draftCreator,
        selectedPlatform,
        usernameInput
      );
      setPreviewResult(result);
    } catch (err: any) {
      setErrorNotice(err?.message || 'ไม่สามารถดึงข้อมูลจาก @username ได้');
    } finally {
      setIsProcessing(false);
    }
  };

  // Preview Mutations
  const handleToggleMetricItem = (id: string) => {
    if (!previewResult) return;
    setPreviewResult({
      ...previewResult,
      metrics: previewResult.metrics.map((m) =>
        m.id === id ? { ...m, selected: !m.selected } : m
      ),
    });
  };

  const handleChangeMetricNewValue = (id: string, nextVal: string) => {
    if (!previewResult) return;
    setPreviewResult({
      ...previewResult,
      metrics: previewResult.metrics.map((m) =>
        m.id === id ? { ...m, newValue: nextVal } : m
      ),
    });
  };

  const handleChangeMetricTimeframe = (
    id: string,
    nextTf: StatsTimeframe | 'profile'
  ) => {
    if (!previewResult) return;
    setPreviewResult({
      ...previewResult,
      metrics: previewResult.metrics.map((m) =>
        m.id === id ? { ...m, timeframe: nextTf } : m
      ),
    });
  };

  const handleChangeMetricPlatform = (id: string, nextPlat: SupportedPlatformId) => {
    if (!previewResult) return;
    setPreviewResult({
      ...previewResult,
      metrics: previewResult.metrics.map((m) =>
        m.id === id ? { ...m, platform: nextPlat } : m
      ),
    });
  };

  const handleChangeDemographicsPlatform = (plat: SupportedPlatformId | 'overall') => {
    if (!previewResult || !previewResult.demographics) return;
    setPreviewResult({
      ...previewResult,
      demographics: {
        ...previewResult.demographics,
        platform: plat,
      },
    });
  };

  const handleToggleDemographicsSelected = () => {
    if (!previewResult || !previewResult.demographics) return;
    setPreviewResult({
      ...previewResult,
      demographics: {
        ...previewResult.demographics,
        selected: !previewResult.demographics.selected,
      },
    });
  };

  const handleConfirmApplyPreview = () => {
    if (!previewResult) return;
    const updated = applySmartImportToCreator(
      draftCreator,
      previewResult,
      autoRecalcWeighted
    );
    const selectedCount =
      previewResult.metrics.filter((m) => m.selected).length +
      (previewResult.demographics?.selected ? 1 : 0);

    const msg = `นำเข้าและอัปเดตข้อมูลสำเร็จ (${selectedCount} รายการ) — อย่าลืมกดปุ่ม "บันทึกการเปลี่ยนแปลงทั้งหมด" ด้านล่างเพื่อซิงก์ขึ้น Cloud`;
    onApplyUpdatedCreator(updated, msg);
    setSuccessToast(msg);
    setPreviewResult(null);
    setScreenshotFiles([]);
    setScreenshotPreviews([]);
    setCsvFiles([]);
  };

  return (
    <div className="rounded-2xl border border-violet-200/90 bg-gradient-to-br from-violet-50/60 via-white to-indigo-50/40 p-4 sm:p-5 space-y-4 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-violet-100">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1E1B4B] text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                Smart Media Kit Importer — อัปเดตสถิติทั้ง 4 แพลตฟอร์ม (ไม่ต้องขอ API Key)
              </h5>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                รองรับ 28 วัน · 60 วัน · Lifetime + อายุ/เพศ/จังหวัด
              </span>
            </div>
            {!compactHeader && (
              <p className="text-[11px] text-slate-500 mt-0.5">
                เลือกวิธีอัปเดตได้ 3 รูปแบบ: อัปโหลดภาพแคปหน้าจอหลังบ้าน (AI OCR), นำเข้าไฟล์ CSV จากสตูดิโอ หรือดึงยอดผู้ติดตามสดจาก @username พร้อมตารางพรีวิวให้ตรวจสอบก่อนกดยืนยัน
              </p>
            )}
          </div>
        </div>

        {/* 3 Mode Switcher Tabs */}
        <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveMode('ocr');
              setErrorNotice(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'ocr'
                ? 'bg-[#1E1B4B] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-amber-300" />
            <span>1. อัปโหลดรูปแคปหน้าจอ (AI OCR)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('csv');
              setErrorNotice(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'csv'
                ? 'bg-[#1E1B4B] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>2. นำเข้าไฟล์ CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('username');
              setErrorNotice(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'username'
                ? 'bg-[#1E1B4B] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <AtSign className="w-3.5 h-3.5 text-sky-400" />
            <span>3. ดึงยอดจาก @username</span>
          </button>
        </div>
      </div>

      {/* Error Notice */}
      {errorNotice && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorNotice(null)}
            className="p-1 text-rose-500 hover:text-rose-800 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Success Toast */}
      {successToast && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="p-1 text-emerald-600 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Mode 1: AI Screenshot OCR */}
      {activeMode === 'ocr' && (
        <ScreenshotOcrTab
          ocrPlatformMode={ocrPlatformMode}
          setOcrPlatformMode={setOcrPlatformMode}
          ocrTimeframeMode={ocrTimeframeMode}
          setOcrTimeframeMode={setOcrTimeframeMode}
          screenshotFiles={screenshotFiles}
          screenshotPreviews={screenshotPreviews}
          isProcessing={isProcessing}
          onSelectScreenshots={handleSelectScreenshots}
          onRemoveScreenshot={handleRemoveScreenshot}
          onClearScreenshots={handleClearScreenshots}
          onRunOcr={handleRunScreenshotOcr}
        />
      )}

      {/* Mode 2: CSV Analytics Import */}
      {activeMode === 'csv' && (
        <CsvAnalyticsTab
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={setSelectedPlatform}
          csvTimeframe={csvTimeframe}
          setCsvTimeframe={setCsvTimeframe}
          csvFiles={csvFiles}
          isProcessing={isProcessing}
          onSelectCsvFiles={handleSelectCsvFiles}
          onRemoveCsvFile={handleRemoveCsvFile}
          onDownloadSampleCsv={handleDownloadSampleCsv}
          onRunCsvImport={handleRunCsvImport}
        />
      )}

      {/* Mode 3: Public Profile Sync */}
      {activeMode === 'username' && (
        <PublicProfileTab
          selectedPlatform={selectedPlatform}
          onSelectPlatform={handleSelectPlatformForUsername}
          usernameInput={usernameInput}
          setUsernameInput={setUsernameInput}
          isProcessing={isProcessing}
          onRunSync={handleRunUsernameSync}
        />
      )}

      {/* Embedded Preview & Diff Card */}
      {previewResult && (
        <SmartImportPreviewCard
          previewResult={previewResult}
          autoRecalcWeighted={autoRecalcWeighted}
          setAutoRecalcWeighted={setAutoRecalcWeighted}
          onCancelPreview={() => setPreviewResult(null)}
          onToggleMetricItem={handleToggleMetricItem}
          onChangeMetricNewValue={handleChangeMetricNewValue}
          onChangeMetricTimeframe={handleChangeMetricTimeframe}
          onChangeMetricPlatform={handleChangeMetricPlatform}
          onChangeDemographicsPlatform={handleChangeDemographicsPlatform}
          onToggleDemographicsSelected={handleToggleDemographicsSelected}
          onConfirmApply={handleConfirmApplyPreview}
        />
      )}
    </div>
  );
};
