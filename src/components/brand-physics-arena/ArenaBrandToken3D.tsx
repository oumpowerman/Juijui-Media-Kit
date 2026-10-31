/**
 * ArenaBrandToken3D.tsx
 * Renders an individual 3D brand token card with its logo visual, dynamic 3D specular glare overlay,
 * campaign count badge, and brand name badge.
 */

import React from 'react';
import { Crown } from 'lucide-react';
import { BrandCollaborationItem } from '../../data/creatorData';
import {
  getBrandTier,
  getTierMeta,
  BrandLogoVisual,
} from '../BrandTokenShared';
import { TierDimensionsGetter } from './types';

interface ArenaBrandToken3DProps {
  brand: BrandCollaborationItem;
  isBeingDragged: boolean;
  getTierDimensions: TierDimensionsGetter;
  onRegisterCardRef: (brandId: string, node: HTMLDivElement | null) => void;
  onRegisterGlareRef: (brandId: string, node: HTMLDivElement | null) => void;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>, brand: BrandCollaborationItem) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>, brand: BrandCollaborationItem) => void;
  onPointerEnter: (brand: BrandCollaborationItem) => void;
  onPointerLeave: (brand: BrandCollaborationItem) => void;
}

export const ArenaBrandToken3D: React.FC<ArenaBrandToken3DProps> = ({
  brand,
  isBeingDragged,
  getTierDimensions,
  onRegisterCardRef,
  onRegisterGlareRef,
  onPointerDown,
  onPointerUp,
  onPointerEnter,
  onPointerLeave,
}) => {
  const tier = getBrandTier(brand);
  const meta = getTierMeta(tier);
  const { w, h } = getTierDimensions(tier);
  const brandAccent = tier === 'vip' ? '#F59E0B' : brand.brandColor || '#6D28D9';

  return (
    <div
      ref={(node) => onRegisterCardRef(brand.id, node)}
      onPointerDown={(e) => onPointerDown(e, brand)}
      onPointerUp={(e) => onPointerUp(e, brand)}
      onPointerEnter={() => onPointerEnter(brand)}
      onPointerLeave={() => onPointerLeave(brand)}
      style={{
        width: `${w}px`,
        height: `${h}px`,
        borderBottomWidth: tier === 'vip' ? '4px' : '3px',
        borderBottomColor: brandAccent,
        willChange: 'transform',
      }}
      className={`group absolute top-0 left-0 ${
        tier === 'vip' ? 'rounded-3xl' : 'rounded-2xl'
      } bg-white border-2 ${
        meta.ringClass
      } flex items-center justify-center transition-shadow select-none ${
        isBeingDragged
          ? 'cursor-grabbing shadow-2xl ring-2 ring-amber-400'
          : 'cursor-grab hover:shadow-2xl'
      }`}
    >
      {/* Full-Card Brand Logo Canvas */}
      <div className="w-full h-full rounded-[inherit] overflow-hidden relative pointer-events-none">
        <BrandLogoVisual brand={brand} tier={tier} />
      </div>

      {/* Dynamic 3D Specular Glare Overlay */}
      <div
        ref={(node) => onRegisterGlareRef(brand.id, node)}
        className="absolute inset-0 rounded-[inherit] pointer-events-none opacity-65"
      />

      {/* Top-Right Campaign Count Badge */}
      <span
        className={`absolute -top-2 -right-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono-num pointer-events-none z-20 ${meta.countBadgeClass}`}
      >
        {tier === 'vip' && <Crown className="w-2.5 h-2.5 shrink-0" />}
        <span>{brand.campaignCount}x</span>
      </span>

      {/* Bottom-Center Brand Name Badge */}
      <span
        className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 max-w-[94%] px-2 py-0.5 rounded-full text-[10px] font-bold truncate shadow-sm pointer-events-none z-20 ${meta.nameBadgeClass}`}
      >
        {brand.brandName}
      </span>
    </div>
  );
};
