import React, { useState, useEffect, useMemo } from 'react';
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
  Film,
  Clock,
  Tv,
} from 'lucide-react';
import {
  BrandCollaborationItem,
  BrandSampleClip,
  resolveGoogleDriveImage,
  resolveVideoSource,
} from '../data/creatorData';
import { PlatformBrandIcon } from './ui/PlatformBrandIcon';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface BrandDetailModalProps {
  brand: BrandCollaborationItem | null;
  creatorName: string;
  onClose: () => void;
  onBookSimilarCampaign: (brand: BrandCollaborationItem) => void;
  onQuickEditBrand?: (brand: BrandCollaborationItem) => void;
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Internal Content Component rendered inside AnimatePresence to ensure clean outro transitions
const BrandDetailModalContent: React.FC<{
  brand: BrandCollaborationItem;
  creatorName: string;
  onClose: () => void;
  onBookSimilarCampaign: (brand: BrandCollaborationItem) => void;
  onQuickEditBrand?: (brand: BrandCollaborationItem) => void;
}> = ({
  brand,
  creatorName,
  onClose,
  onBookSimilarCampaign,
  onQuickEditBrand,
}) => {
  const [logoImgError, setLogoImgError] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string>(() => {
    return brand.sampleClips?.[0]?.id || '';
  });
  const [activeCampaignFilter, setActiveCampaignFilter] = useState<string>('all');
  const [isPlayingInlineVideo, setIsPlayingInlineVideo] = useState(false);

  // Lock both documentElement (<html>) and document.body scroll while modal is open
  useLockBodyScroll(true);

  // Handle Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const resolvedLogo = brand.logoUrl ? resolveGoogleDriveImage(brand.logoUrl) : '';
  const showLogoImage = Boolean(resolvedLogo && !logoImgError);
  const brandColor = brand.brandColor || '#4C1D95';

  const sampleClips = useMemo(() => brand.sampleClips || [], [brand.sampleClips]);

  // Extract unique campaigns if clips specify campaignName
  const uniqueCampaigns = useMemo(() => {
    const names = sampleClips
      .map((c) => c.campaignName)
      .filter((name): name is string => Boolean(name && name.trim()));
    return Array.from(new Set(names));
  }, [sampleClips]);

  const filteredClips = useMemo(() => {
    if (activeCampaignFilter === 'all') return sampleClips;
    return sampleClips.filter((c) => c.campaignName === activeCampaignFilter);
  }, [sampleClips, activeCampaignFilter]);

  // Active highlighted clip
  const activeClip: BrandSampleClip | undefined = useMemo(() => {
    return (
      filteredClips.find((c) => c.id === selectedClipId) ||
      filteredClips[0] ||
      sampleClips[0]
    );
  }, [filteredClips, selectedClipId, sampleClips]);

  // Video source resolution for inline preview
  const videoSourceInfo = useMemo(() => {
    if (!activeClip) return { type: 'none' as const };
    const videoUrlToTest = activeClip.driveVideoUrl || activeClip.url;
    return resolveVideoSource(videoUrlToTest);
  }, [activeClip]);

  const handleSelectClip = (clipId: string) => {
    setSelectedClipId(clipId);
    setIsPlayingInlineVideo(false);
  };

  return (
    <motion.div
      key={`brand-modal-backdrop-${brand.id}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md overscroll-contain"
      onClick={onClose}
    >
      <motion.div
        key={`brand-modal-card-${brand.id}`}
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl xl:max-w-5xl 2xl:max-w-6xl max-h-[90vh] bg-linear-to-b from-white via-[#FAF9FC] to-[#F5F3FF] border border-white/80 rounded-3xl shadow-[0_32px_80px_-16px_rgba(30,11,80,0.45)] ring-1 ring-slate-900/10 overflow-hidden flex flex-col relative text-left"
      >
        {/* Top 1.5px Specular Glass Highlight */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-linear-to-r from-transparent via-white to-transparent pointer-events-none z-30" />

        {/* Studio Ambient Refraction Glows */}
        <div
          className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: brandColor }}
        />
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-violet-400/15 blur-3xl" />

        {/* iOS Glass Shimmer Beam Periodic Sweep */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 overflow-hidden z-20 select-none">
          <motion.div
            animate={{ x: ['-150%', '550%'] }}
            transition={{
              duration: 5.2,
              repeat: Infinity,
              ease: [0.4, 0.0, 0.2, 1],
              repeatDelay: 3.5,
            }}
            className="w-48 h-full bg-linear-to-r from-transparent via-white/20 to-transparent skew-x-[-24deg]"
          />
        </div>

        {/* HEADER: Brand Identity & Quick Actions */}
        <div className="shrink-0 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-5 sm:px-7 py-4.5 flex items-start justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4 min-w-0">
            {/* Brand Logo Frosted Bezel */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border border-slate-200/90 flex items-center justify-center shrink-0 overflow-hidden shadow-xs relative bg-white"
              style={{
                boxShadow: `0 4px 16px -2px ${brandColor}20`,
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
                <div
                  className="w-full h-full flex items-center justify-center font-bold text-lg sm:text-xl tracking-tight text-white"
                  style={{ backgroundColor: brandColor }}
                >
                  {brand.brandName.slice(0, 3).toUpperCase()}
                </div>
              )}
            </motion.div>

            <div className="min-w-0">
              {/* Category & Repeat Badge */}
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 border border-violet-200/60 px-2.5 py-0.5 rounded-md">
                  {brand.category}
                </span>

                {brand.isRepeatPartner ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                    <Repeat className="w-3 h-3 text-emerald-600" />
                    <span>ลูกค้าประจำ (ร่วมงานซ้ำ {brand.campaignCount} ครั้ง)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                    ร่วมงานแล้ว {brand.campaignCount} แคมเปญ
                  </span>
                )}
              </div>

              {/* Title & Thai Name */}
              <h3 className="text-xl sm:text-2xl font-bold text-[#1E1B4B] tracking-tight truncate flex items-baseline gap-2">
                <span>{brand.brandName}</span>
                {brand.brandNameTh && (
                  <span className="text-xs sm:text-sm font-normal text-slate-500 truncate">
                    ({brand.brandNameTh})
                  </span>
                )}
              </h3>

              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-violet-600" />
                <span>แคมเปญล่าสุด: {brand.latestPeriod}</span>
              </p>
            </div>
          </div>

          {/* Action buttons (Quick Edit & Close) */}
          <div className="flex items-center gap-2 shrink-0">
            {onQuickEditBrand && (
              <button
                type="button"
                onClick={() => onQuickEditBrand(brand)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-violet-200 bg-violet-50/70 hover:bg-violet-100/80 text-violet-800 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                title="แก้ไขข้อมูลแบรนด์นี้ใน CMS"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-violet-700" />
                <span className="hidden sm:inline">แก้ไขข้อมูลใน CMS</span>
              </button>
            )}

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              aria-label="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* SCROLLABLE CASE STUDY CONTENT */}
        <div className="flex-1 min-h-0 overflow-y-auto slim-scroll p-5 sm:p-7 space-y-6 relative z-10 overscroll-contain">
          {/* 1. KEY CAMPAIGN PERFORMANCE METRICS */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white/80 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-semibold">
                <Repeat className="w-3.5 h-3.5 text-violet-600" />
                <span>จำนวนแคมเปญ</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono-num text-[#1E1B4B]">
                {brand.campaignCount}{' '}
                <span className="text-xs font-semibold text-slate-500">ครั้ง</span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-semibold">
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                <span>ยอดวิวสะสม</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono-num text-violet-700">
                {brand.totalViews}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-semibold">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Engagement เฉลี่ย</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono-num text-emerald-700">
                {brand.avgEngagement}
              </div>
            </div>
          </div>

          {/* 2. VIP MASTER-DETAIL MULTI-CLIP SHOWCASE */}
          <div className="bg-white/95 rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
            {/* Header: Title + Campaign Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Film className="w-4 h-4 text-violet-700" />
                  <span>
                    ตัวอย่างคลิปผลงาน ({sampleClips.length} คลิปสำหรับแบรนด์ {brand.brandName})
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  กดเลือกคลิปเพื่อดูพรีวิวและรายละเอียดวัตถุประสงค์ของแต่ละคลิป
                </p>
              </div>

              {/* Multi-Campaign Selector Tabs (if brand has multiple campaigns) */}
              {uniqueCampaigns.length > 1 && (
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveCampaignFilter('all')}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      activeCampaignFilter === 'all'
                        ? 'bg-violet-700 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ทั้งหมด ({sampleClips.length})
                  </button>
                  {uniqueCampaigns.map((campName) => (
                    <button
                      key={campName}
                      type="button"
                      onClick={() => setActiveCampaignFilter(campName)}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        activeCampaignFilter === campName
                          ? 'bg-violet-700 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {campName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2-Column Master-Detail Layout */}
            {sampleClips.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* LEFT (7 Cols): Video Stage / Inline Player */}
                <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl bg-[#0F0C20] text-white p-4 relative overflow-hidden border border-violet-900/40 shadow-inner">
                  {/* Subtle Video Studio Ambient Line */}
                  <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-violet-400/30 to-transparent pointer-events-none" />

                  {/* Stage Header */}
                  <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
                    <div className="flex items-center gap-2">
                      <PlatformBrandIcon platform={activeClip?.platform || 'TikTok'} size="sm" />
                      <span className="text-xs font-bold text-white tracking-wide">
                        {activeClip?.platform}
                      </span>
                      {activeClip?.campaignName && (
                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-violet-200 text-[10px] font-medium truncate max-w-[180px]">
                          {activeClip.campaignName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-amber-300 font-mono-num font-bold">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{activeClip?.views} วิว</span>
                    </div>
                  </div>

                  {/* Video Player Display Stage */}
                  <div className="relative rounded-xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center min-h-[220px] sm:min-h-[260px] 2xl:min-h-[300px]">
                    {isPlayingInlineVideo && videoSourceInfo.type === 'drive' ? (
                      <iframe
                        src={videoSourceInfo.embedUrl}
                        title={activeClip?.title}
                        allow="autoplay; fullscreen"
                        className="w-full h-full min-h-[260px] border-0"
                      />
                    ) : isPlayingInlineVideo && videoSourceInfo.type === 'youtube' ? (
                      <iframe
                        src={videoSourceInfo.embedUrl}
                        title={activeClip?.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full min-h-[260px] border-0"
                      />
                    ) : isPlayingInlineVideo && videoSourceInfo.type === 'direct' ? (
                      <video
                        src={videoSourceInfo.src}
                        controls
                        autoPlay
                        playsInline
                        className="w-full h-full max-h-[320px] object-contain"
                      />
                    ) : (
                      /* High-Fidelity Studio Cover with Play Button */
                      <div className="relative w-full h-full p-6 flex flex-col items-center justify-center text-center group cursor-pointer"
                        onClick={() => {
                          if (videoSourceInfo.type !== 'none') {
                            setIsPlayingInlineVideo(true);
                          } else if (activeClip?.url) {
                            window.open(activeClip.url, '_blank');
                          }
                        }}
                      >
                        {/* Ambient Gradient Background */}
                        <div className="absolute inset-0 bg-linear-to-tr from-violet-950 via-[#1E1B4B] to-slate-900 opacity-90" />

                        {/* Floating Play Button */}
                        <motion.div
                          whileHover={{ scale: 1.12 }}
                          whileTap={{ scale: 0.94 }}
                          className="relative z-10 w-16 h-16 rounded-full bg-violet-600/90 text-white flex items-center justify-center shadow-[0_0_24px_rgba(124,58,237,0.5)] border border-violet-400/40 group-hover:bg-violet-500 transition-colors"
                        >
                          <Play className="w-7 h-7 fill-white ml-1" />
                        </motion.div>

                        <div className="relative z-10 mt-3 max-w-sm">
                          <p className="text-xs font-bold text-white line-clamp-2">
                            {activeClip?.title}
                          </p>
                          <p className="text-[11px] text-violet-300 mt-1">
                            {videoSourceInfo.type !== 'none'
                              ? 'กดเพื่อเล่นวิดีโอตัวอย่างบนหน้านี้'
                              : 'คลิกเพื่อเปิดดูคลิปต้นฉบับ'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stage Bottom Actions */}
                  <div className="mt-3 flex items-center justify-between gap-2 relative z-10 text-xs">
                    <span className="text-[11px] text-violet-300 flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>ความยาว: {activeClip?.duration || 'คลิปสั้น'}</span>
                      <span className="text-white/20">·</span>
                      <span>{activeClip?.formatTag}</span>
                    </span>

                    {activeClip?.url && (
                      <a
                        href={activeClip.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-white transition-colors hover:underline"
                      >
                        <span>เปิดบน {activeClip.platform}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* RIGHT (5 Cols): Playlist Selector & Dedicated Clip Description */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
                  {/* Clip Selection Playlist (3-4 VIP Clips) */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 tracking-wide block">
                      เลือกดูคลิปในแคมเปญ:
                    </span>

                    <div className="space-y-2 max-h-[220px] overflow-y-auto slim-scroll pr-1">
                      {filteredClips.map((clip, idx) => {
                        const isSelected = clip.id === activeClip?.id;

                        return (
                          <motion.button
                            key={clip.id}
                            type="button"
                            onClick={() => handleSelectClip(clip.id)}
                            whileHover={{ x: 2 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 relative ${
                              isSelected
                                ? 'bg-violet-50/90 border-violet-500 shadow-2xs'
                                : 'bg-slate-50/80 border-slate-200/80 hover:bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? 'bg-violet-700 text-white'
                                    : 'bg-white border border-slate-200 text-slate-600'
                                }`}
                              >
                                {isSelected ? (
                                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                ) : (
                                  <span className="text-xs font-bold">{idx + 1}</span>
                                )}
                              </div>

                              <div className="min-w-0">
                                <p
                                  className={`text-xs font-bold truncate ${
                                    isSelected ? 'text-violet-950' : 'text-slate-800'
                                  }`}
                                >
                                  {clip.title}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                  {clip.platform} · {clip.views}
                                </p>
                              </div>
                            </div>

                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-violet-600 shrink-0" />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dedicated Editorial Description Box for Selected Clip */}
                  <div className="p-3.5 rounded-xl bg-linear-to-br from-violet-50/60 via-slate-50 to-white border border-violet-100 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-violet-800">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>บทบาทและผลลัพธ์ของคลิปนี้:</span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {activeClip?.description ||
                        brand.campaignHighlight ||
                        'คลิปคอนเทนต์สร้างยอดวิวและการรับรู้แบรนด์อย่างมีประสิทธิภาพ'}
                    </p>

                    <div className="pt-2 border-t border-violet-100/80 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                      <span className="font-semibold text-slate-700">สไตล์:</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                        {activeClip?.formatTag}
                      </span>
                      {activeClip?.campaignName && (
                        <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                          {activeClip.campaignName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                ยังไม่มีข้อมูลคลิปตัวอย่างในระบบ
              </div>
            )}
          </div>

          {/* 3. CAMPAIGN STRATEGIC HIGHLIGHT & DELIVERABLES */}
          <div className="bg-white/95 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-violet-800 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>ไฮไลต์และผลลัพธ์ภาพรวมแคมเปญ (Campaign Impact)</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                {brand.campaignHighlight}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-violet-600" />
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

          {/* 4. CLIENT TESTIMONIAL / AGENCY FEEDBACK */}
          {brand.clientQuote && (
            <div className="bg-linear-to-br from-[#1E1B4B] via-[#2A1658] to-[#160B35] text-white rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-md">
              <Quote className="w-8 h-8 text-amber-300/30 mb-2" />
              <p className="text-sm sm:text-base leading-relaxed text-slate-100 mb-3 font-medium">
                “{brand.clientQuote}”
              </p>
              <div className="text-xs font-bold text-amber-300">
                — {brand.clientRole || `ทีมการตลาด ${brand.brandName}`}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM STICKY ACTION FOOTER */}
        <div className="shrink-0 bg-white border-t border-slate-200/90 px-5 sm:px-7 py-3.5 flex flex-wrap items-center justify-between gap-3 relative z-20">
          <div className="text-xs text-slate-600 font-medium">
            ต้องการแคมเปญสไตล์เดียวกับ{' '}
            <strong className="text-slate-900 font-bold">{brand.brandName}</strong> ร่วมกับช่อง{' '}
            {creatorName}?
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => onBookSimilarCampaign(brand)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-violet-700 hover:bg-violet-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <span>จองแพ็กเกจแนวเดียวกับแบรนด์นี้</span>
              <ArrowUpRight className="w-4 h-4 text-amber-300" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const BrandDetailModal: React.FC<BrandDetailModalProps> = (props) => {
  return (
    <AnimatePresence mode="wait">
      {props.brand && (
        <BrandDetailModalContent
          key={props.brand.id}
          brand={props.brand}
          creatorName={props.creatorName}
          onClose={props.onClose}
          onBookSimilarCampaign={props.onBookSimilarCampaign}
          onQuickEditBrand={props.onQuickEditBrand}
        />
      )}
    </AnimatePresence>
  );
};
