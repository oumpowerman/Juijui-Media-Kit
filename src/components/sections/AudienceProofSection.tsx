import React, { useRef, useState } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from 'motion/react';
import {
  Plus,
  Building2,
  Heart,
  MessageSquareHeart,
  ChevronLeft,
  ChevronRight,
  Star,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { CreatorProfile } from '../../data/creatorData';
import { LineChatBrandCard } from './testimonials/LineChatBrandCard';
import { SocialMediaCommentCard } from './testimonials/SocialMediaCommentCard';
import { AudienceProofBackgroundCanvas } from './testimonials/AudienceProofBackgroundCanvas';
import {
  EASE_OUT_EXPO,
  REPEAT_VIEWPORT,
  fadeUpVariant,
  slideFromLeftVariant,
  slideFromRightVariant,
  staggerContainer,
} from './motionVariants';

export type CommentFilterType = 'all' | 'ลูกค้าแบรนด์ / เอเจนซี่' | 'แฟนคลับ / ผู้ชม';

interface AudienceProofSectionProps {
  currentCreator: CreatorProfile;
  commentFilter: CommentFilterType;
  onSelectCommentFilter: (filter: CommentFilterType) => void;
  onOpenAdmin?: () => void;
}

const PAGE_SIZE = 6;

export const AudienceProofSection: React.FC<AudienceProofSectionProps> = ({
  currentCreator,
  commentFilter,
  onSelectCommentFilter,
  onOpenAdmin,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageDirection, setPageDirection] = useState<number>(1);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 26,
    restDelta: 0.001,
  });

  // Multi-layer Parallax Transforms strictly for Background Canvas
  const waveParallaxY = useTransform(smoothProgress, [0, 1], [52, -52]);
  const leftBubblesParallaxY = useTransform(smoothProgress, [0, 1], [-40, 45]);
  const rightBubblesParallaxY = useTransform(smoothProgress, [0, 1], [45, -40]);

  const brandReviewsCount = currentCreator.commentProofs.filter(
    (c) => c.authorType === 'ลูกค้าแบรนด์ / เอเจนซี่'
  ).length;
  const fanCommentsCount = currentCreator.commentProofs.filter(
    (c) => c.authorType === 'แฟนคลับ / ผู้ชม'
  ).length;

  const filteredComments = currentCreator.commentProofs.filter((c) => {
    if (commentFilter === 'all') return true;
    return c.authorType === commentFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filteredComments.length / PAGE_SIZE));
  const activePage = Math.min(currentPage, totalPages);

  // Pre-slice all pages so they can occupy the same CSS Grid cell (col-start-1 row-start-1).
  // This guarantees the container height is permanently equal to the tallest page,
  // eliminating 100% of layout reflows, scroll jumps, and pagination bar shifts!
  const allPages = Array.from({ length: totalPages }, (_, pageIdx) => {
    const items = filteredComments.slice(
      pageIdx * PAGE_SIZE,
      (pageIdx + 1) * PAGE_SIZE
    );
    return {
      pageNum: pageIdx + 1,
      items,
      leftColItems: items.filter((_, idx) => idx % 2 === 0),
      rightColItems: items.filter((_, idx) => idx % 2 === 1),
    };
  });

  const handleSelectTab = (filter: CommentFilterType) => {
    onSelectCommentFilter(filter);
    setCurrentPage(1);
    setPageDirection(1);
  };

  const goToPage = (nextPage: number) => {
    if (nextPage === activePage || nextPage < 1 || nextPage > totalPages) return;
    setPageDirection(nextPage > activePage ? 1 : -1);
    setCurrentPage(nextPage);
  };

  const FILTER_TABS: {
    id: CommentFilterType;
    label: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    {
      id: 'all',
      label: `ทั้งหมด (${currentCreator.commentProofs.length})`,
      icon: MessageSquareHeart,
    },
    {
      id: 'ลูกค้าแบรนด์ / เอเจนซี่',
      label: `รีวิวจากแบรนด์ (${brandReviewsCount})`,
      icon: Building2,
    },
    {
      id: 'แฟนคลับ / ผู้ชม',
      label: `คอมเมนต์แฟนคลับ (${fanCommentsCount})`,
      icon: Heart,
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="comments"
      className="relative py-16 border-b border-slate-200/80 bg-linear-to-b from-white via-[#F8FAFC]/80 to-white overflow-hidden [overflow-anchor:none]"
    >
      {/* 1. THEMATIC BACKGROUND CANVAS: 5-Star Rating Motifs, Pop-up Message Bubbles & Engagement Waves */}
      <AudienceProofBackgroundCanvas
        waveParallaxY={waveParallaxY}
        leftBubblesParallaxY={leftBubblesParallaxY}
        rightBubblesParallaxY={rightBubblesParallaxY}
      />

      <div className="relative z-10 w-full max-w-7xl xl:max-w-[94vw] 2xl:max-w-[95vw] min-[2400px]:max-w-[2280px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-6 2xl:px-8 space-y-7 2xl:space-y-9 [overflow-anchor:none]">
        {/* 2. HEADER: Title slides from left, Filter Tabs slide from right */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={REPEAT_VIEWPORT}
            variants={slideFromLeftVariant}
          >
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>
                {currentCreator.sectionHeaders?.proofBadge ||
                  '04. 5-STAR BRAND TESTIMONIALS & AUDIENCE ENGAGEMENT'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1E1B4B] mt-1">
              {currentCreator.sectionHeaders?.proofTitle ||
                'เสียงตอบรับจากผู้ชม & รีวิว 5 ดาวจากแบรนด์'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {currentCreator.sectionHeaders?.proofSubtitle ||
                `ฟีดแบ็กจริงหลังจบแคมเปญจากลูกค้าแบรนด์และคอมเมนต์ยอดไลค์สูงของช่อง ${currentCreator.nameTh}`}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={REPEAT_VIEWPORT}
            variants={slideFromRightVariant}
            className="flex flex-wrap items-center gap-2"
          >
            <div className="flex items-center gap-1 p-1 bg-slate-100/95 backdrop-blur-md border border-slate-200/80 rounded-xl text-xs shadow-2xs">
              {FILTER_TABS.map((tab) => {
                const isActive = commentFilter === tab.id;
                const TabIcon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => handleSelectTab(tab.id)}
                    className={`relative px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 select-none ${
                      isActive ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="commentFilterPill"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="absolute inset-0 bg-white rounded-lg shadow-2xs border border-slate-200/60 -z-0"
                      />
                    )}
                    <TabIcon className="w-3.5 h-3.5 relative z-10 text-violet-700" />
                    <span className="relative z-10">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {onOpenAdmin && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มคอมเมนต์ / แนบรูปแคป</span>
              </motion.button>
            )}
          </motion.div>
        </div>

        {/* 3. 5.0-STAR BRAND & AUDIENCE SATISFACTION SUMMARY STRIP */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={REPEAT_VIEWPORT}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 2xl:gap-6"
        >
          {/* Highlight 1: 5.0 / 5.0 Brand Satisfaction Score */}
          <motion.div
            variants={fadeUpVariant}
            custom={0}
            whileHover={{ y: -4, transition: { duration: 0.18, ease: 'easeOut' } }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelectTab('ลูกค้าแบรนด์ / เอเจนซี่')}
            className="group relative bg-white/95 backdrop-blur-xl border border-amber-200/80 hover:border-amber-400/90 rounded-2xl p-4 sm:p-5 shadow-[0_10px_25px_-10px_rgba(245,158,11,0.12)] hover:shadow-[0_16px_32px_-10px_rgba(245,158,11,0.22)] transition-[border-color,box-shadow] duration-200 cursor-pointer overflow-hidden will-change-transform"
          >
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-linear-to-r from-transparent via-amber-400/70 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-600">
                {currentCreator.proofSummaryConfig?.ratingLabel ||
                  'คะแนนความพึงพอใจจากแบรนด์และเอเจนซี่'}
              </span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-md shrink-0">
                5-STAR RATING
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-2xl sm:text-3xl font-bold font-mono-num text-slate-900 tracking-tight">
                {currentCreator.proofSummaryConfig?.ratingScore || '5.0'}
                <span className="text-sm font-semibold text-slate-400">/5.0</span>
              </span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0, rotate: -20 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={REPEAT_VIEWPORT}
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 18,
                      delay: 0.05 + i * 0.04,
                    }}
                  >
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400 drop-shadow-[0_2px_6px_rgba(245,158,11,0.35)]" />
                  </motion.span>
                ))}
              </div>
            </div>

            <p className="mt-2 text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>
                {currentCreator.proofSummaryConfig?.ratingSubtitle ||
                  'ส่งงานไว ตรงบรีฟ ยอดวิวทะลุ KPI ทุกแคมเปญ'}
              </span>
            </p>
          </motion.div>

          {/* Highlight 2: Positive Audience Conversion Sentiment */}
          <motion.div
            variants={fadeUpVariant}
            custom={0.06}
            whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelectTab('แฟนคลับ / ผู้ชม')}
            className="group relative bg-white/95 backdrop-blur-xl border border-rose-200/80 hover:border-rose-400/90 rounded-2xl p-4 sm:p-5 shadow-[0_10px_25px_-10px_rgba(244,63,94,0.10)] hover:shadow-[0_16px_32px_-10px_rgba(244,63,94,0.20)] transition-[border-color,box-shadow] duration-200 cursor-pointer overflow-hidden will-change-transform"
          >
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-linear-to-r from-transparent via-rose-400/60 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-600">
                กระแสตอบรับเชิงบวกและการป้ายยาคนดู
              </span>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200/70 px-2 py-0.5 rounded-md shrink-0">
                TOP SENTIMENT
              </span>
            </div>

            <div className="flex items-baseline gap-2.5 flex-wrap">
              <span className="text-2xl sm:text-3xl font-bold font-mono-num text-rose-600 tracking-tight">
                {currentCreator.proofSummaryConfig?.sentimentPercent || '99.4%'}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-700">
                {currentCreator.proofSummaryConfig?.sentimentTitle ||
                  'คอมเมนต์เชิงบวก & ตามซื้อจริง'}
              </span>
            </div>

            <p className="mt-2 text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 shrink-0" />
              <span>
                {currentCreator.proofSummaryConfig?.sentimentSubtitle ||
                  'เล่าเรื่องสนุก คนดูจบคลิปโดยไม่ปัดหนีโฆษณา'}
              </span>
            </p>
          </motion.div>

          {/* Highlight 3: Verified LINE Chat & Social Pop-up Proof */}
          <motion.div
            variants={fadeUpVariant}
            custom={0.12}
            whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelectTab('all')}
            className="group relative bg-white/95 backdrop-blur-xl border border-emerald-200/80 hover:border-emerald-400/90 rounded-2xl p-4 sm:p-5 shadow-[0_10px_25px_-10px_rgba(16,185,129,0.10)] hover:shadow-[0_16px_32px_-10px_rgba(16,185,129,0.20)] transition-[border-color,box-shadow] duration-200 cursor-pointer overflow-hidden will-change-transform"
          >
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-linear-to-r from-transparent via-emerald-400/60 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-600">
                {currentCreator.proofSummaryConfig?.verifiedTitle ||
                  'คลังหลักฐานฟีดแบ็กจริง (Verified Proof)'}
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-md shrink-0">
                REAL CHAT & SOCIAL
              </span>
            </div>

            <div className="flex items-baseline gap-2.5 flex-wrap">
              <span className="text-2xl sm:text-3xl font-bold font-mono-num text-emerald-700 tracking-tight">
                {currentCreator.commentProofs.length}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-700">
                รายการรีวิวคัดสรร ({brandReviewsCount} แบรนด์ · {fanCommentsCount} แฟนคลับ)
              </span>
            </div>

            <p className="mt-2 text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                {currentCreator.proofSummaryConfig?.verifiedSubtitle ||
                  'คลิกเลือกการ์ดด้านบนเพื่อกรองดูเฉพาะรีวิวแบรนด์หรือแฟนคลับ'}
              </span>
            </p>
          </motion.div>
        </motion.div>

        {/* 4. SINGLE-CELL CSS GRID PAGE STACK (100% Constant Height & Zero Screen Shift) */}
        <div className="grid grid-cols-1 items-start [overflow-anchor:none]">
          {filteredComments.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-slate-50/95 backdrop-blur-md rounded-2xl border border-dashed border-slate-200">
              <MessageSquareHeart className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium">ยังไม่มีรายการความคิดเห็นในหมวดหมู่นี้</p>
            </div>
          ) : (
            allPages.map((page) => {
              const isCurrentPage = page.pageNum === activePage;
              return (
                <motion.div
                  key={`page-${commentFilter}-${page.pageNum}`}
                  initial={false}
                  animate={{
                    opacity: isCurrentPage ? 1 : 0,
                    x: isCurrentPage ? 0 : pageDirection > 0 ? -24 : 24,
                    scale: isCurrentPage ? 1 : 0.985,
                  }}
                  transition={{
                    duration: 0.34,
                    ease: EASE_OUT_EXPO,
                  }}
                  aria-hidden={!isCurrentPage}
                  className={`col-start-1 row-start-1 w-full ${
                    isCurrentPage
                      ? 'relative z-10 pointer-events-auto visible'
                      : 'relative z-0 pointer-events-none invisible select-none'
                  }`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 2xl:gap-8 items-start">
                    {/* Left Masonry Column */}
                    <div className="flex flex-col gap-6 2xl:gap-7">
                      {page.leftColItems.map((cm) => {
                        const isBrand = cm.authorType === 'ลูกค้าแบรนด์ / เอเจนซี่';
                        return (
                          <div key={cm.id} className="w-full">
                            {isBrand ? (
                              <LineChatBrandCard
                                comment={cm}
                                creator={currentCreator}
                              />
                            ) : (
                              <SocialMediaCommentCard
                                comment={cm}
                                creator={currentCreator}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Right Masonry Column */}
                    <div className="flex flex-col gap-6 2xl:gap-7">
                      {page.rightColItems.map((cm) => {
                        const isBrand = cm.authorType === 'ลูกค้าแบรนด์ / เอเจนซี่';
                        return (
                          <div key={cm.id} className="w-full">
                            {isBrand ? (
                              <LineChatBrandCard
                                comment={cm}
                                creator={currentCreator}
                              />
                            ) : (
                              <SocialMediaCommentCard
                                comment={cm}
                                creator={currentCreator}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* 5. ELEVATED OPAQUE PAGINATION BAR CONTROLS (Zero Background Bleed & Fixed Coordinates) */}
        {totalPages > 1 && (
          <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-5 py-3 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_8px_24px_-8px_rgba(15,23,42,0.06)] [overflow-anchor:none]">
            {/* Left: Item count and page status */}
            <div className="text-xs text-slate-600 font-medium">
              แสดงหน้า <span className="font-bold text-slate-900">{activePage}</span> จาก{' '}
              <span className="font-bold text-slate-900">{totalPages}</span> หน้า{' '}
              <span className="text-slate-300">·</span>{' '}
              <span>ทั้งหมด {filteredComments.length} ความคิดเห็น</span>
            </div>

            {/* Right: Previous / Next & Page Dots */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  goToPage(activePage - 1);
                }}
                disabled={activePage <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-2xs hover:border-slate-300 select-none"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>ก่อนหน้า</span>
              </button>

              <div className="flex items-center gap-1.5 px-1.5">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  const isCurrent = pageNum === activePage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        goToPage(pageNum);
                      }}
                      className={`relative w-8 h-8 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center select-none ${
                        isCurrent
                          ? 'text-white bg-[#1E1B4B] shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {isCurrent && (
                        <motion.span
                          layoutId="activeCommentPageDot"
                          transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                          className="absolute inset-0 bg-[#1E1B4B] rounded-xl -z-0"
                        />
                      )}
                      <span className="relative z-10 font-mono-num">{pageNum}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  goToPage(activePage + 1);
                }}
                disabled={activePage >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-2xs hover:border-slate-300 select-none"
              >
                <span>ถัดไป</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
