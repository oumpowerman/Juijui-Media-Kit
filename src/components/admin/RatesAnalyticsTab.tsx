import React, { useState } from 'react';
import {
  DollarSign,
  Layers,
  Sparkles,
  BarChart3,
  Users,
} from 'lucide-react';
import {
  CreatorProfile,
  RatePackage,
  AddOnItem,
  PlatformStat,
  StatsTimeframe,
  TimeframePlatformMetrics,
  TimeframeOverviewMetrics,
} from '../../data/creatorData';
import { AdminTabType } from '../../hooks/useCreatorStudio';
import { RatePackagesEditor } from './rates/RatePackagesEditor';
import { AddOnsAndPerksEditor } from './rates/AddOnsAndPerksEditor';
import { TimeframeStatsEditor } from './rates/TimeframeStatsEditor';
import { AudienceDemographicsEditor } from './rates/AudienceDemographicsEditor';

export interface RatesAnalyticsTabProps {
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
  onApplySmartImport?: (updatedCreator: CreatorProfile, summaryMessage: string) => void;
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
  onApplySmartImport,
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

      {/* Section 1: Rate Packages (3 Tiers) */}
      {(subSection === 'all' || subSection === 'packages') && (
        <RatePackagesEditor
          packages={draftCreator.packages}
          onUpdatePackageField={onUpdatePackageField}
        />
      )}

      {/* Section 2: Add-on Services, Free Perks & Custom Collab Notes */}
      {(subSection === 'all' || subSection === 'addons') && (
        <AddOnsAndPerksEditor
          addOns={draftCreator.addOns}
          freePerks={draftCreator.freePerks}
          customCollabNotes={draftCreator.customCollabNotes}
          supportedFormats={draftCreator.supportedFormats}
          onUpdateAddOnField={onUpdateAddOnField}
          onAddAddOnItem={onAddAddOnItem}
          onDeleteAddOnItem={onDeleteAddOnItem}
          onUpdateFreePerkField={onUpdateFreePerkField}
          onAddFreePerkItem={onAddFreePerkItem}
          onDeleteFreePerkItem={onDeleteFreePerkItem}
          onUpdateCustomCollabNote={onUpdateCustomCollabNote}
          onUpdateSupportedFormats={onUpdateSupportedFormats}
        />
      )}

      {/* Section 3: Timeframe Stats & Platform Analytics */}
      {(subSection === 'all' || subSection === 'stats') && (
        <TimeframeStatsEditor
          draftCreator={draftCreator}
          editingTimeframe={editingTimeframe}
          onChangeEditingTimeframe={setEditingTimeframe}
          onUpdateDefaultStatsTimeframe={onUpdateDefaultStatsTimeframe}
          onUpdateOverviewStat={onUpdateOverviewStat}
          onUpdateOverviewTimeframeStat={onUpdateOverviewTimeframeStat}
          onUpdatePlatformStat={onUpdatePlatformStat}
          onUpdatePlatformTimeframeStat={onUpdatePlatformTimeframeStat}
          onApplySmartImport={onApplySmartImport}
        />
      )}

      {/* Section 4: Audience Demographics (Age, Gender, Location) */}
      {(subSection === 'all' || subSection === 'demographics') && (
        <AudienceDemographicsEditor
          draftCreator={draftCreator}
          onUpdateAgeGroupField={onUpdateAgeGroupField}
          onAddAgeGroupItem={onAddAgeGroupItem}
          onDeleteAgeGroupItem={onDeleteAgeGroupItem}
          onUpdateGenderField={onUpdateGenderField}
          onUpdateLocationField={onUpdateLocationField}
          onAddLocationItem={onAddLocationItem}
          onDeleteLocationItem={onDeleteLocationItem}
          onUpdateDemographicsMeta={onUpdateDemographicsMeta}
          onCopyDemographicsBetweenPlatforms={onCopyDemographicsBetweenPlatforms}
          onRecalculateDemographicsWeightedAverage={onRecalculateDemographicsWeightedAverage}
          onUpdateDefaultDemographicView={onUpdateDefaultDemographicView}
        />
      )}
    </div>
  );
};
