import React, { useState, useRef, useEffect } from 'react';
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
  Monitor,
  Upload,
  Crop,
  Smile,
  UserCircle,
  RotateCcw,
  FolderOpen,
  Check,
  X,
} from 'lucide-react';
import {
  CreatorProfile,
  resolveGoogleDriveImage,
  extractGoogleDriveId,
} from '../../data/creatorData';
import { PlatformBrandIcon } from '../ui/PlatformBrandIcon';
import {
  FaviconShape,
  resolveActiveFaviconHref,
  resolveActiveBrowserTitle,
  applyBrowserTabMeta,
} from '../../utils/faviconUtils';
import { FaviconImageCropperModal } from './FaviconImageCropperModal';

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

type IdentitySectionFilter =
  | 'all'
  | 'hero'
  | 'media'
  | 'favicon'
  | 'strengths'
  | 'contact';

const PRESET_TAB_EMOJIS = [
  '✨',
  '🎬',
  '🔥',
  '💜',
  '👑',
  '🌟',
  '🚀',
  '💎',
  '🎉',
  '📸',
  '🎭',
  '🌈',
  '⚡',
  '🛍️',
  '💖',
  '🏆',
];

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

  // State for Favicon Preview & Cropper Modal
  const [cropperSourceUrl, setCropperSourceUrl] = useState<string | null>(null);
  const [rawUploadedSourceUrl, setRawUploadedSourceUrl] = useState<string | null>(null);
  const [customUrlInput, setCustomUrlInput] = useState<string>(() => {
    const current = draftCreator.faviconUrl || '';
    return current.startsWith('data:image/') ? '' : current;
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync live browser tab preview to actual desktop browser tab while editing
  useEffect(() => {
    applyBrowserTabMeta(draftCreator);
  }, [
    draftCreator.faviconMode,
    draftCreator.faviconEmoji,
    draftCreator.faviconUrl,
    draftCreator.faviconShape,
    draftCreator.browserTabTitle,
    draftCreator.avatarUrl,
    draftCreator.nameEn,
  ]);

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

  const handleFileUploadForCrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRawUploadedSourceUrl(reader.result);
        setCropperSourceUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleOpenCropperFromUrl = (urlToCrop: string) => {
    const resolved = resolveGoogleDriveImage(urlToCrop);
    if (!resolved) return;
    setCropperSourceUrl(resolved);
  };

  const handleApplyCroppedFavicon = (croppedDataUrl: string, shape: FaviconShape) => {
    onUpdateRootField('faviconMode', 'custom');
    onUpdateRootField('faviconUrl', croppedDataUrl);
    onUpdateRootField('faviconShape', shape);
    setCropperSourceUrl(null);
  };

  const avatarDriveId = extractGoogleDriveId(draftCreator.avatarUrl);
  const portraitDriveId = extractGoogleDriveId(draftCreator.portraitUrl);
  const faviconDriveId = extractGoogleDriveId(customUrlInput);

  const activeFaviconMode = draftCreator.faviconMode || 'emoji';
  const activeFaviconEmoji = draftCreator.faviconEmoji || '✨';
  const activeFaviconHref = resolveActiveFaviconHref(draftCreator);
  const activeBrowserTitle = resolveActiveBrowserTitle(draftCreator);
  const isCustomCroppedDataUrl = (draftCreator.faviconUrl || '').startsWith('data:image/');

  const SUB_TABS: {
    id: IdentitySectionFilter;
    label: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'all', label: 'แสดงทั้งหมด', icon: Layers },
    { id: 'hero', label: '1. ข้อมูลหลัก & คำคม', icon: Sparkles },
    { id: 'media', label: '2. รูปโปรไฟล์ & ไฟล์ PDF', icon: ImageIcon },
    { id: 'favicon', label: '3. ไอคอน & ชื่อแท็บเว็บ (Favicon)', icon: Monitor },
    {
      id: 'strengths',
      label: `4. จุดเด่นของช่อง (${draftCreator.strengths.length})`,
      icon: Award,
    },
    { id: 'contact', label: '5. ช่องทางติดต่อ (LINE / Email)', icon: PhoneCall },
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

      {/* 3. ตั้งค่าไอคอน อิโมจิ และชื่อแท็บเบราว์เซอร์บนคอมพิวเตอร์ (Browser Tab Favicon & Title Studio) */}
      {(subSection === 'all' || subSection === 'media' || subSection === 'favicon') && (
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-violet-700" />
                <span>
                  3. ตั้งค่าไอคอน อิโมจิ และชื่อแท็บเบราว์เซอร์เวลาเปิดในคอม (Browser Tab Favicon & Title)
                </span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                เลือกใส่อิโมจิ ใช้รูปโปรไฟล์ หรืออัปโหลดรูปภาพแล้วครอปเลือกจุดที่ต้องการให้แสดงบนแท็บเว็บ Chrome / Safari / Edge ได้ทันที
              </p>
            </div>
          </div>

          {/* LIVE DESKTOP BROWSER TAB MOCKUP PREVIEW */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-100/80 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-600 px-1">
              <span className="font-bold text-slate-800">
                ตัวอย่างการแสดงผลบนแท็บเบราว์เซอร์คอมพิวเตอร์ (Live Desktop Tab Preview)
              </span>
              <span className="text-violet-700 font-semibold">
                อัปเดตขึ้นแท็บเบราว์เซอร์จริงด้านบนสุดอัตโนมัติ
              </span>
            </div>

            {/* Simulated Desktop Browser Window Top Bar */}
            <div className="rounded-xl overflow-hidden border border-slate-300/90 shadow-xs">
              <div className="bg-slate-200 px-3 pt-2 flex items-end gap-2">
                {/* Window Controls */}
                <div className="flex items-center gap-1.5 pb-2.5 pr-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                </div>

                {/* Active Browser Tab */}
                <div className="bg-white rounded-t-xl px-3.5 py-2 flex items-center gap-2.5 min-w-[220px] max-w-[380px] shadow-2xs border-t border-x border-slate-300/60">
                  <img
                    src={activeFaviconHref}
                    alt="Tab Icon"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/assets/juijui/avatar-main.jpg';
                    }}
                    className={`w-4 h-4 object-cover shrink-0 ${
                      activeFaviconMode === 'avatar' ? 'rounded-full' : ''
                    }`}
                  />
                  <span className="text-xs font-semibold text-slate-800 truncate">
                    {activeBrowserTitle}
                  </span>
                  <X className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-auto" />
                </div>

                {/* Inactive Secondary Tab */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 text-[11px] text-slate-500 opacity-75">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>Google Search</span>
                </div>
              </div>

              {/* Address Bar */}
              <div className="bg-white px-3.5 py-2 border-t border-slate-200 flex items-center gap-2">
                <div className="flex-1 bg-slate-100 rounded-lg px-3 py-1 flex items-center gap-2 text-[11px] text-slate-600">
                  <Globe className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                  <span className="truncate font-mono-num">
                    {typeof window !== 'undefined' ? window.location.origin : 'https://juijui-mediakit.app'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 7 Columns: Favicon Source Mode & Image Cropper / Emoji Controls */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  เลือกรูปแบบไอคอนหน้าแท็บเบราว์เซอร์ (Favicon Mode)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    {
                      id: 'emoji' as const,
                      label: '1. ใช้อิโมจิ (Emoji)',
                      desc: 'คมชัดทุกหน้าจอ ไม่ต้องใช้ไฟล์รูป',
                      icon: Smile,
                    },
                    {
                      id: 'custom' as const,
                      label: '2. อัปโหลดรูป & ครอป / URL',
                      desc: 'เลือกรูปและครอปส่วนที่ต้องการ',
                      icon: Crop,
                    },
                    {
                      id: 'avatar' as const,
                      label: '3. ใช้รูปโปรไฟล์ช่อง',
                      desc: 'ดึงรูปโปรไฟล์หลักมาใช้อัตโนมัติ',
                      icon: UserCircle,
                    },
                  ].map((modeItem) => {
                    const Icon = modeItem.icon;
                    const active = activeFaviconMode === modeItem.id;
                    return (
                      <button
                        key={modeItem.id}
                        type="button"
                        onClick={() => onUpdateRootField('faviconMode', modeItem.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                          active
                            ? 'bg-violet-50/90 border-violet-600 text-violet-950 shadow-2xs'
                            : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Icon
                            className={`w-4 h-4 ${
                              active ? 'text-violet-700' : 'text-slate-500'
                            }`}
                          />
                          {active && (
                            <span className="text-[10px] font-bold text-violet-700">
                              กำลังใช้งาน
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold mt-1">{modeItem.label}</p>
                        <p className="text-[10px] text-slate-500">{modeItem.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MODE 1: EMOJI PICKER */}
              {activeFaviconMode === 'emoji' && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-800">
                      เลือกอิโมจิจากรายการยอดนิยม หรือพิมพ์อิโมจิที่ต้องการ
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">พิมพ์อิโมจิเอง:</span>
                      <input
                        type="text"
                        value={activeFaviconEmoji}
                        onChange={(e) => {
                          onUpdateRootField('faviconMode', 'emoji');
                          onUpdateRootField('faviconEmoji', e.target.value);
                        }}
                        maxLength={4}
                        className="w-16 px-2 py-1 text-center text-base rounded-lg bg-white border border-slate-300 focus:border-violet-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-8 sm:grid-cols-8 gap-2">
                    {PRESET_TAB_EMOJIS.map((emo) => {
                      const isSelected = activeFaviconEmoji === emo;
                      return (
                        <button
                          key={emo}
                          type="button"
                          onClick={() => {
                            onUpdateRootField('faviconMode', 'emoji');
                            onUpdateRootField('faviconEmoji', emo);
                          }}
                          className={`h-10 rounded-xl text-lg flex items-center justify-center border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-violet-700 border-violet-700 text-white shadow-xs scale-105'
                              : 'bg-white border-slate-200 hover:border-violet-400 hover:bg-violet-50/50'
                          }`}
                        >
                          {emo}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MODE 2: CUSTOM UPLOAD WITH PREVIEW & CROPPER OR IMAGE URL */}
              {activeFaviconMode === 'custom' && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">
                        อัปโหลดรูปภาพจากเครื่องพร้อมระบบ Preview & Crop
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        เมื่อเลือกรูปภาพ ระบบจะเปิดหน้าต่าง Preview ให้คุณลากและซูมครอปเฉพาะส่วนที่ต้องการได้ทันที (รองรับรูปทุกขนาดแม้ไม่ใช่สี่เหลี่ยมจัตุรัส)
                      </p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                      onChange={handleFileUploadForCrop}
                      className="hidden"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-700 hover:bg-violet-800 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>อัปโหลดรูป & เปิดหน้าต่างครอปภาพ</span>
                      </button>

                      {(rawUploadedSourceUrl || draftCreator.faviconUrl) && (
                        <button
                          type="button"
                          onClick={() =>
                            setCropperSourceUrl(
                              rawUploadedSourceUrl ||
                                resolveGoogleDriveImage(
                                  draftCreator.faviconUrl || draftCreator.avatarUrl
                                )
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-violet-800 border border-violet-200 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Crop className="w-3.5 h-3.5" />
                          <span>ปรับตำแหน่งครอปใหม่</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Current Custom Icon Status */}
                  {draftCreator.faviconUrl && (
                    <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center p-1.5 shrink-0">
                          <img
                            src={activeFaviconHref}
                            alt="Current Custom Favicon"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>
                              {isCustomCroppedDataUrl
                                ? 'ครอปและแปลงเป็นไอคอนความคมชัดสูงเรียบร้อยแล้ว'
                                : 'กำลังใช้รูปภาพจากลิงก์ที่ระบุ'}
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-500">
                            สามารถกดปุ่ม “ปรับตำแหน่งครอปใหม่” เพื่อขยับจุดโฟกัสหรือเปลี่ยนทรงกรอบได้ตลอดเวลา
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Option B: Paste Image URL or /public path */}
                  <div className="pt-2 border-t border-slate-200/80 space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      หรือวางลิงก์รูปภาพ (Google Drive / URL) หรือพาธไฟล์ในโฟลเดอร์ public/
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={customUrlInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomUrlInput(val);
                          onUpdateRootField('faviconMode', 'custom');
                          onUpdateRootField('faviconUrl', resolveGoogleDriveImage(val));
                        }}
                        placeholder="เช่น /my-icon.png หรือวางลิงก์แชร์รูปจาก Google Drive"
                        className="flex-1 px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 focus:border-violet-600 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        disabled={!customUrlInput.trim()}
                        onClick={() => handleOpenCropperFromUrl(customUrlInput)}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Crop className="w-3.5 h-3.5" />
                        <span>Preview & ครอปรูปจากลิงก์นี้</span>
                      </button>
                    </div>
                    {faviconDriveId && (
                      <p className="text-[11px] text-emerald-700 font-semibold">
                        ✓ แปลงลิงก์ Google Drive อัตโนมัติแล้ว ({faviconDriveId})
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* MODE 3: USE CHANNEL AVATAR */}
              {activeFaviconMode === 'avatar' && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={resolveGoogleDriveImage(draftCreator.avatarUrl)}
                      alt="Channel Avatar"
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 bg-white"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        กำลังใช้รูปโปรไฟล์หลักของช่องเป็นไอคอนหน้าแท็บ
                      </p>
                      <p className="text-[11px] text-slate-500">
                        หากรูปโปรไฟล์มีขนาดไม่ตรงหรืออยากซูมเฉพาะใบหน้า สามารถกดปุ่มครอปด้านขวาได้ทันที
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenCropperFromUrl(
                        resolveGoogleDriveImage(draftCreator.avatarUrl)
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-700 hover:bg-violet-800 text-white text-xs font-bold cursor-pointer"
                  >
                    <Crop className="w-3.5 h-3.5" />
                    <span>Preview & ครอปส่วนที่ต้องการจากรูปโปรไฟล์</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right 5 Columns: Browser Tab Title Customizer & Where to put files guide */}
            <div className="lg:col-span-5 space-y-4">
              {/* Browser Tab Title Editor */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    ข้อความชื่อแท็บเบราว์เซอร์ (Browser Tab Title)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateRootField(
                        'browserTabTitle',
                        `${draftCreator.nameEn} Media Kit 2026 — Interactive Creator Rate Card`
                      )
                    }
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 hover:text-violet-900 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>คืนค่าเริ่มต้น</span>
                  </button>
                </div>

                <input
                  type="text"
                  value={draftCreator.browserTabTitle ?? ''}
                  onChange={(e) => onUpdateRootField('browserTabTitle', e.target.value)}
                  placeholder={`${draftCreator.nameEn} Media Kit 2026 — Interactive Creator Rate Card`}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 focus:border-violet-600 focus:outline-hidden text-slate-900"
                />

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    กดเพื่อเติมอิโมจินำหน้าชื่อแท็บอย่างรวดเร็ว:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['✨', '🎬', '🔥', '💜', '👑', '🌟'].map((prefixEmo) => (
                      <button
                        key={prefixEmo}
                        type="button"
                        onClick={() => {
                          const currentText = (
                            draftCreator.browserTabTitle ||
                            `${draftCreator.nameEn} Media Kit 2026 — Interactive Creator Rate Card`
                          ).replace(/^[\p{Emoji}\u200d\ufe0f]+\s*/u, '');
                          onUpdateRootField(
                            'browserTabTitle',
                            `${prefixEmo} ${currentText}`
                          );
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-violet-50 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                      >
                        {prefixEmo} นำหน้าชื่อแท็บ
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clear Guide Card: Where to put image files */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-violet-700 shrink-0" />
                  <span>คำแนะนำ: ต้องเอารูปภาพไปใส่ตรงไหนได้บ้าง?</span>
                </h5>
                <ul className="space-y-1.5 text-[11px] text-slate-600 leading-relaxed">
                  <li>
                    <strong className="text-slate-900">1. อัปโหลดและครอปในหน้านี้เลย (สะดวกที่สุด):</strong>{' '}
                    กดปุ่ม <span className="font-semibold text-violet-700">“อัปโหลดรูป & เปิดหน้าต่างครอปภาพ”</span>{' '}
                    ด้านซ้าย เลือกจุดที่ต้องการแล้วกดบันทึก ระบบจะจำไว้บน Cloud ทันทีโดยไม่ต้องวางไฟล์ในโค้ด
                  </li>
                  <li>
                    <strong className="text-slate-900">2. วางไฟล์ในโฟลเดอร์โปรเจกต์โดยตรง:</strong>{' '}
                    นำไฟล์รูปภาพไปวางไว้ในโฟลเดอร์ <code className="px-1.5 py-0.5 rounded bg-slate-100 text-violet-800 font-mono-num">public/</code>{' '}
                    (เช่น <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono-num">public/favicon.png</code>) แล้วพิมพ์{' '}
                    <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono-num">/favicon.png</code> ในช่องลิงก์รูปภาพ
                  </li>
                  <li>
                    <strong className="text-slate-900">3. ใช้ลิงก์รูปจาก Google Drive:</strong>{' '}
                    เปิดแชร์ไฟล์รูปใน Google Drive เป็น “ทุกคนที่มีลิงก์” แล้ววางลิงก์ในช่อง URL ได้เลย
                  </li>
                </ul>
              </div>
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

      {/* 4. จุดเด่นสำคัญของช่อง (Key Strengths Cards) */}
      {(subSection === 'all' || subSection === 'strengths') && (
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-violet-700" />
                <span>
                  4. จุดเด่นสำคัญของช่อง (Key Strengths — {draftCreator.strengths.length} การ์ด)
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

      {/* 5. ช่องทางติดต่องาน (Contact & Social Handles) */}
      {(subSection === 'all' || subSection === 'contact') && (
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-violet-700" />
              <span>5. ช่องทางติดต่องาน (LINE / Email / Social Handle)</span>
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

      {/* Interactive Image Preview & Cropper Modal */}
      <FaviconImageCropperModal
        isOpen={Boolean(cropperSourceUrl)}
        imageSourceUrl={cropperSourceUrl || ''}
        initialShape={draftCreator.faviconShape || 'rounded'}
        browserTabTitlePreview={activeBrowserTitle}
        onCancel={() => setCropperSourceUrl(null)}
        onApplyCrop={handleApplyCroppedFavicon}
      />
    </div>
  );
};
