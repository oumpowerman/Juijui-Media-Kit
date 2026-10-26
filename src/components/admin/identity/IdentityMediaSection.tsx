import React from 'react';
import { Image as ImageIcon, FileText } from 'lucide-react';
import {
  CreatorProfile,
  resolveGoogleDriveImage,
  extractGoogleDriveId,
} from '../../../data/creatorData';

interface IdentityMediaSectionProps {
  draftCreator: CreatorProfile;
  onUpdateRootField: <K extends keyof CreatorProfile>(
    field: K,
    value: CreatorProfile[K]
  ) => void;
}

export const IdentityMediaSection: React.FC<IdentityMediaSectionProps> = ({
  draftCreator,
  onUpdateRootField,
}) => {
  const avatarDriveId = extractGoogleDriveId(draftCreator.avatarUrl);
  const portraitDriveId = extractGoogleDriveId(draftCreator.portraitUrl);

  return (
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
  );
};
