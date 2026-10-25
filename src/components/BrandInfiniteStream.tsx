import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  BrandCollaborationItem,
  resolveGoogleDriveImage,
} from '../data/creatorData';
import { BrandHoverDetailCard } from './BrandTokenShared';

interface HoveredSeamTokenState {
  keyId: string;
  brand: BrandCollaborationItem;
  anchorX: number;
  notchAlign?: 'center' | 'left' | 'right';
}

interface BrandInfiniteStreamProps {
  brands: BrandCollaborationItem[];
  onSelectBrand: (brand: BrandCollaborationItem) => void;
  direction?: 'left' | 'right';
  tooltipPosition?: 'top' | 'bottom';
}

/**
 * Individual Logo Item on the Infinite Stream:
 * - Natural PNG silhouette (`object-contain`) when a PNG/image URL is provided,
 *   or a clean circular (`rounded-full`) brand logo emblem as fallback.
 * - Brand name badge positioned at the bottom-center of the logo (`ชื่ออยู่ตรงโลโก้ล่างกลาง`).
 * - No campaign count or numbers shown on the stream item (`ไม่ต้องบอกจำนวน แค่ให้เห็นโลโก้ก็พอ`).
 */
const StreamLogoNode: React.FC<{
  brand: BrandCollaborationItem;
  isHovered: boolean;
  onSelect: () => void;
  onHoverEnter: (el: HTMLElement) => void;
}> = ({ brand, isHovered, onSelect, onHoverEnter }) => {
  const [imgError, setImgError] = useState(false);
  const resolvedLogo = brand.logoUrl
    ? resolveGoogleDriveImage(brand.logoUrl)
    : '';
  const accentColor = brand.brandColor || '#6D28D9';

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={(e) => onHoverEnter(e.currentTarget)}
      aria-label={brand.brandName}
      className={`group relative flex flex-col items-center justify-center shrink-0 pt-1 pb-3 px-1 transition-all duration-200 cursor-pointer focus:outline-none ${
        isHovered
          ? 'opacity-100 saturate-100 scale-110 z-30'
          : 'opacity-75 saturate-[0.8] hover:opacity-100 hover:saturate-100 hover:scale-105'
      }`}
    >
      {/* Circular Logo or Natural Transparent PNG Silhouette */}
      {resolvedLogo && !imgError ? (
        <div className="relative w-13 h-13 sm:w-15 sm:h-15 flex items-center justify-center">
          <img
            src={resolvedLogo}
            alt={brand.brandName}
            referrerPolicy="no-referrer"
            draggable={false}
            className="w-full h-full object-contain drop-shadow-xs select-none pointer-events-none transition-transform duration-200"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div
          style={{
            background: `radial-gradient(circle at 32% 28%, #FFFFFF 0%, ${accentColor}15 68%, ${accentColor}2E 100%)`,
            borderColor: isHovered ? accentColor : `${accentColor}40`,
          }}
          className="relative w-13 h-13 sm:w-15 sm:h-15 rounded-full border bg-white shadow-2xs flex items-center justify-center overflow-hidden transition-all duration-200"
        >
          {/* Subtle Inner Circular Sheen */}
          <div
            style={{ borderColor: `${accentColor}22` }}
            className="w-[82%] h-[82%] rounded-full border border-dashed flex items-center justify-center px-1.5"
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
        className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full border text-[10px] font-bold leading-tight whitespace-nowrap max-w-[94px] truncate text-center transition-all duration-200 ${
          isHovered
            ? 'bg-violet-700 text-white border-violet-700 shadow-xs'
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
 * Renders circular / natural-shape PNG brand logos flowing continuously with
 * the brand name centered at the bottom of each logo.
 */
export const BrandInfiniteStream: React.FC<BrandInfiniteStreamProps> = ({
  brands,
  onSelectBrand,
  direction = 'left',
  tooltipPosition = 'top',
}) => {
  const seamRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef<number>(0);
  const currentVelRef = useRef<number>(0.6);
  const isSeamHoveredRef = useRef<boolean>(false);
  const [hoveredToken, setHoveredToken] = useState<HoveredSeamTokenState | null>(
    null
  );
  const [isExiting, setIsExiting] = useState(false);
  const exitTimerRef = useRef<number | null>(null);

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

      // Decelerate smoothly when hovering any brand on the seam
      const targetVel = isSeamHoveredRef.current ? 0.04 : baseSpeed;
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

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
      }
    };
  }, []);

  const handleMouseEnterItem = (
    keyId: string,
    brand: BrandCollaborationItem,
    el: HTMLElement
  ) => {
    if (!seamRef.current) return;

    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    setIsExiting(false);

    const seamRect = seamRef.current.getBoundingClientRect();
    const itemRect = el.getBoundingClientRect();
    const tooltipHalfWidth = 160;
    const screenMargin = 20;

    // Center of item relative to the viewport
    const itemCenterScreen = itemRect.left + itemRect.width * 0.5;

    // Clamped screen center so the tooltip is guaranteed never to clip off-screen
    const clampedScreenCenter = Math.max(
      tooltipHalfWidth + screenMargin,
      Math.min(
        window.innerWidth - tooltipHalfWidth - screenMargin,
        itemCenterScreen
      )
    );

    // Coordinate relative to seam container
    const anchorX = clampedScreenCenter - seamRect.left;

    // Detect if notch should offset slightly when clamped at edges
    const screenDiff = itemCenterScreen - clampedScreenCenter;
    let notchAlign: 'center' | 'left' | 'right' = 'center';
    if (screenDiff < -24) {
      notchAlign = 'left';
    } else if (screenDiff > 24) {
      notchAlign = 'right';
    }

    setHoveredToken({
      keyId,
      brand,
      anchorX,
      notchAlign,
    });
  };

  if (brands.length === 0) return null;

  return (
    <div
      ref={seamRef}
      onMouseEnter={() => {
        isSeamHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isSeamHoveredRef.current = false;
        if (hoveredToken) {
          setIsExiting(true);
          exitTimerRef.current = window.setTimeout(() => {
            setHoveredToken(null);
            setIsExiting(false);
          }, 180);
        }
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
          className="flex items-center gap-5 sm:gap-7 w-max will-change-transform py-1 px-4"
        >
          {loopItems.map((brand, idx) => {
            const keyId = `${brand.id}-seam-${idx}`;
            const isHovered = hoveredToken?.keyId === keyId;

            return (
              <StreamLogoNode
                key={keyId}
                brand={brand}
                isHovered={isHovered}
                onSelect={() => onSelectBrand(brand)}
                onHoverEnter={(el) => handleMouseEnterItem(keyId, brand, el)}
              />
            );
          })}
        </div>
      </div>

      {/* Floating Unclipped Hover Tooltip with Apple iOS Frosted Glass & Edge Clamping & Spring Exit */}
      {hoveredToken && (
        <div
          style={
            tooltipPosition === 'bottom'
              ? {
                  left: `${hoveredToken.anchorX}px`,
                  bottom: '-12px',
                  transform: 'translate(-50%, 100%)',
                }
              : {
                  left: `${hoveredToken.anchorX}px`,
                  top: '-12px',
                  transform: 'translate(-50%, -100%)',
                }
          }
          className="absolute z-35 pointer-events-none hidden sm:block"
        >
          <BrandHoverDetailCard
            brand={hoveredToken.brand}
            position={tooltipPosition}
            notchAlign={hoveredToken.notchAlign || 'center'}
            onSelectBrand={onSelectBrand}
            isExiting={isExiting}
          />
        </div>
      )}
    </div>
  );
};

