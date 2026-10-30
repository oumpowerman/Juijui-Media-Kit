import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  BarChart3,
  DollarSign,
  Layers,
  Users,
  Sparkles,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { CreatorProfile, RatePackage, AddOnItem, PlatformStat } from '../../data/creatorData';
import { AdminTabType } from '../../hooks/useCreatorStudio';
import { PlatformBrandIcon } from '../ui/PlatformBrandIcon';

interface RatesAnalyticsTabProps {
  onNavigateTab?: (tab: AdminTabType) => void;
  draftCreator: CreatorProfile;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  onUpdatePackageField: <K extends keyof RatePackage>(
    pkgId: string,
    field: K,
    value: RatePackage[K]
  ) => void;
  onUpdateAddOnField: <K extends keyof AddOnItem>(
    addonId: string,
    field: K,
    value: AddOnItem[K]
  ) => void;
  onAddAddOnItem: (name: string, description: string, price: number) => Promise<void>;
  onDeleteAddOnItem: (addonId: string) => Promise<void>;
  onUpdateOverviewStat: (field: keyof CreatorProfile['overview'], value: string) => void;
  onUpdatePlatformStat: <K extends keyof PlatformStat>(
    platformId: PlatformStat['id'],
    field: K,
    value: PlatformStat[K]
  ) => void;
  onUpdateAgeGroupPercent: (index: number, percent: number) => void;
  onUpdateGenderPercent: (index: number, percent: number) => void;
  onUpdateLocationField: (index: number, field: 'name' | 'percent', value: string | number) => void;
  onUpdateFreePerkField: (perkId: string, field: 'name' | 'priceLabel', value: string) => void;
  onUpdateCustomCollabNote: (
    index: number,
    field: 'title' | 'description',
    value: string
  ) => void;
  onUpdateSupportedFormats: (formats: string[]) => void;
  onSaveDraftChanges: () => Promise<void>;
  onResetDefaults: () => Promise<void>;
}

type RatesSubSection = 'all' | 'packages' | 'addons' | 'stats' | 'demographics';

export const RatesAnalyticsTab: React.FC<RatesAnalyticsTabProps> = ({
  onNavigateTab,
  draftCreator,
  onUpdatePackageField,
  onUpdateAddOnField,
  onAddAddOnItem,
  onDeleteAddOnItem,
  onUpdateOverviewStat,
  onUpdatePlatformStat,
  onUpdateAgeGroupPercent,
  onUpdateGenderPercent,
  onUpdateLocationField,
  onUpdateFreePerkField,
  onUpdateCustomCollabNote,
  onUpdateSupportedFormats,
}) => {
  const [subSection, setSubSection] = useState<RatesSubSection>('all');
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

  const SUB_TABS: {
    id: RatesSubSection;
    label: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'all', label: 'แสดงทั้งหมด', icon: Layers },
    { id: 'packages', label: '1. แพ็กเกจหลัก (3 Tiers)', icon: DollarSign },
    {
      id: 'addons',
      label: `2. บริการเสริม & ของแถมฟรี (${draftCreator.addOns.length})`,
      icon: Sparkles,
    },
    { id: 'stats', label: '3. สถิติช่อง & 4 แพลตฟอร์ม', icon: BarChart3 },
    { id: 'demographics', label: '4. สัดส่วนผู้ชมเชิงลึก', icon: Users },
  ];

  return (
    <div className="space-y-5">
      {/* Sub-Navigation Bar for Instant Section Focus */}
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
          คลิกเลือกหมวดย่อยเพื่อแก้ไขเรทราคาหรือสถิติได้ทันทีโดยไม่ต้องเลื่อนยาว
        </span>
      </div>

      {/* Section 1: Rate Packages Editor */}
      {(subSection === 'all' || subSection === 'packages') && (
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-violet-700" />
              <span>1. แพ็กเกจหลัก (Starter / Standard / Premium)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              แก้ไขชื่อ ป้ายกำกับ ราคา ขอบเขตงาน ความคุ้มค่า และรายการสิ่งที่ได้รับในแต่ละแพ็กเกจ
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {draftCreator.packages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2 border-b border-slate-200 pb-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        ชื่อแพ็กเกจ
                      </label>
                      <input
                        type="text"
                        value={pkg.name}
                        onChange={(e) => onUpdatePackageField(pkg.id, 'name', e.target.value)}
                        className="w-full px-2.5 py-1 text-xs font-bold text-slate-900 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        ป้ายกำกับด้านบน
                      </label>
                      <input
                        type="text"
                        value={pkg.badgeText}
                        onChange={(e) => onUpdatePackageField(pkg.id, 'badgeText', e.target.value)}
                        className="w-full px-2.5 py-1 text-xs font-semibold text-violet-700 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        ราคาแพ็กเกจ (บาท)
                      </label>
                      <input
                        type="number"
                        value={pkg.price}
                        onChange={(e) =>
                          onUpdatePackageField(pkg.id, 'price', Number(e.target.value))
                        }
                        className="w-full px-3 py-1.5 text-sm font-bold font-mono-num rounded-lg bg-white border border-slate-300 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        ความยาวคลิปสูงสุด
                      </label>
                      <input
                        type="text"
                        value={pkg.maxDuration}
                        onChange={(e) =>
                          onUpdatePackageField(pkg.id, 'maxDuration', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        จำนวนวิดีโอ
                      </label>
                      <input
                        type="text"
                        value={pkg.videoCount}
                        onChange={(e) =>
                          onUpdatePackageField(pkg.id, 'videoCount', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        จำนวนโพสต์รวม
                      </label>
                      <input
                        type="text"
                        value={pkg.totalPosts}
                        onChange={(e) =>
                          onUpdatePackageField(pkg.id, 'totalPosts', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      แพลตฟอร์มที่เผยแพร่ (แสดงไอคอนอัตโนมัติ)
                    </label>
                    <input
                      type="text"
                      value={pkg.platforms}
                      onChange={(e) => onUpdatePackageField(pkg.id, 'platforms', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      ข้อความสรุปความคุ้มค่า (ใต้ราคา)
                    </label>
                    <input
                      type="text"
                      value={pkg.costEfficiency}
                      onChange={(e) =>
                        onUpdatePackageField(pkg.id, 'costEfficiency', e.target.value)
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-300 text-violet-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      รายการสิ่งที่ได้รับ (บรรทัดละ 1 ข้อ)
                    </label>
                    <textarea
                      rows={4}
                      value={pkg.features.join('\n')}
                      onChange={(e) =>
                        onUpdatePackageField(
                          pkg.id,
                          'features',
                          e.target.value.split('\n').filter((line) => line.trim() !== '')
                        )
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-800 leading-relaxed slim-scroll"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Add-on Services & Free Perks Editor */}
      {(subSection === 'all' || subSection === 'addons') && (
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-700" />
                  <span>2. บริการเสริม (Add-ons) ({draftCreator.addOns.length} รายการ)</span>
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
              {draftCreator.addOns.map((addon) => (
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
              <p className="text-xs font-bold text-slate-800">
                บริการรวมในแพ็กเกจ (แถมฟรี 0.-)
              </p>
              {draftCreator.freePerks.map((perk) => (
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
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
              <p className="text-xs font-bold text-slate-800">
                เงื่อนไข Custom Collaboration (Budget Friendly / Barter Trade)
              </p>
              {draftCreator.customCollabNotes.map((note, idx) => (
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
                  value={draftCreator.supportedFormats.join(', ')}
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
      )}

      {/* Section 3: Channel Overview & 4 Platform Stats Editor */}
      {(subSection === 'all' || subSection === 'stats') && (
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-violet-700" />
              <span>3. อัปเดตสถิติภาพรวม & สถิติแยก 4 แพลตฟอร์ม (พร้อมลิงก์ช่อง)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              ตัวเลขทั้งหมดแสดงผลด้วยฟอนต์ Tabular Numerals บนหน้าเว็บเพื่อความแม่นยำระดับเอเจนซี่
            </p>
          </div>

          {/* Quick Sync Shortcut Banner */}
          {onNavigateTab && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-violet-50/70 border border-violet-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-violet-950">
                    ดึงสถิติสดอัตโนมัติทั้ง 4 แพลตฟอร์มด้วย Official API
                  </p>
                  <p className="text-[11px] text-violet-700">
                    มีระบบพรีวิวเปรียบเทียบ (Diff) และประวัติย้อนหลัง 5 เวอร์ชัน
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('sync')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>เปิดแท็บ 08 (API Sync)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Overview KPI Row (All 6 fields) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 rounded-xl bg-slate-50/70 border border-slate-200">
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                ผู้ติดตามรวม
              </label>
              <input
                type="text"
                value={draftCreator.overview.totalFollowers}
                onChange={(e) => onUpdateOverviewStat('totalFollowers', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-bold font-mono-num rounded-lg bg-white border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                ยอดวิว 60 วัน
              </label>
              <input
                type="text"
                value={draftCreator.overview.totalViews60d}
                onChange={(e) => onUpdateOverviewStat('totalViews60d', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-bold font-mono-num rounded-lg bg-white border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                ER เฉลี่ยรวม
              </label>
              <input
                type="text"
                value={draftCreator.overview.totalEr}
                onChange={(e) => onUpdateOverviewStat('totalEr', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-bold font-mono-num rounded-lg bg-white border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                ยอดดูเฉลี่ยต่อคลิป
              </label>
              <input
                type="text"
                value={draftCreator.overview.avgViewsPerContent}
                onChange={(e) => onUpdateOverviewStat('avgViewsPerContent', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-bold font-mono-num rounded-lg bg-white border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                Reach ต่อเดือน
              </label>
              <input
                type="text"
                value={draftCreator.overview.monthlyReach}
                onChange={(e) => onUpdateOverviewStat('monthlyReach', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-mono-num rounded-lg bg-white border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                Likes ต่อเดือน
              </label>
              <input
                type="text"
                value={draftCreator.overview.monthlyLikes}
                onChange={(e) => onUpdateOverviewStat('monthlyLikes', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-mono-num rounded-lg bg-white border border-slate-300"
              />
            </div>
          </div>

          {/* 4 Platform Cards Editor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {draftCreator.platforms.map((plat) => (
              <div
                key={plat.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <div className="flex items-center gap-1.5">
                    <PlatformBrandIcon platform={plat.name} size="xs" />
                    <span className="text-xs font-bold text-slate-900">{plat.name}</span>
                  </div>
                  <input
                    type="text"
                    value={plat.handle}
                    onChange={(e) => onUpdatePlatformStat(plat.id, 'handle', e.target.value)}
                    className="w-28 px-2 py-0.5 text-[11px] text-right text-slate-600 bg-white rounded border border-slate-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-500">Follower</label>
                    <input
                      type="text"
                      value={plat.followers}
                      onChange={(e) =>
                        onUpdatePlatformStat(plat.id, 'followers', e.target.value)
                      }
                      className="w-full px-2 py-1 text-xs font-mono-num font-semibold bg-white rounded border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Views (60d)</label>
                    <input
                      type="text"
                      value={plat.views}
                      onChange={(e) => onUpdatePlatformStat(plat.id, 'views', e.target.value)}
                      className="w-full px-2 py-1 text-xs font-mono-num font-semibold bg-white rounded border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Likes</label>
                    <input
                      type="text"
                      value={plat.likes}
                      onChange={(e) => onUpdatePlatformStat(plat.id, 'likes', e.target.value)}
                      className="w-full px-2 py-1 text-xs font-mono-num bg-white rounded border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">ER (%)</label>
                    <input
                      type="text"
                      value={plat.er}
                      onChange={(e) => onUpdatePlatformStat(plat.id, 'er', e.target.value)}
                      className="w-full px-2 py-1 text-xs font-mono-num font-bold text-violet-700 bg-white rounded border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Comments</label>
                    <input
                      type="text"
                      value={plat.comments}
                      onChange={(e) =>
                        onUpdatePlatformStat(plat.id, 'comments', e.target.value)
                      }
                      className="w-full px-2 py-1 text-xs font-mono-num bg-white rounded border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Shares</label>
                    <input
                      type="text"
                      value={plat.shares}
                      onChange={(e) => onUpdatePlatformStat(plat.id, 'shares', e.target.value)}
                      className="w-full px-2 py-1 text-xs font-mono-num bg-white rounded border border-slate-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">ลิงก์ไปยังช่อง (URL)</label>
                  <input
                    type="text"
                    value={plat.url}
                    onChange={(e) => onUpdatePlatformStat(plat.id, 'url', e.target.value)}
                    className="w-full px-2 py-1 text-[11px] text-slate-600 bg-white rounded border border-slate-200"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 4: Audience Demographics Editor (Age, Gender, Locations) */}
      {(subSection === 'all' || subSection === 'demographics') && (
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-700" />
              <span>4. ข้อมูลสัดส่วนผู้ชมเชิงลึก (Demographics: ช่วงอายุ, เพศ, พื้นที่)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              ปรับสัดส่วนเปอร์เซ็นต์ผู้ชมที่จะไปแสดงผลเป็นกราฟแท่งในหน้าสถิติช่อง
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Age Groups */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
              <p className="text-xs font-bold text-slate-800">ช่วงอายุผู้ติดตาม (%)</p>
              {draftCreator.demographics.ageGroups.map((ag, idx) => (
                <div key={ag.range} className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-slate-700">{ag.range}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={ag.percent}
                      onChange={(e) => onUpdateAgeGroupPercent(idx, Number(e.target.value))}
                      className="w-20 px-2 py-1 text-xs font-mono-num font-bold text-right bg-white rounded-lg border border-slate-300"
                    />
                    <span>%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Gender Split */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
              <p className="text-xs font-bold text-slate-800">สัดส่วนเพศผู้ชม (%)</p>
              {draftCreator.demographics.gender.map((g, idx) => (
                <div key={g.label} className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-slate-700">{g.label}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={g.percent}
                      onChange={(e) => onUpdateGenderPercent(idx, Number(e.target.value))}
                      className="w-20 px-2 py-1 text-xs font-mono-num font-bold text-right bg-white rounded-lg border border-slate-300"
                    />
                    <span>%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Top Locations */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
              <p className="text-xs font-bold text-slate-800">พื้นที่ผู้ชมสูงสุด (%)</p>
              {draftCreator.demographics.locations.map((loc, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <input
                    type="text"
                    value={loc.name}
                    onChange={(e) => onUpdateLocationField(idx, 'name', e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white rounded-lg border border-slate-300"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={loc.percent}
                      onChange={(e) =>
                        onUpdateLocationField(idx, 'percent', Number(e.target.value))
                      }
                      className="w-16 px-2 py-1 text-xs font-mono-num font-bold text-right bg-white rounded-lg border border-slate-300"
                    />
                    <span>%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
