import {
  CreatorProfile,
  RatePackage,
  AddOnItem,
  PlatformStat,
  StatsTimeframe,
  TimeframePlatformMetrics,
  TimeframeOverviewMetrics,
} from '../../../data/creatorData';

export interface RatePackagesEditorProps {
  packages: RatePackage[];
  onUpdatePackageField: <K extends keyof RatePackage>(
    pkgId: string,
    field: K,
    value: RatePackage[K]
  ) => void;
}

export interface AddOnsAndPerksEditorProps {
  addOns: AddOnItem[];
  freePerks: CreatorProfile['freePerks'];
  customCollabNotes: CreatorProfile['customCollabNotes'];
  supportedFormats: string[];
  onUpdateAddOnField: <K extends keyof AddOnItem>(
    addonId: string,
    field: K,
    value: AddOnItem[K]
  ) => void;
  onAddAddOnItem: (name: string, description: string, price: number) => Promise<void>;
  onDeleteAddOnItem: (addonId: string) => Promise<void>;
  onUpdateFreePerkField: (perkId: string, field: 'name' | 'priceLabel', value: string) => void;
  onAddFreePerkItem: () => void;
  onDeleteFreePerkItem: (perkId: string) => void;
  onUpdateCustomCollabNote: (
    index: number,
    field: 'title' | 'description',
    value: string
  ) => void;
  onUpdateSupportedFormats: (formats: string[]) => void;
}

export interface TimeframeStatsEditorProps {
  draftCreator: CreatorProfile;
  editingTimeframe: StatsTimeframe;
  onChangeEditingTimeframe: (timeframe: StatsTimeframe) => void;
  onUpdateDefaultStatsTimeframe: (timeframe: StatsTimeframe) => void;
  onUpdateOverviewStat: (field: keyof CreatorProfile['overview'], value: string) => void;
  onUpdateOverviewTimeframeStat: (
    timeframe: StatsTimeframe,
    field: keyof TimeframeOverviewMetrics,
    value: string
  ) => void;
  onUpdatePlatformStat: <K extends keyof PlatformStat>(
    platformId: PlatformStat['id'],
    field: K,
    value: PlatformStat[K]
  ) => void;
  onUpdatePlatformTimeframeStat: (
    platformId: PlatformStat['id'],
    timeframe: StatsTimeframe,
    field: keyof TimeframePlatformMetrics,
    value: string
  ) => void;
  onApplySmartImport?: (updatedCreator: CreatorProfile, summaryMessage: string) => void;
}

export interface AudienceDemographicsEditorProps {
  draftCreator: CreatorProfile;
  onUpdateAgeGroupField: (
    index: number,
    field: 'range' | 'percent',
    value: string | number,
    platformKey?: string
  ) => void;
  onAddAgeGroupItem: (range?: string, percent?: number, platformKey?: string) => void;
  onDeleteAgeGroupItem: (index: number, platformKey?: string) => void;
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
}
