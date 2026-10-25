import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  Sparkles,
  RotateCcw,
  Shuffle,
  Magnet,
  Orbit,
  ArrowDownToLine,
  Move,
  Layers,
  LayoutGrid,
  Crown,
} from 'lucide-react';
import { BrandCollaborationItem } from '../data/creatorData';
import {
  BrandTier,
  getBrandTier,
  getTierMeta,
  BrandLogoVisual,
  BrandHoverDetailCard,
} from './BrandTokenShared';

interface BrandPhysicsArena3DProps {
  brands: BrandCollaborationItem[];
  onSelectBrand: (brand: BrandCollaborationItem) => void;
}

type PhysicsMode = 'zero-g' | 'gravity' | 'vortex';

interface PhysicsBody {
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

export const BrandPhysicsArena3D: React.FC<BrandPhysicsArena3DProps> = ({
  brands,
  onSelectBrand,
}) => {
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
  const [hoveredBrand, setHoveredBrand] = useState<{
    brand: BrandCollaborationItem;
    x: number;
    y: number;
    halfH: number;
  } | null>(null);
  const [hasEnteredViewport, setHasEnteredViewport] = useState<boolean>(false);

  // Refs for live loop access without re-binding RAF
  const modeRef = useRef<PhysicsMode>(physicsMode);
  modeRef.current = physicsMode;

  const magneticRef = useRef<boolean>(magneticCursor);
  magneticRef.current = magneticCursor;

  const neatRef = useRef<boolean>(neatFormation);
  neatRef.current = neatFormation;

  const pointerRef = useRef<{
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
  }>({
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
      const isMobile = width < 640;
      const isCrowded = showAllDensity && visibleBrands.length > 45;

      if (tier === 'vip') {
        const s = isMobile ? 88 : isCrowded ? 112 : 124;
        return { w: s, h: s };
      }
      if (tier === 'repeat') {
        const s = isMobile ? 74 : isCrowded ? 92 : 102;
        return { w: s, h: s };
      }
      const s = isMobile ? 64 : isCrowded ? 76 : 84;
      return { w: s, h: s };
    },
    [showAllDensity, visibleBrands.length]
  );

  // Initialize or re-seed physics bodies when visibleBrands changes
  const initializeBodies = useCallback(
    (scatterExplosion = true) => {
      const container = arenaRef.current;
      const width = container?.clientWidth || 1100;
      const height = container?.clientHeight || 640;

      const avgSize = width < 640 ? 78 : 96;
      const cols = Math.max(3, Math.floor((width - 48) / (avgSize + 14)));
      const total = visibleBrands.length;
      const rows = Math.ceil(total / cols);

      const newBodies: PhysicsBody[] = visibleBrands.map((brand, idx) => {
        const tier = getBrandTier(brand);
        const meta = getTierMeta(tier);
        const { w, h } = getTierDimensions(tier);
        const halfW = w * 0.5;
        const halfH = h * 0.5;

        const col = idx % cols;
        const row = Math.floor(idx / cols);

        const cellW = (width - 80) / cols;
        const cellH = Math.max(64, (height - 150) / Math.max(1, rows));

        const targetGridX = 40 + col * cellW + cellW * 0.5;
        const targetGridY = 54 + row * cellH + cellH * 0.5;

        const jitterX = (Math.random() - 0.5) * 42;
        const jitterY = (Math.random() - 0.5) * 32;

        const startX = scatterExplosion
          ? width * 0.5 + (Math.random() - 0.5) * 140
          : Math.max(halfW + 16, Math.min(width - halfW - 16, targetGridX + jitterX));
        const startY = scatterExplosion
          ? height * 0.45 + (Math.random() - 0.5) * 110
          : Math.max(halfH + 16, Math.min(height - halfH - 80, targetGridY + jitterY));

        const dx = targetGridX + jitterX - startX;
        const dy = targetGridY + jitterY - startY;

        // VIP tokens float slightly closer in Z depth by default
        const zDepth =
          tier === 'vip'
            ? 20 + Math.random() * 35
            : tier === 'repeat'
            ? (Math.random() - 0.3) * 60
            : (Math.random() - 0.6) * 80;

        return {
          id: brand.id,
          index: idx,
          tier,
          x: startX,
          y: startY,
          z: zDepth,
          vx: scatterExplosion
            ? dx * 0.065 + (Math.random() - 0.5) * 5.5
            : (Math.random() - 0.5) * 2.0,
          vy: scatterExplosion
            ? dy * 0.065 + (Math.random() - 0.5) * 5.5
            : (Math.random() - 0.5) * 2.0,
          vz: (Math.random() - 0.5) * 1.4,
          rotX: (Math.random() - 0.5) * 10,
          rotY: (Math.random() - 0.5) * 12,
          rotZ: (Math.random() - 0.5) * 14,
          vRotZ: (Math.random() - 0.5) * 1.1,
          halfW,
          halfH,
          mass: meta.mass,
          phase: idx * 0.73 + Math.random() * Math.PI,
          isDragging: false,
          isHovered: false,
          targetX: targetGridX,
          targetY: targetGridY,
          targetZ: tier === 'vip' ? 24 : 0,
          lastImpactTime: 0,
        };
      });

      bodiesRef.current = newBodies;
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
      const width = container.clientWidth;
      const height = container.clientHeight;
      const avgSize = width < 640 ? 78 : 96;
      const cols = Math.max(3, Math.floor((width - 48) / (avgSize + 14)));
      const rows = Math.ceil(bodiesRef.current.length / cols);
      const cellW = (width - 80) / cols;
      const cellH = Math.max(64, (height - 150) / Math.max(1, rows));

      bodiesRef.current.forEach((b, idx) => {
        const { w, h } = getTierDimensions(b.tier);
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        b.halfW = w * 0.5;
        b.halfH = h * 0.5;
        b.targetX = 40 + col * cellW + cellW * 0.5;
        b.targetY = 54 + row * cellH + cellH * 0.5;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getTierDimensions]);

  // Impulse button: Scatter / Shake all cards in 3D space
  const handleScatterImpulse = () => {
    setNeatFormation(false);
    const container = arenaRef.current;
    const width = container?.clientWidth || 1100;
    const height = container?.clientHeight || 640;
    const centerX = width * 0.5;
    const centerY = height * 0.45;

    bodiesRef.current.forEach((b) => {
      const angle =
        Math.atan2(b.y - centerY, b.x - centerX) + (Math.random() - 0.5) * 0.9;
      const speed = 9 + Math.random() * 11;
      b.vx = Math.cos(angle) * speed;
      b.vy = Math.sin(angle) * speed - (modeRef.current === 'gravity' ? 8 : 0);
      b.vz = (Math.random() - 0.5) * 8;
      b.vRotZ = (Math.random() - 0.5) * 5.5;
    });
  };

  // Toggle neat floating grid formation
  const handleToggleNeatFormation = () => {
    setNeatFormation((prev) => {
      const next = !prev;
      if (!next) {
        bodiesRef.current.forEach((b) => {
          b.vx = (Math.random() - 0.5) * 4;
          b.vy = (Math.random() - 0.5) * 4;
          b.vRotZ = (Math.random() - 0.5) * 1.5;
        });
      }
      return next;
    });
  };

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
        const bottomWall = height - 78;
        const topWall = 56;
        const leftWall = 18;
        const rightWall = width - 18;

        const bodies = bodiesRef.current;
        const mode = modeRef.current;
        const isNeat = neatRef.current;
        const isMagnetic = magneticRef.current;
        const ptr = pointerRef.current;

        ptr.vx *= 0.85;
        ptr.vy *= 0.85;

        // 1. Advance forces & kinematics per body
        for (let i = 0; i < bodies.length; i++) {
          const b = bodies[i];

          if (b.isDragging) {
            const targetDragX = ptr.x - ptr.dragOffsetX;
            const targetDragY = ptr.y - ptr.dragOffsetY;
            b.vx = (targetDragX - b.x) * 0.45;
            b.vy = (targetDragY - b.y) * 0.45;
            b.x = targetDragX;
            b.y = targetDragY;
            b.z += (95 - b.z) * 0.25;

            const targetRotY = Math.max(-28, Math.min(28, b.vx * 1.35));
            const targetRotX = Math.max(-28, Math.min(28, -b.vy * 1.35));
            b.rotY += (targetRotY - b.rotY) * 0.25;
            b.rotX += (targetRotX - b.rotX) * 0.25;
            b.rotZ += b.vx * 0.08;
            continue;
          }

          // When hovered, brake movement so the user can inspect the hover detail popover comfortably
          if (b.isHovered) {
            b.vx *= 0.65;
            b.vy *= 0.65;
            b.vRotZ *= 0.5;
            b.z += (85 - b.z) * 0.22;
            b.rotX *= 0.7;
            b.rotY *= 0.7;
            b.rotZ *= 0.75;
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            continue;
          }

          if (isNeat && b.targetX !== null && b.targetY !== null) {
            const dx = b.targetX - b.x;
            const dy = b.targetY - b.y;
            b.vx = b.vx * 0.78 + dx * 0.085;
            b.vy = b.vy * 0.78 + dy * 0.085;
            b.z += (Math.sin(now * 0.002 + b.phase) * 18 - b.z) * 0.1;
            b.rotX += (Math.cos(now * 0.0018 + b.phase) * 5 - b.rotX) * 0.12;
            b.rotY += (Math.sin(now * 0.0018 + b.phase) * 6 - b.rotY) * 0.12;
            b.rotZ *= 0.86;
            b.vRotZ *= 0.8;
          } else if (mode === 'zero-g') {
            const floatFx = Math.sin(now * 0.0013 + b.phase) * 0.042;
            const floatFy = Math.cos(now * 0.0011 + b.phase * 1.3) * 0.042;
            b.vx = (b.vx + floatFx * dt) * 0.986;
            b.vy = (b.vy + floatFy * dt) * 0.986;

            const baseZ = b.tier === 'vip' ? 22 : b.tier === 'repeat' ? 4 : -14;
            const targetZ = baseZ + Math.sin(now * 0.0015 + b.phase) * 38;
            b.z += (targetZ - b.z) * 0.03;

            b.rotX +=
              (Math.sin(now * 0.0016 + b.phase) * 10 + b.vy * 1.1 - b.rotX) * 0.1;
            b.rotY +=
              (Math.cos(now * 0.0014 + b.phase) * 12 + b.vx * 1.1 - b.rotY) * 0.1;
            b.vRotZ *= 0.985;
            b.rotZ += b.vRotZ * dt;
            b.vRotZ += -b.rotZ * 0.002 * dt;
          } else if (mode === 'gravity') {
            b.vy += 0.42 * dt;
            b.vx *= 0.99;
            b.vy *= 0.992;
            b.z += (0 - b.z) * 0.08;
            b.rotX += (-b.vy * 0.8 - b.rotX) * 0.12;
            b.rotY += (b.vx * 0.8 - b.rotY) * 0.12;
            b.vRotZ *= 0.96;
            b.rotZ += b.vRotZ * dt;
            b.vRotZ += -b.rotZ * 0.003 * dt;
          } else if (mode === 'vortex') {
            const cx = width * 0.5;
            const cy = (bottomWall + topWall) * 0.5;
            const dx = b.x - cx;
            const dy = b.y - cy;
            const dist = Math.hypot(dx, dy) || 1;
            // VIP orbits in inner ring, repeat in middle ring, standard in outer ring
            const targetRadius =
              b.tier === 'vip' ? 95 : b.tier === 'repeat' ? 185 : 265;

            const tx = -dy / dist;
            const ty = dx / dist;
            const radialForce = (targetRadius - dist) * 0.005;

            b.vx = (b.vx + (tx * 0.24 + (dx / dist) * radialForce) * dt) * 0.965;
            b.vy = (b.vy + (ty * 0.24 + (dy / dist) * radialForce) * dt) * 0.965;
            b.z += (Math.cos(now * 0.002 + b.phase) * 55 - b.z) * 0.05;
            b.rotX += (b.vy * 1.5 - b.rotX) * 0.12;
            b.rotY += (b.vx * 1.5 - b.rotY) * 0.12;
            b.rotZ += (b.vx * 0.28 - b.rotZ * 0.04) * dt;
          }

          // Optional Magnetic Cursor Repulsion / Swirl
          if (isMagnetic && ptr.active && !ptr.draggingId) {
            const mdx = b.x - ptr.x;
            const mdy = b.y - ptr.y;
            const mDist = Math.hypot(mdx, mdy);
            const magRadius = 190;
            if (mDist > 1 && mDist < magRadius) {
              const strength = (1 - mDist / magRadius) * 1.65;
              b.vx += (mdx / mDist) * strength + ptr.vx * 0.08;
              b.vy += (mdy / mDist) * strength + ptr.vy * 0.08;
              b.vRotZ += (mdx * ptr.vy - mdy * ptr.vx) * 0.0004;
              b.z = Math.min(80, b.z + strength * 4);
            }
          }

          // Clamp max velocity
          const maxV = 24;
          const speedSq = b.vx * b.vx + b.vy * b.vy;
          if (speedSq > maxV * maxV) {
            const s = maxV / Math.sqrt(speedSq);
            b.vx *= s;
            b.vy *= s;
          }

          b.x += b.vx * dt;
          b.y += b.vy * dt;

          // Wall Boundary Collisions
          const minX = leftWall + b.halfW;
          const maxX = rightWall - b.halfW;
          const minY = topWall + b.halfH;
          const maxY = bottomWall - b.halfH;

          const wallBounce = mode === 'gravity' ? 0.65 : 0.82;

          if (b.x < minX) {
            b.x = minX;
            b.vx = Math.abs(b.vx) * wallBounce;
            b.vRotZ += b.vy * 0.06;
          } else if (b.x > maxX) {
            b.x = maxX;
            b.vx = -Math.abs(b.vx) * wallBounce;
            b.vRotZ -= b.vy * 0.06;
          }

          if (b.y < minY) {
            b.y = minY;
            b.vy = Math.abs(b.vy) * wallBounce;
            b.vRotZ -= b.vx * 0.06;
          } else if (b.y > maxY) {
            b.y = maxY;
            b.vy = -Math.abs(b.vy) * wallBounce;
            if (mode === 'gravity' && Math.abs(b.vy) < 0.8) {
              b.vy = 0;
              b.vx *= 0.92;
            } else {
              b.vRotZ += b.vx * 0.05;
            }
          }
        }

        // 2. Card-to-Card Elastic Collision Detection & Impulse Response
        if (!isNeat) {
          for (let i = 0; i < bodies.length; i++) {
            const a = bodies[i];
            for (let j = i + 1; j < bodies.length; j++) {
              const b = bodies[j];

              const zDiff = Math.abs(a.z - b.z);
              if (!a.isDragging && !b.isDragging && zDiff > 58) continue;

              const dx = b.x - a.x;
              const dy = b.y - a.y;

              const minSepX = (a.halfW + b.halfW) * 0.9;
              const minSepY = (a.halfH + b.halfH) * 0.9;

              if (Math.abs(dx) < minSepX && Math.abs(dy) < minSepY) {
                const overlapX = minSepX - Math.abs(dx);
                const overlapY = minSepY - Math.abs(dy);

                const dist = Math.hypot(dx, dy) || 1;
                const nx = dx / dist;
                const ny = dy / dist;
                const penetration = Math.min(overlapX, overlapY) * 0.55;

                if (a.isDragging) {
                  b.x += nx * penetration * 1.8;
                  b.y += ny * penetration * 1.8;
                } else if (b.isDragging) {
                  a.x -= nx * penetration * 1.8;
                  a.y -= ny * penetration * 1.8;
                } else {
                  const totalMass = a.mass + b.mass;
                  a.x -= nx * penetration * (b.mass / totalMass);
                  a.y -= ny * penetration * (b.mass / totalMass);
                  b.x += nx * penetration * (a.mass / totalMass);
                  b.y += ny * penetration * (a.mass / totalMass);
                }

                const rvx = b.vx - a.vx;
                const rvy = b.vy - a.vy;
                const velAlongNormal = rvx * nx + rvy * ny;

                if (velAlongNormal < 0) {
                  const restitution = a.isDragging || b.isDragging ? 0.95 : 0.78;
                  const jImpulse =
                    (-(1 + restitution) * velAlongNormal) / (1 / a.mass + 1 / b.mass);

                  const impulseX = jImpulse * nx;
                  const impulseY = jImpulse * ny;

                  if (!a.isDragging && !a.isHovered) {
                    a.vx -= impulseX / a.mass;
                    a.vy -= impulseY / a.mass;
                    a.vRotZ += (nx * impulseY - ny * impulseX) * 0.018;
                  }
                  if (!b.isDragging && !b.isHovered) {
                    b.vx += impulseX / b.mass;
                    b.vy += impulseY / b.mass;
                    b.vRotZ -= (nx * impulseY - ny * impulseX) * 0.018;
                  }

                  if (Math.abs(velAlongNormal) > 2.2) {
                    a.lastImpactTime = now;
                    b.lastImpactTime = now;
                  }
                }
              }
            }
          }
        }

        // 3. Commit 3D CSS Matrix / Transforms directly to DOM nodes
        for (let i = 0; i < bodies.length; i++) {
          const b = bodies[i];
          const el = cardElsRef.current.get(b.id);
          if (!el) continue;

          const tx = b.x - b.halfW;
          const ty = b.y - b.halfH;
          const scale = b.isDragging ? 1.15 : b.isHovered ? 1.1 : 1.0;

          el.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(
            1
          )}px, ${b.z.toFixed(1)}px) rotateX(${b.rotX.toFixed(
            1
          )}deg) rotateY(${b.rotY.toFixed(1)}deg) rotateZ(${b.rotZ.toFixed(
            1
          )}deg) scale(${scale})`;

          const zIdx = b.isDragging
            ? 500
            : b.isHovered
            ? 450
            : Math.round(b.z + 150);
          el.style.zIndex = String(zIdx);

          const glareEl = glareElsRef.current.get(b.id);
          if (glareEl) {
            const impactBoost = Math.max(0, 1 - (now - b.lastImpactTime) / 320);
            const glareX = 50 + b.rotY * 2.2;
            const glareY = 50 - b.rotX * 2.2;
            glareEl.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,${(
              0.42 +
              impactBoost * 0.45
            ).toFixed(2)}) 0%, rgba(139,92,246,${(impactBoost * 0.22).toFixed(
              2
            )}) 45%, transparent 75%)`;
          }
        }
      }

      rafRef.current = requestAnimationFrame(stepPhysics);
    };

    rafRef.current = requestAnimationFrame(stepPhysics);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Pointer Handlers on Arena Container
  const handleArenaPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
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
  };

  const handleArenaPointerLeave = () => {
    const ptr = pointerRef.current;
    ptr.active = false;
    if (ptr.draggingId) {
      const body = bodiesRef.current.find((b) => b.id === ptr.draggingId);
      if (body) body.isDragging = false;
      ptr.draggingId = null;
      setActiveDragId(null);
    }
    setHoveredBrand(null);
  };

  // Card Pointer Down (Grab)
  const handleCardPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    brand: BrandCollaborationItem
  ) => {
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
  };

  // Card Pointer Up (Throw or Click to Inspect)
  const handleCardPointerUp = (
    e: React.PointerEvent<HTMLDivElement>,
    brand: BrandCollaborationItem
  ) => {
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
  };

  // Compute safe popover position inside the 3D Arena
  const hoverPopoverCoords = useMemo(() => {
    if (!hoveredBrand || activeDragId) return null;
    const arenaW = arenaRef.current?.clientWidth || 1100;
    const clampedX = Math.max(152, Math.min(arenaW - 152, hoveredBrand.x));
    const preferBottom = hoveredBrand.y - hoveredBrand.halfH < 220;
    const anchorY = preferBottom
      ? hoveredBrand.y + hoveredBrand.halfH + 14
      : hoveredBrand.y - hoveredBrand.halfH - 14;
    return { clampedX, anchorY, preferBottom };
  }, [hoveredBrand, activeDragId]);

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
        <div className="absolute top-3.5 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-450">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-900/90 border border-violet-400/30 text-white text-xs font-semibold shadow-md">
              <Move className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                หยิบโลโก้เหวี่ยงชนกันได้ · ชี้เมาส์ (Hover) เพื่อดูสถิติ · คลิกเพื่อดูคลิปตัวอย่าง
              </span>
            </div>

            {/* 3-Tier Size Legend Pill */}
            <div className="hidden xl:inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-950/85 border border-slate-700/80 text-[11px] font-semibold text-slate-300">
              <span className="inline-flex items-center gap-1 text-amber-300">
                <Crown className="w-3 h-3 text-amber-400" />
                <span>ขนาดใหญ่ XL: 5+ งาน</span>
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-300">ขนาดกลาง MD: 2–4 งาน</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300">ขนาดมาตรฐาน SM: 1 งาน</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {brands.length > 36 && (
              <button
                type="button"
                onClick={() => setShowAllDensity((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-violet-950 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-violet-400" />
                <span>
                  {showAllDensity
                    ? `กำลังแสดงครบ ${brands.length} แบรนด์ (สลับเป็น 36 แบรนด์เด่น)`
                    : `กำลังแสดง 36 แบรนด์เด่น (กดเพื่อเทลงมาทั้ง ${brands.length} แบรนด์)`}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* 3D Logo-First Tokens Stage Layer */}
        <div
          className="relative w-full h-full"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {visibleBrands.map((brand) => {
            const isBeingDragged = activeDragId === brand.id;
            const tier = getBrandTier(brand);
            const meta = getTierMeta(tier);
            const { w, h } = getTierDimensions(tier);
            const brandAccent =
              tier === 'vip' ? '#F59E0B' : brand.brandColor || '#6D28D9';

            return (
              <div
                key={brand.id}
                ref={(node) => {
                  if (node) cardElsRef.current.set(brand.id, node);
                  else cardElsRef.current.delete(brand.id);
                }}
                onPointerDown={(e) => handleCardPointerDown(e, brand)}
                onPointerUp={(e) => handleCardPointerUp(e, brand)}
                onPointerEnter={() => {
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
                }}
                onPointerLeave={() => {
                  const b = bodiesRef.current.find((item) => item.id === brand.id);
                  if (b) b.isHovered = false;
                  setHoveredBrand((prev) =>
                    prev?.brand.id === brand.id ? null : prev
                  );
                }}
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
                  ref={(node) => {
                    if (node) glareElsRef.current.set(brand.id, node);
                    else glareElsRef.current.delete(brand.id);
                  }}
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
          })}
        </div>

        {/* Floating Hover Detail Card directly above/below the hovered 3D token */}
        {hoveredBrand && hoverPopoverCoords && !activeDragId && (
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
        )}

        {/* Unified Bottom Control Dock */}
        <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-450 flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-950/92 border border-slate-700/90 text-white shadow-xl">
          {/* Physics Mode Selector */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 hidden sm:inline">
              โหมดฟิสิกส์ 3D:
            </span>
            <button
              type="button"
              onClick={() => {
                setNeatFormation(false);
                setPhysicsMode('zero-g');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                physicsMode === 'zero-g' && !neatFormation
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ลอยตัวไร้น้ำหนัก (Zero-G)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setNeatFormation(false);
                setPhysicsMode('gravity');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                physicsMode === 'gravity' && !neatFormation
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              <span>กองบนโต๊ะ (Gravity Drop)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setNeatFormation(false);
                setPhysicsMode('vortex');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                physicsMode === 'vortex' && !neatFormation
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Orbit className="w-3.5 h-3.5" />
              <span>โคจร 3 ชั้นตามระดับ (Vortex)</span>
            </button>
          </div>

          {/* Interactive Impulse & Helper Controls */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setMagneticCursor((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                magneticCursor
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
              title="เมื่อเปิดโหมดนี้ แค่เลื่อนเมาส์ผ่านการ์ดก็จะแหวกและหมุนตามแรงแม่เหล็ก"
            >
              <Magnet className="w-3.5 h-3.5" />
              <span>เมาส์แม่เหล็ก {magneticCursor ? 'ON' : 'OFF'}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleNeatFormation}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                neatFormation
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{neatFormation ? 'ปลดล็อกให้ลอยอิสระ' : 'จัดเรียงเข้าแถว'}</span>
            </button>

            <button
              type="button"
              onClick={handleScatterImpulse}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>เขย่าโลโก้ 3D!</span>
            </button>

            <button
              type="button"
              onClick={() => initializeBodies(true)}
              className="inline-flex items-center justify-center p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="รีเซ็ตตำแหน่งการ์ด"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
