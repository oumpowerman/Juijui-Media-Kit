import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  ArrowLeft,
  Send,
  Copy,
  Check,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { RatePackage, AddOnItem, BookingRecord } from '../../data/creatorData';

export interface BookingModalFooterProps {
  currentStep: 1 | 2 | 3;
  collaborationType: 'standard_package' | 'budget_friendly' | 'barter_trade';
  activePackage: RatePackage;
  chosenAddOns: AddOnItem[];
  totalPrice: number;
  customBudgetAmount: string;
  isSubmitting: boolean;
  copiedQuote: boolean;
  submittedBooking: BookingRecord | null;
  onCopyQuote: () => void;
  onProceedToStep2: () => void;
  onBackToStep1: () => void;
  onTriggerSubmitStep2: () => void;
  onStartNewBooking: () => void;
  onClose: () => void;
}

export const BookingModalFooter: React.FC<BookingModalFooterProps> = ({
  currentStep,
  collaborationType,
  activePackage,
  chosenAddOns,
  totalPrice,
  customBudgetAmount,
  isSubmitting,
  copiedQuote,
  submittedBooking,
  onCopyQuote,
  onProceedToStep2,
  onBackToStep1,
  onTriggerSubmitStep2,
  onStartNewBooking,
  onClose,
}) => {
  if (currentStep === 3 && submittedBooking) {
    return (
      <div className="px-4 sm:px-6 py-3.5 border-t border-slate-200/80 bg-white/90 backdrop-blur-xl shrink-0 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>
            บันทึกใบเสนอราคา <strong className="text-slate-900 font-mono-num">{submittedBooking.quoteNumber}</strong> เรียบร้อยแล้ว
          </span>
        </div>

        <div className="flex items-center gap-2.5 ml-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={onStartNewBooking}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>คำนวณแพ็กเกจอื่น</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <span>เสร็จสิ้น / ปิดหน้าต่าง</span>
          </motion.button>
        </div>
      </div>
    );
  }

  const modeSummaryLabel =
    collaborationType === 'standard_package'
      ? `แพ็กเกจ ${activePackage.name}`
      : collaborationType === 'budget_friendly'
      ? 'โหมด Budget Friendly'
      : 'โหมด Barter Trade';

  return (
    <div className="px-4 sm:px-6 py-3.5 border-t border-violet-200/70 bg-linear-to-r from-[#1E1B4B] via-[#272162] to-[#1E1B4B] text-white shrink-0 relative overflow-hidden">
      {/* Top Specular Glass Line */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-violet-300/50 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Live Price & Selection Summary */}
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-violet-200 font-medium">
              <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
              <span>{modeSummaryLabel}</span>
              {chosenAddOns.length > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-violet-500/40 text-white font-semibold">
                  +{chosenAddOns.length} บริการเสริม
                </span>
              )}
              <span className="hidden md:inline text-emerald-300">· ฟรี 4 สิทธิพิเศษ</span>
            </div>

            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-[11px] text-violet-300">ยอดสุทธิ:</span>
              <motion.span
                key={`${collaborationType}-${totalPrice}-${customBudgetAmount}`}
                initial={{ scale: 1.12, color: '#FDE047' }}
                animate={{ scale: 1, color: '#FCD34D' }}
                transition={{ type: 'spring', stiffness: 360, damping: 22 }}
                className="text-lg sm:text-2xl font-bold font-mono-num text-amber-300 tracking-tight"
              >
                {collaborationType === 'barter_trade'
                  ? 'Barter Trade'
                  : collaborationType === 'budget_friendly' && !totalPrice
                  ? customBudgetAmount || 'ระบุงบที่ต้องการ'
                  : `${totalPrice.toLocaleString()} บาท`}
              </motion.span>
            </div>
          </div>

          {/* Mobile Quick Copy Button */}
          <button
            type="button"
            onClick={onCopyQuote}
            className="sm:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-colors cursor-pointer"
          >
            {copiedQuote ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedQuote ? 'คัดลอกแล้ว' : 'คัดลอกร่าง'}</span>
          </button>
        </div>

        {/* Right: Step Navigation & Primary Action Buttons */}
        <div className="flex items-center justify-end gap-2.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={onCopyQuote}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-violet-100 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            {copiedQuote ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">คัดลอกร่างแล้ว</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>คัดลอกสรุปราคา</span>
              </>
            )}
          </motion.button>

          {currentStep === 1 ? (
            <motion.button
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={onProceedToStep2}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-violet-950/50 border border-violet-400/40 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>ถัดไป: ข้อมูลแบรนด์และบรีฟงาน</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onBackToStep1}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>ย้อนกลับ</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                disabled={isSubmitting}
                onClick={onTriggerSubmitStep2}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-950/40 border border-emerald-300/40 transition-all cursor-pointer whitespace-nowrap"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'กำลังออกใบเสนอราคา...'
                    : 'ยืนยันจองคิว & ออกใบเสนอราคา'}
                </span>
              </motion.button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
