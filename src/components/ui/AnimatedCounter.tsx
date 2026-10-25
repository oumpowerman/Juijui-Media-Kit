import React, { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'motion/react';
import { EASE_OUT_EXPO } from '../sections/motionVariants';

interface AnimatedCounterProps {
  value: string | number;
  duration?: number;
  delay?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

interface ParsedMetric {
  leadingText: string;
  numericValue: number;
  decimals: number;
  useCommas: boolean;
  trailingText: string;
}

function parseMetricValue(raw: string | number): ParsedMetric | null {
  if (typeof raw === 'number') {
    return {
      leadingText: '',
      numericValue: raw,
      decimals: Number.isInteger(raw) ? 0 : 1,
      useCommas: true,
      trailingText: '',
    };
  }

  const str = String(raw).trim();
  // Match first numeric group (supports commas and decimals, e.g. "979.1K+", "10,000 .-", "+1,500.-")
  const match = str.match(/^([^0-9]*)([0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?)(.*)$/);
  if (!match) return null;

  const leadingText = match[1] || '';
  const numPart = match[2];
  const trailingText = match[3] || '';

  const cleanNumStr = numPart.replace(/,/g, '');
  const numericValue = parseFloat(cleanNumStr);
  if (Number.isNaN(numericValue)) return null;

  const decimalSplit = cleanNumStr.split('.');
  const decimals = decimalSplit.length > 1 ? decimalSplit[1].length : 0;
  const useCommas = numPart.includes(',') || numericValue >= 1000;

  return {
    leadingText,
    numericValue,
    decimals,
    useCommas,
    trailingText,
  };
}

function formatNumber(val: number, decimals: number, useCommas: boolean): string {
  const fixed = val.toFixed(decimals);
  if (!useCommas) return fixed;
  const parts = fixed.split('.');
  parts[0] = Number(parts[0]).toLocaleString('en-US');
  return parts.join('.');
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1.65,
  delay = 0.05,
  className = '',
  prefix = '',
  suffix = '',
}) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(spanRef, {
    once: false,
    amount: 0.2,
    margin: '-20px 0px -20px 0px',
  });

  const parsed = parseMetricValue(value);
  const [displayStr, setDisplayStr] = useState<string>(() => String(value));

  useEffect(() => {
    if (!parsed) {
      setDisplayStr(String(value));
      return;
    }

    if (!isInView) {
      // Reset to 0 when out of view so scrolling back in triggers a fresh count-up
      const zeroFormatted = formatNumber(0, parsed.decimals, parsed.useCommas);
      setDisplayStr(`${parsed.leadingText}${zeroFormatted}${parsed.trailingText}`);
      return;
    }

    const controls = animate(0, parsed.numericValue, {
      duration,
      delay,
      ease: EASE_OUT_EXPO,
      onUpdate: (latest) => {
        const formatted = formatNumber(latest, parsed.decimals, parsed.useCommas);
        setDisplayStr(`${parsed.leadingText}${formatted}${parsed.trailingText}`);
      },
    });

    return () => controls.stop();
  }, [isInView, value, duration, delay]);

  return (
    <span ref={spanRef} className={`tabular-nums ${className}`}>
      {prefix}
      {displayStr}
      {suffix}
    </span>
  );
};
