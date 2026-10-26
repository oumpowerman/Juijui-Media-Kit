import React, { useState } from 'react';
import { Award, Plus, Trash2 } from 'lucide-react';
import { CreatorProfile } from '../../../data/creatorData';

interface IdentityStrengthsSectionProps {
  draftCreator: CreatorProfile;
  onUpdateStrengthItem: (
    index: number,
    field: 'title' | 'subtitle' | 'description',
    value: string
  ) => void;
  onAddStrengthItem: (title: string, subtitle: string, description: string) => void;
  onDeleteStrengthItem: (index: number) => void;
}

export const IdentityStrengthsSection: React.FC<IdentityStrengthsSectionProps> = ({
  draftCreator,
  onUpdateStrengthItem,
  onAddStrengthItem,
  onDeleteStrengthItem,
}) => {
  const [showAddStrength, setShowAddStrength] = useState(false);
  const [newStrengthTitle, setNewStrengthTitle] = useState('');
  const [newStrengthSubtitle, setNewStrengthSubtitle] = useState('');
  const [newStrengthDesc, setNewStrengthDesc] = useState('');

  const handleAddStrength = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStrengthTitle.trim()) return;
    onAddStrengthItem(newStrengthTitle, newStrengthSubtitle, newStrengthDesc);
    setNewStrengthTitle('');
    setNewStrengthSubtitle('');
    setNewStrengthDesc('');
    setShowAddStrength(false);
  };

  return (
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
  );
};
