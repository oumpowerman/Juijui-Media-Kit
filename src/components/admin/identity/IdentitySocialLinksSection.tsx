import React from 'react';
import { Globe, ExternalLink } from 'lucide-react';
import { CreatorProfile } from '../../../data/creatorData';
import { PlatformBrandIcon } from '../../ui/PlatformBrandIcon';

interface IdentitySocialLinksSectionProps {
  draftCreator: CreatorProfile;
  onUpdateRootField: <K extends keyof CreatorProfile>(
    field: K,
    value: CreatorProfile[K]
  ) => void;
}

export const IdentitySocialLinksSection: React.FC<IdentitySocialLinksSectionProps> = ({
  draftCreator,
  onUpdateRootField,
}) => {
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

  return (
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
  );
};
