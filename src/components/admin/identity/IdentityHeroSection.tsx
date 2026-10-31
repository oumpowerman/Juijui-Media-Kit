import React from 'react';
import { Sparkles, LayoutTemplate } from 'lucide-react';
import { CreatorProfile, SectionHeadersConfig } from '../../../data/creatorData';

interface IdentityHeroSectionProps {
  draftCreator: CreatorProfile;
  onUpdateRootField: <K extends keyof CreatorProfile>(
    field: K,
    value: CreatorProfile[K]
  ) => void;
  onUpdateSectionHeaderField: (
    field: keyof SectionHeadersConfig,
    value: string
  ) => void;
}

export const IdentityHeroSection: React.FC<IdentityHeroSectionProps> = ({
  draftCreator,
  onUpdateRootField,
  onUpdateSectionHeaderField,
}) => {
  const sh = draftCreator.sectionHeaders || {};

  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-700" />
              <span>1. ข้อมูลโปรไฟล์หลัก คำคม และคำอธิบายช่อง (Hero Section)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              แก้ไขชื่อช่อง ตำแหน่ง คำคมประจำช่อง ป้ายรอบเวลาสถิติ และป้ายกำกับหมวดหมู่ที่แสดงในส่วนหัวของเว็บไซต์
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ป้ายรอบเวลาสถิติมุมขวาบนการ์ดโปรไฟล์
            </label>
            <input
              type="text"
              value={draftCreator.heroTimeframeBadge ?? '28 วันล่าสุด · วิว 60 วัน'}
              onChange={(e) => onUpdateRootField('heroTimeframeBadge', e.target.value)}
              placeholder="เช่น 28 วันล่าสุด · วิว 60 วัน"
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300 focus:border-violet-600 focus:outline-hidden text-slate-800 transition-colors"
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

          <div className="sm:col-span-2">
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

          <div className="sm:col-span-2">
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

      {/* 1B. หัวข้อและคำโปรยประจำแต่ละส่วนบนหน้าเว็บ (Section Headers Customizer) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-violet-700" />
              <span>1B. หัวข้อและคำโปรยประจำหมวดบนหน้าเว็บ (Section Headers & Subtitles)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              ปรับแต่งหัวข้อใหญ่ ป้าย Badge และคำโปรยของแต่ละส่วนบนหน้าเว็บหลักได้อิสระ (หากเว้นว่างจะใช้ค่ามาตรฐาน)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Analytics Header */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
            <p className="text-xs font-bold text-slate-800">หมวด 02 · สถิติช่อง & ข้อมูลเชิงลึก</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">ป้ายกำกับ (Badge)</label>
                <input
                  type="text"
                  value={sh.analyticsBadge ?? ''}
                  onChange={(e) => onUpdateSectionHeaderField('analyticsBadge', e.target.value)}
                  placeholder="02 · ข้อมูลสถิติและกลุ่มเป้าหมาย"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">หัวข้อหลัก (Title)</label>
                <input
                  type="text"
                  value={sh.analyticsTitle ?? ''}
                  onChange={(e) => onUpdateSectionHeaderField('analyticsTitle', e.target.value)}
                  placeholder="ภาพรวมสถิติทุกช่องทางและกลุ่มผู้ชม"
                  className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">คำโปรยย่อย (Subtitle)</label>
              <input
                type="text"
                value={sh.analyticsSubtitle ?? ''}
                onChange={(e) => onUpdateSectionHeaderField('analyticsSubtitle', e.target.value)}
                placeholder="ข้อมูลสถิติจริงจาก TikTok, Facebook, Instagram และ YouTube..."
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
              />
            </div>
          </div>

          {/* Viral Works Header */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
            <p className="text-xs font-bold text-slate-800">หมวด 03 · ผลงานคลิปไวรัล</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">ป้ายกำกับ (Badge)</label>
                <input
                  type="text"
                  value={sh.viralBadge ?? ''}
                  onChange={(e) => onUpdateSectionHeaderField('viralBadge', e.target.value)}
                  placeholder="03 · ตัวอย่างผลงานวิดีโอ"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">หัวข้อหลัก (Title)</label>
                <input
                  type="text"
                  value={sh.viralTitle ?? ''}
                  onChange={(e) => onUpdateSectionHeaderField('viralTitle', e.target.value)}
                  placeholder="ผลงานคลิปไวรัลและรูปแบบคอนเทนต์"
                  className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">คำโปรยย่อย (Subtitle)</label>
              <input
                type="text"
                value={sh.viralSubtitle ?? ''}
                onChange={(e) => onUpdateSectionHeaderField('viralSubtitle', e.target.value)}
                placeholder="รวมตัวอย่างผลงานจริงทั้งคลิปสั้นแนวตั้ง (9:16) และวิดีโอแนวนอน (16:9)..."
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
              />
            </div>
          </div>

          {/* Rate Card Header */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
            <p className="text-xs font-bold text-slate-800">หมวด 04 · เรทการ์ดและแพ็กเกจ</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">ป้ายกำกับ (Badge)</label>
                <input
                  type="text"
                  value={sh.rateCardBadge ?? ''}
                  onChange={(e) => onUpdateSectionHeaderField('rateCardBadge', e.target.value)}
                  placeholder="04 · เรทการ์ดและแพ็กเกจร่วมงาน"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">หัวข้อหลัก (Title)</label>
                <input
                  type="text"
                  value={sh.rateCardTitle ?? ''}
                  onChange={(e) => onUpdateSectionHeaderField('rateCardTitle', e.target.value)}
                  placeholder="เรทการ์ดและแพ็กเกจโปรโมต"
                  className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">คำโปรยย่อย (Subtitle)</label>
              <input
                type="text"
                value={sh.rateCardSubtitle ?? ''}
                onChange={(e) => onUpdateSectionHeaderField('rateCardSubtitle', e.target.value)}
                placeholder="เลือกแพ็กเกจหลักและบริการเสริมเพื่อคำนวณงบประมาณเบื้องต้น..."
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
              />
            </div>
          </div>

          {/* Audience Proof & Contact Headers */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
            <p className="text-xs font-bold text-slate-800">หมวด 05 & 06 · เสียงตอบรับ & ติดต่องาน</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">หัวข้อหมวดเสียงตอบรับ (05)</label>
                <input
                  type="text"
                  value={sh.proofTitle ?? ''}
                  onChange={(e) => onUpdateSectionHeaderField('proofTitle', e.target.value)}
                  placeholder="เสียงตอบรับจากผู้ชมและลูกค้าแบรนด์"
                  className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">คำโปรยหมวดเสียงตอบรับ (05)</label>
                <input
                  type="text"
                  value={sh.proofSubtitle ?? ''}
                  onChange={(e) => onUpdateSectionHeaderField('proofSubtitle', e.target.value)}
                  placeholder="รวบรวมคอมเมนต์จริงจากผู้ติดตามและฟีดแบ็กจากการทำงานร่วมกับแบรนด์และเอเจนซี่"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">หัวข้อหมวดติดต่องาน (06)</label>
                <input
                  type="text"
                  value={sh.contactTitle ?? ''}
                  onChange={(e) => onUpdateSectionHeaderField('contactTitle', e.target.value)}
                  placeholder="รูปแบบการทำงานและช่องทางติดต่อ"
                  className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">คำโปรยหมวดติดต่องาน (06)</label>
                <input
                  type="text"
                  value={sh.contactSubtitle ?? ''}
                  onChange={(e) => onUpdateSectionHeaderField('contactSubtitle', e.target.value)}
                  placeholder="ยืดหยุ่นตามโจทย์แคมเปญและงบประมาณของแบรนด์ ติดต่อพูดคุยรายละเอียดได้โดยตรง"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

