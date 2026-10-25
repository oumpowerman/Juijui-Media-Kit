import React from 'react';
import { motion, MotionValue } from 'motion/react';
import { EASE_OUT_EXPO, REPEAT_VIEWPORT } from '../motionVariants';

interface BrandConstellationCanvasProps {
  constellationY: MotionValue<number>;
}

const CONSTELLATION_NODES = [
  { cx: 180, cy: 140, r: 4.5, delay: 0.1 },
  { cx: 390, cy: 85, r: 5.5, delay: 0.25 },
  { cx: 640, cy: 165, r: 4.5, delay: 0.4 },
  { cx: 880, cy: 95, r: 6, delay: 0.55 },
  { cx: 1140, cy: 155, r: 5, delay: 0.7 },
  { cx: 1310, cy: 75, r: 4.5, delay: 0.85 },
  { cx: 290, cy: 360, r: 4.5, delay: 0.2 },
  { cx: 540, cy: 310, r: 6, delay: 0.35 },
  { cx: 790, cy: 380, r: 4.5, delay: 0.5 },
  { cx: 1040, cy: 290, r: 5.5, delay: 0.65 },
  { cx: 1270, cy: 340, r: 4.5, delay: 0.8 },
];

const CONSTELLATION_LINKS = [
  'M 180 140 L 390 85 L 640 165 L 880 95 L 1140 155 L 1310 75',
  'M 290 360 L 540 310 L 790 380 L 1040 290 L 1270 340',
  'M 390 85 L 540 310',
  'M 640 165 L 790 380',
  'M 880 95 L 1040 290',
  'M 1140 155 L 1270 340',
];

const PULSE_HUB_NODES = [
  { cx: 340, cy: 495 },
  { cx: 740, cy: 410 },
  { cx: 1120, cy: 335 },
  { cx: 1340, cy: 265 },
];

export const BrandConstellationCanvas: React.FC<BrandConstellationCanvasProps> = ({
  constellationY,
}) => {
  return (
    <motion.div
      aria-hidden="true"
      style={{ y: constellationY }}
      className="pointer-events-none absolute -inset-y-20 inset-x-0 overflow-hidden select-none z-0"
    >
      {/* Soft Silver-Slate Studio Radial Illumination */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(900px circle at 18% 18%, rgba(203, 213, 225, 0.38), transparent 60%), radial-gradient(850px circle at 85% 52%, rgba(148, 163, 184, 0.22), transparent 62%), radial-gradient(900px circle at 45% 88%, rgba(226, 232, 240, 0.45), transparent 65%)',
        }}
      />

      {/* Clean Silver-Slate Architectural Coordinate Grid */}
      <div
        className="absolute inset-0 opacity-65"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(100, 116, 139, 0.075) 1px, transparent 1px), linear-gradient(to bottom, rgba(100, 116, 139, 0.075) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Secondary Fine Sub-Grid for Executive Precision */}
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(71, 85, 105, 0.16) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Upper & Mid Section: Brand Constellation Network SVG */}
      <svg
        className="absolute inset-x-0 top-6 w-full h-[540px] opacity-60"
        viewBox="0 0 1440 540"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="silverConstellationGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.1" />
            <stop offset="30%" stopColor="#64748B" stopOpacity="0.42" />
            <stop offset="70%" stopColor="#475569" stopOpacity="0.48" />
            <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.12" />
          </linearGradient>

          <linearGradient id="coolSlateWaveGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#64748B" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Constellation Network Connecting Lines (Draw on Scroll) */}
        {CONSTELLATION_LINKS.map((d, idx) => (
          <motion.path
            key={idx}
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={REPEAT_VIEWPORT}
            transition={{
              duration: 1.8,
              delay: idx * 0.1,
              ease: EASE_OUT_EXPO,
            }}
            d={d}
            stroke="url(#silverConstellationGrad)"
            strokeWidth="1.5"
            strokeDasharray={idx >= 2 ? '5 6' : undefined}
          />
        ))}

        {/* Ambient Harmonic Brand Wave Across Mid Canvas */}
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={REPEAT_VIEWPORT}
          transition={{ duration: 2.1, delay: 0.15, ease: EASE_OUT_EXPO }}
          d="M0 240 C 240 170, 460 295, 720 215 C 980 135, 1180 250, 1440 165"
          stroke="url(#coolSlateWaveGrad)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Constellation Partner Nodes with Silver-Blue Pulse */}
        {CONSTELLATION_NODES.map((node, i) => (
          <g key={i}>
            <motion.circle
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{
                scale: [1, 1.65, 1],
                opacity: [0.3, 0.75, 0.3],
              }}
              viewport={REPEAT_VIEWPORT}
              transition={{
                duration: 3.4,
                delay: node.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              cx={node.cx}
              cy={node.cy}
              r={node.r * 2.4}
              fill="#94A3B8"
              fillOpacity="0.24"
            />
            <motion.circle
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={REPEAT_VIEWPORT}
              transition={{
                duration: 0.6,
                delay: node.delay,
                ease: EASE_OUT_EXPO,
              }}
              cx={node.cx}
              cy={node.cy}
              r={node.r}
              fill="#475569"
              stroke="#F8FAFC"
              strokeWidth="1.5"
            />
          </g>
        ))}
      </svg>

      {/* Lower & Full-Span Section: Partnership Pulse Telemetry Curves (Analytics-Ref Style) */}
      <svg
        className="absolute inset-x-0 bottom-0 w-full h-[640px] opacity-45"
        viewBox="0 0 1440 640"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="brandSilverAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#64748B" stopOpacity="0.16" />
            <stop offset="65%" stopColor="#94A3B8" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="silverPulseStrokeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.25" />
            <stop offset="45%" stopColor="#475569" stopOpacity="0.65" />
            <stop offset="85%" stopColor="#334155" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#64748B" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="slateSecondaryStrokeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#64748B" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#475569" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Soft Metallic Shaded Area Under Curve */}
        <motion.path
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={REPEAT_VIEWPORT}
          transition={{ duration: 1.2 }}
          d="M0 560 C 180 535, 340 495, 520 465 C 740 410, 920 385, 1120 335 C 1240 300, 1340 265, 1440 230 L 1440 640 L 0 640 Z"
          fill="url(#brandSilverAreaGrad)"
        />

        {/* Primary Self-Drawing Brand Momentum Curve */}
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={REPEAT_VIEWPORT}
          transition={{ duration: 1.95, ease: EASE_OUT_EXPO }}
          d="M0 560 C 180 535, 340 495, 520 465 C 740 410, 920 385, 1120 335 C 1240 300, 1340 265, 1440 230"
          stroke="url(#silverPulseStrokeGrad)"
          strokeWidth="2.75"
          strokeLinecap="round"
        />

        {/* Secondary Dashed Repeat-Partner Harmonic Curve */}
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={REPEAT_VIEWPORT}
          transition={{ duration: 2.35, delay: 0.16, ease: EASE_OUT_EXPO }}
          d="M0 595 C 260 565, 480 510, 740 465 C 980 420, 1180 375, 1440 295"
          stroke="url(#slateSecondaryStrokeGrad)"
          strokeWidth="2.2"
          strokeDasharray="8 8"
        />

        {/* Pulsing Hub Nodes Along Primary Curve */}
        {PULSE_HUB_NODES.map((pt, i) => (
          <g key={i}>
            <motion.circle
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: [1, 1.55, 1], opacity: [0.4, 0.85, 0.4] }}
              viewport={REPEAT_VIEWPORT}
              transition={{
                duration: 3.1,
                delay: 0.35 + i * 0.22,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              cx={pt.cx}
              cy={pt.cy}
              r="11"
              fill="#64748B"
              fillOpacity="0.22"
            />
            <circle
              cx={pt.cx}
              cy={pt.cy}
              r="4.5"
              fill="#334155"
              stroke="#F8FAFC"
              strokeWidth="1.5"
            />
          </g>
        ))}
      </svg>
    </motion.div>
  );
};
