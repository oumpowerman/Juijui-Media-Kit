import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { EASE_OUT_EXPO } from './sections/motionVariants';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface OriginalPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  creatorName: string;
}

const PDF_PAGES = [
  { page: 1, title: '01 · Profile & Follower Overview', src: '/assets/juijui/page-1.png' },
  { page: 2, title: '02 · สถิติสำคัญแยกแพลตฟอร์ม & ข้อมูลผู้ชม', src: '/assets/juijui/page-2.png' },
  { page: 3, title: '03 · Content Profile & ผลงานไวรัล', src: '/assets/juijui/page-3.png' },
  { page: 4, title: '04 · อัตราการให้บริการ (Starter / Standard / Premium)', src: '/assets/juijui/page-4.png' },
  { page: 5, title: '05 · บริการรวมในแพ็กเกจ (ฟรี) & บริการเสริม (Add-ons)', src: '/assets/juijui/page-5.png' },
  { page: 6, title: '06 · ช่องทางติดต่องาน (Contact Page)', src: '/assets/juijui/page-6.png' },
];

export const OriginalPdfModal: React.FC<OriginalPdfModalProps> = ({
  isOpen,
  onClose,
  pdfUrl,
  creatorName,
}) => {
  useLockBodyScroll(isOpen);
  const [activePage, setActivePage] = useState(0);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const [viewMode, setViewMode] = useState<'slides' | 'all'>('slides');

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `Media_Kit_2026_${creatorName.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleChangePage = (nextIndex: number) => {
    setSlideDirection(nextIndex >= activePage ? 1 : -1);
    setActivePage(nextIndex);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="pdf-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          onClick={onClose}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            key="pdf-modal-dialog"
            initial={{ opacity: 0, y: 52, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 36, scale: 0.95 }}
            transition={{ duration: 0.46, ease: EASE_OUT_EXPO }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl 2xl:max-w-6xl max-h-[92vh] flex flex-col overflow-hidden shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-5 h-5 text-violet-700 shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 truncate">
                    ไฟล์ Media Kit 2026 ต้นฉบับ — {creatorName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    สามารถเลื่อนดูสไลด์ทั้ง 6 หน้า หรือดาวน์โหลดไฟล์ PDF เพื่อแนบเอกสารจัดซื้อของบริษัทได้ทันที
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden sm:flex items-center p-1 bg-slate-200/70 rounded-lg text-xs">
                  <button
                    onClick={() => setViewMode('slides')}
                    className={`relative px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      viewMode === 'slides' ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {viewMode === 'slides' && (
                      <motion.span
                        layoutId="pdfModalViewTab"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="absolute inset-0 bg-white rounded-md shadow-2xs -z-0"
                      />
                    )}
                    <span className="relative z-10">ดูทีละหน้า ({activePage + 1}/6)</span>
                  </button>
                  <button
                    onClick={() => setViewMode('all')}
                    className={`relative px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      viewMode === 'all' ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {viewMode === 'all' && (
                      <motion.span
                        layoutId="pdfModalViewTab"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="absolute inset-0 bg-white rounded-md shadow-2xs -z-0"
                      />
                    )}
                    <span className="relative z-10">ดูทั้งหมด 6 หน้า</span>
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-700 hover:bg-violet-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด PDF</span>
                </motion.button>

                <motion.button
                  whileHover={{ rotate: 90, scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={onClose}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  aria-label="ปิดหน้าต่าง"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
              <AnimatePresence mode="wait">
                {viewMode === 'slides' ? (
                  <motion.div
                    key="slides-mode"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-full max-w-4xl rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-lg relative">
                      <AnimatePresence mode="wait" custom={slideDirection}>
                        <motion.img
                          key={PDF_PAGES[activePage].page}
                          custom={slideDirection}
                          initial={{ opacity: 0, x: slideDirection * 48, scale: 0.98 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: slideDirection * -48, scale: 0.98 }}
                          transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                          src={PDF_PAGES[activePage].src}
                          alt={PDF_PAGES[activePage].title}
                          referrerPolicy="no-referrer"
                          className="w-full h-auto object-contain"
                        />
                      </AnimatePresence>
                    </div>

                    {/* Slide Controls */}
                    <div className="flex items-center justify-between w-full max-w-4xl mt-4 gap-4">
                      <motion.button
                        whileHover={{ x: -2 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleChangePage(Math.max(0, activePage - 1))}
                        disabled={activePage === 0}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>หน้าก่อนหน้า</span>
                      </motion.button>

                      <div className="text-center">
                        <p className="text-xs font-semibold text-white">
                          {PDF_PAGES[activePage].title}
                        </p>
                        <div className="flex items-center justify-center gap-1.5 mt-2">
                          {PDF_PAGES.map((item, idx) => (
                            <button
                              key={item.page}
                              onClick={() => handleChangePage(idx)}
                              className={`h-2 rounded-full transition-all cursor-pointer ${
                                activePage === idx
                                  ? 'w-6 bg-violet-400'
                                  : 'w-2 bg-slate-600 hover:bg-slate-400'
                              }`}
                              aria-label={`หน้าที่ ${item.page}`}
                            />
                          ))}
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() =>
                          handleChangePage(Math.min(PDF_PAGES.length - 1, activePage + 1))
                        }
                        disabled={activePage === PDF_PAGES.length - 1}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <span>หน้าถัดไป</span>
                        <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="grid-mode"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.38, ease: EASE_OUT_EXPO }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto"
                  >
                    {PDF_PAGES.map((item, idx) => (
                      <motion.div
                        key={item.page}
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          duration: 0.45,
                          delay: idx * 0.06,
                          ease: EASE_OUT_EXPO,
                        }}
                        whileHover={{ y: -5, scale: 1.01 }}
                        onClick={() => {
                          handleChangePage(idx);
                          setViewMode('slides');
                        }}
                        className="group cursor-pointer rounded-xl overflow-hidden border border-slate-700 bg-slate-950 hover:border-violet-400 transition-colors"
                      >
                        <img
                          src={item.src}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-auto object-contain"
                        />
                        <div className="px-4 py-2.5 bg-slate-900 text-xs font-semibold text-slate-200 flex items-center justify-between">
                          <span>{item.title}</span>
                          <span className="text-violet-400">คลิกเพื่อขยาย</span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>เอกสารต้นฉบับ: Media Kit 2026 — จุ๊ยจุ๊ย | JUIJUI</span>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-violet-700 hover:underline"
              >
                <span>เปิดไฟล์ PDF ในแท็บใหม่</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
