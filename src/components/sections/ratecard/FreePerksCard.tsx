import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, QrCode, BarChart3, ShieldCheck, Wand2 } from 'lucide-react';
import { FreeIncludedItem } from '../../../data/creatorData';
import { EASE_OUT_EXPO, REPEAT_VIEWPORT, slideFromLeftVariant } from '../motionVariants';

const PERK_ICONS = [QrCode, BarChart3, ShieldCheck, Wand2];

export interface FreePerksCardProps {
  freePerks: FreeIncludedItem[];
  customCollabNotes: { title: string; description: string }[];
  onConsultCustomCollab: () => void;
}

export const FreePerksCard: React.FC<FreePerksCardProps> = ({
  freePerks,
  customCollabNotes,
  onConsultCustomCollab,
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={REPEAT_VIEWPORT}
      variants={slideFromLeftVariant}
      className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-2xs"
    >
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1E1B4B]">
              บริการรวมในแพ็กเกจ (ฟรี 0.-)
            </h3>
            <p className="text-xs text-slate-500">
              แถมฟรีให้ครบทุกแพ็กเกจ ไม่มีบวกเพิ่ม
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          {freePerks.map((perk, pIdx) => {
            const PerkIcon = PERK_ICONS[pIdx % PERK_ICONS.length];
            return (
              <motion.div
                key={perk.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={REPEAT_VIEWPORT}
                transition={{
                  duration: 0.45,
                  delay: 0.1 + pIdx * 0.06,
                  ease: EASE_OUT_EXPO,
                }}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
              >
                <div className="flex items-center gap-2.5 font-semibold text-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <PerkIcon className="w-3.5 h-3.5" />
                  </div>
                  <span>{perk.name}</span>
                </div>
                <span className="font-mono-num font-bold text-emerald-700 shrink-0">
                  {perk.priceLabel}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Custom Collaboration Box (Concise Icon Cards) */}
      <div className="p-4 rounded-xl bg-[#F5F3FF] border border-violet-200 space-y-2.5">
        <h4 className="text-xs font-bold text-violet-950 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-violet-700" />
          <span>Custom Collaboration (ปรับตามงบแบรนด์ได้)</span>
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {customCollabNotes.map((note, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-white/80 border border-violet-200/60 text-xs text-slate-700"
            >
              <strong className="font-bold text-violet-900">{note.title}:</strong>{' '}
              <span>{note.description}</span>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onConsultCustomCollab}
          className="text-xs font-semibold text-violet-700 hover:underline cursor-pointer"
        >
          ปรึกษาเรท Budget Friendly / Barter Trade →
        </button>
      </div>
    </motion.div>
  );
};
