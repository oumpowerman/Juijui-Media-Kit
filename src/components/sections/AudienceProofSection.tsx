import React, { useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  Variants,
} from 'motion/react';
import {
  Plus,
  Building2,
  Heart,
  MessageSquareHeart,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CreatorProfile } from '../../data/creatorData';
import { LineChatBrandCard } from './testimonials/LineChatBrandCard';
import { SocialMediaCommentCard } from './testimonials/SocialMediaCommentCard';
import {
  EASE_OUT_EXPO,
  REPEAT_VIEWPORT,
  slideFromLeftVariant,
  slideFromRightVariant,
} from './motionVariants';

export type CommentFilterType = 'all' | 'ลูกค้าแบรนด์ / เอเจนซี่' | 'แฟนคลับ / ผู้ชม';

interface AudienceProofSectionProps {
  currentCreator: CreatorProfile;
  commentFilter: CommentFilterType;
  onSelectCommentFilter: (filter: CommentFilterType) => void;
  onOpenAdmin?: () => void;
}

const PAGE_SIZE = 6;

// 3D Cascade animation variants for page switches
const pageContainerVariants: Variants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? 36 : -36,
    rotateY: dir > 0 ? 3 : -3,
    scale: 0.98,
    transition: {
      duration: 0.35,
      ease: EASE_OUT_EXPO,
    },
  }),
  center: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: EASE_OUT_EXPO,
      staggerChildren: 0.05,
      delayChildren: 0.04,
    },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -36 : 36,
    rotateY: dir > 0 ? -3 : 3,
    scale: 0.98,
    transition: {
      duration: 0.25,
      ease: EASE_OUT_EXPO,
    },
  }),
};

const cardItemVariant: Variants = {
  enter: {
    opacity: 0,
    y: 18,
    scale: 0.97,
  },
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.38,
      ease: EASE_OUT_EXPO,
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.97,
    transition: {
      duration: 0.18,
    },
  },
};

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

  const quoteLeftParallaxY = useTransform(smoothProgress, [0, 1], [-55, 65]);
  const quoteRightParallaxY = useTransform(smoothProgress, [0, 1], [65, -55]);
  const commentsGridParallaxY = useTransform(smoothProgress, [0, 1], [24, -20]);

  const filteredComments = currentCreator.commentProofs.filter((c) => {
    if (commentFilter === 'all') return true;
    return c.authorType === commentFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filteredComments.length / PAGE_SIZE));
  const activePage = Math.min(currentPage, totalPages);

  const pageItems = filteredComments.slice(
    (activePage - 1) * PAGE_SIZE,
    activePage * PAGE_SIZE
  );

  // Distribute page items into two columns for true seamless masonry vertical stacking
  const leftColItems = pageItems.filter((_, idx) => idx % 2 === 0);
  const rightColItems = pageItems.filter((_, idx) => idx % 2 === 1);

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
    { id: 'ลูกค้าแบรนด์ / เอเจนซี่', label: 'รีวิวจากแบรนด์', icon: Building2 },
    { id: 'แฟนคลับ / ผู้ชม', label: 'คอมเมนต์แฟนคลับ', icon: Heart },
  ];

  return (
    <section
      ref={sectionRef}
      id="comments"
      className="relative py-16 border-b border-slate-200/80 bg-white overflow-hidden"
    >
      {/* THEMATIC BACKGROUND CANVAS 04: Floating Social Pulse Rings & Oversized Editorial Quote Marks */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      >
        <motion.div
          style={{ y: quoteLeftParallaxY }}
          className="absolute -top-6 left-8 text-[220px] font-bold text-violet-950/[0.045] leading-none font-serif"
        >
          “
        </motion.div>
        <motion.div
          style={{ y: quoteRightParallaxY }}
          className="absolute -bottom-20 right-10 text-[220px] font-bold text-violet-950/[0.045] leading-none font-serif"
        >
          ”
        </motion.div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {[320, 520, 740].map((size, idx) => (
            <motion.div
              key={size}
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.12, 0.24, 0.12],
              }}
              transition={{
                duration: 6 + idx * 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ width: size, height: size }}
              className="rounded-full border border-violet-300/60 absolute -translate-x-1/2 -translate-y-1/2"
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header: Title slides from left, Filter Tabs slide from right */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={REPEAT_VIEWPORT}
            variants={slideFromLeftVariant}
          >
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700">
              <MessageSquareHeart className="w-3.5 h-3.5" />
              <span>04. AUDIENCE ENGAGEMENT & BRAND TESTIMONIALS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1E1B4B] mt-1">
              เสียงตอบรับจากผู้ชม & รีวิวจากแบรนด์
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              คอมเมนต์ยอดไลค์สูงและฟีดแบ็กจริงจากแคมเปญของช่อง {currentCreator.nameTh}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={REPEAT_VIEWPORT}
            variants={slideFromRightVariant}
            className="flex flex-wrap items-center gap-2"
          >
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs">
              {FILTER_TABS.map((tab) => {
                const isActive = commentFilter === tab.id;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleSelectTab(tab.id)}
                    className={`relative px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                      isActive ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="commentFilterPill"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="absolute inset-0 bg-white rounded-lg shadow-2xs -z-0"
                      />
                    )}
                    <TabIcon className="w-3.5 h-3.5 relative z-10 text-violet-700" />
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {onOpenAdmin && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มคอมเมนต์ / แนบรูปแคป</span>
              </motion.button>
            )}
          </motion.div>
        </div>

        {/* Masonry Layout with 3D Cascade Page Animation */}
        <motion.div style={{ y: commentsGridParallaxY }} className="relative min-h-[380px]">
          <AnimatePresence mode="wait" custom={pageDirection}>
            <motion.div
              key={`comment-page-${activePage}-${commentFilter}`}
              custom={pageDirection}
              variants={pageContainerVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{ perspective: 1200 }}
              className="w-full"
            >
              {pageItems.length === 0 ? (
                <div className="py-16 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <MessageSquareHeart className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-medium">ยังไม่มีรายการความคิดเห็นในหมวดหมู่นี้</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  {/* Left Masonry Column */}
                  <div className="flex flex-col gap-6">
                    {leftColItems.map((cm) => {
                      const isBrand = cm.authorType === 'ลูกค้าแบรนด์ / เอเจนซี่';
                      return (
                        <motion.div
                          key={cm.id}
                          variants={cardItemVariant}
                          className="w-full"
                        >
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
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Right Masonry Column */}
                  <div className="flex flex-col gap-6">
                    {rightColItems.map((cm) => {
                      const isBrand = cm.authorType === 'ลูกค้าแบรนด์ / เอเจนซี่';
                      return (
                        <motion.div
                          key={cm.id}
                          variants={cardItemVariant}
                          className="w-full"
                        >
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
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Pagination Bar Controls */}
        {totalPages > 1 && (
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80">
            {/* Left: Item count and page status */}
            <div className="text-xs text-slate-500 font-medium">
              แสดงหน้า <span className="font-bold text-slate-900">{activePage}</span> จาก{' '}
              <span className="font-bold text-slate-900">{totalPages}</span> หน้า{' '}
              <span className="text-slate-300">·</span>{' '}
              <span>ทั้งหมด {filteredComments.length} ความคิดเห็น</span>
            </div>

            {/* Right: Previous / Next & Page Dots */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(activePage - 1)}
                disabled={activePage <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-2xs hover:border-slate-300"
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
                      onClick={() => goToPage(pageNum)}
                      className={`relative w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                        isCurrent
                          ? 'text-white bg-[#1E1B4B] shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {isCurrent && (
                        <motion.span
                          layoutId="activeCommentPageDot"
                          transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                          className="absolute inset-0 bg-[#1E1B4B] rounded-lg -z-0"
                        />
                      )}
                      <span className="relative z-10 font-mono-num">{pageNum}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => goToPage(activePage + 1)}
                disabled={activePage >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-2xs hover:border-slate-300"
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
