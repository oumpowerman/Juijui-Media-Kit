import React from 'react';
import { Sparkles } from 'lucide-react';
import { CreatorProfile } from '../../../data/creatorData';

interface IdentityHeroSectionProps {
  draftCreator: CreatorProfile;
  onUpdateRootField: <K extends keyof CreatorProfile>(
    field: K,
    value: CreatorProfile[K]
  ) => void;
}

export const IdentityHeroSection: React.FC<IdentityHeroSectionProps> = ({
  draftCreator,
  onUpdateRootField,
}) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/90 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-700" />
            <span>1. ข้อมูลโปรไฟล์หลัก คำคม และคำอธิบายช่อง (Hero Section)</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            แก้ไขชื่อช่อง ตำแหน่ง คำคมประจำช่อง และป้ายกำกับหมวดหมู่ที่แสดงในส่วนหัวของเว็บไซต์
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ชื่อช่อง (ภาษาไทย)
          </label>
          <input
            type="text"
            value={draftCreator.nameTh}
            onChange={(e) => onUpdateRootField('nameTh', e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300 focus:border-violet-600 focus:outline-hidden text-slate-900 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ชื่อช่อง (ภาษาอังกฤษ)
          </label>
          <input
            type="text"
            value={draftCreator.nameEn}
            onChange={(e) => onUpdateRootField('nameEn', e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300 focus:border-violet-600 focus:outline-hidden text-slate-900 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ตำแหน่ง / บทบาท (Role Title)
          </label>
          <input
            type="text"
            value={draftCreator.roleTitle}
            onChange={(e) => onUpdateRootField('roleTitle', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300 focus:border-violet-600 focus:outline-hidden text-slate-800 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ป้ายกำกับระดับ / คิกเกอร์ (Tier / Edition)
          </label>
          <input
            type="text"
            value={draftCreator.tierLabel || ''}
            onChange={(e) => onUpdateRootField('tierLabel', e.target.value)}
            placeholder="เช่น 01 · MEDIA KIT 2026 หรือ Macro Creator"
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300 focus:border-violet-600 focus:outline-hidden text-slate-800 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ป้ายวันที่อัปเดตข้อมูล
          </label>
          <input
            type="text"
            value={draftCreator.updatedLabel}
            onChange={(e) => onUpdateRootField('updatedLabel', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300 focus:border-violet-600 focus:outline-hidden text-slate-800 transition-colors"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            คำคมประจำช่อง (Signature Quote)
          </label>
          <input
            type="text"
            value={draftCreator.quote}
            onChange={(e) => onUpdateRootField('quote', e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300 focus:border-violet-600 focus:outline-hidden text-violet-950 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            หมวดหมู่ช่อง (คั่นด้วยลูกน้ำ ,)
          </label>
          <input
            type="text"
            value={draftCreator.categories.join(', ')}
            onChange={(e) =>
              onUpdateRootField(
                'categories',
                e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300 focus:border-violet-600 focus:outline-hidden text-slate-800 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Mood & Tone (คั่นด้วยลูกน้ำ ,)
          </label>
          <input
            type="text"
            value={draftCreator.moodAndTone.join(', ')}
            onChange={(e) =>
              onUpdateRootField(
                'moodAndTone',
                e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300 focus:border-violet-600 focus:outline-hidden text-slate-800 transition-colors"
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            คำอธิบายตัวตนและสไตล์ของช่อง (Bio Description)
          </label>
          <textarea
            rows={2}
            value={draftCreator.bioDescription}
            onChange={(e) => onUpdateRootField('bioDescription', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300 focus:border-violet-600 focus:outline-hidden text-slate-800 leading-relaxed transition-colors slim-scroll"
          />
        </div>
      </div>
    </div>
  );
};
