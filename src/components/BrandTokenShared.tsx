import React, { useState, useRef, useEffect } from 'react';
import {
  Crown,
  Repeat,
  Eye,
  TrendingUp,
  ArrowUpRight,
  Play,
} from 'lucide-react';
import {
  BrandCollaborationItem,
  resolveGoogleDriveImage,
} from '../data/creatorData';

export type BrandTier = 'vip' | 'repeat' | 'standard';

/**
 * 3-Tiered Classification by Repeat Collaboration Count:
 * - 'vip': 5+ campaigns (ร่วมงาน 5 ครั้งขึ้นไป)
 * - 'repeat': 3–4 campaigns (ร่วมงาน 3–4 ครั้ง)
 * - 'standard': 1–2 campaigns (ร่วมงาน 1–2 ครั้ง)
 */
export function getBrandTier(brand: BrandCollaborationItem): BrandTier {
  const count = Number(brand.campaignCount) || 1;
  if (count >= 5) return 'vip';
  if (count >= 3) return 'repeat';
  return 'standard';
}

export function getTierMeta(tier: BrandTier) {
  switch (tier) {
    case 'vip':
      return {
        label: 'VIP Partner (5+ ครั้ง)',
        labelTh: 'ลูกค้า VIP ร่วมงาน 5 ครั้งขึ้นไป',
        ringClass: 'border-amber-400/90 hover:border-amber-500 shadow-amber-500/10',
        countBadgeClass:
          'bg-amber-400 text-slate-950 border border-amber-300 shadow-2xs',
        nameBadgeClass:
          'bg-slate-900/95 text-amber-300 border border-amber-400/50',
        mass: 1.6,
      };
    case 'repeat':
      return {
        label: 'Regular Partner (3–4 ครั้ง)',
        labelTh: 'ลูกค้าประจำร่วมงาน 3–4 ครั้ง',
        ringClass: 'border-emerald-300/90 hover:border-emerald-500 shadow-emerald-500/5',
        countBadgeClass:
          'bg-emerald-600 text-white border border-emerald-500 shadow-2xs',
        nameBadgeClass:
          'bg-slate-900/90 text-white border border-slate-700/80',
        mass: 1.25,
      };
    default:
      return {
        label: 'Trusted Partner (1–2 ครั้ง)',
        labelTh: 'แบรนด์พาร์ทเนอร์ (1–2 ครั้ง)',
        ringClass: 'border-slate-200/95 hover:border-violet-400',
        countBadgeClass:
          'bg-slate-800/85 text-white border border-slate-700',
        nameBadgeClass:
          'bg-white/95 text-slate-800 border border-slate-200/90',
        mass: 0.95,
      };
  }
}

export const BrandLogoVisual: React.FC<{
  brand: BrandCollaborationItem;
  tier?: BrandTier;
  compact?: boolean;
  className?: string;
}> = ({ brand, tier = 'standard', compact = false, className = '' }) => {
  const [imgError, setImgError] = useState(false);
  const resolvedLogo = brand.logoUrl ? resolveGoogleDriveImage(brand.logoUrl) : '';
  const showImage = Boolean(resolvedLogo && !imgError);
  const brandColor = brand.brandColor || '#4C1D95';

  return (
    <div
      className={`w-full h-full flex items-center justify-center overflow-hidden select-none pointer-events-none ${className}`}
      style={{
        backgroundColor: showImage ? '#FFFFFF' : `${brandColor}10`,
      }}
    >
      {showImage ? (
        <img
          src={resolvedLogo}
          alt={brand.brandName}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          draggable={false}
          className={`w-full h-full object-contain select-none pointer-events-none transition-transform duration-200 group-hover:scale-108 ${
            compact ? 'p-1.5' : 'p-2.5 sm:p-3 pb-5'
          }`}
          loading="lazy"
        />
      ) : (
        <div
          className={`w-full h-full flex flex-col items-center justify-center text-center select-none pointer-events-none ${
            compact ? 'px-1' : 'px-2 pb-4'
          }`}
          style={{
            background: `radial-gradient(circle at 50% 35%, ${brandColor}22 0%, ${brandColor}08 75%)`,
          }}
        >
          <span
            className={`${
              compact
                ? 'text-[10px]'
                : tier === 'vip'
                ? 'text-base sm:text-lg'
                : tier === 'repeat'
                ? 'text-sm sm:text-base'
                : 'text-xs sm:text-sm'
            } font-bold tracking-tight leading-tight line-clamp-2`}
            style={{ color: brandColor }}
          >
            {brand.brandName}
          </span>
        </div>
      )}
    </div>
  );
};

export const BrandHoverDetailCard: React.FC<{
  brand: BrandCollaborationItem;
  position?: 'top' | 'bottom';
  notchAlign?: 'center' | 'left' | 'right';
  onSelectBrand?: (brand: BrandCollaborationItem) => void;
  interactive?: boolean;
  isExiting?: boolean;
}> = ({
  brand,
  position = 'top',
  notchAlign = 'center',
  onSelectBrand,
  interactive = false,
  isExiting = false,
}) => {
  const tier = getBrandTier(brand);

  // Creative pastel theme palette per tier
  const tierTheme =
    tier === 'vip'
      ? {
          glow: 'from-amber-200/40 via-orange-100/25 to-transparent',
          badge:
            'bg-linear-to-r from-amber-100/90 to-orange-100/90 text-amber-900 border border-amber-300/80 shadow-2xs',
          crownColor: 'text-amber-500',
        }
      : tier === 'repeat'
      ? {
          glow: 'from-emerald-200/40 via-teal-100/25 to-transparent',
          badge:
            'bg-linear-to-r from-emerald-100/90 to-teal-100/90 text-emerald-900 border border-emerald-300/80 shadow-2xs',
          crownColor: 'text-emerald-500',
        }
      : {
          glow: 'from-violet-200/40 via-indigo-100/25 to-transparent',
          badge:
            'bg-linear-to-r from-violet-100/90 to-indigo-100/90 text-violet-900 border border-violet-300/80 shadow-2xs',
          crownColor: 'text-violet-500',
        };

  const animClass =
    position === 'bottom'
      ? isExiting
        ? 'animate-ios-pop-top-out pointer-events-none'
        : 'animate-ios-pop-top'
      : isExiting
      ? 'animate-ios-pop-out pointer-events-none'
      : 'animate-ios-pop';

  return (
    <div
      onClick={(e) => {
        if (interactive && onSelectBrand && !isExiting) {
          e.stopPropagation();
          onSelectBrand(brand);
        }
      }}
      className={`relative w-72 sm:w-80 rounded-3xl bg-white/92 backdrop-blur-2xl border border-white/95 text-slate-800 p-4 shadow-[0_24px_50px_-12px_rgba(79,70,229,0.18),0_10px_25px_-5px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,1)] ring-1 ring-slate-900/[0.04] text-left select-none overflow-hidden transition-shadow duration-200 ${animClass} ${
        interactive && !isExiting ? 'cursor-pointer pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Apple iOS Specular Glass Sheen Top Rim */}
      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-linear-to-r from-transparent via-white/95 to-transparent pointer-events-none z-30" />

      {/* Frosted Glass Diagonal Refraction Sheen */}
      <div className="absolute -top-16 -left-12 w-64 h-36 bg-linear-to-br from-white/45 via-white/10 to-transparent rotate-12 pointer-events-none z-10 rounded-full blur-xs" />

      {/* Creative Pastel Ambient Corner Glows */}
      <div
        className={`absolute -top-12 -right-12 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-60 bg-linear-to-br ${tierTheme.glow}`}
      />
      <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full blur-xl pointer-events-none opacity-30 bg-linear-to-tr from-sky-200/50 via-violet-200/30 to-transparent" />

      {/* Header: Mini Brand Logo + Name + Category + Pastel Repeat Badge */}
      <div className="relative flex items-start justify-between gap-2.5 pb-3 border-b border-slate-200/70 z-20">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-white/95 border border-slate-200/80 shadow-2xs p-1 flex items-center justify-center shrink-0 overflow-hidden">
            <BrandLogoVisual brand={brand} compact className="w-full h-full" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {tier === 'vip' && (
                <Crown className={`w-3.5 h-3.5 ${tierTheme.crownColor} shrink-0`} />
              )}
              <h4 className="text-sm font-bold text-slate-900 truncate tracking-tight">
                {brand.brandName}
              </h4>
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
              {brand.brandNameTh ? `${brand.brandNameTh} · ` : ''}
              {brand.category}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-[10px] font-bold font-mono-num shrink-0 ${tierTheme.badge}`}
        >
          <Repeat className="w-2.5 h-2.5" />
          {brand.campaignCount} ครั้ง
        </span>
      </div>

      {/* Metrics Row: Two Frosted Glass Tiles */}
      <div className="relative grid grid-cols-2 gap-2 my-2.5 z-20">
        <div className="rounded-2xl bg-white/75 backdrop-blur-md border border-white/90 px-3 py-2 shadow-2xs">
          <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
            <Eye className="w-3 h-3 text-violet-600 shrink-0" />
            <span>ยอดวิวสะสม</span>
          </div>
          <div className="text-xs sm:text-sm font-bold font-mono-num text-slate-900 mt-0.5">
            {brand.totalViews}
          </div>
        </div>
        <div className="rounded-2xl bg-white/75 backdrop-blur-md border border-white/90 px-3 py-2 shadow-2xs">
          <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Engagement เฉลี่ย</span>
          </div>
          <div className="text-xs sm:text-sm font-bold font-mono-num text-emerald-700 mt-0.5">
            {brand.avgEngagement}
          </div>
        </div>
      </div>

      {/* Video Styles Chips */}
      <div className="relative mb-2.5 z-20">
        <div className="text-[10px] font-semibold text-slate-400 mb-1">แนวคลิปที่ผลิต:</div>
        <div className="flex flex-wrap items-center gap-1">
          {brand.videoStyles.map((style, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-violet-50/80 text-violet-800 border border-violet-100/90 shadow-2xs"
            >
              {style}
            </span>
          ))}
        </div>
      </div>

      {/* Campaign Highlight Snippet */}
      {brand.campaignHighlight && (
        <div className="relative mb-2.5 bg-linear-to-r from-violet-50/70 to-indigo-50/50 border border-violet-100/80 rounded-2xl p-2.5 text-[11px] text-slate-700 leading-relaxed italic shadow-2xs z-20">
          “{brand.campaignHighlight}”
        </div>
      )}

      {/* Footer CTA */}
      <div className="relative flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] font-bold text-violet-700 group-hover:text-violet-900 transition-colors z-20">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center">
            <Play className="w-2.5 h-2.5 fill-violet-700 ml-0.5" />
          </span>
          <span>คลิกดูรายละเอียดและคลิปตัวอย่าง</span>
        </span>
        <ArrowUpRight className="w-3.5 h-3.5 text-violet-600" />
      </div>

      {/* Apple iOS Glassy Pointer Carat Notch with Specular Highlight */}
      <div
        style={{
          left:
            notchAlign === 'left'
              ? '36px'
              : notchAlign === 'right'
              ? 'auto'
              : '50%',
          right: notchAlign === 'right' ? '36px' : 'auto',
          transform:
            notchAlign === 'center'
              ? 'translateX(-50%) rotate(45deg)'
              : 'rotate(45deg)',
        }}
        className={`absolute w-3.5 h-3.5 bg-white/92 backdrop-blur-2xl pointer-events-none shadow-2xs z-25 ${
          position === 'bottom'
            ? '-top-1.5 border-l border-t border-white/90'
            : '-bottom-1.5 border-r border-b border-white/90'
        }`}
      />
    </div>
  );
};

interface LogoFirstBrandTokenProps {
  brand: BrandCollaborationItem;
  onSelectBrand: (brand: BrandCollaborationItem) => void;
  sizeOverride?: 'vip' | 'repeat' | 'standard';
  showHoverPopover?: boolean;
  popoverPosition?: 'top' | 'bottom';
  className?: string;
}

export const LogoFirstBrandToken: React.FC<LogoFirstBrandTokenProps> = ({
  brand,
  onSelectBrand,
  sizeOverride,
  showHoverPopover = true,
  popoverPosition = 'top',
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [horizontalAlign, setHorizontalAlign] = useState<'center' | 'left' | 'right'>('center');
  const tokenRef = useRef<HTMLDivElement | null>(null);
  const exitTimeoutRef = useRef<number | null>(null);

  const tier = sizeOverride || getBrandTier(brand);
  const meta = getTierMeta(tier);
  const brandColor = brand.brandColor || '#4C1D95';

  const handleMouseEnter = () => {
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = null;
    }
    setIsExiting(false);

    if (tokenRef.current) {
      const rect = tokenRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const tooltipHalfWidth = 160; // Card width ~320px
      const safePadding = 20;

      // Detect viewport boundary proximity to prevent tooltip from clipping off-screen
      if (centerX - tooltipHalfWidth < safePadding) {
        setHorizontalAlign('left');
      } else if (centerX + tooltipHalfWidth > window.innerWidth - safePadding) {
        setHorizontalAlign('right');
      } else {
        setHorizontalAlign('center');
      }
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (isHovered) {
      setIsExiting(true);
      exitTimeoutRef.current = window.setTimeout(() => {
        setIsHovered(false);
        setIsExiting(false);
      }, 180);
    }
  };

  useEffect(() => {
    return () => {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
      }
    };
  }, []);

  // 3-Tiered Static Sizing dimensions: VIP (>5x), Repeat (3-4x), Standard (1-2x)
  const sizeClasses =
    tier === 'vip'
      ? 'w-28 h-28 sm:w-32 sm:h-32 rounded-3xl'
      : tier === 'repeat'
      ? 'w-24 h-24 sm:w-26 sm:h-26 rounded-2xl'
      : 'w-20 h-20 sm:w-22 sm:h-22 rounded-2xl';

  return (
    <div
      ref={tokenRef}
      className={`relative inline-flex items-center justify-center shrink-0 ${
        isHovered || isExiting ? 'z-30' : 'z-10'
      } ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={() => onSelectBrand(brand)}
        style={{
          borderBottomWidth: tier === 'vip' ? '4px' : '3px',
          borderBottomColor: tier === 'vip' ? '#F59E0B' : brandColor,
        }}
        className={`group relative ${sizeClasses} bg-white border-2 ${meta.ringClass} transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-95 active:translate-y-0 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer overflow-visible flex items-center justify-center`}
      >
        {/* Inner clipped logo canvas */}
        <div className="w-full h-full rounded-[inherit] overflow-hidden relative">
          <BrandLogoVisual brand={brand} tier={tier} />
        </div>

        {/* Top-Right Campaign Count Badge */}
        <span
          className={`absolute -top-2 -right-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono-num z-20 ${meta.countBadgeClass}`}
        >
          {tier === 'vip' && <Crown className="w-2.5 h-2.5 shrink-0" />}
          <span>{brand.campaignCount}x</span>
        </span>

        {/* Bottom-Center Brand Name Badge */}
        <span
          className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 max-w-[92%] px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold truncate shadow-2xs z-20 transition-transform duration-200 group-hover:scale-105 ${meta.nameBadgeClass}`}
        >
          {brand.brandName}
        </span>
      </button>

      {/* Floating Detail Card on Hover with edge-safe positioning and iOS fluid spring enter/exit */}
      {showHoverPopover && (isHovered || isExiting) && (
        <div
          className={`absolute bottom-full mb-3.5 z-35 hidden sm:block ${
            horizontalAlign === 'left'
              ? 'left-0 translate-x-0'
              : horizontalAlign === 'right'
              ? 'right-0 translate-x-0'
              : 'left-1/2 -translate-x-1/2'
          }`}
        >
          <BrandHoverDetailCard
            brand={brand}
            position={popoverPosition}
            notchAlign={horizontalAlign}
            onSelectBrand={onSelectBrand}
            isExiting={isExiting}
          />
        </div>
      )}
    </div>
  );
};


