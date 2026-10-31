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
  Star,
  Clock,
  Copy,
  Check,
  Calculator,
  AlertCircle,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import {
  CreatorProfile,
  RatePackage,
  AddOnItem,
  PlatformStat,
  StatsTimeframe,
  TimeframePlatformMetrics,
  TimeframeOverviewMetrics,
  STATS_TIMEFRAME_OPTIONS,
  resolvePlatformMetricsForTimeframe,
  resolveOverviewForTimeframe,
  resolveDemographicsForView,
  PlatformDemographicsData,
} from '../../data/creatorData';
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
  onUpdateDefaultStatsTimeframe: (timeframe: StatsTimeframe) => void;
  onUpdateOverviewTimeframeStat: (
    timeframe: StatsTimeframe,
    field: keyof TimeframeOverviewMetrics,
    value: string
  ) => void;
  onUpdatePlatformTimeframeStat: (
    platformId: PlatformStat['id'],
    timeframe: StatsTimeframe,
    field: keyof TimeframePlatformMetrics,
    value: string
  ) => void;
  onUpdateAgeGroupPercent: (index: number, percent: number, platformKey?: string) => void;
  onUpdateAgeGroupField: (
    index: number,
    field: 'range' | 'percent',
    value: string | number,
    platformKey?: string
  ) => void;
  onAddAgeGroupItem: (range?: string, percent?: number, platformKey?: string) => void;
  onDeleteAgeGroupItem: (index: number, platformKey?: string) => void;
  onUpdateGenderPercent: (index: number, percent: number, platformKey?: string) => void;
  onUpdateGenderField: (
    index: number,
    field: 'label' | 'percent',
    value: string | number,
    platformKey?: string
  ) => void;
  onUpdateLocationField: (
    index: number,
    field: 'name' | 'percent',
    value: string | number,
    platformKey?: string
  ) => void;
  onAddLocationItem: (name?: string, percent?: number, platformKey?: string) => void;
  onDeleteLocationItem: (index: number, platformKey?: string) => void;
  onUpdateDemographicsMeta: (
    field: Exclude<
      keyof CreatorProfile['demographics'],
      'ageGroups' | 'gender' | 'locations' | 'platformDemographics' | 'defaultDemographicView'
    >,
    value: string,
    platformKey?: string
  ) => void;
  onCopyDemographicsBetweenPlatforms?: (
    fromPlatformKey: string,
    targetPlatformKeys: string[]
  ) => void;
  onRecalculateDemographicsWeightedAverage?: () => void;
  onUpdateDefaultDemographicView?: (view: string) => void;
  onUpdateFreePerkField: (perkId: string, field: 'name' | 'priceLabel', value: string) => void;
  onAddFreePerkItem: () => void;
  onDeleteFreePerkItem: (perkId: string) => void;
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
  onUpdateDefaultStatsTimeframe,
  onUpdateOverviewTimeframeStat,
  onUpdatePlatformTimeframeStat,
  onUpdateAgeGroupField,
  onAddAgeGroupItem,
  onDeleteAgeGroupItem,
  onUpdateGenderField,
  onUpdateLocationField,
  onAddLocationItem,
  onDeleteLocationItem,
  onUpdateDemographicsMeta,
  onCopyDemographicsBetweenPlatforms,
  onRecalculateDemographicsWeightedAverage,
  onUpdateDefaultDemographicView,
  onUpdateFreePerkField,
  onAddFreePerkItem,
  onDeleteFreePerkItem,
  onUpdateCustomCollabNote,
  onUpdateSupportedFormats,
}) => {
  const [subSection, setSubSection] = useState<RatesSubSection>('all');
  const [editingTimeframe, setEditingTimeframe] = useState<StatsTimeframe>(
    draftCreator.defaultStatsTimeframe || '60d'
  );
  const [selectedDemographicPlatform, setSelectedDemographicPlatform] = useState<string>('overall');
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyTargets, setCopyTargets] = useState<string[]>([
    'tiktok',
    'facebook',
    'instagram',
    'youtube',
  ]);
  const [showRecalcSuccess, setShowRecalcSuccess] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

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

  // Resolve demographics object for currently selected view
  const demo: PlatformDemographicsData =
    selectedDemographicPlatform === 'overall'
      ? draftCreator.demographics
      : draftCreator.demographics.platformDemographics?.[selectedDemographicPlatform] ||
        draftCreator.demographics;

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
              แก้ไขชื่อ ป้ายกำกับ ราคา ขอบเขตงาน ความคุ้มค่า ป้ายแนะนำ (Most Popular) และรายการสิ่งที่ได้รับในแต่ละแพ็กเกจ
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {draftCreator.packages.map((pkg, idx) => {
              const isPopularActive = pkg.isPopular ?? idx === 1;
              return (
                <div
                  key={pkg.id}
                  className={`p-4 rounded-xl border space-y-3 flex flex-col justify-between transition-colors ${
                    isPopularActive
                      ? 'border-violet-400 bg-violet-50/40'
                      : 'border-slate-200 bg-slate-50/60'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Popular Toggle */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                      <span className="text-[11px] font-bold text-slate-700">
                        การ์ดแพ็กเกจที่ #{idx + 1}
                      </span>
                      <label className="inline-flex items-center gap-1.5 text-[11px] font-bold text-violet-800 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isPopularActive}
                          onChange={(e) =>
                            onUpdatePackageField(pkg.id, 'isPopular', e.target.checked)
                          }
                          className="accent-violet-700 rounded"
                        />
                        <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                        <span>ป้ายแนะนำสูงสุด (Most Popular)</span>
                      </label>
                    </div>

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
                        แพลตฟอร์มที่เผยแพร่ (ระบุชื่อช่องทาง เช่น TikTok, Facebook, Instagram, YouTube)
                      </label>
                      <input
                        type="text"
                        value={pkg.platforms}
                        onChange={(e) => onUpdatePackageField(pkg.id, 'platforms', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          ป้ายขอบเขตช่องทาง (ถ้าต้องการระบุเอง)
                        </label>
                        <input
                          type="text"
                          value={pkg.platformScopeLabel ?? ''}
                          onChange={(e) =>
                            onUpdatePackageField(pkg.id, 'platformScopeLabel', e.target.value)
                          }
                          placeholder="คำนวณอัตโนมัติจากแพลตฟอร์ม"
                          className="w-full px-2.5 py-1 text-[11px] rounded-lg bg-white border border-slate-300 text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          คำอธิบายการกระจายโพสต์ (ถ้ามี)
                        </label>
                        <input
                          type="text"
                          value={pkg.distributionSubLabel ?? ''}
                          onChange={(e) =>
                            onUpdatePackageField(pkg.id, 'distributionSubLabel', e.target.value)
                          }
                          placeholder="เช่น กระจายทุกช่องทางพร้อมกัน"
                          className="w-full px-2.5 py-1 text-[11px] rounded-lg bg-white border border-slate-300 text-slate-700"
                        />
                      </div>
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
              );
            })}
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

      {/* Section 3: Channel Overview & 4 Platform Stats Editor (Supports 28d, 60d, Lifetime) */}
      {(subSection === 'all' || subSection === 'stats') && (
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-violet-700" />
              <span>3. อัปเดตสถิติภาพรวม & สถิติแยก 4 แพลตฟอร์ม (รองรับ 3 ช่วงเวลา: 28 วัน / 60 วัน / Lifetime)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              ตั้งค่าช่วงเวลาเริ่มต้นที่ลูกค้าเห็นเมื่อเปิดเรทการ์ด และสลับแก้ไขตัวเลขสถิติทั้ง 3 ช่วงเวลาได้อย่างอิสระ
            </p>
          </div>

          {/* Default Client Timeframe & Admin Editing Timeframe Switcher Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200/90">
            {/* Left: Default Timeframe when client opens page */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>1. ค่าเริ่มต้นเมื่อลูกค้าเปิดเรทการ์ด (Default Client Timeframe)</span>
              </label>
              <p className="text-[11px] text-slate-500">
                เมื่อลูกค้าเปิดเข้าเว็บครั้งแรก ระบบจะแสดงตัวเลขของช่วงเวลานี้ก่อน (ลูกค้ากดสลับดูช่วงอื่นเองได้)
              </p>
              <div className="inline-flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white border border-slate-200 mt-1">
                {STATS_TIMEFRAME_OPTIONS.map((opt) => {
                  const isDefault = (draftCreator.defaultStatsTimeframe || '60d') === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onUpdateDefaultStatsTimeframe(opt.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        isDefault
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {opt.labelTh} {isDefault && '✓ (ค่าเริ่มต้น)'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Active Timeframe being edited in Admin Studio right now */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-violet-700" />
                <span>2. เลือกช่วงเวลาที่กำลังแก้ไขตัวเลขด้านล่าง (Admin Editing Mode)</span>
              </label>
              <p className="text-[11px] text-slate-500">
                คลิกสลับเพื่อตรวจดูหรือแก้ไขตัวเลข ยอดวิว, Likes, Comments, Shares และ ER ของแต่ละช่วงเวลา
              </p>
              <div className="inline-flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white border border-violet-200 mt-1">
                {STATS_TIMEFRAME_OPTIONS.map((opt) => {
                  const isEditingThis = editingTimeframe === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setEditingTimeframe(opt.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        isEditingThis
                          ? 'bg-violet-700 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      กำลังแก้: {opt.labelTh}
                    </button>
                  );
                })}
              </div>
            </div>
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
                    ดึงสถิติสดอัตโนมัติทั้ง 4 แพลตฟอร์มครบทั้ง 3 ช่วงเวลา (28d / 60d / Lifetime) ด้วย Official API
                  </p>
                  <p className="text-[11px] text-violet-700">
                    มีระบบพรีวิวเปรียบเทียบ (Diff) แยกดูได้ทั้ง 3 ช่วงเวลา และประวัติย้อนหลัง 5 เวอร์ชัน
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

          {/* Overview KPI Row for Active Editing Timeframe */}
          {(() => {
            const activeOv = resolveOverviewForTimeframe(draftCreator, editingTimeframe);
            const tfInfo =
              STATS_TIMEFRAME_OPTIONS.find((o) => o.id === editingTimeframe) ||
              STATS_TIMEFRAME_OPTIONS[1];

            return (
              <div className="space-y-2.5 p-4 rounded-xl bg-slate-50/70 border border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-violet-900">
                    ตัวเลขภาพรวมด้านบน (Overview KPIs) — ช่วงเวลา: {tfInfo.labelTh}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    * ผู้ติดตามรวมใช้ค่าร่วมกันทุกช่วงเวลา ส่วนยอดวิว/ER/Reach เปลี่ยนตามช่วงเวลาที่เลือก
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                      ผู้ติดตามรวม (ทุกช่อง)
                    </label>
                    <input
                      type="text"
                      value={draftCreator.overview.totalFollowers}
                      onChange={(e) => onUpdateOverviewStat('totalFollowers', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-bold font-mono-num rounded-lg bg-white border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-violet-700 mb-1">
                      {tfInfo.viewsLabelTh}
                    </label>
                    <input
                      type="text"
                      value={activeOv.totalViews}
                      onChange={(e) =>
                        onUpdateOverviewTimeframeStat(editingTimeframe, 'totalViews', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 text-xs font-bold font-mono-num rounded-lg bg-white border border-violet-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-violet-700 mb-1">
                      ER เฉลี่ยรวม ({tfInfo.shortBadge})
                    </label>
                    <input
                      type="text"
                      value={activeOv.totalEr}
                      onChange={(e) =>
                        onUpdateOverviewTimeframeStat(editingTimeframe, 'totalEr', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 text-xs font-bold font-mono-num rounded-lg bg-white border border-violet-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-violet-700 mb-1">
                      ยอดดูเฉลี่ยต่อคลิป ({tfInfo.shortBadge})
                    </label>
                    <input
                      type="text"
                      value={activeOv.avgViewsPerContent}
                      onChange={(e) =>
                        onUpdateOverviewTimeframeStat(
                          editingTimeframe,
                          'avgViewsPerContent',
                          e.target.value
                        )
                      }
                      className="w-full px-2.5 py-1.5 text-xs font-bold font-mono-num rounded-lg bg-white border border-violet-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-violet-700 mb-1">
                      Reach ({tfInfo.shortBadge})
                    </label>
                    <input
                      type="text"
                      value={activeOv.monthlyReach}
                      onChange={(e) =>
                        onUpdateOverviewTimeframeStat(
                          editingTimeframe,
                          'monthlyReach',
                          e.target.value
                        )
                      }
                      className="w-full px-2.5 py-1.5 text-xs font-mono-num rounded-lg bg-white border border-violet-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-violet-700 mb-1">
                      Likes รวม ({tfInfo.shortBadge})
                    </label>
                    <input
                      type="text"
                      value={activeOv.monthlyLikes}
                      onChange={(e) =>
                        onUpdateOverviewTimeframeStat(
                          editingTimeframe,
                          'monthlyLikes',
                          e.target.value
                        )
                      }
                      className="w-full px-2.5 py-1.5 text-xs font-mono-num rounded-lg bg-white border border-violet-300"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-semibold text-violet-700 mb-1">
                      ป้ายกำกับมุมการ์ด ({tfInfo.shortBadge})
                    </label>
                    <input
                      type="text"
                      value={activeOv.periodBadgeLabel}
                      onChange={(e) =>
                        onUpdateOverviewTimeframeStat(
                          editingTimeframe,
                          'periodBadgeLabel',
                          e.target.value
                        )
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-violet-300"
                    />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 4 Platform Cards Editor for Active Editing Timeframe */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {draftCreator.platforms.map((plat) => {
              const tfMetrics = resolvePlatformMetricsForTimeframe(plat, editingTimeframe);
              const tfOption =
                STATS_TIMEFRAME_OPTIONS.find((o) => o.id === editingTimeframe) ||
                STATS_TIMEFRAME_OPTIONS[1];

              return (
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
                      <label className="block text-[10px] text-slate-500">Follower (รวม)</label>
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
                      <label className="block text-[10px] font-semibold text-violet-700">
                        {tfOption.cardViewsLabel}
                      </label>
                      <input
                        type="text"
                        value={tfMetrics.views}
                        onChange={(e) =>
                          onUpdatePlatformTimeframeStat(
                            plat.id,
                            editingTimeframe,
                            'views',
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 text-xs font-mono-num font-semibold bg-white rounded border border-violet-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-violet-700">
                        Likes ({tfOption.shortBadge})
                      </label>
                      <input
                        type="text"
                        value={tfMetrics.likes}
                        onChange={(e) =>
                          onUpdatePlatformTimeframeStat(
                            plat.id,
                            editingTimeframe,
                            'likes',
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 text-xs font-mono-num bg-white rounded border border-violet-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-violet-700">
                        ER (%) ({tfOption.shortBadge})
                      </label>
                      <input
                        type="text"
                        value={tfMetrics.er}
                        onChange={(e) =>
                          onUpdatePlatformTimeframeStat(
                            plat.id,
                            editingTimeframe,
                            'er',
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 text-xs font-mono-num font-bold text-violet-700 bg-white rounded border border-violet-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-violet-700">
                        Comments ({tfOption.shortBadge})
                      </label>
                      <input
                        type="text"
                        value={tfMetrics.comments}
                        onChange={(e) =>
                          onUpdatePlatformTimeframeStat(
                            plat.id,
                            editingTimeframe,
                            'comments',
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 text-xs font-mono-num bg-white rounded border border-violet-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-violet-700">
                        Shares ({tfOption.shortBadge})
                      </label>
                      <input
                        type="text"
                        value={tfMetrics.shares}
                        onChange={(e) =>
                          onUpdatePlatformTimeframeStat(
                            plat.id,
                            editingTimeframe,
                            'shares',
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 text-xs font-mono-num bg-white rounded border border-violet-300"
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
              );
            })}
          </div>
        </div>
      )}

      {/* Section 4: Audience Demographics Editor (Age, Gender, Locations + Per-Platform + Weighted Average) */}
      {(subSection === 'all' || subSection === 'demographics') && (
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-700" />
                <span>4. ข้อมูลสัดส่วนผู้ชมเชิงลึก ป้ายกำกับ และคำอธิบายกลยุทธ์ (Demographics 100%)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                รองรับการแยกข้อมูลสถิติทั้ง 4 แพลตฟอร์มอย่างอิสระ พร้อมคำนวณค่าเฉลี่ยภาพรวมถ่วงน้ำหนัก (Follower-Weighted) อัตโนมัติ
              </p>
            </div>

            {/* Quick Status Notice */}
            {showRecalcSuccess && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 animate-fade-in">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>คำนวณค่าเฉลี่ยถ่วงน้ำหนักสำเร็จ!</span>
              </span>
            )}
            {showCopySuccess && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 animate-fade-in">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>คัดลอกข้อมูลไปยังช่องทางที่เลือกสำเร็จ!</span>
              </span>
            )}
          </div>

          {/* Platform Switcher & Tooling Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-xl bg-violet-50/70 border border-violet-200">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-violet-950 mr-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-violet-700" />
                <span>เลือกช่องทางที่ต้องการจัดการ:</span>
              </span>

              {/* Overall Tab */}
              <button
                type="button"
                onClick={() => setSelectedDemographicPlatform('overall')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedDemographicPlatform === 'overall'
                    ? 'bg-violet-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>ภาพรวม (Weighted Avg)</span>
              </button>

              {/* 4 Platforms */}
              {draftCreator.platforms.map((plat) => {
                const isSelected = selectedDemographicPlatform === plat.id;
                return (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() => setSelectedDemographicPlatform(plat.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-violet-700 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <PlatformBrandIcon platform={plat.id} size="xs" />
                    <span>{plat.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono-num font-normal ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {plat.followers}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Action Tools */}
            <div className="flex flex-wrap items-center gap-2">
              {onRecalculateDemographicsWeightedAverage && (
                <button
                  type="button"
                  onClick={() => {
                    onRecalculateDemographicsWeightedAverage();
                    setShowRecalcSuccess(true);
                    setTimeout(() => setShowRecalcSuccess(false), 2500);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-violet-800 border border-violet-300 hover:bg-violet-100/70 transition-colors shadow-2xs cursor-pointer"
                  title="คำนวณเฉลี่ยอัตโนมัติตามสัดส่วนผู้ติดตามของแต่ละแพลตฟอร์มไปยังแท็บภาพรวม"
                >
                  <Calculator className="w-3.5 h-3.5 text-violet-700" />
                  <span>คำนวณค่าเฉลี่ยภาพรวมใหม่</span>
                </button>
              )}

              {onCopyDemographicsBetweenPlatforms && (
                <button
                  type="button"
                  onClick={() => setShowCopyModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-violet-700 text-white hover:bg-violet-800 transition-colors shadow-2xs cursor-pointer"
                  title="คัดลอกสถิติของช่องทางปัจจุบันไปยังช่องทางอื่นอย่างรวดเร็ว"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>คัดลอกไปช่องทางอื่น...</span>
                </button>
              )}
            </div>
          </div>

          {/* Client Default Demographic View Config */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-semibold">แท็บสถิติเริ่มต้นที่ลูกค้าเห็นบนหน้าเว็บ:</span>
              <span className="font-bold text-violet-900 bg-violet-100 px-2 py-0.5 rounded text-[11px]">
                {draftCreator.demographics.defaultDemographicView === 'tiktok'
                  ? 'TikTok'
                  : draftCreator.demographics.defaultDemographicView === 'facebook'
                  ? 'Facebook'
                  : draftCreator.demographics.defaultDemographicView === 'instagram'
                  ? 'Instagram'
                  : draftCreator.demographics.defaultDemographicView === 'youtube'
                  ? 'YouTube'
                  : 'ภาพรวมทุกช่องทาง (Overall Weighted)'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-500 mr-1">เปลี่ยนค่าเริ่มต้น:</span>
              {(['overall', 'tiktok', 'facebook', 'instagram', 'youtube'] as const).map((viewKey) => {
                const isCurrent =
                  (draftCreator.demographics.defaultDemographicView || 'overall') === viewKey;
                return (
                  <button
                    key={viewKey}
                    type="button"
                    onClick={() => onUpdateDefaultDemographicView?.(viewKey)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-violet-700 text-white shadow-2xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {viewKey === 'overall' ? 'ภาพรวม' : viewKey.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Platform Banner Indicator */}
          <div className="px-3.5 py-2 rounded-lg bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs text-indigo-950">
            <span className="font-semibold">
              กำลังแก้ไขข้อมูล:{' '}
              <span className="font-bold text-violet-900 underline">
                {selectedDemographicPlatform === 'overall'
                  ? 'ภาพรวม (Overall Weighted)'
                  : draftCreator.platforms.find((p) => p.id === selectedDemographicPlatform)?.name ||
                    selectedDemographicPlatform.toUpperCase()}
              </span>
              {selectedDemographicPlatform !== 'overall' && (
                <span className="text-indigo-600 ml-1.5">
                  (ระบบจะบันทึกแยกเป็นสถิติเฉพาะของช่องนี้โดยตรง)
                </span>
              )}
            </span>
            <span className="text-[11px] text-slate-500">
              * ข้อมูล 3 ส่วนด้านล่างจะสลับตามช่องทางที่เลือกด้านบน
            </span>
          </div>

          {/* 3 Demographic Cards (Age, Gender, Locations) */}
          {(() => {
            const ageSum = (demo.ageGroups || []).reduce(
              (acc, curr) => acc + (Number(curr.percent) || 0),
              0
            );
            const isAge100 = Math.abs(ageSum - 100) < 0.1;

            const genderSum = (demo.gender || []).reduce(
              (acc, curr) => acc + (Number(curr.percent) || 0),
              0
            );
            const isGender100 = Math.abs(genderSum - 100) < 0.2;

            const locSum = (demo.locations || []).reduce(
              (acc, curr) => acc + (Number(curr.percent) || 0),
              0
            );
            const isLoc100 = Math.abs(locSum - 100) < 0.2;

            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* 1. Age Groups Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900">1. ช่วงอายุผู้ติดตาม (%)</p>
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isAge100
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isAge100 ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>100% ครบ</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <span>รวม {ageSum}%</span>
                          </>
                        )}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAddAgeGroupItem('45+ ปี', 5, selectedDemographicPlatform)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 text-[11px] font-semibold cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>เพิ่มช่วงอายุ</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(demo.ageGroups || []).map((ag, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs">
                        <input
                          type="text"
                          value={ag.range}
                          onChange={(e) =>
                            onUpdateAgeGroupField(
                              idx,
                              'range',
                              e.target.value,
                              selectedDemographicPlatform
                            )
                          }
                          className="flex-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white rounded-lg border border-slate-300"
                        />
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={ag.percent}
                          onChange={(e) =>
                            onUpdateAgeGroupField(
                              idx,
                              'percent',
                              Number(e.target.value),
                              selectedDemographicPlatform
                            )
                          }
                          className="w-16 px-2 py-1 text-xs font-mono-num font-bold text-right bg-white rounded-lg border border-slate-300"
                        />
                        <span className="text-slate-500">%</span>
                        {(demo.ageGroups || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              onDeleteAgeGroupItem(idx, selectedDemographicPlatform)
                            }
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="ลบช่วงอายุนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-2.5 border-t border-slate-200 space-y-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        ป้ายกำกับมุมขวาบน (Badge) & คำโปรยใต้หัวข้อ
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={demo.ageBadge ?? ''}
                          onChange={(e) =>
                            onUpdateDemographicsMeta(
                              'ageBadge',
                              e.target.value,
                              selectedDemographicPlatform
                            )
                          }
                          placeholder="Gen Z & Young Adults"
                          className="px-2 py-1 text-[11px] bg-white rounded border border-slate-300"
                        />
                        <input
                          type="text"
                          value={demo.ageSubtitle ?? ''}
                          onChange={(e) =>
                            onUpdateDemographicsMeta(
                              'ageSubtitle',
                              e.target.value,
                              selectedDemographicPlatform
                            )
                          }
                          placeholder="กำลังซื้อหลัก 18–34 ปี (77%)"
                          className="px-2 py-1 text-[11px] bg-white rounded border border-slate-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        ข้อความสรุปด้านล่างการ์ด (ซ้าย / ขวา)
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={demo.ageFooterLeft ?? ''}
                          onChange={(e) =>
                            onUpdateDemographicsMeta(
                              'ageFooterLeft',
                              e.target.value,
                              selectedDemographicPlatform
                            )
                          }
                          placeholder="กลุ่มผู้ชมหลัก: 25-34 ปี (45%)"
                          className="px-2 py-1 text-[11px] bg-white rounded border border-slate-300"
                        />
                        <input
                          type="text"
                          value={demo.ageFooterRight ?? ''}
                          onChange={(e) =>
                            onUpdateDemographicsMeta(
                              'ageFooterRight',
                              e.target.value,
                              selectedDemographicPlatform
                            )
                          }
                          placeholder="วัยทำงานเริ่มต้น & นักศึกษา"
                          className="px-2 py-1 text-[11px] bg-white rounded border border-slate-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Tooltip กลยุทธ์การตลาด & สินค้าที่เหมาะ
                      </label>
                      <input
                        type="text"
                        value={demo.ageTooltipStrategy ?? ''}
                        onChange={(e) =>
                          onUpdateDemographicsMeta(
                            'ageTooltipStrategy',
                            e.target.value,
                            selectedDemographicPlatform
                          )
                        }
                        placeholder="กลยุทธ์: กลุ่มวัยรุ่นและวัยทำงานตอนต้น..."
                        className="w-full px-2 py-1 text-[11px] bg-white rounded border border-slate-300 mb-1"
                      />
                      <input
                        type="text"
                        value={demo.ageTooltipProducts ?? ''}
                        onChange={(e) =>
                          onUpdateDemographicsMeta(
                            'ageTooltipProducts',
                            e.target.value,
                            selectedDemographicPlatform
                          )
                        }
                        placeholder="สินค้าที่เหมาะ: อาหารและเครื่องดื่ม, แก็ดเจ็ต..."
                        className="w-full px-2 py-1 text-[11px] bg-white rounded border border-slate-300"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Gender Split Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900">2. สัดส่วนเพศผู้ชม (%)</p>
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isGender100
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isGender100 ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>100% ครบ</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>รวม {genderSum}%</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(demo.gender || []).map((g, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs">
                        <input
                          type="text"
                          value={g.label}
                          onChange={(e) =>
                            onUpdateGenderField(
                              idx,
                              'label',
                              e.target.value,
                              selectedDemographicPlatform
                            )
                          }
                          className="flex-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white rounded-lg border border-slate-300"
                        />
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.1}
                          value={g.percent}
                          onChange={(e) =>
                            onUpdateGenderField(
                              idx,
                              'percent',
                              Number(e.target.value),
                              selectedDemographicPlatform
                            )
                          }
                          className="w-16 px-2 py-1 text-xs font-mono-num font-bold text-right bg-white rounded-lg border border-slate-300"
                        />
                        <span className="text-slate-500">%</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2.5 border-t border-slate-200 space-y-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        ป้ายกำกับมุมขวาบน (Badge) & คำโปรยใต้หัวข้อ
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={demo.genderBadge ?? ''}
                          onChange={(e) =>
                            onUpdateDemographicsMeta(
                              'genderBadge',
                              e.target.value,
                              selectedDemographicPlatform
                            )
                          }
                          placeholder="Mass Appeal"
                          className="px-2 py-1 text-[11px] bg-white rounded border border-slate-300"
                        />
                        <input
                          type="text"
                          value={demo.genderSubtitle ?? ''}
                          onChange={(e) =>
                            onUpdateDemographicsMeta(
                              'genderSubtitle',
                              e.target.value,
                              selectedDemographicPlatform
                            )
                          }
                          placeholder="เข้าถึงง่ายทั้งผู้หญิงและผู้ชาย"
                          className="px-2 py-1 text-[11px] bg-white rounded border border-slate-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        ข้อความสรุปด้านล่างการ์ด
                      </label>
                      <input
                        type="text"
                        value={demo.genderFooter ?? ''}
                        onChange={(e) =>
                          onUpdateDemographicsMeta(
                            'genderFooter',
                            e.target.value,
                            selectedDemographicPlatform
                          )
                        }
                        placeholder="สมดุลดีเยี่ยม เหมาะกับสินค้าทุกหมวดหมู่ (Unisex & Mass)"
                        className="w-full px-2 py-1 text-[11px] bg-white rounded border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Tooltip กลยุทธ์การตลาด & สินค้าที่เหมาะ
                      </label>
                      <input
                        type="text"
                        value={demo.genderTooltipStrategy ?? ''}
                        onChange={(e) =>
                          onUpdateDemographicsMeta(
                            'genderTooltipStrategy',
                            e.target.value,
                            selectedDemographicPlatform
                          )
                        }
                        placeholder="กลยุทธ์: สัดส่วนผู้หญิงและผู้ชายใกล้เคียงกัน..."
                        className="w-full px-2 py-1 text-[11px] bg-white rounded border border-slate-300 mb-1"
                      />
                      <input
                        type="text"
                        value={demo.genderTooltipProducts ?? ''}
                        onChange={(e) =>
                          onUpdateDemographicsMeta(
                            'genderTooltipProducts',
                            e.target.value,
                            selectedDemographicPlatform
                          )
                        }
                        placeholder="สินค้าที่เหมาะ: สินค้าอุปโภคบริโภค (FMCG)..."
                        className="w-full px-2 py-1 text-[11px] bg-white rounded border border-slate-300"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Top Locations Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900">3. พื้นที่ผู้ชมสูงสุด (%)</p>
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isLoc100
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isLoc100 ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>100% ครบ</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <span>รวม {locSum}%</span>
                          </>
                        )}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAddLocationItem('จังหวัดอื่นๆ', 2, selectedDemographicPlatform)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 text-[11px] font-semibold cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>เพิ่มพื้นที่</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(demo.locations || []).map((loc, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs">
                        <input
                          type="text"
                          value={loc.name}
                          onChange={(e) =>
                            onUpdateLocationField(
                              idx,
                              'name',
                              e.target.value,
                              selectedDemographicPlatform
                            )
                          }
                          className="flex-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white rounded-lg border border-slate-300"
                        />
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.1}
                          value={loc.percent}
                          onChange={(e) =>
                            onUpdateLocationField(
                              idx,
                              'percent',
                              Number(e.target.value),
                              selectedDemographicPlatform
                            )
                          }
                          className="w-16 px-2 py-1 text-xs font-mono-num font-bold text-right bg-white rounded-lg border border-slate-300"
                        />
                        <span className="text-slate-500">%</span>
                        {(demo.locations || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              onDeleteLocationItem(idx, selectedDemographicPlatform)
                            }
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="ลบพื้นที่นี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-2.5 border-t border-slate-200 space-y-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        ป้ายกำกับมุมขวาบน (เว้นว่างเพื่อดึงจากอันดับ 1 อัตโนมัติ) & คำโปรย
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={demo.locationBadge ?? ''}
                          onChange={(e) =>
                            onUpdateDemographicsMeta(
                              'locationBadge',
                              e.target.value,
                              selectedDemographicPlatform
                            )
                          }
                          placeholder="ดึงจากพื้นที่อันดับ 1 อัตโนมัติ"
                          className="px-2 py-1 text-[11px] bg-white rounded border border-slate-300"
                        />
                        <input
                          type="text"
                          value={demo.locationSubtitle ?? ''}
                          onChange={(e) =>
                            onUpdateDemographicsMeta(
                              'locationSubtitle',
                              e.target.value,
                              selectedDemographicPlatform
                            )
                          }
                          placeholder="ฐานผู้ชมในเขตเมืองและหัวเมืองหลัก"
                          className="px-2 py-1 text-[11px] bg-white rounded border border-slate-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        ข้อความสรุปด้านล่างการ์ด
                      </label>
                      <input
                        type="text"
                        value={demo.locationFooter ?? ''}
                        onChange={(e) =>
                          onUpdateDemographicsMeta(
                            'locationFooter',
                            e.target.value,
                            selectedDemographicPlatform
                          )
                        }
                        placeholder="เหมาะสำหรับแคมเปญหน้าร้าน อีเวนต์ และเดลิเวอรี"
                        className="w-full px-2 py-1 text-[11px] bg-white rounded border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Tooltip กลยุทธ์การตลาด & สินค้าที่เหมาะ
                      </label>
                      <input
                        type="text"
                        value={demo.locationTooltipStrategy ?? ''}
                        onChange={(e) =>
                          onUpdateDemographicsMeta(
                            'locationTooltipStrategy',
                            e.target.value,
                            selectedDemographicPlatform
                          )
                        }
                        placeholder="กลยุทธ์: ฐานผู้ชมหนาแน่นในกรุงเทพฯ..."
                        className="w-full px-2 py-1 text-[11px] bg-white rounded border border-slate-300 mb-1"
                      />
                      <input
                        type="text"
                        value={demo.locationTooltipProducts ?? ''}
                        onChange={(e) =>
                          onUpdateDemographicsMeta(
                            'locationTooltipProducts',
                            e.target.value,
                            selectedDemographicPlatform
                          )
                        }
                        placeholder="สินค้าที่เหมาะ: แคมเปญดึงคนเข้าหน้าร้าน..."
                        className="w-full px-2 py-1 text-[11px] bg-white rounded border border-slate-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Interactive Modal: Copy Demographics Between Platforms */}
          {showCopyModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4 animate-scale-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
                      <Copy className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">คัดลอกข้อมูล Demographic</h4>
                      <p className="text-[11px] text-slate-500">
                        จากช่องทาง:{' '}
                        <span className="font-bold text-violet-700">
                          {selectedDemographicPlatform === 'overall'
                            ? 'ภาพรวม (Overall)'
                            : draftCreator.platforms.find((p) => p.id === selectedDemographicPlatform)?.name ||
                              selectedDemographicPlatform.toUpperCase()}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCopyModal(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700">
                    เลือกช่องทางปลายทางที่ต้องการคัดลอกข้อมูลไปแทนที่:
                  </p>
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    {[
                      { id: 'overall', name: 'ภาพรวมทุกช่องทาง (Overall View)' },
                      { id: 'tiktok', name: 'TikTok' },
                      { id: 'facebook', name: 'Facebook' },
                      { id: 'instagram', name: 'Instagram' },
                      { id: 'youtube', name: 'YouTube' },
                    ]
                      .filter((p) => p.id !== selectedDemographicPlatform)
                      .map((p) => {
                        const isChecked = copyTargets.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white cursor-pointer transition-colors text-xs font-medium text-slate-800"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCopyTargets((prev) => [...prev, p.id]);
                                } else {
                                  setCopyTargets((prev) => prev.filter((id) => id !== p.id));
                                }
                              }}
                              className="rounded text-violet-600 focus:ring-violet-500"
                            />
                            <span>{p.name}</span>
                          </label>
                        );
                      })}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      const allOthers = [
                        'overall',
                        'tiktok',
                        'facebook',
                        'instagram',
                        'youtube',
                      ].filter((id) => id !== selectedDemographicPlatform);
                      setCopyTargets(allOthers);
                    }}
                    className="text-[11px] text-violet-700 hover:underline font-semibold cursor-pointer"
                  >
                    เลือกปลายทางทั้งหมด
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCopyModal(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      disabled={copyTargets.length === 0}
                      onClick={() => {
                        if (copyTargets.length > 0 && onCopyDemographicsBetweenPlatforms) {
                          onCopyDemographicsBetweenPlatforms(
                            selectedDemographicPlatform,
                            copyTargets
                          );
                          setShowCopyModal(false);
                          setShowCopySuccess(true);
                          setTimeout(() => setShowCopySuccess(false), 2500);
                        }
                      }}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-violet-700 hover:bg-violet-800 text-white disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      ยืนยันการคัดลอก ({copyTargets.length} ช่องทาง)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

