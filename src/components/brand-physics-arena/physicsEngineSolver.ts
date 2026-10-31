/**
 * Pure 3D Physics Engine Solver & Direct DOM Transform Committer
 * Handles body initialization, force integration (Zero-G, Gravity, Vortex, Neat Grid, Magnetic Cursor),
 * wall boundaries, elastic mass-weighted card-to-card collisions, and 60 FPS CSS Matrix transforms.
 */

import { BrandCollaborationItem } from '../../data/creatorData';
import { BrandTier, getBrandTier, getTierMeta } from '../BrandTokenShared';
import {
  PhysicsBody,
  PhysicsMode,
  PointerState,
  TierDimensionsGetter,
} from './types';

/**
 * Computes 3-Tiered Token Dimensions based on collaboration count, screen width, and crowd density
 */
export function computeTierDimensions(
  tier: BrandTier,
  arenaWidth: number,
  showAllDensity: boolean,
  visibleCount: number
): { w: number; h: number } {
  const isMobile = arenaWidth < 640;
  const isCrowded = showAllDensity && visibleCount > 45;

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
}

/**
 * Initializes or re-seeds physics bodies when visibleBrands or layout density changes
 */
export function createInitialPhysicsBodies(
  visibleBrands: BrandCollaborationItem[],
  width: number,
  height: number,
  scatterExplosion: boolean,
  getTierDimensions: TierDimensionsGetter
): PhysicsBody[] {
  const avgSize = width < 640 ? 78 : 96;
  const cols = Math.max(3, Math.floor((width - 48) / (avgSize + 14)));
  const total = visibleBrands.length;
  const rows = Math.ceil(total / cols);

  return visibleBrands.map((brand, idx) => {
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
}

/**
 * Updates target grid coordinates and dimensions on container resize
 */
export function recalculateBodiesGridTargets(
  bodies: PhysicsBody[],
  width: number,
  height: number,
  getTierDimensions: TierDimensionsGetter
): void {
  const avgSize = width < 640 ? 78 : 96;
  const cols = Math.max(3, Math.floor((width - 48) / (avgSize + 14)));
  const rows = Math.ceil(bodies.length / cols);
  const cellW = (width - 80) / cols;
  const cellH = Math.max(64, (height - 150) / Math.max(1, rows));

  bodies.forEach((b, idx) => {
    const { w, h } = getTierDimensions(b.tier);
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    b.halfW = w * 0.5;
    b.halfH = h * 0.5;
    b.targetX = 40 + col * cellW + cellW * 0.5;
    b.targetY = 54 + row * cellH + cellH * 0.5;
  });
}

/**
 * Applies radial scatter impulse to all bodies (Shake 3D Logos button)
 */
export function applyScatterImpulseToBodies(
  bodies: PhysicsBody[],
  width: number,
  height: number,
  mode: PhysicsMode
): void {
  const centerX = width * 0.5;
  const centerY = height * 0.45;

  bodies.forEach((b) => {
    const angle =
      Math.atan2(b.y - centerY, b.x - centerX) + (Math.random() - 0.5) * 0.9;
    const speed = 9 + Math.random() * 11;
    b.vx = Math.cos(angle) * speed;
    b.vy = Math.sin(angle) * speed - (mode === 'gravity' ? 8 : 0);
    b.vz = (Math.random() - 0.5) * 8;
    b.vRotZ = (Math.random() - 0.5) * 5.5;
  });
}

/**
 * Applies gentle random drift when unlocking from Neat Grid formation
 */
export function releaseNeatFormationImpulse(bodies: PhysicsBody[]): void {
  bodies.forEach((b) => {
    b.vx = (Math.random() - 0.5) * 4;
    b.vy = (Math.random() - 0.5) * 4;
    b.vRotZ = (Math.random() - 0.5) * 1.5;
  });
}

/**
 * Step 1 of 60 FPS Loop: Advances forces, kinematics, and wall boundary collisions per body
 */
export function stepBodyKinematicsAndForces(
  bodies: PhysicsBody[],
  now: number,
  dt: number,
  width: number,
  height: number,
  mode: PhysicsMode,
  isNeat: boolean,
  isMagnetic: boolean,
  ptr: PointerState
): void {
  const bottomWall = height - 78;
  const topWall = 56;
  const leftWall = 18;
  const rightWall = width - 18;

  ptr.vx *= 0.85;
  ptr.vy *= 0.85;

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
}

/**
 * Step 2 of 60 FPS Loop: Card-to-Card Elastic Collision Detection & Impulse Response
 */
export function resolveCardToCardCollisions(
  bodies: PhysicsBody[],
  now: number,
  isNeat: boolean
): void {
  if (isNeat) return;

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

/**
 * Step 3 of 60 FPS Loop: Commits 3D CSS Matrix / Transforms & Specular Glare directly to DOM nodes
 */
export function commitBodiesToDomTransforms(
  bodies: PhysicsBody[],
  now: number,
  cardEls: Map<string, HTMLDivElement>,
  glareEls: Map<string, HTMLDivElement>
): void {
  for (let i = 0; i < bodies.length; i++) {
    const b = bodies[i];
    const el = cardEls.get(b.id);
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

    const glareEl = glareEls.get(b.id);
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
