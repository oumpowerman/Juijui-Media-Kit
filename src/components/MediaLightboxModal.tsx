import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ExternalLink,
  Play,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  CalendarCheck,
  MonitorPlay,
  Smartphone,
  Clock,
} from 'lucide-react';
import { ViralWorkItem, resolveGoogleDriveImage } from '../data/creatorData';
import { PlatformBrandIcon } from './ui/PlatformBrandIcon';
import { EASE_OUT_EXPO } from './sections/motionVariants';

interface MediaLightboxModalProps {
  item: ViralWorkItem | null;
  onClose: () => void;
  onBookSimilar: (referenceTitle: string) => void;
}

export const MediaLightboxModal: React.FC<MediaLightboxModalProps> = ({
  item,
  onClose,
  onBookSimilar,
}) => {
  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="lightbox-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          onClick={onClose}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 56, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.94 }}
            transition={{ duration: 0.48, ease: EASE_OUT_EXPO }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl 2xl:max-w-5xl max-h-[90vh] overflow-hidden grid grid-cols-1 md:grid-cols-12 shadow-2xl"
          >
            {/* Left: Visual Media Preview (Slides in from Left) */}
            <motion.div
              initial={{ opacity: 0, x: -36 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.5, delay: 0.06, ease: EASE_OUT_EXPO }}
              className="md:col-span-6 bg-slate-950 flex items-center justify-center relative min-h-[320px] max-h-[560px] md:max-h-none overflow-hidden"
            >
              <motion.img
                initial={{ scale: 1.08, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.55, delay: 0.1, ease: EASE_OUT_EXPO }}
                src={
                  item.driveImageUrl
                    ? resolveGoogleDriveImage(item.driveImageUrl)
                    : item.thumbnailUrl
                }
                alt={item.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/assets/juijui/viral-2.jpg';
                }}
                className="w-full h-full object-contain"
              />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.18, ease: EASE_OUT_EXPO }}
                className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-black/85 via-black/40 to-transparent text-white flex items-center justify-between"
              >
                <div className="flex items-center gap-2 text-xs">
                  <PlatformBrandIcon platform={item.platform} size="sm" />
                  <span className="font-semibold">{item.platform}</span>
                  <span>·</span>
                  <span>
                    {item.orientation === 'horizontal' ? 'แนวนอน 16:9' : 'แนวตั้ง 9:16'}
                  </span>
                </div>

                {item.tiktokUrl && (
                  <motion.a
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    href={item.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-slate-950 text-xs font-semibold hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>เปิดดูคลิปต้นฉบับ</span>
                  </motion.a>
                )}
              </motion.div>
            </motion.div>

            {/* Right: Metrics, Comments & Booking CTA (Slides in from Right) */}
            <motion.div
              initial={{ opacity: 0, x: 36 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.5, delay: 0.08, ease: EASE_OUT_EXPO }}
              className="md:col-span-6 flex flex-col justify-between p-6 overflow-y-auto"
            >
              <div>
                {/* Top header & close */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <PlatformBrandIcon platform={item.platform} size="xs" withLabel />
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          item.orientation === 'horizontal'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-violet-100 text-violet-800 border border-violet-200'
                        }`}
                      >
                        {item.orientation === 'horizontal' ? (
                          <>
                            <MonitorPlay className="w-3 h-3" />
                            <span>แนวนอน 16:9</span>
                          </>
                        ) : (
                          <>
                            <Smartphone className="w-3 h-3" />
                            <span>แนวตั้ง 9:16</span>
                          </>
                        )}
                      </span>
                      {item.duration && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono-num font-semibold">
                          <Clock className="w-3 h-3" />
                          <span>{item.duration}</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">{item.title}</h3>
                    <p className="text-xs text-slate-600 mt-1">{item.subtitle}</p>
                  </div>
                  <motion.button
                    whileHover={{ rotate: 90, scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                    aria-label="ปิดหน้าต่าง"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* 4 Quantitative Stats with Staggered Pop */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5 py-4 border-y border-slate-200">
                  {[
                    {
                      icon: <Eye className="w-3.5 h-3.5 text-violet-600" />,
                      label: 'ยอดวิว',
                      value: item.views,
                    },
                    {
                      icon: <Heart className="w-3.5 h-3.5 text-pink-600" />,
                      label: 'กดถูกใจ',
                      value: item.likes,
                    },
                    {
                      icon: <MessageCircle className="w-3.5 h-3.5 text-blue-600" />,
                      label: 'คอมเมนต์',
                      value: item.commentsCount,
                    },
                    {
                      icon: <Share2 className="w-3.5 h-3.5 text-emerald-600" />,
                      label: 'แชร์ต่อ',
                      value: item.sharesCount,
                    },
                  ].map((stat, idx) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.14 + idx * 0.06,
                        ease: EASE_OUT_EXPO,
                      }}
                    >
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        {stat.icon}
                        <span>{stat.label}</span>
                      </div>
                      <p className="text-base font-bold text-slate-900 font-mono-num mt-0.5">
                        {stat.value}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Top Comments on this video */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900">
                    ตัวอย่างคอมเมนต์และเสียงตอบรับจากผู้ชม
                  </h4>
                  {item.topComments && item.topComments.length > 0 ? (
                    <div className="space-y-2.5">
                      {item.topComments.map((c, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: 0.22 + idx * 0.07,
                            ease: EASE_OUT_EXPO,
                          }}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                        >
                          <div className="flex items-center justify-between text-slate-500 mb-1">
                            <span className="font-semibold text-slate-800">{c.user}</span>
                            <span className="font-mono-num">ถูกใจ {c.likes}</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed">“{c.text}”</p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 py-2">
                      คอนเทนต์ได้รับความสนใจและมีการแชร์ต่อในกลุ่มผู้ชม Gen Z และวัยทำงานอย่างต่อเนื่อง
                    </p>
                  )}

                  {item.driveImageUrl && (
                    <div className="pt-2">
                      <a
                        href={item.driveImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 hover:underline"
                      >
                        <span>เปิดไฟล์ภาพความละเอียดสูงบน Google Drive</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.26, ease: EASE_OUT_EXPO }}
                className="pt-5 mt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    onClose();
                    onBookSimilar(item.title);
                  }}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-700 hover:bg-violet-800 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>จองงานสไตล์คลิปนี้</span>
                </motion.button>
                {item.tiktokUrl && (
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    href={item.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>ไปที่ช่อง {item.platform}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </motion.a>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
