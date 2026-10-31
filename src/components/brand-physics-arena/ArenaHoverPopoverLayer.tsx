/**
 * ArenaHoverPopoverLayer.tsx
 * Computes clamped safe coordinates within the 3D Arena and displays BrandHoverDetailCard
 * directly above or below the hovered 3D brand token.
 */

import React, { useMemo } from 'react';
import { BrandHoverDetailCard } from '../BrandTokenShared';
import { HoveredBrandState } from './types';

interface ArenaHoverPopoverLayerProps {
  hoveredBrand: HoveredBrandState | null;
  activeDragId: string | null;
  arenaWidth: number;
}

export const ArenaHoverPopoverLayer: React.FC<ArenaHoverPopoverLayerProps> = ({
  hoveredBrand,
  activeDragId,
  arenaWidth,
}) => {
  const hoverPopoverCoords = useMemo(() => {
    if (!hoveredBrand || activeDragId) return null;
    const safeWidth = arenaWidth || 1100;
    const clampedX = Math.max(152, Math.min(safeWidth - 152, hoveredBrand.x));
    const preferBottom = hoveredBrand.y - hoveredBrand.halfH < 220;
    const anchorY = preferBottom
      ? hoveredBrand.y + hoveredBrand.halfH + 14
      : hoveredBrand.y - hoveredBrand.halfH - 14;
    return { clampedX, anchorY, preferBottom };
  }, [hoveredBrand, activeDragId, arenaWidth]);

  if (!hoveredBrand || !hoverPopoverCoords || activeDragId) {
    return null;
  }

  return (
    <div
      style={{
        left: `${hoverPopoverCoords.clampedX}px`,
        top: `${hoverPopoverCoords.anchorY}px`,
        transform: hoverPopoverCoords.preferBottom
          ? 'translate(-50%, 0)'
          : 'translate(-50%, -100%)',
      }}
      className="absolute z-500 pointer-events-none hidden sm:block"
    >
      <BrandHoverDetailCard
        brand={hoveredBrand.brand}
        position={hoverPopoverCoords.preferBottom ? 'bottom' : 'top'}
      />
    </div>
  );
};
