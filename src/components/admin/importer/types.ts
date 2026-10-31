import { CreatorProfile, StatsTimeframe } from '../../../data/creatorData';
import {
  SupportedPlatformId,
  SmartImportPreviewResult,
} from '../../../services/smartImportService';

export const PLATFORM_OPTIONS: { id: SupportedPlatformId; label: string }[] = [
  { id: 'tiktok', label: 'TikTok' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'youtube', label: 'YouTube' },
];

export interface SmartMediaKitImporterProps {
  draftCreator: CreatorProfile;
  onApplyUpdatedCreator: (
    updatedCreator: CreatorProfile,
    summaryMessage: string
  ) => void;
  defaultMode?: 'ocr' | 'csv' | 'username';
  compactHeader?: boolean;
}

export interface ScreenshotOcrTabProps {
  ocrPlatformMode: SupportedPlatformId | 'auto';
  setOcrPlatformMode: (mode: SupportedPlatformId | 'auto') => void;
  ocrTimeframeMode: StatsTimeframe | 'auto';
  setOcrTimeframeMode: (tf: StatsTimeframe | 'auto') => void;
  screenshotFiles: File[];
  screenshotPreviews: string[];
  isProcessing: boolean;
  onSelectScreenshots: (files: FileList | null) => void;
  onRemoveScreenshot: (index: number) => void;
  onClearScreenshots: () => void;
  onRunOcr: () => void;
}

export interface CsvAnalyticsTabProps {
  selectedPlatform: SupportedPlatformId;
  setSelectedPlatform: (plat: SupportedPlatformId) => void;
  csvTimeframe: StatsTimeframe;
  setCsvTimeframe: (tf: StatsTimeframe) => void;
  csvFiles: File[];
  isProcessing: boolean;
  onSelectCsvFiles: (files: FileList | null) => void;
  onRemoveCsvFile: (index: number) => void;
  onDownloadSampleCsv: () => void;
  onRunCsvImport: () => void;
}

export interface PublicProfileTabProps {
  selectedPlatform: SupportedPlatformId;
  onSelectPlatform: (plat: SupportedPlatformId) => void;
  usernameInput: string;
  setUsernameInput: (val: string) => void;
  isProcessing: boolean;
  onRunSync: () => void;
}

export interface SmartImportPreviewCardProps {
  previewResult: SmartImportPreviewResult;
  autoRecalcWeighted: boolean;
  setAutoRecalcWeighted: (val: boolean) => void;
  onCancelPreview: () => void;
  onToggleMetricItem: (id: string) => void;
  onChangeMetricNewValue: (id: string, val: string) => void;
  onChangeMetricTimeframe: (id: string, tf: StatsTimeframe | 'profile') => void;
  onChangeMetricPlatform: (id: string, plat: SupportedPlatformId) => void;
  onChangeDemographicsPlatform: (plat: SupportedPlatformId | 'overall') => void;
  onToggleDemographicsSelected: () => void;
  onConfirmApply: () => void;
}
