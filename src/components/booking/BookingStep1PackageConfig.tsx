import React from 'react';
import { motion } from 'motion/react';
import {
  Layers,
  Wallet,
  Gift,
  Sparkles,
  Flame,
  Crown,
  Check,
  Scissors,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Camera,
  Video,
  Clock,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { CreatorProfile, RatePackage, AddOnItem } from '../../data/creatorData';
import { PlatformBadgeGroup } from '../ui/PlatformBrandIcon';
import { EASE_OUT_EXPO } from '../sections/motionVariants';

export interface BookingStep1PackageConfigProps {
  creator: CreatorProfile;
  collaborationType: 'standard_package' | 'budget_friendly' | 'barter_trade';
  onSelectCollaborationType: (type: 'standard_package' | 'budget_friendly' | 'barter_trade') => void;
  activePackage: RatePackage;
  onSelectPackageId: (id: string) => void;
  customBudgetAmount: string;
  onChangeCustomBudgetAmount: (val: string) => void;
  selectedAddOnIds: string[];
  chosenAddOns: AddOnItem[];
  onToggleAddOnId: (id: string) => void;
  onClearAddOns?: () => void;
  errorMsg?: string | null;
}

const PACKAGE_TIER_ICONS = [Sparkles, Flame, Crown];
const ADDON_CARD_ICONS = [Scissors, ShoppingBag, Zap, ShieldCheck, Camera];
const QUICK_BUDGET_PRESETS = ['8,000 บาท', '12,000 บาท', '15,000 บาท', '25,000 บาท'];

export const BookingStep1PackageConfig: React.FC<BookingStep1PackageConfigProps> = ({
  creator,
  collaborationType,
  onSelectCollaborationType,
  activePackage,
  onSelectPackageId,
  customBudgetAmount,
  onChangeCustomBudgetAmount,
  selectedAddOnIds,
  chosenAddOns,
  onToggleAddOnId,
  onClearAddOns,
  errorMsg,
}) => {
  const collabModes = [
    {
      id: 'standard_package' as const,
      label: 'แพ็กเกจมาตรฐาน',
      sub: 'เรทคุ้มค่า พร้อมของแถมครบ',
      icon: Layers,
    },
    {
      id: 'budget_friendly' as const,
      label: 'Budget Friendly',
      sub: 'ปรับสโคปตามงบแบรนด์',
      icon: Wallet,
    },
    {
      id: 'barter_trade' as const,
      label: 'Barter Trade',
      sub: 'แลกเปลี่ยนสินค้า/บริการ',
      icon: Gift,
    },
  ];

  return (
    <motion.div
      key="step-1"
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 18 }}
      transition={{ duration: 0.32, ease: EASE_OUT_EXPO }}
      className="space-y-5"
    >
      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </motion.div>
      )}

      {/* 1. Collaboration Mode Selector with Animated Pill */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-600" />
            <span>เลือกรูปแบบการร่วมงานที่ต้องการ</span>
          </label>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            ยืดหยุ่นได้ตามเป้าหมายแคมเปญ
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100/90 border border-slate-200/70 rounded-2xl">
          {collabModes.map((tab) => {
            const isActive = collaborationType === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectCollaborationType(tab.id)}
                className={`relative py-2.5 px-2.5 sm:px-3.5 rounded-xl text-left transition-colors cursor-pointer flex items-center gap-2.5 ${
                  isActive ? 'text-violet-950' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="bookingCollabModeTabPill"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="absolute inset-0 bg-white rounded-xl shadow-xs border border-violet-200/80"
                  />
                )}
                <div
                  className={`relative z-10 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-violet-100 text-violet-700'
                      : 'bg-slate-200/70 text-slate-500'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                </div>
                <div className="relative z-10 min-w-0">
                  <span className="text-xs font-bold block truncate">{tab.label}</span>
                  <span className="text-[10px] text-slate-500 hidden sm:block truncate">
                    {tab.sub}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Package Selection or Custom Budget / Barter Box */}
      {collaborationType === 'standard_package' ? (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-600" />
              <span>เลือกแพ็กเกจหลัก (คลิกการ์ดเพื่อสลับ)</span>
            </label>
            <span className="text-[11px] font-semibold text-violet-700">
              เลือกอยู่: {activePackage.name}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {creator.packages.map((pkg, pIdx) => {
              const isSelected = pkg.id === activePackage.id;
              const TierIcon = PACKAGE_TIER_ICONS[pIdx % PACKAGE_TIER_ICONS.length];
              const isPopular = pIdx === 1;

              return (
                <motion.div
                  key={pkg.id}
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 24 }}
                  onClick={() => onSelectPackageId(pkg.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between overflow-hidden ${
                    isSelected
                      ? 'border-violet-600 bg-linear-to-br from-violet-50/90 via-white to-indigo-50/60 ring-2 ring-violet-600/25 shadow-md shadow-violet-600/10'
                      : 'border-slate-200/90 hover:border-violet-300 bg-white hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-violet-700 text-white shadow-xs shadow-violet-700/30'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <TierIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">{pkg.name}</span>
                            {isPopular && (
                              <span className="text-[10px] font-bold bg-linear-to-r from-amber-500 to-violet-600 text-white px-2 py-0.5 rounded-md">
                                ยอดนิยม
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-semibold text-violet-700 block">
                            {pkg.costEfficiency}
                          </span>
                        </div>
                      </div>

                      {/* Selection Check Indicator */}
                      <motion.div
                        initial={false}
                        animate={{
                          scale: isSelected ? 1 : 0.85,
                          backgroundColor: isSelected ? '#6D28D9' : '#F1F5F9',
                        }}
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border border-slate-200"
                      >
                        {isSelected && <Check className="w-3 h-3 text-white stroke-[2.5]" />}
                      </motion.div>
                    </div>

                    {/* Deliverable Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600 mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100/90 font-medium text-slate-700">
                        <Video className="w-3 h-3 text-violet-600" />
                        <span>{pkg.videoCount}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100/90 font-medium text-slate-700">
                        <Clock className="w-3 h-3 text-indigo-600" />
                        <span>{pkg.maxDuration}</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <PlatformBadgeGroup platformsText={pkg.platforms} size="xs" />
                      <span className="text-[10px] font-semibold text-slate-500">
                        {pkg.totalPosts}
                      </span>
                    </div>
                    <span className="text-base font-bold text-violet-700 font-mono-num">
                      {pkg.price.toLocaleString()}.-
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : collaborationType === 'budget_friendly' ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-violet-50/90 via-indigo-50/50 to-white border border-violet-200/90 space-y-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs sm:text-sm font-bold text-violet-950 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-violet-700" />
                <span>โหมด Budget Friendly (ปรับสโคปงานตามงบประมาณแบรนด์)</span>
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                ระบุงบประมาณที่ตั้งไว้ หรือคลิกเลือกงบประมาณด่วนด้านล่าง ทีมงานพร้อมจัดสัดส่วนคอนเทนต์ให้คุ้มค่าที่สุด
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 mr-1">เลือกงบด่วน:</span>
            {QUICK_BUDGET_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChangeCustomBudgetAmount(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                  customBudgetAmount === preset
                    ? 'bg-violet-700 text-white border-violet-700 shadow-2xs'
                    : 'bg-white text-slate-700 border-violet-200 hover:bg-violet-50'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={customBudgetAmount}
            onChange={(e) => onChangeCustomBudgetAmount(e.target.value)}
            placeholder="ระบุงบประมาณที่ตั้งไว้ เช่น 15,000 บาท"
            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white border border-violet-300 focus:border-violet-600 focus:outline-hidden text-slate-900 font-semibold"
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-fuchsia-50/90 via-pink-50/40 to-white border border-fuchsia-200/90 space-y-2"
        >
          <p className="text-xs sm:text-sm font-bold text-fuchsia-950 flex items-center gap-1.5">
            <Gift className="w-4 h-4 text-fuchsia-700" />
            <span>โหมด Barter Trade (รีวิวแลกเปลี่ยนสินค้า / บริการ / ท่องเที่ยว)</span>
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            เปิดรับการร่วมงานสำหรับสินค้าไลฟ์สไตล์ แกดเจ็ตที่พัก หรือบริการที่น่าสนใจและตรงกับมู้ดของช่อง
            สามารถกดปุ่มถัดไปเพื่อกรอกรายละเอียดสินค้าและข้อเสนอได้เลยครับ
          </p>
        </motion.div>
      )}

      {/* 3. Interactive Add-ons Cards with Custom Icons & Spring Motion */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-600" />
            <span>บริการเสริมเพิ่มเติม (Add-ons) — คลิกการ์ดเพื่อเพิ่ม/ลด</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500">
              เลือกแล้ว {chosenAddOns.length} รายการ
            </span>
            {chosenAddOns.length > 0 && onClearAddOns && (
              <button
                type="button"
                onClick={onClearAddOns}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>ล้าง</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {creator.addOns.map((addon, aIdx) => {
            const checked = selectedAddOnIds.includes(addon.id);
            const AddonIcon = ADDON_CARD_ICONS[aIdx % ADDON_CARD_ICONS.length];

            return (
              <motion.div
                key={addon.id}
                whileHover={{ y: -2, scale: 1.005 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => onToggleAddOnId(addon.id)}
                className={`flex items-start justify-between gap-3 p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                  checked
                    ? 'border-violet-600 bg-violet-50/70 ring-1 ring-violet-600/20 shadow-2xs'
                    : 'border-slate-200/90 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      checked
                        ? 'bg-violet-700 text-white shadow-2xs'
                        : 'bg-violet-50 text-violet-700 border border-violet-100'
                    }`}
                  >
                    <AddonIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-slate-900 font-bold block leading-snug">
                      {addon.name}
                    </span>
                    <span className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {addon.description || 'ต่อ 1 แคมเปญ'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between shrink-0 gap-1.5">
                  <span
                    className={`font-mono-num font-bold text-xs ${
                      checked ? 'text-violet-700' : 'text-slate-900'
                    }`}
                  >
                    +{addon.price.toLocaleString()}.-
                  </span>
                  <div
                    className={`w-4.5 h-4.5 rounded-md flex items-center justify-center border transition-colors ${
                      checked
                        ? 'bg-violet-700 border-violet-700 text-white'
                        : 'bg-slate-50 border-slate-300 text-transparent'
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 4. Included Free Perks Reassurance Strip */}
      <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-emerald-950">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>แถมฟรีในทุกแพ็กเกจ (0.-):</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-emerald-800">
          {creator.freePerks.map((perk) => (
            <span
              key={perk.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/90 border border-emerald-200/70"
            >
              <Check className="w-3 h-3 text-emerald-600" />
              <span>{perk.name}</span>
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
