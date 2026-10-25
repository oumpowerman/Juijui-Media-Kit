import React from 'react';
import { motion } from 'motion/react';
import {
  FileCheck2,
  Sparkles,
  MessageSquare,
  ExternalLink,
  Mail,
  Copy,
  Check,
  Building2,
  Calendar,
} from 'lucide-react';
import { CreatorProfile, BookingRecord } from '../../data/creatorData';
import { EASE_OUT_EXPO } from '../sections/motionVariants';

export interface BookingStep3ConfirmationProps {
  creator: CreatorProfile;
  booking: BookingRecord;
  copiedQuote: boolean;
  onCopyQuote: () => void;
  plainQuoteText: string;
}

export const BookingStep3Confirmation: React.FC<BookingStep3ConfirmationProps> = ({
  creator,
  booking,
  copiedQuote,
  onCopyQuote,
  plainQuoteText,
}) => {
  return (
    <motion.div
      key="step-3"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
      className="space-y-5"
    >
      {/* Celebratory Success Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-emerald-50 via-teal-50/60 to-white border border-emerald-200/90 flex items-start gap-3.5 shadow-2xs">
        <motion.div
          initial={{ scale: 0.5, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 360, damping: 18 }}
          className="p-2.5 rounded-2xl bg-emerald-600 text-white shrink-0 mt-0.5 shadow-sm shadow-emerald-600/25"
        >
          <FileCheck2 className="w-5 h-5" />
        </motion.div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-bold text-emerald-950">
              ออกใบเสนอราคาและบันทึกคิวงานสำเร็จ!
            </h4>
            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[11px] font-bold font-mono-num">
              {booking.quoteNumber}
            </span>
          </div>
          <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
            ระบบได้คัดลอกสรุปใบเสนอราคาไว้ให้คุณอัตโนมัติแล้ว กดปุ่ม{' '}
            <strong className="font-bold">“ส่งเข้า LINE {creator.contact.lineId}”</strong>{' '}
            แล้วกดวาง (Paste) ในแชทเพื่อคุยรายละเอียดคิวงานกับทีมงานได้เลยครับ
          </p>
        </div>
      </div>

      {/* Direct Real Contact Handoff Actions — Prominent at Top for Instant Action */}
      <div className="p-4 rounded-2xl bg-violet-50/70 border border-violet-200/80 space-y-3">
        <p className="text-xs font-bold text-violet-950 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-violet-700" />
          <span>กดส่งใบเสนอราคานี้ให้ทีมงานเพื่อล็อกคิวงานทันที:</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Direct LINE Chat Button */}
          <motion.a
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            href={creator.contact.lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onCopyQuote}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 text-center"
          >
            <MessageSquare className="w-4 h-4" />
            <span>ส่งเข้า LINE {creator.contact.lineId}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-85" />
          </motion.a>

          {/* Direct Pre-filled Email Mailto */}
          <motion.a
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            href={`mailto:${creator.contact.email}?subject=${encodeURIComponent(
              `[จองคิวงาน ${booking.quoteNumber}] แบรนด์ ${booking.brandName} — ${creator.nameTh}`
            )}&body=${encodeURIComponent(plainQuoteText)}`}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-700 hover:bg-violet-800 text-white text-xs font-bold transition-all shadow-sm shadow-violet-700/20 text-center"
          >
            <Mail className="w-4 h-4" />
            <span>ส่งผ่านอีเมลพร้อมบรีฟ</span>
          </motion.a>

          {/* Copy Text Summary */}
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={onCopyQuote}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all cursor-pointer text-center"
          >
            {copiedQuote ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">คัดลอกข้อความแล้ว!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-600" />
                <span>คัดลอกข้อความสรุป</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Official Printable Quotation Ticket */}
      <div
        id="quotation-print-area"
        className="border border-slate-200/90 rounded-2xl p-5 bg-white space-y-4 shadow-2xs"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-bold text-violet-700 uppercase tracking-wider block">
              OFFICIAL QUOTATION SUMMARY
            </span>
            <h4 className="text-base font-bold text-slate-900 font-mono-num mt-0.5">
              เลขที่อ้างอิง: {booking.quoteNumber}
            </h4>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-500 block">วันที่ออกเอกสาร</span>
            <p className="text-xs font-semibold text-slate-800 font-mono-num">
              {booking.createdAt}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <p className="text-slate-500 font-semibold flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-violet-600" />
              <span>ข้อมูลลูกค้า / แบรนด์</span>
            </p>
            <p className="font-bold text-slate-900 text-sm">{booking.brandName}</p>
            <p className="text-slate-600">ผู้ติดต่อ: {booking.contactName || '-'}</p>
            <p className="text-slate-600">ช่องทางติดต่อ: {booking.contactChannel}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <p className="text-slate-500 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>ครีเอเตอร์และกำหนดการ</span>
            </p>
            <p className="font-bold text-slate-900 text-sm">{booking.creatorName}</p>
            <p className="text-slate-600">
              ช่วงเวลาแคมเปญ: {booking.targetCampaignDate || 'ยืดหยุ่นตามตกลง'}
            </p>
            <p className="text-emerald-700 font-semibold">สถานะ: บันทึกคิวงานในระบบแล้ว</p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200/80 space-y-2 text-xs">
          <div className="flex items-center justify-between font-semibold text-slate-900">
            <span>แพ็กเกจหลัก: {booking.packageName}</span>
            <span className="font-mono-num font-bold">
              {booking.collaborationType === 'standard_package'
                ? `${booking.basePrice.toLocaleString()} บาท`
                : booking.collaborationType === 'budget_friendly'
                ? `งบที่เสนอ: ${booking.customBudgetAmount || '-'} บาท`
                : 'Barter Trade'}
            </span>
          </div>

          {booking.selectedAddOns.map((add) => (
            <div key={add.id} className="flex items-center justify-between text-slate-600">
              <span>+ บริการเสริม: {add.name}</span>
              <span className="font-mono-num font-semibold">{add.price.toLocaleString()} บาท</span>
            </div>
          ))}

          <div className="flex items-center justify-between text-emerald-700 pt-1">
            <span>+ สิทธิพิเศษรวมในแพ็กเกจ (Gencode 30 วัน, สิทธิ์ 6 เดือน, แก้ไข 3 รอบ)</span>
            <span className="font-mono-num font-bold">0 บาท (ฟรี)</span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-sm font-bold text-violet-950">
            <span>ยอดรวมสุทธิประมาณการ (Estimated Net Total)</span>
            <span className="font-mono-num text-base text-violet-700">
              {booking.collaborationType === 'barter_trade'
                ? 'Barter Trade'
                : `${booking.totalPrice.toLocaleString()} บาท`}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
