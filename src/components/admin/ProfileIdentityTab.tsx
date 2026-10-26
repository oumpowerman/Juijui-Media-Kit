import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  PhoneCall,
  Award,
  Layers,
  Monitor,
} from 'lucide-react';
import {
  CreatorProfile,
  resolveGoogleDriveImage,
} from '../../data/creatorData';
import {
  FaviconShape,
  resolveActiveFaviconHref,
  resolveActiveBrowserTitle,
  applyBrowserTabMeta,
} from '../../utils/faviconUtils';
import { FaviconImageCropperModal } from './FaviconImageCropperModal';
import { IdentityHeroSection } from './identity/IdentityHeroSection';
import { IdentityMediaSection } from './identity/IdentityMediaSection';
import { IdentityFaviconSection } from './identity/IdentityFaviconSection';
import { IdentitySocialLinksSection } from './identity/IdentitySocialLinksSection';
import { IdentityStrengthsSection } from './identity/IdentityStrengthsSection';
import { IdentityContactSection } from './identity/IdentityContactSection';

export interface ProfileIdentityTabProps {
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

export type IdentitySectionFilter =
  | 'all'
  | 'hero'
  | 'media'
  | 'favicon'
  | 'strengths'
  | 'contact';

export const ProfileIdentityTab: React.FC<ProfileIdentityTabProps> = ({
  draftCreator,
  onUpdateRootField,
  onUpdateStrengthItem,
  onAddStrengthItem,
  onDeleteStrengthItem,
  onUpdateContactField,
}) => {
  const [subSection, setSubSection] = useState<IdentitySectionFilter>('all');

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

  const activeFaviconMode = draftCreator.faviconMode || 'emoji';
  const activeFaviconEmoji = draftCreator.faviconEmoji || '✨';
  const activeFaviconHref = resolveActiveFaviconHref(draftCreator);
  const activeBrowserTitle = resolveActiveBrowserTitle(draftCreator);

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

      {/* 1. ข้อมูลชื่อช่อง สโลแกน คำคม และคำอธิบาย (Hero Section) */}
      {(subSection === 'all' || subSection === 'hero') && (
        <IdentityHeroSection
          draftCreator={draftCreator}
          onUpdateRootField={onUpdateRootField}
        />
      )}

      {/* 2. รูปโปรไฟล์หลัก รูปหน้าติดต่อ และลิงก์ PDF */}
      {(subSection === 'all' || subSection === 'media') && (
        <IdentityMediaSection
          draftCreator={draftCreator}
          onUpdateRootField={onUpdateRootField}
        />
      )}

      {/* 3. ตั้งค่าไอคอน อิโมจิ และชื่อแท็บเบราว์เซอร์บนคอมพิวเตอร์ */}
      {(subSection === 'all' || subSection === 'media' || subSection === 'favicon') && (
        <IdentityFaviconSection
          draftCreator={draftCreator}
          onUpdateRootField={onUpdateRootField}
          activeFaviconMode={activeFaviconMode}
          activeFaviconEmoji={activeFaviconEmoji}
          activeFaviconHref={activeFaviconHref}
          activeBrowserTitle={activeBrowserTitle}
          customUrlInput={customUrlInput}
          setCustomUrlInput={setCustomUrlInput}
          rawUploadedSourceUrl={rawUploadedSourceUrl}
          fileInputRef={fileInputRef}
          onFileUploadForCrop={handleFileUploadForCrop}
          onOpenCropperFromUrl={handleOpenCropperFromUrl}
          onReOpenCropper={(sourceUrl) => setCropperSourceUrl(sourceUrl)}
        />
      )}

      {/* 2B. ลิงก์ช่องทางโซเชียลมีเดียหลัก (Social Media Channel URLs) */}
      {(subSection === 'all' || subSection === 'media' || subSection === 'hero') && (
        <IdentitySocialLinksSection
          draftCreator={draftCreator}
          onUpdateRootField={onUpdateRootField}
        />
      )}

      {/* 4. จุดเด่นสำคัญของช่อง (Key Strengths Cards) */}
      {(subSection === 'all' || subSection === 'strengths') && (
        <IdentityStrengthsSection
          draftCreator={draftCreator}
          onUpdateStrengthItem={onUpdateStrengthItem}
          onAddStrengthItem={onAddStrengthItem}
          onDeleteStrengthItem={onDeleteStrengthItem}
        />
      )}

      {/* 5. ช่องทางติดต่องาน (Contact & Social Handles) */}
      {(subSection === 'all' || subSection === 'contact') && (
        <IdentityContactSection
          draftCreator={draftCreator}
          onUpdateContactField={onUpdateContactField}
        />
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
