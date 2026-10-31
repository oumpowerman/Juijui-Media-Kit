import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Key,
  History,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  PlatformApiCredentials,
  SyncSnapshotHistoryItem,
} from '../../services/platformApiService';
import {
  PlatformSyncTabProps,
  SyncHeaderHero,
  DiffComparisonSection,
  SmartImporterSection,
  OfficialApiSection,
  SnapshotHistorySection,
  ApiSetupGuideModal,
} from './platform-sync';

export type { PlatformSyncTabProps } from './platform-sync';

export type SyncInternalTab = 'smart' | 'api' | 'snapshot';

export const PlatformSyncTab: React.FC<PlatformSyncTabProps> = ({
  draftCreator,
  credentials,
  syncHistory,
  diffItems,
  isLoading,
  syncError,
  lastSyncTimestamp,
  activeSyncMode,
  onUpdateCredentials,
  onExecuteSync,
  onToggleDiffSelection,
  onToggleSelectAll,
  onClearDiff,
  onApplyDiff,
  onRollbackToSnapshot,
  saveDraftChanges,
  tiktokOAuth,
  onConnectTikTok,
  onDisconnectTikTok,
  onRefreshTikTokToken,
  onSaveTikTokConfig,
  singleTestLoading = {},
  singleTestResults = {},
  onTestSinglePlatform,
  onClearSingleTestResult,
  onApplySinglePlatformToDiff,
  onApplySmartImport,
}) => {
  // Internal Sub-Tab State
  const [activeTab, setActiveTab] = useState<SyncInternalTab>('smart');

  // Local edit state for credentials form
  const [localCreds, setLocalCreds] = useState<PlatformApiCredentials>(credentials);
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});
  const [credentialsSavedToast, setCredentialsSavedToast] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState<string | null>(null);
  const [showApiGuideModal, setShowApiGuideModal] = useState(false);

  useEffect(() => {
    setLocalCreds(credentials);
  }, [credentials]);

  const toggleShowToken = (key: string) => {
    setShowTokens((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveCredentials = () => {
    onUpdateCredentials(localCreds);
    setCredentialsSavedToast(true);
    setTimeout(() => setCredentialsSavedToast(false), 2400);
  };

  const handleApplyDiff = async () => {
    setIsApplying(true);
    try {
      await onApplyDiff(draftCreator, saveDraftChanges);
    } finally {
      setIsApplying(false);
    }
  };

  const handleRollback = async (snapshot: SyncSnapshotHistoryItem) => {
    setIsRollingBack(snapshot.id);
    try {
      await onRollbackToSnapshot(snapshot, draftCreator, saveDraftChanges);
    } finally {
      setIsRollingBack(null);
    }
  };

  const handleApplySmartImportInternal = (
    updatedCreator: typeof draftCreator,
    summaryMessage: string
  ) => {
    if (onApplySmartImport) {
      onApplySmartImport(updatedCreator, summaryMessage);
    } else {
      // Fallback: save directly via saveDraftChanges if provided
      saveDraftChanges(updatedCreator, summaryMessage);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      {/* 1. Top Hero Card: Status & Quick Full Sync */}
      <SyncHeaderHero
        isLoading={isLoading}
        lastSyncTimestamp={lastSyncTimestamp}
        syncHistoryCount={syncHistory.length}
        syncError={syncError}
        platforms={draftCreator.platforms}
        onExecuteSync={onExecuteSync}
      />

      {/* 2. Interactive Diff Comparison Table (Shown whenever diffItems is populated) */}
      {diffItems && (
        <DiffComparisonSection
          diffItems={diffItems}
          activeSyncMode={activeSyncMode}
          isApplying={isApplying}
          onToggleDiffSelection={onToggleDiffSelection}
          onToggleSelectAll={onToggleSelectAll}
          onClearDiff={onClearDiff}
          onApplyDiff={handleApplyDiff}
        />
      )}

      {/* 3. Internal Segmented Sub-Tab Switcher */}
      <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row gap-1">
        {/* Tab 1: Smart Media Kit Importer */}
        <button
          type="button"
          onClick={() => setActiveTab('smart')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'smart'
              ? 'bg-white text-violet-900 shadow-xs border border-violet-100'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${activeTab === 'smart' ? 'text-violet-600' : 'text-slate-400'}`} />
          <span>Smart Media Kit Importer</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
            activeTab === 'smart' ? 'bg-violet-100 text-violet-800' : 'bg-slate-200 text-slate-600'
          }`}>
            ไม่ต้องใช้ API Key
          </span>
        </button>

        {/* Tab 2: Official API & Cloud Sync */}
        <button
          type="button"
          onClick={() => setActiveTab('api')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'api'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Key className={`w-4 h-4 ${activeTab === 'api' ? 'text-amber-600' : 'text-slate-400'}`} />
          <span>Official API & Credentials</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
            activeTab === 'api' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
          }`}>
            Developer Mode
          </span>
        </button>

        {/* Tab 3: Snapshot History & Rollback */}
        <button
          type="button"
          onClick={() => setActiveTab('snapshot')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'snapshot'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <History className={`w-4 h-4 ${activeTab === 'snapshot' ? 'text-blue-600' : 'text-slate-400'}`} />
          <span>ประวัติและจุดคืนค่า (Snapshots)</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
            activeTab === 'snapshot' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
          }`}>
            {syncHistory.length} จุดย้อนกลับ
          </span>
        </button>
      </div>

      {/* 4. Tab Content Panels */}
      {activeTab === 'smart' && (
        <div className="animate-in fade-in duration-200">
          <SmartImporterSection
            draftCreator={draftCreator}
            onApplySmartImport={handleApplySmartImportInternal}
          />
        </div>
      )}

      {activeTab === 'api' && (
        <div className="animate-in fade-in duration-200">
          <OfficialApiSection
            draftCreator={draftCreator}
            localCreds={localCreds}
            setLocalCreds={setLocalCreds}
            showTokens={showTokens}
            toggleShowToken={toggleShowToken}
            credentialsSavedToast={credentialsSavedToast}
            onSaveCredentials={handleSaveCredentials}
            onOpenApiGuide={() => setShowApiGuideModal(true)}
            tiktokOAuth={tiktokOAuth}
            onConnectTikTok={onConnectTikTok}
            onDisconnectTikTok={onDisconnectTikTok}
            onRefreshTikTokToken={onRefreshTikTokToken}
            onSaveTikTokConfig={onSaveTikTokConfig}
            singleTestLoading={singleTestLoading}
            singleTestResults={singleTestResults}
            onTestSinglePlatform={onTestSinglePlatform}
            onClearSingleTestResult={onClearSingleTestResult}
            onApplySinglePlatformToDiff={onApplySinglePlatformToDiff}
            onUpdateCredentials={onUpdateCredentials}
          />
        </div>
      )}

      {activeTab === 'snapshot' && (
        <div className="animate-in fade-in duration-200">
          <SnapshotHistorySection
            syncHistory={syncHistory}
            isRollingBack={isRollingBack}
            onRollback={handleRollback}
          />
        </div>
      )}

      {/* 5. Comprehensive API Setup Guide Modal */}
      <ApiSetupGuideModal
        isOpen={showApiGuideModal}
        onClose={() => setShowApiGuideModal(false)}
        redirectUri={tiktokOAuth?.redirectUri}
      />
    </div>
  );
};
