import React, { useState, useEffect } from 'react';
import {
  Maximize2,
  Minimize2,
  Download,
  FileText,
  Eye,
  FileCode,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';

interface PdfPreviewProps {
  title: string;
  pdfBase64: string;
  filename: string;
  pagesCount?: number;
  category?: string;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({
  title,
  pdfBase64,
  filename,
  pagesCount,
  category,
}) => {
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [viewMode, setViewMode] = useState<'preview' | 'text'>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState<number>(100);
  const [extractedRawText, setExtractedRawText] = useState<string>('');

  useEffect(() => {
    if (!pdfBase64) return;

    try {
      // Decode base64 to Blob
      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '').trim();
      const binaryString = atob(cleanBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);

      // Extract printable ascii text from PDF streams for text fallback preview
      const matches = binaryString.match(/\((.*?)\)\s*Tj/g);
      if (matches && matches.length > 0) {
        const readable = matches
          .map((m) => m.replace(/^\(/, '').replace(/\)\s*Tj$/, '').replace(/\\([()\\])/g, '$1'))
          .join('\n');
        setExtractedRawText(readable);
      } else {
        setExtractedRawText('ไฟล์ PDF นี้อยู่ในรูปแบบ Binary / Scanned Images ซึ่งระบบ Gemini AI สามารถอ่านได้ผ่าน Multimodal OCR');
      }

      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (e) {
      console.error('Failed to create PDF blob:', e);
    }
  }, [pdfBase64]);

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || 'document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className={`flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'h-full min-h-[480px]'
      }`}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-800/90 border-b border-slate-700/80 backdrop-blur-xs text-slate-200">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-slate-100 truncate" title={title}>
              {title}
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
              <span className="truncate">{filename}</span>
              {pagesCount && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-slate-300">
                    <Layers className="w-2.5 h-2.5" /> {pagesCount} หน้า
                  </span>
                </>
              )}
              {category && (
                <>
                  <span>•</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 text-[9px]">
                    {category}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Toggle between embedded PDF and extracted text */}
          <div className="flex items-center bg-slate-950/60 p-0.5 rounded-lg border border-slate-700/60 text-[11px]">
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                viewMode === 'preview'
                  ? 'bg-blue-600 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="ดูเอกสาร PDF แบบดั้งเดิม"
            >
              <Eye className="w-3 h-3" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => setViewMode('text')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                viewMode === 'text'
                  ? 'bg-blue-600 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="ดูข้อความที่สกัดจากเอกสาร"
            >
              <FileCode className="w-3 h-3" />
              <span>Text</span>
            </button>
          </div>

          {/* Zoom controls for text / preview */}
          {viewMode === 'preview' && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-950/40 px-1 py-0.5 rounded-lg border border-slate-700/40 text-[11px] text-slate-300">
              <button
                onClick={() => setZoom((z) => Math.max(50, z - 15))}
                className="p-1 hover:text-white rounded hover:bg-slate-700"
                title="ย่อขนาด"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className="w-8 text-center text-[10px] font-mono">{zoom}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(175, z + 15))}
                className="p-1 hover:text-white rounded hover:bg-slate-700"
                title="ขยายขนาด"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
              <button
                onClick={() => setZoom(100)}
                className="p-1 hover:text-white rounded hover:bg-slate-700 ml-0.5"
                title="รีเซ็ตขนาด 100%"
              >
                <RotateCcw className="w-2.5 h-2.5" />
              </button>
            </div>
          )}

          {/* Download button */}
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="ดาวน์โหลดไฟล์ PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title={isFullscreen ? 'ย่อหน้าต่างกลับ' : 'เปิดเต็มจอ'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Content Viewer */}
      <div className="flex-1 bg-slate-950 relative overflow-auto flex items-center justify-center p-2">
        {viewMode === 'preview' ? (
          blobUrl ? (
            <div
              className="w-full h-full flex items-center justify-center transition-transform origin-top duration-150"
              style={{ transform: zoom !== 100 ? `scale(${zoom / 100})` : 'none' }}
            >
              <object
                data={`${blobUrl}#toolbar=1&navpanes=0`}
                type="application/pdf"
                className="w-full h-full rounded-md bg-white border border-slate-700/60 shadow-lg min-h-[460px]"
              >
                {/* Fallback iframe */}
                <iframe
                  src={`${blobUrl}#toolbar=1`}
                  title={title}
                  className="w-full h-full rounded-md border-0 min-h-[460px]"
                >
                  <div className="p-8 text-center text-slate-400">
                    <p className="text-sm">เบราว์เซอร์ของคุณยังไม่ได้เปิดใช้งานปลั๊กอิน PDF Viewer</p>
                    <button
                      onClick={handleDownload}
                      className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> ดาวน์โหลดเพื่อเปิดไฟล์ PDF
                    </button>
                  </div>
                </iframe>
              </object>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500 gap-2 p-8">
              <FileText className="w-8 h-8 opacity-40 animate-pulse" />
              <p className="text-xs">กำลังเตรียมการแสดงผล PDF...</p>
            </div>
          )
        ) : (
          /* Text View Mode */
          <div className="w-full h-full p-4 overflow-y-auto bg-slate-900/90 rounded-lg text-slate-200 font-mono text-xs border border-slate-800 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 text-[11px]">
              <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
                <FileCode className="w-3.5 h-3.5" /> ข้อความในเอกสาร (Text Stream)
              </span>
              <span>Gemini AI อ่านไฟล์นี้ผ่าน Multimodal Vision & Text</span>
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed select-text text-slate-300">
              {extractedRawText || 'ไม่มีข้อความ ASCII ในสตรีม'}
            </pre>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-3 py-1.5 bg-slate-900/95 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>เอกสารถูกโหลดและพร้อมสำหรับการประมวลผลด้วย Gemini 3.8 Flash</span>
        </span>
        <span className="hidden sm:inline text-slate-500">Multimodal PDF Support</span>
      </div>
    </div>
  );
};
