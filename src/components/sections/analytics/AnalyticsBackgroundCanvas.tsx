import React from 'react';
import { motion, MotionValue } from 'motion/react';
import { EASE_OUT_EXPO, REPEAT_VIEWPORT } from '../motionVariants';

interface AnalyticsBackgroundCanvasProps {
  telemetryGraphY: MotionValue<number>;
}

export const AnalyticsBackgroundCanvas: React.FC<AnalyticsBackgroundCanvasProps> = ({
  telemetryGraphY,
}) => {
  return (
    <motion.div
      aria-hidden="true"
      style={{ y: telemetryGraphY }}
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      {/* Coordinate Grid Paper */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(99, 102, 241, 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(99, 102, 241, 0.07) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Animated SVG Telemetry Curves (Re-draws on scroll up/down!) */}
      <svg
        className="absolute inset-x-0 bottom-0 w-full h-[420px] opacity-35"
        viewBox="0 0 1440 420"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="analyticsAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="emeraldLineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#10B981" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        <motion.path
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={REPEAT_VIEWPORT}
          transition={{ duration: 1.1 }}
          d="M0 360 C 220 330, 340 240, 540 250 C 740 260, 880 130, 1120 110 C 1260 95, 1360 45, 1440 30 L 1440 420 L 0 420 Z"
          fill="url(#analyticsAreaGrad)"
        />

        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={REPEAT_VIEWPORT}
          transition={{ duration: 1.9, ease: EASE_OUT_EXPO }}
          d="M0 360 C 220 330, 340 240, 540 250 C 740 260, 880 130, 1120 110 C 1260 95, 1360 45, 1440 30"
          stroke="#7C3AED"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={REPEAT_VIEWPORT}
          transition={{ duration: 2.3, delay: 0.15, ease: EASE_OUT_EXPO }}
          d="M0 390 C 260 360, 460 310, 680 280 C 920 250, 1100 210, 1440 120"
          stroke="url(#emeraldLineGrad)"
          strokeWidth="2.5"
          strokeDasharray="8 8"
        />

        {[
          { cx: 540, cy: 250 },
          { cx: 1120, cy: 110 },
          { cx: 1360, cy: 45 },
        ].map((pt, i) => (
          <g key={i}>
            <motion.circle
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: [1, 1.5, 1], opacity: [0.5, 0.9, 0.5] }}
              transition={{
                duration: 3,
                delay: 0.4 + i * 0.25,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              cx={pt.cx}
              cy={pt.cy}
              r="10"
              fill="#7C3AED"
              fillOpacity="0.2"
            />
            <circle cx={pt.cx} cy={pt.cy} r="4.5" fill="#6D28D9" />
          </g>
        ))}
      </svg>
    </motion.div>
  );
};
