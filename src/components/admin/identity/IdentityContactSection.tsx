import React from 'react';
import { PhoneCall } from 'lucide-react';
import { CreatorProfile } from '../../../data/creatorData';

interface IdentityContactSectionProps {
  draftCreator: CreatorProfile;
  onUpdateContactField: <K extends keyof CreatorProfile['contact']>(
    field: K,
    value: CreatorProfile['contact'][K]
  ) => void;
}

export const IdentityContactSection: React.FC<IdentityContactSectionProps> = ({
  draftCreator,
  onUpdateContactField,
}) => {
  return (
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
  );
};
