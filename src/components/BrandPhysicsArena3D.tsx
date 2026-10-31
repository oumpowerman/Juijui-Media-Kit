/**
 * BrandPhysicsArena3D.tsx
 * Interactive 3D Brand Collaboration Physics Stage Orchestrator.
 *
 * Refactored into modular subcomponents and a dedicated 60 FPS physics engine
 * under `./brand-physics-arena/` for maintainability and future scalability:
 * - `physicsEngineSolver.ts`: Pure 3D kinematics, forces, collisions, and DOM matrix transforms
 * - `useBrandPhysicsEngine.ts`: React lifecycle, observer, resize, and pointer drag/throw hook
 * - `ArenaTopHudBar.tsx`: Instructions, 3-Tier size legend, and brand density switcher
 * - `ArenaBrandToken3D.tsx`: Individual 3D brand token card with specular glare & badges
 * - `ArenaHoverPopoverLayer.tsx`: Clamped coordinate anchor & hover detail card overlay
 * - `ArenaBottomControlDock.tsx`: 3D mode selectors & interactive impulse controls
 */

import React from 'react';
import {
  BrandPhysicsArena3DProps,
  useBrandPhysicsEngine,
  ArenaTopHudBar,
  ArenaBrandToken3D,
  ArenaHoverPopoverLayer,
  ArenaBottomControlDock,
} from './brand-physics-arena';

export type { BrandPhysicsArena3DProps } from './brand-physics-arena';

export const BrandPhysicsArena3D: React.FC<BrandPhysicsArena3DProps> = ({
  brands,
  onSelectBrand,
}) => {
  const {
    arenaRef,
    visibleBrands,
    physicsMode,
    magneticCursor,
    neatFormation,
    showAllDensity,
    activeDragId,
    hoveredBrand,
    getTierDimensions,
    initializeBodies,
    setMagneticCursor,
    setShowAllDensity,
    handleSelectPhysicsMode,
    handleScatterImpulse,
    handleToggleNeatFormation,
    handleArenaPointerMove,
    handleArenaPointerLeave,
    handleCardPointerDown,
    handleCardPointerUp,
    handleCardPointerEnter,
    handleCardPointerLeave,
    registerCardRef,
    registerGlareRef,
  } = useBrandPhysicsEngine({ brands, onSelectBrand });

  return (
    <div className="relative w-full">
      {/* 3D Interactive Physics Stage */}
      <div
        ref={arenaRef}
        onPointerMove={handleArenaPointerMove}
        onPointerLeave={handleArenaPointerLeave}
        className="relative w-full h-[580px] sm:h-[660px] rounded-3xl overflow-hidden border border-slate-800/80 shadow-xl select-none touch-none"
        style={{
          perspective: '1200px',
          background:
            'radial-gradient(120% 100% at 50% 15%, #2E1065 0%, #1E1B4B 48%, #0F172A 100%)',
        }}
      >
        {/* Subtle 3D Studio Floor Grid & Ambient Depth Glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(167, 139, 250, 0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(167, 139, 250, 0.16) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            transform: 'perspective(900px) rotateX(24deg) scale(1.15)',
            transformOrigin: '50% 80%',
          }}
        />

        {/* Top-Left Instruction + 3-Tier Size Legend + Density Switcher */}
        <ArenaTopHudBar
          totalBrandsCount={brands.length}
          showAllDensity={showAllDensity}
          onToggleDensity={() => setShowAllDensity((prev) => !prev)}
        />

        {/* 3D Logo-First Tokens Stage Layer */}
        <div
          className="relative w-full h-full"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {visibleBrands.map((brand) => (
            <ArenaBrandToken3D
              key={brand.id}
              brand={brand}
              isBeingDragged={activeDragId === brand.id}
              getTierDimensions={getTierDimensions}
              onRegisterCardRef={registerCardRef}
              onRegisterGlareRef={registerGlareRef}
              onPointerDown={handleCardPointerDown}
              onPointerUp={handleCardPointerUp}
              onPointerEnter={handleCardPointerEnter}
              onPointerLeave={handleCardPointerLeave}
            />
          ))}
        </div>

        {/* Floating Hover Detail Card directly above/below the hovered 3D token */}
        <ArenaHoverPopoverLayer
          hoveredBrand={hoveredBrand}
          activeDragId={activeDragId}
          arenaWidth={arenaRef.current?.clientWidth || 1100}
        />

        {/* Unified Bottom Control Dock */}
        <ArenaBottomControlDock
          physicsMode={physicsMode}
          neatFormation={neatFormation}
          magneticCursor={magneticCursor}
          onSelectPhysicsMode={handleSelectPhysicsMode}
          onToggleMagneticCursor={() => setMagneticCursor((prev) => !prev)}
          onToggleNeatFormation={handleToggleNeatFormation}
          onScatterImpulse={handleScatterImpulse}
          onResetBodies={() => initializeBodies(true)}
        />
      </div>
    </div>
  );
};
