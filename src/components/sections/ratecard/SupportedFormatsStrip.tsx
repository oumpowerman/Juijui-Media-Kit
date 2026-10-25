import React from 'react';
import { motion } from 'motion/react';
import { Video } from 'lucide-react';
import { PlatformBrandIcon } from '../../ui/PlatformBrandIcon';
import { fadeUpVariant, REPEAT_VIEWPORT } from '../motionVariants';

export interface SupportedFormatsStripProps {
  supportedFormats: string[];
}

export const SupportedFormatsStrip: React.FC<SupportedFormatsStripProps> = ({
  supportedFormats,
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={REPEAT_VIEWPORT}
      variants={fadeUpVariant}
      className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 text-xs shadow-2xs"
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 font-bold text-slate-900">
          <Video className="w-4 h-4 text-violet-700" />
          <span>รูปแบบคอนเทนต์ที่รองรับ (แนวตั้ง 9:16 & แนวนอน 16:9):</span>
        </span>
        <div className="inline-flex items-center gap-1">
          <PlatformBrandIcon platform="TikTok" size="xs" />
          <PlatformBrandIcon platform="YouTube" size="xs" />
          <PlatformBrandIcon platform="Facebook" size="xs" />
          <PlatformBrandIcon platform="Instagram" size="xs" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-slate-700 font-semibold">
        {supportedFormats.map((fmt, idx) => (
          <React.Fragment key={fmt}>
            {idx > 0 && <span className="text-slate-300">·</span>}
            <span>{fmt}</span>
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
};
