import React, { useState } from 'react';
import { Check, Key, BookOpen } from 'lucide-react';
import {
  PlatformApiCredentials,
  SyncSnapshotHistoryItem,
} from '../../services/platformApiService';
import {
  PlatformSyncTabProps,
  SyncHeaderHero,
  DiffComparisonSection,
  YouTubeCredentialCard,
  TikTokOAuthCard,
  InstagramCredentialCard,
  FacebookCredentialCard,
  SnapshotHistorySection,
  ApiSetupGuideModal,
} from './platform-sync';

export type { PlatformSyncTabProps } from './platform-sync';

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
}) => {
  // Local edit state for credentials form
  const [localCreds, setLocalCreds] = useState<PlatformApiCredentials>(credentials);
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});
  const [credentialsSavedToast, setCredentialsSavedToast] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState<string | null>(null);
  const [showApiGuideModal, setShowApiGuideModal] = useState(false);

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

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      {/* 1. Header Hero Card with Connection Status & Trigger Buttons */}
      <SyncHeaderHero
        isLoading={isLoading}
        lastSyncTimestamp={lastSyncTimestamp}
        syncHistoryCount={syncHistory.length}
        syncError={syncError}
        platforms={draftCreator.platforms}
        onExecuteSync={onExecuteSync}
      />

      {/* 2. Interactive Diff Comparison Table (Shown prominently when diffItems is populated) */}
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

      {/* 3. API Credentials & Access Tokens Configuration Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-violet-700" />
              <span>การตั้งค่าคีย์ API & โทเค็นทั้ง 4 แพลตฟอร์ม (Official Credentials)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              สามารถกรอก Official API Token หรือกดปุ่ม{' '}
              <strong className="text-violet-700 font-semibold">[ทดสอบเชื่อมต่อสด]</strong> /{' '}
              <strong className="text-amber-700 font-semibold">[จำลองทดสอบ]</strong>{' '}
              แยกเฉพาะทีละแพลตฟอร์มได้ทันที
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowApiGuideModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-violet-600" />
              <span>วิธีขอ API แต่ละแพลตฟอร์ม</span>
            </button>
            {credentialsSavedToast && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5" /> บันทึกการตั้งค่าแล้ว
              </span>
            )}
            <button
              type="button"
              onClick={handleSaveCredentials}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
            >
              บันทึกคีย์ API
            </button>
          </div>
        </div>

        {/* 4 Platforms Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* YouTube Data API v3 */}
          <YouTubeCredentialCard
            youtubeCreds={localCreds.youtube}
            showToken={Boolean(showTokens['yt_key'])}
            onToggleShowToken={() => toggleShowToken('yt_key')}
            onChangeYoutubeCreds={(nextYoutube) =>
              setLocalCreds((prev) => ({ ...prev, youtube: nextYoutube }))
            }
            isTesting={Boolean(singleTestLoading['youtube'])}
            testResult={singleTestResults['youtube'] || null}
            onRunTest={(forceSim) =>
              onTestSinglePlatform?.('youtube', draftCreator.platforms, localCreds, forceSim)
            }
            onClearTest={() => onClearSingleTestResult?.('youtube')}
            onApplyToDiff={(data) =>
              onApplySinglePlatformToDiff?.(data, draftCreator.platforms)
            }
          />

          {/* TikTok Official OAuth 2.0 & Open API */}
          <TikTokOAuthCard
            tiktokCreds={localCreds.tiktok}
            tiktokOAuth={tiktokOAuth}
            showManualToken={Boolean(showTokens['tt_token'])}
            onToggleShowManualToken={() => toggleShowToken('tt_token')}
            onChangeTiktokCreds={(nextTiktok) =>
              setLocalCreds((prev) => ({ ...prev, tiktok: nextTiktok }))
            }
            onConnectTikTok={onConnectTikTok}
            onDisconnectTikTok={onDisconnectTikTok}
            onRefreshTikTokToken={onRefreshTikTokToken}
            onSaveTikTokConfig={onSaveTikTokConfig}
            isTesting={Boolean(singleTestLoading['tiktok'])}
            testResult={singleTestResults['tiktok'] || null}
            onRunTest={(forceSim) =>
              onTestSinglePlatform?.('tiktok', draftCreator.platforms, localCreds, forceSim)
            }
            onClearTest={() => onClearSingleTestResult?.('tiktok')}
            onApplyToDiff={(data) =>
              onApplySinglePlatformToDiff?.(data, draftCreator.platforms)
            }
          />

          {/* Instagram Graph API v20.0 */}
          <InstagramCredentialCard
            instagramCreds={localCreds.instagram}
            showToken={Boolean(showTokens['ig_token'])}
            onToggleShowToken={() => toggleShowToken('ig_token')}
            onChangeInstagramCreds={(nextIg, persistImmediately) => {
              const nextCreds: PlatformApiCredentials = {
                ...localCreds,
                instagram: nextIg,
              };
              setLocalCreds(nextCreds);
              if (persistImmediately) {
                onUpdateCredentials(nextCreds);
              }
            }}
            isTesting={Boolean(singleTestLoading['instagram'])}
            testResult={singleTestResults['instagram'] || null}
            onRunTest={(forceSim) =>
              onTestSinglePlatform?.('instagram', draftCreator.platforms, localCreds, forceSim)
            }
            onClearTest={() => onClearSingleTestResult?.('instagram')}
            onApplyToDiff={(data) =>
              onApplySinglePlatformToDiff?.(data, draftCreator.platforms)
            }
          />

          {/* Facebook Page Graph API v20.0 */}
          <FacebookCredentialCard
            facebookCreds={localCreds.facebook}
            showToken={Boolean(showTokens['fb_token'])}
            onToggleShowToken={() => toggleShowToken('fb_token')}
            onChangeFacebookCreds={(nextFb) =>
              setLocalCreds((prev) => ({ ...prev, facebook: nextFb }))
            }
            isTesting={Boolean(singleTestLoading['facebook'])}
            testResult={singleTestResults['facebook'] || null}
            onRunTest={(forceSim) =>
              onTestSinglePlatform?.('facebook', draftCreator.platforms, localCreds, forceSim)
            }
            onClearTest={() => onClearSingleTestResult?.('facebook')}
            onApplyToDiff={(data) =>
              onApplySinglePlatformToDiff?.(data, draftCreator.platforms)
            }
          />
        </div>
      </div>

      {/* 4. Snapshot History (ประวัติย้อนหลังสูงสุด 5 รายการ พร้อมปุ่ม Restore) */}
      <SnapshotHistorySection
        syncHistory={syncHistory}
        isRollingBack={isRollingBack}
        onRollback={handleRollback}
      />

      {/* 5. Comprehensive API Setup Guide Modal */}
      <ApiSetupGuideModal
        isOpen={showApiGuideModal}
        onClose={() => setShowApiGuideModal(false)}
        redirectUri={tiktokOAuth?.redirectUri}
      />
    </div>
  );
};
