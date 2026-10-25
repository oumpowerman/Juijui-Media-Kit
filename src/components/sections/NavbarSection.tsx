import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
} from 'motion/react';
import {
  Sparkles,
  BarChart3,
  Clapperboard,
  MessageSquareHeart,
  Calculator,
  PhoneCall,
  CalendarCheck,
  SlidersHorizontal,
  FileText,
  Menu,
  X,
  ChevronRight,
  Briefcase,
} from 'lucide-react';
import { CreatorProfile, RatePackage } from '../../data/creatorData';
import { PlatformBrandIcon } from '../ui/PlatformBrandIcon';
import { EASE_OUT_EXPO } from './motionVariants';

interface NavbarSectionProps {
  currentCreator: CreatorProfile;
  bookingsCount: number;
  activePackage: RatePackage;
  chosenAddOnsCount: number;
  estimatedNetTotal: number;
  onOpenAdmin?: () => void;
  onOpenPdf?: () => void;
  onOpenBooking: () => void;
}

interface NavItemConfig {
  id: string;
  href: string;
  shortLabel: string;
  longLabel: string;
  icon: React.FC<{ className?: string }>;
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'top',
    href: '#top',
    shortLabel: 'หน้าแรก',
    longLabel: 'โปรไฟล์ช่อง',
    icon: Sparkles,
  },
  {
    id: 'analytics',
    href: '#analytics',
    shortLabel: 'สถิติ',
    longLabel: 'สถิติช่อง',
    icon: BarChart3,
  },
  {
    id: 'brands',
    href: '#brands',
    shortLabel: 'ลูกค้า',
    longLabel: 'แบรนด์ลูกค้า',
    icon: Briefcase,
  },
  {
    id: 'portfolio',
    href: '#portfolio',
    shortLabel: 'ไวรัล',
    longLabel: 'ผลงานไวรัล',
    icon: Clapperboard,
  },
  {
    id: 'comments',
    href: '#comments',
    shortLabel: 'รีวิว',
    longLabel: 'เสียงตอบรับ',
    icon: MessageSquareHeart,
  },
  {
    id: 'ratecard',
    href: '#ratecard',
    shortLabel: 'เรทราคา',
    longLabel: 'เรทการ์ด',
    icon: Calculator,
  },
  {
    id: 'contact',
    href: '#contact',
    shortLabel: 'ติดต่อ',
    longLabel: 'ติดต่องาน',
    icon: PhoneCall,
  },
];

// Adaptive density tiers computed from actual container pixel width + overflow guard
type NavDensityTier = 'full' | 'compact' | 'icon-expand' | 'mobile';

export const NavbarSection: React.FC<NavbarSectionProps> = ({
  currentCreator,
  bookingsCount,
  activePackage,
  chosenAddOnsCount,
  estimatedNetTotal,
  onOpenAdmin,
  onOpenPdf,
  onOpenBooking,
}) => {
  const [activeSection, setActiveSection] = useState<string>('top');
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [densityTier, setDensityTier] = useState<NavDensityTier>('compact');

  const rowContainerRef = useRef<HTMLDivElement>(null);
  // Lock scroll-spy during programmatic click navigation so the active pill glides directly in 1 step
  const programmaticTargetRef = useRef<string | null>(null);
  const programmaticTimerRef = useRef<number | null>(null);

  // Subtle ultra-slim reading progress bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 30,
    restDelta: 0.001,
  });

  // 1. REAL CONTAINER WIDTH & OVERFLOW DETECTOR (ResizeObserver)
  const evaluateNavbarFit = useCallback(() => {
    const el = rowContainerRef.current;
    const width = el ? el.clientWidth : window.innerWidth;

    let nextTier: NavDensityTier;
    if (width >= 1220) {
      nextTier = 'full';
    } else if (width >= 960) {
      nextTier = 'compact';
    } else if (width >= 720) {
      nextTier = 'icon-expand';
    } else {
      nextTier = 'mobile';
    }

    setDensityTier(nextTier);
  }, []);

  // Secondary post-render check: if scrollWidth > clientWidth in current tier, step down automatically
  useEffect(() => {
    const el = rowContainerRef.current;
    if (!el) return;
    if (el.scrollWidth > el.clientWidth + 4) {
      if (densityTier === 'full') {
        setDensityTier('compact');
      } else if (densityTier === 'compact') {
        setDensityTier('icon-expand');
      } else if (densityTier === 'icon-expand') {
        setDensityTier('mobile');
      }
    }
  }, [densityTier, currentCreator.nameTh, estimatedNetTotal, chosenAddOnsCount]);

  useEffect(() => {
    evaluateNavbarFit();
    const el = rowContainerRef.current;
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && el) {
      observer = new ResizeObserver(() => {
        evaluateNavbarFit();
      });
      observer.observe(el);
    }
    window.addEventListener('resize', evaluateNavbarFit);
    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('resize', evaluateNavbarFit);
    };
  }, [evaluateNavbarFit]);

  // 2. SCROLL-SPY WITH PROGRAMMATIC CLICK LOCK (Prevents stepping through intermediate tabs)
  useEffect(() => {
    const sectionIds = NAV_ITEMS.map((item) => item.id);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // If user clicked a nav button, ignore intermediate sections while smooth-scrolling to target
      if (programmaticTargetRef.current) {
        return;
      }

      const scrollPosition = window.scrollY + 220;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const elTop = el.getBoundingClientRect().top + window.scrollY;
          if (elTop <= scrollPosition) {
            setActiveSection(sectionIds[i]);
            break;
          }
        }
      }
    };

    // Release lock immediately once browser fires native 'scrollend'
    const handleScrollEnd = () => {
      if (programmaticTargetRef.current) {
        programmaticTargetRef.current = null;
        if (programmaticTimerRef.current) {
          window.clearTimeout(programmaticTimerRef.current);
          programmaticTimerRef.current = null;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('scrollend', handleScrollEnd, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scrollend', handleScrollEnd);
      if (programmaticTimerRef.current) {
        window.clearTimeout(programmaticTimerRef.current);
      }
    };
  }, []);

  // Direct smooth navigation without stepping through intermediate tabs
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveSection(id);

    programmaticTargetRef.current = id;
    if (programmaticTimerRef.current) {
      window.clearTimeout(programmaticTimerRef.current);
    }
    // Fallback unlock after smooth scroll completes (~850ms)
    programmaticTimerRef.current = window.setTimeout(() => {
      programmaticTargetRef.current = null;
      programmaticTimerRef.current = null;
    }, 850);

    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const targetEl = document.getElementById(id);
    if (targetEl) {
      const navOffset = 64;
      const topPos = targetEl.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({ top: Math.max(0, topPos), behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full max-w-full transition-colors duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-2xs border-b border-slate-200/90'
          : 'bg-white/90 backdrop-blur-md border-b border-slate-200/75'
      }`}
    >
      <div
        ref={rowContainerRef}
        className="w-full max-w-7xl xl:max-w-[94vw] 2xl:max-w-[95vw] min-[2400px]:max-w-[2280px] mx-auto px-3 sm:px-5 lg:px-8 xl:px-6 2xl:px-8 h-15 2xl:h-16 flex items-center justify-between gap-2 overflow-hidden"
      >
        {/* ZONE 1: Brand Identity (Auto-adapts width based on densityTier) */}
        <a
          href="#top"
          onClick={(e) => handleNavClick(e, 'top')}
          className="flex items-center gap-2 min-w-0 shrink-0 group"
        >
          <div className="relative shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border border-violet-200 bg-violet-950 shadow-2xs">
              <img
                src={currentCreator.avatarUrl}
                alt={currentCreator.nameTh}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/assets/juijui/page-1.png';
                }}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-[#1E1B4B] truncate">
                {currentCreator.nameTh}
              </span>
                <>
                  <span className="hidden sm:inline text-slate-300 font-light">|</span>
                  <span className="hidden sm:inline text-sm font-bold text-violet-700">
                    {currentCreator.nameEn}
                  </span>
                </>
            </div>

            <div className="flex items-center gap-1.5">
              {densityTier === 'full' && (
                <div className="flex items-center gap-0.5">
                  <PlatformBrandIcon platform="TikTok" size="xs" />
                  <PlatformBrandIcon platform="YouTube" size="xs" />
                  <PlatformBrandIcon platform="Facebook" size="xs" />
                  <PlatformBrandIcon platform="Instagram" size="xs" />
                </div>
              )}
              <span className="text-[10px] font-semibold text-slate-500 font-mono-num truncate">
                {currentCreator.overview.totalFollowers} Followers
              </span>
            </div>
          </div>
        </a>

        {/* ZONE 2: Center Navigation Pill Bar (Shown when densityTier !== 'mobile')
            - 'full': Icon + Long Label
            - 'compact': Icon + Short Label
            - 'icon-expand': Icon for all tabs, plus Short Label ONLY on the active tab */}
        {densityTier !== 'mobile' && (
          <nav
            aria-label="เมนูหลัก"
            className="flex items-center gap-0.5 2xl:gap-1 p-1 2xl:p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/80 shrink-0"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              const NavIcon = item.icon;
              const showLabel = true;

              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.id)}
                  title={item.longLabel}
                  className={`relative px-2.5 2xl:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-600 hover:text-violet-800 hover:bg-white/70'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeNavbarPill"
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 34,
                        mass: 0.8,
                      }}
                      className="absolute inset-0 rounded-xl bg-linear-to-r from-violet-700 to-indigo-700 shadow-2xs -z-0"
                    />
                  )}
                  <NavIcon
                    className={`w-3.5 h-3.5 relative z-10 shrink-0 transition-transform duration-200 ${
                      isActive ? 'text-amber-300 scale-105' : 'text-violet-700'
                    }`}
                  />
                  {showLabel && (
                    <span className="relative z-10">
                      {densityTier === 'full' ? item.longLabel : item.shortLabel}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>
        )}

        {/* ZONE 3: Right Action Controls (Never overflows or clips) */}
        <div className="flex items-center gap-1.5 shrink-0">

          {/* Creator Studio Button: Only visible in Admin Mode */}
          {onOpenAdmin && densityTier !== 'mobile' && (
            <button
              type="button"
              onClick={onOpenAdmin}
              title="จัดการข้อมูลเรทการ์ด ผลงาน และคิวงาน"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-violet-300 bg-white hover:bg-violet-50/60 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-violet-700 shrink-0" />
              <span className="whitespace-nowrap">จัดการข้อมูล</span>
              <span className="px-1.5 py-0.5 rounded-md bg-violet-100 text-violet-800 font-mono-num text-[10px] font-bold">
                {bookingsCount}
              </span>
            </button>
          )}

          {/* Primary Live Quote & Booking CTA Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={onOpenBooking}
            className="px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-linear-to-r from-violet-700 to-indigo-700 hover:from-violet-800 hover:to-indigo-800 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>{densityTier === 'mobile' ? 'จอง' : 'จองคิวงาน'}</span>
            <span className="px-1.5 py-0.5 rounded-md bg-white/15 text-amber-300 font-mono-num font-bold text-[11px]">
              {activePackage ? `${estimatedNetTotal.toLocaleString()}.-` : 'ด่วน'}
              {chosenAddOnsCount > 0 ? ` +${chosenAddOnsCount}` : ''}
            </span>
          </motion.button>

        </div>
      </div>

      {/* MOBILE QUICK-JUMP BAR (Only in 'mobile' tier — wraps cleanly without horizontal scrollbar) */}
      {densityTier === 'mobile' && (
        <div className="border-t border-slate-200/70 bg-slate-50/90 px-2 py-1 grid grid-cols-7 gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            const NavIcon = item.icon;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.id)}
                className={`py-1 px-1 rounded-lg text-[10px] font-semibold flex flex-col items-center justify-center gap-0.5 transition-colors truncate ${
                  isActive
                    ? 'bg-violet-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-white'
                }`}
              >
                <NavIcon
                  className={`w-3 h-3 shrink-0 ${
                    isActive ? 'text-amber-300' : 'text-violet-700'
                  }`}
                />
                <span className="truncate max-w-full">{item.shortLabel}</span>
              </a>
            );
          })}
        </div>
      )}


      {/* Ultra-slim 1.5px Scroll Progress Line */}
      <motion.div
        style={{ scaleX }}
        className="h-[1.5px] bg-linear-to-r from-violet-600/80 via-pink-500/80 to-amber-400/80 origin-left"
      />
    </header>
  );
};
