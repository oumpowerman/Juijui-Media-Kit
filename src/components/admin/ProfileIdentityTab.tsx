import React, { useState } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  FileText,
  Plus,
  Trash2,
  PhoneCall,
  Award,
  Layers,
  Globe,
  ExternalLink,
} from 'lucide-react';
import {
  CreatorProfile,
  resolveGoogleDriveImage,
  extractGoogleDriveId,
} from '../../data/creatorData';
import { PlatformBrandIcon } from '../ui/PlatformBrandIcon';

interface ProfileIdentityTabProps {
  draftCreator: CreatorProfile;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  onUpdateRootField: <K extends keyof CreatorProfile>(
    field: K,
    value: CreatorProfile[K]
  ) => void;
  onUpdateStrengthItem: (
    index: number,
    field: 'title' | 'subtitle' | 'description',
    value: string
  ) => void;
  onAddStrengthItem: (title: string, subtitle: string, description: string) => void;
  onDeleteStrengthItem: (index: number) => void;
  onUpdateContactField: <K extends keyof CreatorProfile['contact']>(
    field: K,
    value: CreatorProfile['contact'][K]
  ) => void;
  onSaveDraftChanges: () => Promise<void>;
}

type IdentitySectionFilter = 'all' | 'hero' | 'media' | 'strengths' | 'contact';

export const ProfileIdentityTab: React.FC<ProfileIdentityTabProps> = ({
  draftCreator,
  onUpdateRootField,
  onUpdateStrengthItem,
  onAddStrengthItem,
  onDeleteStrengthItem,
  onUpdateContactField,
}) => {
  const [subSection, setSubSection] = useState<IdentitySectionFilter>('all');
  const [newStrengthTitle, setNewStrengthTitle] = useState('');
  const [newStrengthSubtitle, setNewStrengthSubtitle] = useState('');
  const [newStrengthDesc, setNewStrengthDesc] = useState('');
  const [showAddStrength, setShowAddStrength] = useState(false);

  const handleAddStrength = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStrengthTitle.trim()) return;
    onAddStrengthItem(newStrengthTitle, newStrengthSubtitle, newStrengthDesc);
    setNewStrengthTitle('');
    setNewStrengthSubtitle('');
    setNewStrengthDesc('');
    setShowAddStrength(false);
  };

  const handleUpdatePlatformUrl = (platformId: string, newUrl: string) => {
    const updated = draftCreator.platforms.map((p) =>
      p.id === platformId ? { ...p, url: newUrl } : p
    );
    onUpdateRootField('platforms', updated);
  };

  const handleUpdatePlatformHandle = (platformId: string, newHandle: string) => {
    const updated = draftCreator.platforms.map((p) =>
      p.id === platformId ? { ...p, handle: newHandle } : p
    );
    onUpdateRootField('platforms', updated);
  };

  const avatarDriveId = extractGoogleDriveId(draftCreator.avatarUrl);
  const portraitDriveId = extractGoogleDriveId(draftCreator.portraitUrl);

  const SUB_TABS: {
    id: IdentitySectionFilter;
    label: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'all', label: 'แสดงทั้งหมด', icon: Layers },
    { id: 'hero', label: '1. ข้อมูลหลัก & คำคม', icon: Sparkles },
    { id: 'media', label: '2. รูปโปรไฟล์ & ไฟล์ PDF', icon: ImageIcon },
    {
      id: 'strengths',
      label: `3. จุดเด่นของช่อง (${draftCreator.strengths.length})`,
      icon: Award,
    },
    { id: 'contact', label: '4. ช่องทางติดต่อ (LINE / Email)', icon: PhoneCall },
  ];

  return (
    <div className="space-y-5">
      {/* Sub-Navigation Filter Bar for Instant Section Focus */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200/90">
        <div className="flex flex-wrap items-center gap-1">
          {SUB_TABS.map((item) => {
            const Icon = item.icon;
            const active = subSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSubSection(item.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-violet-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
        <span className="text-[11px] text-slate-400 pr-2 hidden lg:inline">
          เลือกหมวดย่อยเพื่อโฟกัสเฉพาะส่วนที่ต้องการแก้ไข
        </span>
      </div>

      {/* 1. ข้อมูลชื่อช่อง สโลแกน คำคม และคำอธิบาย */}
      {(subSection === 'all' || subSection === 'hero') && (
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
      )}

      {/* 2. รูปโปรไฟล์หลัก รูปหน้าติดต่อ และลิงก์ PDF */}
      {(subSection === 'all' || subSection === 'media') && (
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-violet-700" />
              <span>2. รูปโปรไฟล์ รูปหน้าติดต่อ & ไฟล์ PDF Media Kit</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              รองรับทั้ง URL รูปภาพปกติ และลิงก์แชร์รูปภาพจาก Google Drive (ระบบแปลงลิงก์ให้อัตโนมัติ)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Avatar URL */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
              <label className="block text-xs font-bold text-slate-800">
                รูปโปรไฟล์หลัก (Avatar Image / Google Drive)
              </label>
              <input
                type="text"
                value={draftCreator.avatarUrl}
                onChange={(e) =>
                  onUpdateRootField('avatarUrl', resolveGoogleDriveImage(e.target.value))
                }
                placeholder="วางลิงก์รูปภาพ หรือลิงก์ Google Drive"
                className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 focus:border-violet-600 focus:outline-hidden"
              />
              <div className="flex items-center gap-3 pt-1">
                <img
                  src={resolveGoogleDriveImage(draftCreator.avatarUrl)}
                  alt="Avatar Preview"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/assets/juijui/page-1.png';
                  }}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 bg-white shrink-0"
                />
                <span className="text-[11px] text-slate-500 leading-relaxed">
                  {avatarDriveId
                    ? `✓ แปลงลิงก์ Google Drive แล้ว (${avatarDriveId})`
                    : 'แสดงผลในแถบเมนูด้านบน และการ์ดโปรไฟล์หน้าแรก'}
                </span>
              </div>
            </div>

            {/* Portrait URL */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
              <label className="block text-xs font-bold text-slate-800">
                รูปภาพส่วนติดต่องานท้ายเว็บ (Contact Portrait)
              </label>
              <input
                type="text"
                value={draftCreator.portraitUrl}
                onChange={(e) =>
                  onUpdateRootField('portraitUrl', resolveGoogleDriveImage(e.target.value))
                }
                placeholder="วางลิงก์รูปภาพ หรือลิงก์ Google Drive"
                className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 focus:border-violet-600 focus:outline-hidden"
              />
              <div className="flex items-center gap-3 pt-1">
                <img
                  src={resolveGoogleDriveImage(draftCreator.portraitUrl)}
                  alt="Portrait Preview"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/assets/juijui/page-6.png';
                  }}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 bg-white shrink-0"
                />
                <span className="text-[11px] text-slate-500 leading-relaxed">
                  {portraitDriveId
                    ? `✓ แปลงลิงก์ Google Drive แล้ว (${portraitDriveId})`
                    : 'แสดงผลในหน้า 06. Contact & Collaboration'}
                </span>
              </div>
            </div>

            {/* PDF URL */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-violet-700" />
                <span>ลิงก์ไฟล์ PDF Media Kit ต้นฉบับ</span>
              </label>
              <input
                type="text"
                value={draftCreator.pdfMediaKitUrl}
                onChange={(e) => onUpdateRootField('pdfMediaKitUrl', e.target.value)}
                placeholder="/assets/aistudio/_Media_kit_PR_BIGBAG_8383827f.pdf"
                className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 focus:border-violet-600 focus:outline-hidden"
              />
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                ใช้สำหรับปุ่ม “เปิดดู PDF ต้นฉบับ” และปุ่มดาวน์โหลดไฟล์ PDF บนหน้าเว็บหลัก
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2B. ลิงก์ช่องทางโซเชียลมีเดียหลัก (Social Media Channel URLs) */}
      {(subSection === 'all' || subSection === 'media' || subSection === 'hero') && (
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-violet-700" />
                <span>ลิงก์ช่องทางโซเชียลมีเดียหลัก (Social Media Channel URLs)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                กำหนด URL ปลายทางของแต่ละแพลตฟอร์ม เมื่อผู้ใช้กดคลิกที่การ์ดใน Hero Section จะพาไปยังช่องทางเหล่านี้โดยตรง
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {draftCreator.platforms.map((plat) => (
              <div
                key={plat.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                  <div className="flex items-center gap-2">
                    <PlatformBrandIcon platform={plat.name} size="xs" />
                    <span className="text-xs font-bold text-slate-900">{plat.name}</span>
                  </div>
                  {plat.url && (
                    <a
                      href={plat.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-violet-700 hover:text-violet-900 flex items-center gap-0.5 hover:underline"
                      title="ทดสอบเปิดลิงก์ช่อง"
                    >
                      <span>เปิดดู</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                    ชื่อบัญชี / Handle
                  </label>
                  <input
                    type="text"
                    value={plat.handle}
                    onChange={(e) => handleUpdatePlatformHandle(plat.id, e.target.value)}
                    placeholder="@JUIJUI.j"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300 focus:border-violet-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                    URL ลิงก์ตรงสู่ช่อง
                  </label>
                  <input
                    type="text"
                    value={plat.url}
                    onChange={(e) => handleUpdatePlatformUrl(plat.id, e.target.value)}
                    placeholder={`https://${plat.id}.com/...`}
                    className="w-full px-2.5 py-1.5 text-[11px] text-slate-700 font-mono-num rounded-lg bg-white border border-slate-300 focus:border-violet-600 focus:outline-hidden"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. จุดเด่นสำคัญของช่อง (Key Strengths Cards) */}
      {(subSection === 'all' || subSection === 'strengths') && (
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-violet-700" />
                <span>
                  3. จุดเด่นสำคัญของช่อง (Key Strengths — {draftCreator.strengths.length} การ์ด)
                </span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                แก้ไขข้อความในการ์ดจุดเด่นหน้าแรก หรือเพิ่มการ์ดจุดเด่นใหม่
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddStrength(!showAddStrength)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddStrength ? 'ปิดฟอร์ม' : 'เพิ่มจุดเด่นใหม่'}</span>
            </button>
          </div>

          {showAddStrength && (
            <form
              onSubmit={handleAddStrength}
              className="p-4 rounded-xl bg-violet-50/60 border border-violet-200 grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
            >
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  หัวข้อจุดเด่น <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newStrengthTitle}
                  onChange={(e) => setNewStrengthTitle(e.target.value)}
                  placeholder="เช่น คอนเทนต์ไวรัลธรรมชาติ"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ป้ายกำกับสั้น (Subtitle)
                </label>
                <input
                  type="text"
                  value={newStrengthSubtitle}
                  onChange={(e) => setNewStrengthSubtitle(e.target.value)}
                  placeholder="เช่น ป้ายยาเนียน"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300"
                />
              </div>
              <div className="md:col-span-5">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  คำอธิบายรายละเอียด
                </label>
                <input
                  type="text"
                  value={newStrengthDesc}
                  onChange={(e) => setNewStrengthDesc(e.target.value)}
                  placeholder="อธิบายจุดขายที่ทำให้แบรนด์มั่นใจ"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300"
                />
              </div>
              <div className="md:col-span-1">
                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-lg bg-violet-700 hover:bg-violet-800 text-white text-xs font-semibold cursor-pointer"
                >
                  เพิ่ม
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {draftCreator.strengths.map((st, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-violet-700">
                      การ์ดจุดเด่น #{idx + 1}
                    </span>
                    {draftCreator.strengths.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeleteStrengthItem(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        title="ลบการ์ดจุดเด่นนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      หัวข้อหลัก (Title)
                    </label>
                    <input
                      type="text"
                      value={st.title}
                      onChange={(e) => onUpdateStrengthItem(idx, 'title', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-900 bg-white rounded-lg border border-slate-200 focus:border-violet-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      ป้ายกำกับมุมขวา (Subtitle)
                    </label>
                    <input
                      type="text"
                      value={st.subtitle}
                      onChange={(e) => onUpdateStrengthItem(idx, 'subtitle', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold text-violet-700 bg-white rounded-lg border border-slate-200 focus:border-violet-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      คำอธิบาย (Description)
                    </label>
                    <textarea
                      rows={2}
                      value={st.description}
                      onChange={(e) =>
                        onUpdateStrengthItem(idx, 'description', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 text-xs text-slate-700 bg-white rounded-lg border border-slate-200 focus:border-violet-600 focus:outline-hidden slim-scroll"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ช่องทางติดต่องาน (Contact & Social Handles) */}
      {(subSection === 'all' || subSection === 'contact') && (
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-violet-700" />
              <span>4. ช่องทางติดต่องาน (LINE / Email / Social Handle)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              ข้อมูลส่วนนี้จะแสดงทั้งในการ์ด Hero, ปุ่มส่งใบเสนอราคาเข้า LINE/Email และหน้า 06. Contact
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                LINE ID สำหรับติดต่องาน
              </label>
              <input
                type="text"
                value={draftCreator.contact.lineId}
                onChange={(e) => onUpdateContactField('lineId', e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300 focus:border-violet-600 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ลิงก์คลิกแอด LINE (lineUrl)
              </label>
              <input
                type="text"
                value={draftCreator.contact.lineUrl}
                onChange={(e) => onUpdateContactField('lineUrl', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300 focus:border-violet-600 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                อีเมลติดต่องาน (Email)
              </label>
              <input
                type="email"
                value={draftCreator.contact.email}
                onChange={(e) => onUpdateContactField('email', e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300 focus:border-violet-600 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อ Social Handle รวม
              </label>
              <input
                type="text"
                value={draftCreator.contact.tiktokHandle}
                onChange={(e) => onUpdateContactField('tiktokHandle', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300 focus:border-violet-600 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
