/**
 * Types & Interfaces for the 3D Brand Physics Arena
 */

import { BrandCollaborationItem } from '../../data/creatorData';
import { BrandTier } from '../BrandTokenShared';

export interface BrandPhysicsArena3DProps {
  brands: BrandCollaborationItem[];
  onSelectBrand: (brand: BrandCollaborationItem) => void;
}

export type PhysicsMode = 'zero-g' | 'gravity' | 'vortex';

export interface PhysicsBody {
  id: string;
  index: number;
  tier: BrandTier;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  vRotZ: number;
  halfW: number;
  halfH: number;
  mass: number;
  phase: number;
  isDragging: boolean;
  isHovered: boolean;
  targetX: number | null;
  targetY: number | null;
  targetZ: number | null;
  lastImpactTime: number;
}

export interface PointerState {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  active: boolean;
  draggingId: string | null;
  dragOffsetX: number;
  dragOffsetY: number;
  downClientX: number;
  downClientY: number;
  downTime: number;
}

export interface HoveredBrandState {
  brand: BrandCollaborationItem;
  x: number;
  y: number;
  halfH: number;
}

export type TierDimensionsGetter = (tier: BrandTier) => { w: number; h: number };
