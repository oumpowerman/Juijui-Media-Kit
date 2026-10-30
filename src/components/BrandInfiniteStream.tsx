import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  BrandCollaborationItem,
  resolveGoogleDriveImage,
} from '../data/creatorData';

interface BrandInfiniteStreamProps {
  brands: BrandCollaborationItem[];
  onSelectBrand: (brand: BrandCollaborationItem) => void;
  direction?: 'left' | 'right';
  tooltipPosition?: 'top' | 'bottom';
}

/**
 * Individual Logo Item on the Infinite Stream:
 * - Natural PNG silhouette (`object-contain`) or clean circular emblem fallback.
 * - Brand name badge positioned at the bottom-center of the logo (`ชื่ออยู่ตรงโลโก้ล่างกลาง`).
 * - Rich, tactile interactive hover effects:
 *   lifts (-translate-y-2), scales up (scale-115), glows with ambient drop-shadow,
 *   badge transforms to vibrant violet, and cursor feedback.
 * - Zero intrusive tooltips/popovers for a clean, uninterrupted browsing experience.
 */
const StreamLogoNode: React.FC<{
  brand: BrandCollaborationItem;
  isHovered: boolean;
  hasAnyHovered: boolean;
  onSelect: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}> = ({
  brand,
  isHovered,
  hasAnyHovered,
  onSelect,
  onHoverStart,
  onHoverEnd,
}) => {
  const [imgError, setImgError] = useState(false);
  const resolvedLogo = brand.logoUrl
    ? resolveGoogleDriveImage(brand.logoUrl)
    : '';
  const accentColor = brand.brandColor || '#6D28D9';

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      aria-label={brand.brandName}
      className={`group relative flex flex-col items-center justify-center shrink-0 pt-2 pb-3.5 px-2 transition-all duration-300 ease-out cursor-pointer focus:outline-none select-none ${
        isHovered
          ? 'opacity-100 saturate-110 -translate-y-2 scale-115 z-30'
          : hasAnyHovered
          ? 'opacity-55 saturate-[0.7] scale-95'
          : 'opacity-85 saturate-[0.85] hover:opacity-100 hover:saturate-100'
      }`}
    >
      {/* Circular Logo or Natural Transparent PNG Silhouette */}
      {resolvedLogo && !imgError ? (
        <div className="relative w-13 h-13 sm:w-15 sm:h-15 flex items-center justify-center transition-transform duration-300">
          <img
            src={resolvedLogo}
            alt={brand.brandName}
            referrerPolicy="no-referrer"
            draggable={false}
            className={`w-full h-full object-contain pointer-events-none transition-all duration-300 ${
              isHovered
                ? 'drop-shadow-[0_12px_22px_rgba(109,40,217,0.32)] brightness-105'
                : 'drop-shadow-xs'
            }`}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div
          style={{
            background: `radial-gradient(circle at 32% 28%, #FFFFFF 0%, ${accentColor}18 68%, ${accentColor}30 100%)`,
            borderColor: isHovered ? accentColor : `${accentColor}40`,
            boxShadow: isHovered
              ? `0 12px 24px -4px ${accentColor}45, 0 4px 10px -2px rgba(0,0,0,0.06)`
              : undefined,
          }}
          className={`relative w-13 h-13 sm:w-15 sm:h-15 rounded-full border bg-white flex items-center justify-center overflow-hidden transition-all duration-300 ${
            isHovered ? 'border-2' : 'shadow-2xs'
          }`}
        >
          {/* Subtle Inner Circular Sheen */}
          <div
            style={{ borderColor: `${accentColor}25` }}
            className="w-[82%] h-[82%] rounded-full border border-dashed flex items-center justify-center px-1.5 transition-transform duration-300"
          >
            <span
              style={{ color: accentColor }}
              className="font-bold tracking-tight text-center leading-none select-none text-[10px] sm:text-[11px] line-clamp-2 break-words"
            >
              {brand.brandName}
            </span>
          </div>
        </div>
      )}

      {/* Brand Name Centered at Bottom of Logo (ชื่ออยู่ตรงโลโก้ล่างกลาง) */}
      <div
        className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full border text-[10px] font-bold leading-tight whitespace-nowrap max-w-[96px] truncate text-center transition-all duration-300 ${
          isHovered
            ? 'bg-violet-700 text-white border-violet-700 shadow-md scale-105'
            : 'bg-white/95 text-slate-700 border-slate-200/90 shadow-2xs'
        }`}
      >
        {brand.brandName}
      </div>
    </button>
  );
};

/**
 * Minimal Section-Seam Brand Conveyor Belt
 * Continuously flows brand logos across the section with seamless wrap-around.
 * Provides instant tactile hover reactions directly on each logo without obscuring tooltips.
 */
export const BrandInfiniteStream: React.FC<BrandInfiniteStreamProps> = ({
  brands,
  onSelectBrand,
  direction = 'left',
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef<number>(0);
  const currentVelRef = useRef<number>(0.6);
  const isSeamHoveredRef = useRef<boolean>(false);
  const [hoveredKeyId, setHoveredKeyId] = useState<string | null>(null);

  // Ensure enough items in one cycle so wide & ultrawide (2560px–3840px+) viewports never see a seam gap
  const singleSet = useMemo(() => {
    if (brands.length === 0) return [];
    const minCount = 44;
    const repeated: BrandCollaborationItem[] = [];
    while (repeated.length < minCount) {
      repeated.push(...brands);
    }
    return repeated;
  }, [brands]);

  // Duplicate 2x for seamless 50% wrap-around
  const loopItems = useMemo(() => [...singleSet, ...singleSet], [singleSet]);

  useEffect(() => {
    let rafId: number;
    let lastTime = performance.now();
    const baseSpeed = 0.6;
    const dirMultiplier = direction === 'right' ? 1 : -1;

    const tick = (now: number) => {
      const dt = Math.min(2.5, (now - lastTime) / 16.667);
      lastTime = now;

      // Decelerate smoothly to a slow crawl when hovering over the conveyor seam or any brand item
      const targetVel = isSeamHoveredRef.current ? 0.08 : baseSpeed;
      currentVelRef.current += (targetVel - currentVelRef.current) * 0.12;

      if (Math.abs(currentVelRef.current) > 0.005 && trackRef.current) {
        const halfWidth = trackRef.current.scrollWidth * 0.5;
        if (halfWidth > 0) {
          offsetRef.current += dirMultiplier * currentVelRef.current * dt;
          if (direction === 'left' && Math.abs(offsetRef.current) >= halfWidth) {
            offsetRef.current += halfWidth;
          } else if (direction === 'right' && offsetRef.current >= 0) {
            offsetRef.current -= halfWidth;
          }
          trackRef.current.style.transform = `translate3d(${offsetRef.current.toFixed(
            2
          )}px, 0, 0)`;
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [direction]);

  if (brands.length === 0) return null;

  return (
    <div
      onMouseEnter={() => {
        isSeamHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isSeamHoveredRef.current = false;
        setHoveredKeyId(null);
      }}
      className="relative w-full bg-transparent py-2.5 overflow-visible select-none"
    >
      {/* Soft Left Edge Fade Mask */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-14 sm:w-28 2xl:w-44 bg-linear-to-r from-[#FAFAFC] via-[#FAFAFC]/85 to-transparent z-20" />

      {/* Soft Right Edge Fade Mask */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-14 sm:w-28 2xl:w-44 bg-linear-to-l from-[#FAFAFC] via-[#FAFAFC]/85 to-transparent z-20" />

      {/* Clipped Horizontal Conveyor Track */}
      <div className="w-full overflow-hidden">
        <div
          ref={trackRef}
          className="flex items-center gap-5 sm:gap-7 w-max will-change-transform py-2 px-4"
        >
          {loopItems.map((brand, idx) => {
            const keyId = `${brand.id}-seam-${idx}`;
            const isHovered = hoveredKeyId === keyId;

            return (
              <StreamLogoNode
                key={keyId}
                brand={brand}
                isHovered={isHovered}
                hasAnyHovered={hoveredKeyId !== null}
                onSelect={() => onSelectBrand(brand)}
                onHoverStart={() => setHoveredKeyId(keyId)}
                onHoverEnd={() => {
                  setHoveredKeyId((curr) => (curr === keyId ? null : curr));
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
