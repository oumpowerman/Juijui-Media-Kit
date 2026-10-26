import React from 'react';
import {
  Monitor,
  Upload,
  Crop,
  Smile,
  UserCircle,
  Globe,
  X,
  RotateCcw,
  FolderOpen,
  Check,
} from 'lucide-react';
import {
  CreatorProfile,
  resolveGoogleDriveImage,
  extractGoogleDriveId,
} from '../../../data/creatorData';

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

interface IdentityFaviconSectionProps {
  draftCreator: CreatorProfile;
  onUpdateRootField: <K extends keyof CreatorProfile>(
    field: K,
    value: CreatorProfile[K]
  ) => void;
  activeFaviconMode: 'emoji' | 'avatar' | 'custom';
  activeFaviconEmoji: string;
  activeFaviconHref: string;
  activeBrowserTitle: string;
  customUrlInput: string;
  setCustomUrlInput: (val: string) => void;
  rawUploadedSourceUrl: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileUploadForCrop: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenCropperFromUrl: (url: string) => void;
  onReOpenCropper: (sourceUrl: string) => void;
}

export const IdentityFaviconSection: React.FC<IdentityFaviconSectionProps> = ({
  draftCreator,
  onUpdateRootField,
  activeFaviconMode,
  activeFaviconEmoji,
  activeFaviconHref,
  activeBrowserTitle,
  customUrlInput,
  setCustomUrlInput,
  rawUploadedSourceUrl,
  fileInputRef,
  onFileUploadForCrop,
  onOpenCropperFromUrl,
  onReOpenCropper,
}) => {
  const isCustomCroppedDataUrl = Boolean(draftCreator.faviconUrl?.startsWith('data:image/'));
  const faviconDriveId = extractGoogleDriveId(customUrlInput);

  return (
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
                  onChange={onFileUploadForCrop}
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
                        onReOpenCropper(
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
                    onClick={() => onOpenCropperFromUrl(customUrlInput)}
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
                    ดึงรูปโปรไฟล์หลักของช่องมาใช้เป็นไอคอนแท็บเบราว์เซอร์
                  </p>
                  <p className="text-[11px] text-slate-500">
                    รูปจะแสดงแบบวงกลมมนตามสไตล์รูปโปรไฟล์ และอัปเดตอัตโนมัติเมื่อเปลี่ยนรูปโปรไฟล์หลัก
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onReOpenCropper(
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
  );
};
