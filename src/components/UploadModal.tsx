import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Sparkles
} from 'lucide-react';
import { SAMPLE_DOCUMENTS, SampleDoc } from '../samplePdfs';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDoc: (doc: {
    title: string;
    filename: string;
    pdfBase64: string;
    pagesCount?: number;
    category?: string;
    suggestedQuestions?: string[];
  }) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSelectDoc,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    setErrorMsg(null);

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('กรุณาเลือกไฟล์เอกสารนามสกุล .pdf เท่านั้น');
      return;
    }

    if (file.size > 40 * 1024 * 1024) {
      setErrorMsg('ขนาดไฟล์เกิน 40 MB กรุณาเลือกไฟล์ที่มีขนาดเล็กลง');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.replace(/^data:application\/pdf;base64,/, '');

      onSelectDoc({
        title: file.name.replace(/\.pdf$/i, ''),
        filename: file.name,
        pdfBase64: base64,
        pagesCount: 1, // dynamically estimated
        category: 'เอกสารที่คุณอัปโหลด',
        suggestedQuestions: [
          'กรุณาสรุปภาพรวมและสาระสำคัญของเอกสารนี้',
          'มีเงื่อนไข ข้อตกลง หรือสิ่งที่ต้องปฏิบัติตามอะไรบ้าง?',
          'สกัดตารางตัวเลขและข้อมูลสำคัญในเอกสารนี้',
          'จุดเด่นและข้อควรระวังในเอกสารนี้มีอะไรบ้าง?',
        ],
      });
      setIsProcessing(false);
      onClose();
    };

    reader.onerror = () => {
      setErrorMsg('ไม่สามารถอ่านไฟล์ได้ กรุณาลองใหม่อีกครั้ง');
      setIsProcessing(false);
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSampleClick = (sample: SampleDoc) => {
    onSelectDoc({
      title: sample.titleTh,
      filename: sample.filename,
      pdfBase64: sample.pdfBase64,
      pagesCount: sample.pagesCount,
      category: sample.categoryTh,
      suggestedQuestions: sample.suggestedQuestions,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-blue-600" />
              อัปโหลดเอกสาร PDF หรือเลือกตัวอย่าง
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              รองรับไฟล์ PDF ทุกประเภท (ทั้งภาษาไทย ภาษาอังกฤษ สัญญา รายงาน และไฟล์สแกน)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[0.99]'
                : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shadow-2xs">
                {isProcessing ? (
                  <FileCheck className="w-6 h-6 animate-pulse" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {isProcessing ? 'กำลังอ่านและประมวลผลไฟล์...' : 'ลากไฟล์ PDF มาวางที่นี่ หรือ คลิกเพื่อเลือกไฟล์'}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                รองรับไฟล์ PDF ขนาดสูงสุด 40MB • ระบบรักษาความปลอดภัยข้อมูลแบบเข้ารหัส
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Sample Documents Section */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                หรือทดลองด้วยเอกสารตัวอย่างที่มีข้อมูลจริง:
              </span>
              <span className="text-[10px] text-slate-400">คลิกเพื่อเปิดอ่านทันที</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SAMPLE_DOCUMENTS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSampleClick(sample)}
                  className="text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all shadow-2xs group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {sample.categoryTh}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Layers className="w-2.5 h-2.5" /> {sample.pagesCount} หน้า
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1">
                      {sample.titleTh}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {sample.descriptionTh}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    {sample.tags.slice(0, 3).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[9px] px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
