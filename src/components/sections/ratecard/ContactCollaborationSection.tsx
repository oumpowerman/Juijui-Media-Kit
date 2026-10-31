import React, { useState } from 'react';
import { motion, MotionValue } from 'motion/react';
import {
  MessageSquare,
  Mail,
  FileText,
  Copy,
  CalendarCheck,
  Edit3,
} from 'lucide-react';
import { CreatorProfile } from '../../../data/creatorData';
import { PlatformBrandIcon } from '../../ui/PlatformBrandIcon';
import {
  REPEAT_VIEWPORT,
  slideFromLeftVariant,
  slideFromRightVariant,
} from '../motionVariants';

export interface ContactCollaborationSectionProps {
  currentCreator: CreatorProfile;
  portraitParallaxY: MotionValue<number>;
  onOpenPdf: () => void;
  onOpenBookingForPackage: (packageId: string) => void;
  selectedPackageId: string;
  onOpenAdmin?: () => void;
  onOpenAdminContact?: () => void;
}

export const ContactCollaborationSection: React.FC<ContactCollaborationSectionProps> = ({
  currentCreator,
  portraitParallaxY,
  onOpenPdf,
  onOpenBookingForPackage,
  selectedPackageId,
  onOpenAdmin,
  onOpenAdminContact,
}) => {
  const [copiedContact, setCopiedContact] = useState<string | null>(null);

  const handleCopyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedContact(type);
      setTimeout(() => setCopiedContact(null), 2500);
    });
  };

  return (
    <section id="contact" className="py-16 bg-white overflow-hidden">
      <div className="w-full max-w-7xl xl:max-w-[94vw] 2xl:max-w-[95vw] min-[2400px]:max-w-[2280px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-6 2xl:px-8">
        <div className="bg-linear-to-br from-[#F5F3FF] via-white to-[#FDF2F8] border border-slate-200/90 rounded-2xl p-6 sm:p-10 2xl:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 2xl:gap-12 items-center">
          {/* Left Contact Channels (Slides from Left on every scroll) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={REPEAT_VIEWPORT}
            variants={slideFromLeftVariant}
            className="lg:col-span-7 space-y-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-violet-700">
                  {currentCreator.sectionHeaders?.contactBadge ||
                    '06. CONTACT & COLLABORATION'}
                </p>
                <h2 className="text-2xl sm:text-4xl font-bold text-[#1E1B4B] mt-1">
                  {currentCreator.sectionHeaders?.contactTitle ||
                    'มาร่วมงานกับพวกเรา!'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  {currentCreator.sectionHeaders?.contactSubtitle ||
                    'ติดต่องาน สปอนเซอร์ หรือคอลแลปได้โดยตรงผ่าน LINE และ Email'}
                </p>
              </div>
              {(onOpenAdminContact || onOpenAdmin) && (
                <button
                  type="button"
                  onClick={onOpenAdminContact || onOpenAdmin}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-violet-200 hover:bg-violet-50 text-violet-700 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>แก้ไขช่องทางติดต่อ</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* LINE ID Card */}
              <motion.div
                whileHover={{ y: -3 }}
                className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-emerald-700">
                      LINE ID (ตอบไวที่สุด)
                    </p>
                    <p className="text-base font-bold text-slate-900">
                      {currentCreator.contact.lineId}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText(currentCreator.contact.lineId, 'line')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedContact === 'line' ? 'คัดลอกแล้ว!' : 'คัดลอก'}</span>
                </button>
              </motion.div>

              {/* Email Card */}
              <motion.div
                whileHover={{ y: -3 }}
                className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-violet-700">EMAIL</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {currentCreator.contact.email}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText(currentCreator.contact.email, 'email')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedContact === 'email' ? 'คัดลอกแล้ว!' : 'คัดลอก'}</span>
                </button>
              </motion.div>

              {/* PDF Media Kit Card */}
              <motion.div
                whileHover={{ y: -3 }}
                className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-violet-700 uppercase tracking-wider">
                      Media Kit
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      ดาวน์โหลดรายละเอียด
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenPdf}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold transition-colors cursor-pointer shrink-0 border border-violet-200/50"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>เปิดดู PDF</span>
                </button>
              </motion.div>

              {/* Social Handles with Brand Icons */}
              <div className="sm:col-span-2 p-4 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="flex items-center gap-1">
                    <PlatformBrandIcon platform="TikTok" size="sm" />
                    <PlatformBrandIcon platform="Instagram" size="sm" />
                    <PlatformBrandIcon platform="Facebook" size="sm" />
                    <PlatformBrandIcon platform="YouTube" size="sm" />
                  </div>
                  <strong className="font-bold text-slate-900">
                    {currentCreator.contact.tiktokHandle}
                  </strong>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => onOpenBookingForPackage(selectedPackageId)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-700 hover:bg-violet-800 text-white font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>จองคิวงานออนไลน์ →</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Right Duo Portrait Photo */}
          <motion.div
            style={{ y: portraitParallaxY }}
            initial="hidden"
            whileInView="visible"
            viewport={REPEAT_VIEWPORT}
            variants={slideFromRightVariant}
            custom={0.1}
            className="lg:col-span-5"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm aspect-[4/4] max-h-[380px] 2xl:max-h-[420px] mx-auto"
            >
              <img
                src={currentCreator.portraitUrl}
                alt={`${currentCreator.nameTh} Contact Portrait`}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/assets/juijui/page-6.png';
                }}
                className="w-full h-full object-cover object-top"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
