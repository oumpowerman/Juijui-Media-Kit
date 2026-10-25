import React from 'react';
import { motion } from 'motion/react';
import {
  Calculator,
  CalendarCheck,
  Pin,
  ShoppingBag,
  Link2,
  PlusCircle,
} from 'lucide-react';
import { AddOnItem, RatePackage } from '../../../data/creatorData';
import { AnimatedCounter } from '../../ui/AnimatedCounter';
import { EASE_OUT_EXPO, REPEAT_VIEWPORT, slideFromRightVariant } from '../motionVariants';

const ADDON_ICONS = [Pin, ShoppingBag, Link2, PlusCircle];

export interface AddOnsCalculatorCardProps {
  addOns: AddOnItem[];
  selectedAddOnIds: string[];
  chosenAddOns: AddOnItem[];
  activePackage: RatePackage;
  estimatedNetTotal: number;
  onToggleAddOn: (id: string) => void;
  onClearAddOns: () => void;
  onOpenBooking: () => void;
}

export const AddOnsCalculatorCard: React.FC<AddOnsCalculatorCardProps> = ({
  addOns,
  selectedAddOnIds,
  chosenAddOns,
  activePackage,
  estimatedNetTotal,
  onToggleAddOn,
  onClearAddOns,
  onOpenBooking,
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={REPEAT_VIEWPORT}
      variants={slideFromRightVariant}
      custom={0.08}
      className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-2xs"
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1E1B4B]">
                บริการเสริม (Add-ons) — คลิกติ๊กคำนวณงบ
              </h3>
              <p className="text-xs text-slate-500">
                บวกรวมกับแพ็กเกจหลักให้อัตโนมัติแบบเรียลไทม์
              </p>
            </div>
          </div>
          {selectedAddOnIds.length > 0 && (
            <button
              type="button"
              onClick={onClearAddOns}
              className="text-xs text-slate-500 hover:text-rose-600 font-semibold cursor-pointer"
            >
              ล้างตัวเลือก
            </button>
          )}
        </div>

        <div className="mt-4 space-y-2.5">
          {addOns.map((addon, aIdx) => {
            const isChecked = selectedAddOnIds.includes(addon.id);
            const AddonIcon = ADDON_ICONS[aIdx % ADDON_ICONS.length];
            return (
              <motion.div
                key={addon.id}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={REPEAT_VIEWPORT}
                transition={{
                  duration: 0.45,
                  delay: 0.1 + aIdx * 0.06,
                  ease: EASE_OUT_EXPO,
                }}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onToggleAddOn(addon.id)}
                className={`p-3.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-4 ${
                  isChecked
                    ? 'border-violet-700 bg-violet-50/50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="w-4 h-4 accent-violet-700 rounded cursor-pointer shrink-0"
                  />
                  <div className="w-8 h-8 rounded-lg bg-violet-100/80 text-violet-700 flex items-center justify-center shrink-0">
                    <AddonIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{addon.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{addon.description}</p>
                  </div>
                </div>

                <span className="text-xs font-bold font-mono-num text-violet-800 shrink-0">
                  +<AnimatedCounter value={addon.price} suffix=".-" duration={1.3} />
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Live Calculator Summary Bar with Animated Price */}
      <div className="p-5 rounded-xl bg-[#1E1B4B] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-violet-200">
            แพ็กเกจ <strong className="text-white">{activePackage.name}</strong>{' '}
            {chosenAddOns.length > 0
              ? `+ บริการเสริม ${chosenAddOns.length} รายการ`
              : '+ ฟรี 4 บริการหลัก'}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <motion.span
              key={estimatedNetTotal}
              initial={{ scale: 1.12, color: '#FDE047' }}
              animate={{ scale: 1, color: '#FCD34D' }}
              transition={{ type: 'spring', stiffness: 360, damping: 20 }}
              className="text-2xl sm:text-3xl font-bold font-mono-num text-amber-300 inline-block"
            >
              <AnimatedCounter value={estimatedNetTotal} suffix=" บาท" duration={0.9} />
            </motion.span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={onOpenBooking}
          className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <CalendarCheck className="w-4 h-4" />
          <span>ออกใบเสนอราคา & จองคิวงาน →</span>
        </motion.button>
      </div>
    </motion.div>
  );
};
