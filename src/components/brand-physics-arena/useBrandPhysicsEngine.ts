/**
 * useBrandPhysicsEngine.ts
 * Custom hook managing the 60 FPS 3D physics loop, viewport intersection observer,
 * responsive resize grid targets, and pointer grab/throw/click interactions.
 */

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { BrandCollaborationItem } from '../../data/creatorData';
import { BrandTier } from '../BrandTokenShared';
import {
  PhysicsMode,
  PhysicsBody,
  PointerState,
  HoveredBrandState,
} from './types';
import {
  computeTierDimensions,
  createInitialPhysicsBodies,
  recalculateBodiesGridTargets,
  applyScatterImpulseToBodies,
  releaseNeatFormationImpulse,
  stepBodyKinematicsAndForces,
  resolveCardToCardCollisions,
  commitBodiesToDomTransforms,
} from './physicsEngineSolver';

interface UseBrandPhysicsEngineParams {
  brands: BrandCollaborationItem[];
  onSelectBrand: (brand: BrandCollaborationItem) => void;
}

export function useBrandPhysicsEngine({
  brands,
  onSelectBrand,
}: UseBrandPhysicsEngineParams) {
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const cardElsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const glareElsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const bodiesRef = useRef<PhysicsBody[]>([]);
  const rafRef = useRef<number | null>(null);

  const [physicsMode, setPhysicsMode] = useState<PhysicsMode>('zero-g');
  const [magneticCursor, setMagneticCursor] = useState<boolean>(false);
  const [neatFormation, setNeatFormation] = useState<boolean>(false);
  const [showAllDensity, setShowAllDensity] = useState<boolean>(true);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [hoveredBrand, setHoveredBrand] = useState<HoveredBrandState | null>(null);
  const [hasEnteredViewport, setHasEnteredViewport] = useState<boolean>(false);

  // Refs for live 60 FPS loop access without re-binding requestAnimationFrame
  const modeRef = useRef<PhysicsMode>(physicsMode);
  modeRef.current = physicsMode;

  const magneticRef = useRef<boolean>(magneticCursor);
  magneticRef.current = magneticCursor;

  const neatRef = useRef<boolean>(neatFormation);
  neatRef.current = neatFormation;

  const pointerRef = useRef<PointerState>({
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    vx: 0,
    vy: 0,
    active: false,
    draggingId: null,
    dragOffsetX: 0,
    dragOffsetY: 0,
    downClientX: 0,
    downClientY: 0,
    downTime: 0,
  });

  // Sort so VIP & Repeat brands are prioritized when toggling featured vs all
  const sortedBrands = useMemo(() => {
    return [...brands].sort((a, b) => (b.campaignCount || 1) - (a.campaignCount || 1));
  }, [brands]);

  const visibleBrands = useMemo(() => {
    if (showAllDensity || sortedBrands.length <= 36) {
      return sortedBrands;
    }
    return sortedBrands.slice(0, 36);
  }, [sortedBrands, showAllDensity]);

  // 3-Tiered Token Dimensions based on collaboration count & screen size
  const getTierDimensions = useCallback(
    (tier: BrandTier) => {
      const width = arenaRef.current?.clientWidth || 1100;
      return computeTierDimensions(tier, width, showAllDensity, visibleBrands.length);
    },
    [showAllDensity, visibleBrands.length]
  );

  // Initialize or re-seed physics bodies when visibleBrands changes
  const initializeBodies = useCallback(
    (scatterExplosion = true) => {
      const container = arenaRef.current;
      const width = container?.clientWidth || 1100;
      const height = container?.clientHeight || 640;

      bodiesRef.current = createInitialPhysicsBodies(
        visibleBrands,
        width,
        height,
        scatterExplosion,
        getTierDimensions
      );
    },
    [visibleBrands, getTierDimensions]
  );

  // Trigger initial scatter when scrolling into section
  useEffect(() => {
    const el = arenaRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasEnteredViewport) {
            setHasEnteredViewport(true);
            initializeBodies(true);
          }
        });
      },
      { threshold: 0.18 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasEnteredViewport, initializeBodies]);

  // Re-initialize when filter or density changes
  useEffect(() => {
    initializeBodies(true);
  }, [visibleBrands, showAllDensity, initializeBodies]);

  // Update target grid coordinates on window resize
  useEffect(() => {
    const handleResize = () => {
      const container = arenaRef.current;
      if (!container) return;
      recalculateBodiesGridTargets(
        bodiesRef.current,
        container.clientWidth,
        container.clientHeight,
        getTierDimensions
      );
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getTierDimensions]);

  // Impulse button: Scatter / Shake all cards in 3D space
  const handleScatterImpulse = useCallback(() => {
    setNeatFormation(false);
    const container = arenaRef.current;
    const width = container?.clientWidth || 1100;
    const height = container?.clientHeight || 640;
    applyScatterImpulseToBodies(bodiesRef.current, width, height, modeRef.current);
  }, []);

  // Toggle neat floating grid formation
  const handleToggleNeatFormation = useCallback(() => {
    setNeatFormation((prev) => {
      const next = !prev;
      if (!next) {
        releaseNeatFormationImpulse(bodiesRef.current);
      }
      return next;
    });
  }, []);

  // Switch physics mode and unlock neat formation
  const handleSelectPhysicsMode = useCallback((mode: PhysicsMode) => {
    setNeatFormation(false);
    setPhysicsMode(mode);
  }, []);

  // Main 60 FPS 3D Physics & Collision Loop
  useEffect(() => {
    let lastTime = performance.now();

    const stepPhysics = (now: number) => {
      const dt = Math.min(2.0, (now - lastTime) / 16.667);
      lastTime = now;

      const container = arenaRef.current;
      if (container) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        const bodies = bodiesRef.current;
        const mode = modeRef.current;
        const isNeat = neatRef.current;
        const isMagnetic = magneticRef.current;
        const ptr = pointerRef.current;

        // 1. Advance forces & kinematics per body
        stepBodyKinematicsAndForces(
          bodies,
          now,
          dt,
          width,
          height,
          mode,
          isNeat,
          isMagnetic,
          ptr
        );

        // 2. Card-to-Card Elastic Collision Detection & Impulse Response
        resolveCardToCardCollisions(bodies, now, isNeat);

        // 3. Commit 3D CSS Matrix / Transforms directly to DOM nodes
        commitBodiesToDomTransforms(
          bodies,
          now,
          cardElsRef.current,
          glareElsRef.current
        );
      }

      rafRef.current = requestAnimationFrame(stepPhysics);
    };

    rafRef.current = requestAnimationFrame(stepPhysics);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Pointer Handlers on Arena Container
  const handleArenaPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ptr = pointerRef.current;

    ptr.vx = x - ptr.x;
    ptr.vy = y - ptr.y;
    ptr.prevX = ptr.x;
    ptr.prevY = ptr.y;
    ptr.x = x;
    ptr.y = y;
    ptr.active = true;
  }, []);

  const handleArenaPointerLeave = useCallback(() => {
    const ptr = pointerRef.current;
    ptr.active = false;
    if (ptr.draggingId) {
      const body = bodiesRef.current.find((b) => b.id === ptr.draggingId);
      if (body) body.isDragging = false;
      ptr.draggingId = null;
      setActiveDragId(null);
    }
    setHoveredBrand(null);
  }, []);

  // Card Pointer Down (Grab)
  const handleCardPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, brand: BrandCollaborationItem) => {
      e.stopPropagation();
      const rect = arenaRef.current?.getBoundingClientRect();
      if (!rect) return;

      const body = bodiesRef.current.find((b) => b.id === brand.id);
      if (!body) return;

      const ptr = pointerRef.current;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ptr.x = x;
      ptr.y = y;
      ptr.prevX = x;
      ptr.prevY = y;
      ptr.vx = 0;
      ptr.vy = 0;
      ptr.draggingId = brand.id;
      ptr.dragOffsetX = x - body.x;
      ptr.dragOffsetY = y - body.y;
      ptr.downClientX = e.clientX;
      ptr.downClientY = e.clientY;
      ptr.downTime = performance.now();

      body.isDragging = true;
      setActiveDragId(brand.id);
      setHoveredBrand(null);

      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Ignore capture errors on synthetic events
      }
    },
    []
  );

  // Card Pointer Up (Throw or Click to Inspect)
  const handleCardPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, brand: BrandCollaborationItem) => {
      e.stopPropagation();
      const ptr = pointerRef.current;
      const body = bodiesRef.current.find((b) => b.id === brand.id);

      if (body) {
        body.isDragging = false;
        body.vx = Math.max(-22, Math.min(22, ptr.vx * 1.15));
        body.vy = Math.max(-22, Math.min(22, ptr.vy * 1.15));
        body.vRotZ = Math.max(-6, Math.min(6, ptr.vx * 0.22));
      }

      ptr.draggingId = null;
      setActiveDragId(null);

      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Ignore release errors
      }

      const moveDist = Math.hypot(
        e.clientX - ptr.downClientX,
        e.clientY - ptr.downClientY
      );
      const elapsed = performance.now() - ptr.downTime;

      if (moveDist < 8 && elapsed < 420) {
        onSelectBrand(brand);
      }
    },
    [onSelectBrand]
  );

  const handleCardPointerEnter = useCallback((brand: BrandCollaborationItem) => {
    const b = bodiesRef.current.find((item) => item.id === brand.id);
    if (b) {
      b.isHovered = true;
      setHoveredBrand({
        brand,
        x: b.x,
        y: b.y,
        halfH: b.halfH,
      });
    }
  }, []);

  const handleCardPointerLeave = useCallback((brand: BrandCollaborationItem) => {
    const b = bodiesRef.current.find((item) => item.id === brand.id);
    if (b) b.isHovered = false;
    setHoveredBrand((prev) => (prev?.brand.id === brand.id ? null : prev));
  }, []);

  const registerCardRef = useCallback((brandId: string, node: HTMLDivElement | null) => {
    if (node) cardElsRef.current.set(brandId, node);
    else cardElsRef.current.delete(brandId);
  }, []);

  const registerGlareRef = useCallback((brandId: string, node: HTMLDivElement | null) => {
    if (node) glareElsRef.current.set(brandId, node);
    else glareElsRef.current.delete(brandId);
  }, []);

  return {
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
  };
}
