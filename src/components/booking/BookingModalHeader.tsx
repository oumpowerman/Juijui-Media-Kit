import React from 'react';
import { motion } from 'motion/react';
import { Calendar, X, Check, Sparkles, SlidersHorizontal, FileSpreadsheet, Send } from 'lucide-react';
import { CreatorProfile } from '../../data/creatorData';

export interface BookingModalHeaderProps {
  creator: CreatorProfile;
  currentStep: 1 | 2 | 3;
  onSelectStep: (step: 1 | 2) => void;
  onClose: () => void;
}

const STEP_ITEMS = [
  { step: 1 as const, label: 'ปรับแต่งแพ็กเกจ', icon: SlidersHorizontal },
  { step: 2 as const, label: 'ข้อมูลแบรนด์และบรีฟ', icon: FileSpreadsheet },
  { step: 3 as const, label: 'ใบเสนอราคา & ติดต่อ', icon: Send },
];

export const BookingModalHeader: React.FC<BookingModalHeaderProps> = ({
  creator,
  currentStep,
  onSelectStep,
  onClose,
}) => {
  return (
    <div className="px-4 sm:px-6 pt-4 pb-3.5 border-b border-slate-200/80 bg-linear-to-r from-violet-50/70 via-white to-indigo-50/50 relative z-10 shrink-0 overflow-hidden">
      {/* Subtle Ambient Header Glow */}
      <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full bg-violet-300/20 blur-2xl pointer-events-none" />
      <div className="absolute -top-12 right-12 w-40 h-40 rounded-full bg-fuchsia-300/15 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Creator Avatar / Icon Badge */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-linear-to-br from-violet-600 to-indigo-700 p-0.5 shadow-sm shadow-violet-600/20">
              <img
                src={creator.avatarUrl}
                alt={creator.nameTh}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/assets/juijui/avatar-main.jpg';
                }}
                className="w-full h-full rounded-[14px] object-cover bg-white"
              />
            </div>
            <span
              title="พร้อมรับบรีฟงาน"
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5 truncate">
                <Calendar className="w-4 h-4 text-violet-700 shrink-0" />
                <span className="truncate">จองคิวงาน & คำนวณใบเสนอราคา</span>
              </h3>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>ตอบกลับไวภายใน 24 ชม.</span>
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
              {creator.nameTh} ({creator.nameEn}) · {creator.tierLabel}
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ rotate: 90, scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
          aria-label="ปิดหน้าต่าง"
        >
          <X className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Step Navigation Progress Bar — Clean Labels Without Duplicate Numbers */}
      <div className="relative z-10 mt-3.5 p-1 rounded-2xl bg-slate-100/90 border border-slate-200/70 grid grid-cols-3 gap-1 text-xs">
        {STEP_ITEMS.map((item) => {
          const isActive = currentStep === item.step;
          const isCompleted = currentStep > item.step;
          const isClickable = item.step < 3 && currentStep !== 3;
          const StepIcon = item.icon;

          return (
            <button
              key={item.step}
              type="button"
              disabled={!isClickable}
              onClick={() => {
                if (item.step === 1 || item.step === 2) {
                  onSelectStep(item.step);
                }
              }}
              className={`relative flex items-center justify-center sm:justify-start gap-2 py-2 px-2.5 sm:px-3.5 rounded-xl font-semibold transition-colors text-left ${
                isClickable ? 'cursor-pointer' : 'cursor-default'
              } ${
                isActive
                  ? 'text-violet-900'
                  : isCompleted
                  ? 'text-emerald-800 hover:text-violet-800'
                  : 'text-slate-500'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="bookingModalStepActivePill"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute inset-0 rounded-xl bg-white shadow-xs border border-violet-200/80"
                />
              )}

              <span
                className={`relative z-10 w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors ${
                  isActive
                    ? 'bg-violet-700 text-white shadow-2xs'
                    : isCompleted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200/90 text-slate-600'
                }`}
              >
                {isCompleted ? <Check className="w-3 h-3 stroke-[2.5]" /> : item.step}
              </span>

              <span className="relative z-10 truncate font-bold text-[11px] sm:text-xs">
                {item.label}
              </span>

              <StepIcon
                className={`relative z-10 w-3.5 h-3.5 ml-auto hidden md:block shrink-0 ${
                  isActive
                    ? 'text-violet-600'
                    : isCompleted
                    ? 'text-emerald-600'
                    : 'text-slate-400'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
