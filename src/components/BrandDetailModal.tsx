import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Repeat,
  Eye,
  TrendingUp,
  Calendar,
  Sparkles,
  ExternalLink,
  Play,
  Quote,
  CheckCircle2,
  SlidersHorizontal,
  ArrowUpRight,
  Layers,
} from 'lucide-react';
import { BrandCollaborationItem, resolveGoogleDriveImage } from '../data/creatorData';

interface BrandDetailModalProps {
  brand: BrandCollaborationItem | null;
  creatorName: string;
  onClose: () => void;
  onBookSimilarCampaign: (brand: BrandCollaborationItem) => void;
  onQuickEditBrand?: (brand: BrandCollaborationItem) => void;
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const BrandDetailModal: React.FC<BrandDetailModalProps> = ({
  brand,
  creatorName,
  onClose,
  onBookSimilarCampaign,
  onQuickEditBrand,
}) => {
  const [logoImgError, setLogoImgError] = useState(false);

  if (!brand) return null;

  const resolvedLogo = brand.logoUrl ? resolveGoogleDriveImage(brand.logoUrl) : '';
  const showLogoImage = Boolean(resolvedLogo && !logoImgError);
  const brandColor = brand.brandColor || '#4C1D95';

  return (
    <AnimatePresence>
      {brand && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-slate-950/65 backdrop-blur-xs"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[88vh] bg-[#FAF8F5] border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Top Brand Identity Banner */}
            <div className="shrink-0 bg-white border-b border-slate-200 px-5 sm:px-7 py-5 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border border-slate-200/90 flex items-center justify-center shrink-0 overflow-hidden shadow-xs"
                  style={{
                    backgroundColor: showLogoImage ? '#FFFFFF' : `${brandColor}12`,
                  }}
                >
                  {showLogoImage ? (
                    <img
                      src={resolvedLogo}
                      alt={brand.brandName}
                      onError={() => setLogoImgError(true)}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <span
                      className="text-base sm:text-lg font-bold tracking-tight text-center px-1.5 leading-tight"
                      style={{ color: brandColor }}
                    >
                      {brand.brandName.slice(0, 10)}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                      {brand.category}
                    </span>
                    {brand.isRepeatPartner ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
                        <Repeat className="w-3 h-3" />
                        ลูกค้าประจำ (ร่วมงานซ้ำ {brand.campaignCount} ครั้ง)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-violet-50 border border-violet-200 text-violet-700 text-[11px] font-semibold">
                        ร่วมงานแล้ว {brand.campaignCount} แคมเปญ
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
                    {brand.brandName}
                    {brand.brandNameTh && (
                      <span className="text-sm sm:text-base font-normal text-slate-500 ml-2">
                        ({brand.brandNameTh})
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>อัปเดตแคมเปญล่าสุด: {brand.latestPeriod}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onQuickEditBrand && (
                  <button
                    type="button"
                    onClick={() => onQuickEditBrand(brand)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                    title="แก้ไขข้อมูลแบรนด์นี้ใน CMS"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-violet-700" />
                    <span className="hidden sm:inline">แก้ไขข้อมูล</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="ปิดหน้าต่าง"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Case Study Content */}
            <div className="flex-1 min-h-0 overflow-y-auto slim-scroll p-5 sm:p-7 space-y-6">
              {/* 3 Key Campaign Metrics */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Repeat className="w-3.5 h-3.5 text-violet-600" />
                    <span>จำนวนครั้งที่ร่วมงาน</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono-num text-slate-900">
                    {brand.campaignCount} <span className="text-xs font-semibold text-slate-500">แคมเปญ</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ยอดวิวรวมแคมเปญ</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono-num text-slate-900">
                    {brand.totalViews}
                  </div>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                    <span>Engagement เฉลี่ย</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono-num text-emerald-700">
                    {brand.avgEngagement}
                  </div>
                </div>
              </div>

              {/* Campaign Highlight & Deliverables Summary */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-violet-800 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>ไฮไลต์และผลลัพธ์แคมเปญ (Campaign Impact)</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {brand.campaignHighlight}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>แนวคลิปที่ผลิตให้แบรนด์ (Content Styles)</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {brand.videoStyles.map((style, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-violet-50/80 border border-violet-200/70 text-violet-900 text-xs font-semibold"
                        >
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ขอบเขตงานที่ส่งมอบ (Deliverables)</span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200/70 rounded-xl px-3 py-2">
                      {brand.deliverablesSummary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sample Clips List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Play className="w-4 h-4 text-violet-700 fill-violet-700" />
                    <span>ตัวอย่างคลิปผลงานที่ทำร่วมกับ {brand.brandName}</span>
                  </h4>
                  <span className="text-xs text-slate-500">
                    คลิกเพื่อเปิดดูคลิปต้นฉบับ
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {brand.sampleClips && brand.sampleClips.length > 0 ? (
                    brand.sampleClips.map((clip) => (
                      <a
                        key={clip.id}
                        href={clip.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 hover:border-violet-400 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[#1E1B4B] text-white flex items-center justify-center shrink-0 group-hover:bg-violet-700 transition-colors">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                              <span className="text-[11px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md">
                                {clip.platform}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-500">
                                {clip.formatTag}
                              </span>
                              {clip.duration && (
                                <span className="text-[11px] font-mono-num text-slate-400">
                                  · {clip.duration}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-bold text-slate-900 group-hover:text-violet-800 transition-colors truncate">
                              {clip.title}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="text-xs font-mono-num font-bold text-slate-900">
                              {clip.views} วิว
                            </div>
                            <div className="text-[11px] text-slate-400">ดูคลิปจริง</div>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-violet-100 text-slate-600 group-hover:text-violet-700 flex items-center justify-center transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </div>
                        </div>
                      </a>
                    ))
                  ) : (
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 text-center">
                      {onQuickEditBrand
                        ? 'สามารถกดเพิ่มลิงก์คลิปตัวอย่างของแบรนด์นี้ได้ในเมนูจัดการ CMS'
                        : 'สามารถสอบถามตัวอย่างคลิปแคมเปญเพิ่มเติมได้ผ่านทาง LINE หรือใบเสนอราคา'}
                    </div>
                  )}
                </div>
              </div>

              {/* Client Feedback / Quote (if available) */}
              {brand.clientQuote && (
                <div className="bg-gradient-to-br from-[#1E1B4B] to-[#311042] text-white rounded-2xl p-5 relative overflow-hidden">
                  <Quote className="w-8 h-8 text-amber-300/30 mb-2" />
                  <p className="text-sm sm:text-base leading-relaxed text-slate-100 mb-3">
                    “{brand.clientQuote}”
                  </p>
                  <div className="text-xs font-semibold text-amber-300">
                    — {brand.clientRole || `ทีมการตลาด ${brand.brandName}`}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Footer */}
            <div className="shrink-0 bg-white border-t border-slate-200 px-5 sm:px-7 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                ต้องการทำแคมเปญสไตล์เดียวกับ <strong className="text-slate-800">{brand.brandName}</strong> ร่วมกับช่อง {creatorName}?
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
                <button
                  type="button"
                  onClick={() => onBookSimilarCampaign(brand)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1E1B4B] hover:bg-violet-900 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  <span>จองแพ็กเกจแนวเดียวกับแบรนด์นี้</span>
                  <ArrowUpRight className="w-4 h-4 text-amber-300" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
