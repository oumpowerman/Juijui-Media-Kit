import React, { useState } from 'react';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { AddOnsAndPerksEditorProps } from './types';

export const AddOnsAndPerksEditor: React.FC<AddOnsAndPerksEditorProps> = ({
  addOns,
  freePerks,
  customCollabNotes,
  supportedFormats,
  onUpdateAddOnField,
  onAddAddOnItem,
  onDeleteAddOnItem,
  onUpdateFreePerkField,
  onAddFreePerkItem,
  onDeleteFreePerkItem,
  onUpdateCustomCollabNote,
  onUpdateSupportedFormats,
}) => {
  const [newAddOnName, setNewAddOnName] = useState('');
  const [newAddOnDesc, setNewAddOnDesc] = useState('');
  const [newAddOnPrice, setNewAddOnPrice] = useState(1000);
  const [showNewAddOnForm, setShowNewAddOnForm] = useState(false);

  const handleCreateAddOn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddOnName.trim()) return;
    await onAddAddOnItem(newAddOnName, newAddOnDesc, newAddOnPrice);
    setNewAddOnName('');
    setNewAddOnDesc('');
    setNewAddOnPrice(1000);
    setShowNewAddOnForm(false);
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/90 space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-700" />
              <span>2. บริการเสริม (Add-ons) ({addOns.length} รายการ)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              แก้ไขชื่อบริการ คำอธิบาย ราคา หรือเพิ่มรายการบริการเสริมใหม่ได้ตามต้องการ
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNewAddOnForm(!showNewAddOnForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showNewAddOnForm ? 'ปิดฟอร์ม' : 'เพิ่มบริการเสริมใหม่'}</span>
          </button>
        </div>

        {showNewAddOnForm && (
          <form
            onSubmit={handleCreateAddOn}
            className="p-4 rounded-xl bg-violet-50/60 border border-violet-200 grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
          >
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อบริการเสริมใหม่ <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={newAddOnName}
                onChange={(e) => setNewAddOnName(e.target.value)}
                placeholder="เช่น ไลฟ์สด TikTok 1 ชั่วโมง"
                className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300"
              />
            </div>
            <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                คำอธิบายรายละเอียด
              </label>
              <input
                type="text"
                value={newAddOnDesc}
                onChange={(e) => setNewAddOnDesc(e.target.value)}
                placeholder="ระบุเงื่อนไขหรือสิ่งที่แบรนด์จะได้รับเพิ่มเติม"
                className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ราคา (บาท)
              </label>
              <input
                type="number"
                value={newAddOnPrice}
                onChange={(e) => setNewAddOnPrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-bold font-mono-num rounded-lg bg-white border border-slate-300"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {addOns.map((addon) => (
            <div
              key={addon.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <input
                  type="text"
                  value={addon.name}
                  onChange={(e) => onUpdateAddOnField(addon.id, 'name', e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs font-bold text-slate-900 bg-white rounded-lg border border-slate-200 focus:border-violet-600 focus:outline-hidden"
                />
                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    type="number"
                    value={addon.price}
                    onChange={(e) =>
                      onUpdateAddOnField(addon.id, 'price', Number(e.target.value))
                    }
                    className="w-24 px-2.5 py-1 text-xs font-bold font-mono-num rounded-lg bg-white border border-slate-300 text-right"
                  />
                  <span className="text-xs text-slate-500">บาท</span>
                  <button
                    type="button"
                    onClick={() => onDeleteAddOnItem(addon.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                    title="ลบบริการเสริมนี้"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={addon.description}
                onChange={(e) =>
                  onUpdateAddOnField(addon.id, 'description', e.target.value)
                }
                className="w-full px-2.5 py-1 text-[11px] text-slate-600 bg-white rounded-lg border border-slate-200 focus:border-violet-600 focus:outline-hidden"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Free Perks & Custom Collaboration */}
      <div className="pt-4 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-800">
              บริการรวมในแพ็กเกจ (แถมฟรี · แสดงในตารางเปรียบเทียบด้วย)
            </p>
            <button
              type="button"
              onClick={onAddFreePerkItem}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-semibold cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>เพิ่มของแถมฟรี</span>
            </button>
          </div>
          {freePerks.map((perk) => (
            <div key={perk.id} className="flex items-center gap-2">
              <input
                type="text"
                value={perk.name}
                onChange={(e) => onUpdateFreePerkField(perk.id, 'name', e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
              />
              <input
                type="text"
                value={perk.priceLabel}
                onChange={(e) =>
                  onUpdateFreePerkField(perk.id, 'priceLabel', e.target.value)
                }
                className="w-28 px-2.5 py-1.5 text-xs font-bold text-emerald-700 rounded-lg bg-white border border-slate-300 text-right"
              />
              <button
                type="button"
                onClick={() => onDeleteFreePerkItem(perk.id)}
                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                title="ลบรายการของแถมนี้"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
          <p className="text-xs font-bold text-slate-800">
            เงื่อนไข Custom Collaboration (Budget Friendly / Barter Trade)
          </p>
          {customCollabNotes.map((note, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={note.title}
                onChange={(e) => onUpdateCustomCollabNote(idx, 'title', e.target.value)}
                className="col-span-1 px-2.5 py-1.5 text-xs font-bold text-violet-900 rounded-lg bg-white border border-slate-300"
              />
              <input
                type="text"
                value={note.description}
                onChange={(e) =>
                  onUpdateCustomCollabNote(idx, 'description', e.target.value)
                }
                className="col-span-2 px-2.5 py-1.5 text-xs text-slate-700 rounded-lg bg-white border border-slate-300"
              />
            </div>
          ))}

          <div className="pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              รูปแบบคอนเทนต์ที่รองรับ (คั่นด้วยลูกน้ำ ,)
            </label>
            <input
              type="text"
              value={supportedFormats.join(', ')}
              onChange={(e) =>
                onUpdateSupportedFormats(
                  e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                )
              }
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
