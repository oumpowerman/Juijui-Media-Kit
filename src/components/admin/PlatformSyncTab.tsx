import React, { useState } from 'react';
import {
  RefreshCw,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  History,
  Key,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Clock,
  Sliders,
  ChevronDown,
  ChevronUp,
  Radio,
  FileCheck2,
  BookOpen,
  HelpCircle,
  Info,
  Copy,
  X,
  Zap,
  Play,
} from 'lucide-react';
import { CreatorProfile, PlatformStat } from '../../data/types';
import { PlatformBrandIcon } from '../ui/PlatformBrandIcon';
import {
  PlatformApiCredentials,
  PlatformDiffItem,
  SyncSnapshotHistoryItem,
  SinglePlatformTestResult,
  FetchedPlatformData,
  discoverInstagramBusinessAccount,
} from '../../services/platformApiService';

interface PlatformSyncTabProps {
  draftCreator: CreatorProfile;
  credentials: PlatformApiCredentials;
  syncHistory: SyncSnapshotHistoryItem[];
  diffItems: PlatformDiffItem[] | null;
  isLoading: boolean;
  syncError: string | null;
  lastSyncTimestamp: string | null;
  activeSyncMode: 'official' | 'simulation';
  onUpdateCredentials: (creds: PlatformApiCredentials) => void;
  onExecuteSync: (
    currentPlatforms: PlatformStat[],
    mode: 'official' | 'simulation'
  ) => Promise<void>;
  onToggleDiffSelection: (platformId: PlatformStat['id']) => void;
  onToggleSelectAll: (selectAll: boolean) => void;
  onClearDiff: () => void;
  onApplyDiff: (
    currentCreator: CreatorProfile,
    saveDraftChanges: (customDraft?: CreatorProfile, customMessage?: string) => Promise<void>
  ) => Promise<boolean>;
  onRollbackToSnapshot: (
    snapshot: SyncSnapshotHistoryItem,
    currentCreator: CreatorProfile,
    saveDraftChanges: (customDraft?: CreatorProfile, customMessage?: string) => Promise<void>
  ) => Promise<void>;
  saveDraftChanges: (customDraft?: CreatorProfile, customMessage?: string) => Promise<void>;
  tiktokOAuth?: {
    clientKey: string;
    hasClientSecret: boolean;
    isConnected: boolean;
    expiresAt: number | null;
    openId: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    followerCount: number | null;
    likesCount: number | null;
    videoCount: number | null;
    lastSyncedAt: string | null;
    redirectUri: string;
    isConnecting: boolean;
    isRefreshing: boolean;
    error: string | null;
    successMessage: string | null;
  };
  onConnectTikTok?: () => Promise<void>;
  onDisconnectTikTok?: () => Promise<void>;
  onRefreshTikTokToken?: () => Promise<void>;
  onSaveTikTokConfig?: (clientKey: string, clientSecret?: string) => Promise<boolean>;
  singleTestLoading?: Record<string, boolean>;
  singleTestResults?: Record<string, SinglePlatformTestResult | null>;
  onTestSinglePlatform?: (
    platformId: PlatformStat['id'],
    currentPlatforms: PlatformStat[],
    customCreds?: PlatformApiCredentials,
    forceSimulation?: boolean
  ) => Promise<SinglePlatformTestResult>;
  onClearSingleTestResult?: (platformId: PlatformStat['id']) => void;
  onApplySinglePlatformToDiff?: (
    fetchedData: FetchedPlatformData,
    currentPlatforms: PlatformStat[]
  ) => void;
}

interface PlatformTestBoxProps {
  platformId: PlatformStat['id'];
  platformName: string;
  isLoading: boolean;
  testResult: SinglePlatformTestResult | null;
  onRunTest: (forceSim: boolean) => void;
  onClear: () => void;
  onApplyToDiff?: (data: FetchedPlatformData) => void;
}

const PlatformTestBox: React.FC<PlatformTestBoxProps> = ({
  platformId,
  platformName,
  isLoading,
  testResult,
  onRunTest,
  onClear,
  onApplyToDiff,
}) => {
  const [appliedToast, setAppliedToast] = useState(false);

  const handleApply = () => {
    if (testResult?.data && onApplyToDiff) {
      onApplyToDiff(testResult.data);
      setAppliedToast(true);
      setTimeout(() => setAppliedToast(false), 2500);
    }
  };

  return (
    <div className="pt-3 border-t border-slate-200/80 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-violet-600" />
          <span>ทดสอบเฉพาะ {platformName} (Individual Test)</span>
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onRunTest(true)}
            className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
            title="ทดสอบดูตัวอย่างผลลัพธ์จำลองก่อนใส่ API Key จริง"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>จำลองทดสอบ</span>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => onRunTest(false)}
            className="px-3 py-1 rounded-lg text-[11px] font-bold bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>กำลังทดสอบ...</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>ทดสอบเชื่อมต่อสด</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Test Results Display */}
      {testResult && (
        <div
          className={`p-3 rounded-xl border transition-all text-xs space-y-2 animate-in fade-in duration-200 ${
            testResult.success
              ? 'bg-emerald-50/70 border-emerald-200 text-slate-800'
              : 'bg-rose-50/70 border-rose-200 text-slate-800'
          }`}
        >
          {/* Header row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-bold">
              {testResult.success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-emerald-900">ทดสอบ {platformName} ผ่านสำเร็จ</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="text-rose-900">ทดสอบ {platformName} ไม่ผ่าน</span>
                </>
              )}
              <span className="text-[10px] font-mono font-normal px-1.5 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-600">
                ⚡ {testResult.latencyMs}ms
              </span>
              <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                {testResult.timestamp}
              </span>
            </div>

            <button
              type="button"
              onClick={onClear}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded hover:bg-slate-200/50 cursor-pointer"
              title="ปิดผลการทดสอบนี้"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Success details */}
          {testResult.success && testResult.data && (
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-1.5 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                  <div className="text-[9px] font-semibold text-slate-500">ผู้ติดตามล่าสุด</div>
                  <div className="text-xs font-bold font-mono text-emerald-700 mt-0.5">
                    {testResult.data.followersFormatted}
                  </div>
                </div>
                <div className="p-1.5 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                  <div className="text-[9px] font-semibold text-slate-500">ยอดวิว / Reach</div>
                  <div className="text-xs font-bold font-mono text-slate-800 mt-0.5 truncate">
                    {testResult.data.viewsFormatted || '-'}
                  </div>
                </div>
                <div className="p-1.5 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                  <div className="text-[9px] font-semibold text-slate-500">อัตรา ER</div>
                  <div className="text-xs font-bold font-mono text-violet-700 mt-0.5">
                    {testResult.data.erFormatted}
                  </div>
                </div>
                <div className="p-1.5 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                  <div className="text-[9px] font-semibold text-slate-500">ยอดไลค์ (Likes)</div>
                  <div className="text-xs font-bold font-mono text-slate-800 mt-0.5 truncate">
                    {testResult.data.likesFormatted || '-'}
                  </div>
                </div>
                <div className="p-1.5 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                  <div className="text-[9px] font-semibold text-slate-500">คอมเมนต์ (Comments)</div>
                  <div className="text-xs font-bold font-mono text-slate-800 mt-0.5 truncate">
                    {testResult.data.commentsFormatted || '-'}
                  </div>
                </div>
                <div className="p-1.5 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                  <div className="text-[9px] font-semibold text-slate-500">ยอดแชร์ (Shares)</div>
                  <div className="text-xs font-bold font-mono text-slate-800 mt-0.5 truncate">
                    {testResult.data.sharesFormatted || '-'}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <span className="text-[10px] text-slate-600">
                  {testResult.statusMessage}
                </span>

                {onApplyToDiff && (
                  <button
                    type="button"
                    onClick={handleApply}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {appliedToast ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>ส่งเข้า Diff แล้ว!</span>
                      </>
                    ) : (
                      <>
                        <FileCheck2 className="w-3 h-3" />
                        <span>นำค่านี้เข้า Diff เพื่อบันทึก</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Error & Advice details */}
          {!testResult.success && (
            <div className="space-y-1.5 pt-0.5">
              <p className="text-[11px] text-rose-800 font-semibold">
                {testResult.error || testResult.statusMessage}
              </p>
              {testResult.advice && (
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">คำแนะนำวิธีแก้ไข: </span>
                    <span>{testResult.advice}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

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
  const [activePlatformSection, setActivePlatformSection] = useState<
    'all' | 'credentials' | 'diff' | 'history'
  >('all');
  const [credentialsSavedToast, setCredentialsSavedToast] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState<string | null>(null);
  const [showApiGuideModal, setShowApiGuideModal] = useState(false);
  const [guideActivePlatform, setGuideActivePlatform] = useState<
    'youtube' | 'instagram' | 'facebook' | 'tiktok'
  >('youtube');

  // TikTok OAuth local states
  const [tiktokClientKeyInput, setTiktokClientKeyInput] = useState(
    tiktokOAuth?.clientKey || credentials.tiktok.clientKey || ''
  );
  const [tiktokClientSecretInput, setTiktokClientSecretInput] = useState('');
  const [showTikTokSecret, setShowTikTokSecret] = useState(false);
  const [showTikTokSettings, setShowTikTokSettings] = useState(false);
  const [showTikTokManualFallback, setShowTikTokManualFallback] = useState(false);
  const [copiedRedirectUri, setCopiedRedirectUri] = useState(false);
  const [isSavingTikTokConfig, setIsSavingTikTokConfig] = useState(false);
  const [tiktokConfigSavedToast, setTiktokConfigSavedToast] = useState(false);
  const [igDiscoverLoading, setIgDiscoverLoading] = useState(false);
  const [igDiscoverMessage, setIgDiscoverMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const toggleShowToken = (key: string) => {
    setShowTokens((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveCredentials = () => {
    onUpdateCredentials(localCreds);
    setCredentialsSavedToast(true);
    setTimeout(() => setCredentialsSavedToast(false), 2400);
  };

  const handleDiscoverIgAccount = async () => {
    setIgDiscoverLoading(true);
    setIgDiscoverMessage(null);
    try {
      const found = await discoverInstagramBusinessAccount(localCreds.instagram.accessToken);
      const nextCreds: PlatformApiCredentials = {
        ...localCreds,
        instagram: {
          ...localCreds.instagram,
          igUserId: found.igUserId,
          username: found.username || localCreds.instagram.username,
        },
      };
      setLocalCreds(nextCreds);
      onUpdateCredentials(nextCreds);
      setIgDiscoverMessage({
        type: 'success',
        text: `พบบัญชี @${found.username || found.name} (IG ID: ${found.igUserId} · ผู้ติดตาม ${found.followersCount.toLocaleString()} คน) และบันทึกให้อัตโนมัติแล้ว!`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ไม่พบบัญชี IG Business จาก Token นี้';
      setIgDiscoverMessage({ type: 'error', text: msg });
    } finally {
      setIgDiscoverLoading(false);
    }
  };

  const handleSaveTikTokConfig = async () => {
    if (!onSaveTikTokConfig) return;
    setIsSavingTikTokConfig(true);
    try {
      const ok = await onSaveTikTokConfig(tiktokClientKeyInput, tiktokClientSecretInput);
      if (ok) {
        setTiktokConfigSavedToast(true);
        setTimeout(() => setTiktokConfigSavedToast(false), 2400);
      }
    } finally {
      setIsSavingTikTokConfig(false);
    }
  };

  const handleCopyRedirectUri = () => {
    const uri =
      tiktokOAuth?.redirectUri ||
      (typeof window !== 'undefined' ? `${window.location.origin}/api/tiktok/callback` : '');
    if (!uri) return;
    navigator.clipboard.writeText(uri);
    setCopiedRedirectUri(true);
    setTimeout(() => setCopiedRedirectUri(false), 2000);
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

  // Calculate diff totals
  const selectedDiffs = diffItems?.filter((d) => d.isSelected) || [];
  const totalFollowerDelta = selectedDiffs.reduce((sum, d) => sum + d.followerDelta, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      {/* 1. Header Hero Card with Connection Status & Trigger Buttons */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Enterprise API Auto-Sync Ready</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                <RefreshCw className={`w-6 h-6 text-violet-400 ${isLoading ? 'animate-spin' : ''}`} />
                <span>ดึงข้อมูลสด 4 แพลตฟอร์ม (Official API & Sandbox)</span>
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
                เชื่อมต่อดึงสถิติช่อง <strong className="text-white font-bold">"จุ๊ยจุ๊ย"</strong>{' '}
                ทั้งผู้ติดตาม, ยอดวิว, และ Engagement Rate แสดงผลพรีวิวเปรียบเทียบ (Diff) ก่อนบันทึก
                พร้อมระบบย้อนกลับประวัติ (Rollback) สูงสุด 5 เวอร์ชัน
              </p>
            </div>

            {/* Quick Trigger Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => onExecuteSync(draftCreator.platforms, 'simulation')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="ทดสอบดึงข้อมูลสดจำลองที่เสมือนจริงโดยไม่ต้องระบุ API Key"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>จำลองดึงสดแบบทดสอบ</span>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => onExecuteSync(draftCreator.platforms, 'official')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-900/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'กำลังดึงข้อมูลสด...' : 'ดึงข้อมูลสดผ่าน Official API'}</span>
              </button>
            </div>
          </div>

          {/* Status info bar */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>ดึงล่าสุด: </span>
                <span className="text-white font-semibold font-mono">
                  {lastSyncTimestamp || 'ยังไม่มีการซิงค์ในรอบนี้'}
                </span>
              </span>
              <span className="hidden sm:inline-block text-slate-600">•</span>
              <span className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-400" />
                <span>ประวัติย้อนหลัง: </span>
                <span className="text-white font-semibold">{syncHistory.length}/5 เวอร์ชัน</span>
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>ความปลอดภัย: เก็บ API Token ในเบราว์เซอร์ส่วนตัว (Local Encrypted)</span>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {syncError && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">เกิดข้อผิดพลาดในการดึงข้อมูลจากแพลตฟอร์ม</p>
              <p className="mt-0.5 text-rose-700">{syncError}</p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Interactive Diff Comparison Table (Shown prominently when diffItems is populated) */}
      {diffItems && (
        <div className="bg-white rounded-2xl border-2 border-violet-500/40 shadow-lg p-5 sm:p-6 space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-violet-100 text-violet-800 text-xs font-semibold mb-1">
                <FileCheck2 className="w-3.5 h-3.5 text-violet-700" />
                <span>พรีวิวการเปรียบเทียบข้อมูล (Diff Review)</span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-slate-900">
                ตรวจสอบความเปลี่ยนแปลงก่อนบันทึกลงเว็บไซต์
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                ข้อมูลดึงมาจาก{' '}
                <strong className="text-slate-900">
                  {activeSyncMode === 'official' ? 'Official Platform APIs' : 'Verified Sandbox Simulation'}
                </strong>
                . คุณสามารถเลือกเฉพาะแพลตฟอร์มที่ต้องการนำมาอัปเดตได้
              </p>
            </div>

            {/* Diff Summary Badges */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-right">
                <div className="text-[10px] text-slate-500 font-medium">ส่วนต่างผู้ติดตามรวม</div>
                <div
                  className={`text-xs font-bold font-mono ${
                    totalFollowerDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {totalFollowerDelta >= 0 ? `+${totalFollowerDelta.toLocaleString()}` : totalFollowerDelta.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Diff Controls Header */}
          <div className="flex items-center justify-between text-xs text-slate-600 px-1">
            <label className="flex items-center gap-2 cursor-pointer font-semibold select-none">
              <input
                type="checkbox"
                checked={selectedDiffs.length === diffItems.length}
                onChange={(e) => onToggleSelectAll(e.target.checked)}
                className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-slate-300"
              />
              <span>เลือกทั้งหมด ({selectedDiffs.length}/{diffItems.length} แพลตฟอร์ม)</span>
            </label>

            <span className="text-[11px] text-slate-500">
              * ข้อมูลเดิมจะถูกสำรองไว้ในประวัติย้อนหลังอัตโนมัติ
            </span>
          </div>

          {/* Diff Rows */}
          <div className="space-y-3">
            {diffItems.map((item) => (
              <div
                key={item.platformId}
                className={`p-4 rounded-xl border transition-all ${
                  item.isSelected
                    ? 'border-violet-300 bg-violet-50/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50/40 opacity-70'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Platform & Handle */}
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <input
                      type="checkbox"
                      checked={item.isSelected}
                      onChange={() => onToggleDiffSelection(item.platformId)}
                      className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-slate-300 cursor-pointer"
                    />
                    <PlatformBrandIcon platform={item.platformId} size="md" />
                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{item.name}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                            item.status === 'success'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'error'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.status === 'success' ? 'ดึงสำเร็จ' : item.status === 'error' ? 'ไม่สำเร็จ' : 'แจ้งเตือน'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono">{item.handle}</div>
                    </div>
                  </div>

                  {/* Center: Metric Comparison (Followers, Views, ER) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                    {/* Followers Comparison */}
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/90">
                      <div className="text-[10px] font-semibold text-slate-500">ผู้ติดตาม (Followers)</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono text-slate-500 line-through">
                          {item.currentFollowers}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-xs font-bold font-mono text-slate-900">
                          {item.newFollowers}
                        </span>
                      </div>
                      {item.followerDelta !== 0 && (
                        <div
                          className={`text-[10px] font-bold font-mono mt-0.5 ${
                            item.followerDelta > 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {item.followerDelta > 0 ? `+${item.followerDelta.toLocaleString()}` : item.followerDelta.toLocaleString()}{' '}
                          ({item.followerDeltaPercent > 0 ? `+${item.followerDeltaPercent}%` : `${item.followerDeltaPercent}%`})
                        </div>
                      )}
                    </div>

                    {/* Views Metric */}
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/90">
                      <div className="text-[10px] font-semibold text-slate-500">ยอดวิวสะสม/รอบ</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono text-slate-500">
                          {item.currentViews}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-xs font-bold font-mono text-slate-900">
                          {item.newViews}
                        </span>
                      </div>
                    </div>

                    {/* ER Metric */}
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/90">
                      <div className="text-[10px] font-semibold text-slate-500">Engagement Rate (ER)</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono text-slate-500">
                          {item.currentEr}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-xs font-bold font-mono text-slate-900">
                          {item.newEr}
                        </span>
                      </div>
                      {item.erDelta !== 0 && (
                        <div
                          className={`text-[10px] font-bold font-mono mt-0.5 ${
                            item.erDelta > 0 ? 'text-emerald-600' : 'text-slate-600'
                          }`}
                        >
                          {item.erDelta > 0 ? `+${item.erDelta}%` : `${item.erDelta}%`}
                        </div>
                      )}
                    </div>

                    {/* Likes Metric */}
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/90">
                      <div className="text-[10px] font-semibold text-slate-500">ยอดไลค์ (Likes)</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono text-slate-500">
                          {item.currentLikes || '-'}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-xs font-bold font-mono text-slate-900">
                          {item.newLikes || '-'}
                        </span>
                      </div>
                    </div>

                    {/* Comments Metric */}
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/90">
                      <div className="text-[10px] font-semibold text-slate-500">คอมเมนต์ (Comments)</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono text-slate-500">
                          {item.currentComments || '-'}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-xs font-bold font-mono text-slate-900">
                          {item.newComments || '-'}
                        </span>
                      </div>
                    </div>

                    {/* Shares Metric */}
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/90">
                      <div className="text-[10px] font-semibold text-slate-500">ยอดแชร์ (Shares)</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono text-slate-500">
                          {item.currentShares || '-'}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-xs font-bold font-mono text-slate-900">
                          {item.newShares || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-status message */}
                <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>{item.statusMessage}</span>
                  <span className="text-slate-400 text-[10px]">
                    แหล่งข้อมูล: {item.source === 'official_api' ? 'Official Graph/Open API' : 'Sandbox Simulated Live Feed'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Diff Action Footer */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClearDiff}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              ปิดหน้าพรีวิว (ยกเลิกการซิงค์รอบนี้)
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                disabled={isApplying || selectedDiffs.length === 0}
                onClick={handleApplyDiff}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isApplying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>กำลังบันทึกและสร้างจุดสำรอง...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>
                      ยืนยันบันทึกสถิติ ({selectedDiffs.length} แพลตฟอร์ม) ลงเว็บไซต์
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
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
              สามารถกรอก Official API Token หรือกดปุ่ม <strong className="text-violet-700 font-semibold">[ทดสอบเชื่อมต่อสด]</strong> / <strong className="text-amber-700 font-semibold">[จำลองทดสอบ]</strong> แยกเฉพาะทีละแพลตฟอร์มได้ทันที
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

        {/* 4 Platforms Accordion Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* YouTube Data API v3 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlatformBrandIcon platform="youtube" size="sm" />
                <span className="text-xs font-bold text-slate-900">YouTube Data API v3</span>
              </div>
              <a
                href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-violet-600 hover:text-violet-800 flex items-center gap-1"
              >
                <span>รับ API Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                YouTube API Key (Google Cloud)
              </label>
              <div className="relative">
                <input
                  type={showTokens['yt_key'] ? 'text' : 'password'}
                  value={localCreds.youtube.apiKey}
                  onChange={(e) =>
                    setLocalCreds((prev) => ({
                      ...prev,
                      youtube: { ...prev.youtube, apiKey: e.target.value },
                    }))
                  }
                  placeholder="AIzaSy..."
                  className="w-full px-2.5 py-1.5 pr-8 text-xs font-mono rounded-lg bg-white border border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => toggleShowToken('yt_key')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  {showTokens['yt_key'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                  Channel ID
                </label>
                <input
                  type="text"
                  value={localCreds.youtube.channelId}
                  onChange={(e) =>
                    setLocalCreds((prev) => ({
                      ...prev,
                      youtube: { ...prev.youtube, channelId: e.target.value },
                    }))
                  }
                  placeholder="UC_..."
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                  Custom Handle
                </label>
                <input
                  type="text"
                  value={localCreds.youtube.customHandle}
                  onChange={(e) =>
                    setLocalCreds((prev) => ({
                      ...prev,
                      youtube: { ...prev.youtube, customHandle: e.target.value },
                    }))
                  }
                  placeholder="@JUIJUIChannel"
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white border border-slate-300"
                />
              </div>
            </div>

            {/* YouTube Individual Test Box */}
            <PlatformTestBox
              platformId="youtube"
              platformName="YouTube"
              isLoading={Boolean(singleTestLoading['youtube'])}
              testResult={singleTestResults['youtube'] || null}
              onRunTest={(forceSim) =>
                onTestSinglePlatform?.('youtube', draftCreator.platforms, localCreds, forceSim)
              }
              onClear={() => onClearSingleTestResult?.('youtube')}
              onApplyToDiff={(data) => onApplySinglePlatformToDiff?.(data, draftCreator.platforms)}
            />
          </div>

          {/* TikTok Official OAuth 2.0 & Open API */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
            {/* Card Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <PlatformBrandIcon platform="tiktok" size="sm" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      TikTok Official OAuth 2.0
                    </span>
                    {tiktokOAuth?.isConnected ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        เชื่อมต่อแล้ว
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        ยังไม่ได้เชื่อมต่อ
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    ระบบดึงข้อมูลสถิติสดผ่าน TikTok Open API v2 อัตโนมัติ
                  </p>
                </div>
              </div>

              <a
                href="https://developers.tiktok.com/"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-violet-600 hover:text-violet-800 flex items-center gap-1 font-semibold"
              >
                <span>TikTok Developers</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Error or Success notification banner */}
            {tiktokOAuth?.error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">การเชื่อมต่อ TikTok ขัดข้อง:</span>
                  <p className="mt-0.5 text-rose-700">{tiktokOAuth.error}</p>
                </div>
              </div>
            )}

            {tiktokOAuth?.successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">{tiktokOAuth.successMessage}</span>
              </div>
            )}

            {/* Main Action Area */}
            {tiktokOAuth?.isConnected ? (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {tiktokOAuth.avatarUrl ? (
                      <img
                        src={tiktokOAuth.avatarUrl}
                        alt="TikTok Avatar"
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                        TT
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {tiktokOAuth.displayName || 'TikTok Official Creator'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {tiktokOAuth.openId ? `OpenID: ${tiktokOAuth.openId.substring(0, 14)}...` : 'Authorized'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={tiktokOAuth.isRefreshing}
                      onClick={onRefreshTikTokToken}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="ขอรีเฟรชอายุ Access Token ใหม่"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${tiktokOAuth.isRefreshing ? 'animate-spin text-violet-600' : 'text-slate-500'}`}
                      />
                      <span>{tiktokOAuth.isRefreshing ? 'กำลังรีเฟรช...' : 'รีเฟรชสิทธิ์'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('คุณต้องการตัดการเชื่อมต่อบัญชี TikTok นี้ใช่หรือไม่?')) {
                          onDisconnectTikTok?.();
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      ตัดการเชื่อมต่อ
                    </button>
                  </div>
                </div>

                {/* Cached Stats Badges */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/70 text-center">
                  <div className="p-2 bg-white rounded-lg border border-slate-100">
                    <div className="text-[10px] text-slate-500 font-medium">ผู้ติดตาม</div>
                    <div className="text-xs font-bold text-slate-900 font-mono mt-0.5">
                      {tiktokOAuth.followerCount != null
                        ? tiktokOAuth.followerCount.toLocaleString()
                        : 'พร้อมดึง'}
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-100">
                    <div className="text-[10px] text-slate-500 font-medium">ยอดถูกใจรวม</div>
                    <div className="text-xs font-bold text-slate-900 font-mono mt-0.5">
                      {tiktokOAuth.likesCount != null
                        ? tiktokOAuth.likesCount.toLocaleString()
                        : 'พร้อมดึง'}
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-100">
                    <div className="text-[10px] text-slate-500 font-medium">คลิปวิดีโอ</div>
                    <div className="text-xs font-bold text-slate-900 font-mono mt-0.5">
                      {tiktokOAuth.videoCount != null
                        ? tiktokOAuth.videoCount.toLocaleString()
                        : 'พร้อมดึง'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  disabled={tiktokOAuth?.isConnecting || !onConnectTikTok}
                  onClick={() => onConnectTikTok?.()}
                  className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs shadow-md shadow-slate-950/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer border border-slate-800 disabled:opacity-50"
                >
                  <PlatformBrandIcon platform="tiktok" size="xs" />
                  <span>
                    {tiktokOAuth?.isConnecting
                      ? 'กำลังรอการยืนยันสิทธิ์จากหน้าต่าง TikTok...'
                      : 'เชื่อมต่อบัญชี TikTok (Connect TikTok OAuth 2.0)'}
                  </span>
                </button>
                <p className="text-[11px] text-slate-500 text-center">
                  คลิกเพื่อเปิดหน้าต่าง Popup เข้าสู่ระบบ TikTok และยืนยันสิทธิ์อย่างปลอดภัยตามมาตรฐาน Official API
                </p>
              </div>
            )}

            {/* Collapsible TikTok Client Key & Secret Settings */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowTikTokSettings(!showTikTokSettings)}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-slate-500" />
                  <span>ตั้งค่า TikTok Client Credentials & Redirect URI</span>
                  {tiktokOAuth?.hasClientSecret && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Secret บันทึกแล้ว
                    </span>
                  )}
                </div>
                {showTikTokSettings ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              {showTikTokSettings && (
                <div className="p-3.5 bg-white space-y-3 border-t border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                        TikTok Client Key
                      </label>
                      <input
                        type="text"
                        value={tiktokClientKeyInput}
                        onChange={(e) => setTiktokClientKeyInput(e.target.value)}
                        placeholder="aw1234567890..."
                        className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white border border-slate-300 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
                        <span>TikTok Client Secret</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {tiktokOAuth?.hasClientSecret ? '(มีค่าบันทึกอยู่บนเซิร์ฟเวอร์แล้ว)' : '(ยังไม่ได้บันทึก)'}
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type={showTikTokSecret ? 'text' : 'password'}
                          value={tiktokClientSecretInput}
                          onChange={(e) => setTiktokClientSecretInput(e.target.value)}
                          placeholder={tiktokOAuth?.hasClientSecret ? '••••••••••••••••••••' : 'กรอก Client Secret...'}
                          className="w-full px-2.5 py-1.5 pr-8 text-xs font-mono rounded-lg bg-white border border-slate-300 focus:outline-none focus:border-violet-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowTikTokSecret(!showTikTokSecret)}
                          className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                        >
                          {showTikTokSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Redirect URI Box with 1-Click Copy */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                      OAuth Redirect URI (นำไปใส่ใน TikTok Developer Portal)
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-2.5 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 truncate select-all">
                        {tiktokOAuth?.redirectUri || (typeof window !== 'undefined' ? `${window.location.origin}/api/tiktok/callback` : '')}
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyRedirectUri}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                      >
                        {copiedRedirectUri ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedRedirectUri ? 'คัดลอกแล้ว!' : 'คัดลอก URL'}</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      ตั้งค่าใน TikTok Developer Console &gt; App Details &gt; Redirect domain
                    </p>
                  </div>

                  {/* Save Credentials Button */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">
                      {tiktokConfigSavedToast ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> บันทึกการตั้งค่าเรียบร้อยแล้ว
                        </span>
                      ) : (
                        'บันทึก Client Key & Secret เพื่อเปิดใช้งาน OAuth 2.0 Flow'
                      )}
                    </span>
                    <button
                      type="button"
                      disabled={isSavingTikTokConfig}
                      onClick={handleSaveTikTokConfig}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white cursor-pointer disabled:opacity-50"
                    >
                      {isSavingTikTokConfig ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Collapsible Manual Token Fallback Accordion */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowTikTokManualFallback(!showTikTokManualFallback)}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
              >
                <span>ทางเลือกสำรอง: กรอก User Access Token ด้วยตนเอง (Sandbox Mode Fallback)</span>
                {showTikTokManualFallback ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              {showTikTokManualFallback && (
                <div className="p-3.5 bg-white space-y-3 border-t border-slate-200">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                      TikTok User Access Token (Bearer)
                    </label>
                    <div className="relative">
                      <input
                        type={showTokens['tt_token'] ? 'text' : 'password'}
                        value={localCreds.tiktok.accessToken}
                        onChange={(e) =>
                          setLocalCreds((prev) => ({
                            ...prev,
                            tiktok: { ...prev.tiktok, accessToken: e.target.value },
                          }))
                        }
                        placeholder="act.example_tiktok_token..."
                        className="w-full px-2.5 py-1.5 pr-8 text-xs font-mono rounded-lg bg-white border border-slate-300"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowToken('tt_token')}
                        className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                      >
                        {showTokens['tt_token'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                      Username (@)
                    </label>
                    <input
                      type="text"
                      value={localCreds.tiktok.username}
                      onChange={(e) =>
                        setLocalCreds((prev) => ({
                          ...prev,
                          tiktok: { ...prev.tiktok, username: e.target.value },
                        }))
                      }
                      placeholder="juijui.j"
                      className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white border border-slate-300"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* TikTok Individual Test Box */}
            <PlatformTestBox
              platformId="tiktok"
              platformName="TikTok"
              isLoading={Boolean(singleTestLoading['tiktok'])}
              testResult={singleTestResults['tiktok'] || null}
              onRunTest={(forceSim) =>
                onTestSinglePlatform?.('tiktok', draftCreator.platforms, localCreds, forceSim)
              }
              onClear={() => onClearSingleTestResult?.('tiktok')}
              onApplyToDiff={(data) => onApplySinglePlatformToDiff?.(data, draftCreator.platforms)}
            />
          </div>

          {/* Instagram Graph API v20.0 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlatformBrandIcon platform="instagram" size="sm" />
                <span className="text-xs font-bold text-slate-900">Instagram Graph API v20.0</span>
              </div>
              <a
                href="https://developers.facebook.com/docs/instagram-platform/instagram-graph-api"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-violet-600 hover:text-violet-800 flex items-center gap-1"
              >
                <span>Meta Developers</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                Meta User / Page Access Token
              </label>
              <div className="relative">
                <input
                  type={showTokens['ig_token'] ? 'text' : 'password'}
                  value={localCreds.instagram.accessToken}
                  onChange={(e) =>
                    setLocalCreds((prev) => ({
                      ...prev,
                      instagram: { ...prev.instagram, accessToken: e.target.value },
                    }))
                  }
                  placeholder="EAAG..."
                  className="w-full px-2.5 py-1.5 pr-8 text-xs font-mono rounded-lg bg-white border border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => toggleShowToken('ig_token')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  {showTokens['ig_token'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-semibold text-slate-600">
                    IG Business / User ID
                  </label>
                  <button
                    type="button"
                    disabled={igDiscoverLoading || !localCreds.instagram.accessToken}
                    onClick={handleDiscoverIgAccount}
                    className="text-[10px] font-bold text-violet-600 hover:text-violet-800 disabled:opacity-40 cursor-pointer flex items-center gap-0.5"
                    title="ดึงรหัส 17 หลักของ IG Business Account อัตโนมัติจาก Token ที่ใส่ไว้"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>{igDiscoverLoading ? 'กำลังค้นหา...' : 'ค้นหา ID อัตโนมัติ'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={localCreds.instagram.igUserId}
                  onChange={(e) =>
                    setLocalCreds((prev) => ({
                      ...prev,
                      instagram: { ...prev.instagram, igUserId: e.target.value },
                    }))
                  }
                  placeholder="17841400..."
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                  IG Username
                </label>
                <input
                  type="text"
                  value={localCreds.instagram.username}
                  onChange={(e) =>
                    setLocalCreds((prev) => ({
                      ...prev,
                      instagram: { ...prev.instagram, username: e.target.value },
                    }))
                  }
                  placeholder="juijui.official"
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white border border-slate-300"
                />
              </div>
            </div>

            {igDiscoverMessage && (
              <div
                className={`p-2 rounded-lg border text-[11px] flex items-center justify-between gap-2 ${
                  igDiscoverMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <span>{igDiscoverMessage.text}</span>
                <button
                  type="button"
                  onClick={() => setIgDiscoverMessage(null)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Instagram Individual Test Box */}
            <PlatformTestBox
              platformId="instagram"
              platformName="Instagram"
              isLoading={Boolean(singleTestLoading['instagram'])}
              testResult={singleTestResults['instagram'] || null}
              onRunTest={(forceSim) =>
                onTestSinglePlatform?.('instagram', draftCreator.platforms, localCreds, forceSim)
              }
              onClear={() => onClearSingleTestResult?.('instagram')}
              onApplyToDiff={(data) => onApplySinglePlatformToDiff?.(data, draftCreator.platforms)}
            />
          </div>

          {/* Facebook Page Graph API */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlatformBrandIcon platform="facebook" size="sm" />
                <span className="text-xs font-bold text-slate-900">Facebook Page API v20.0</span>
              </div>
              <a
                href="https://developers.facebook.com/tools/explorer/"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-violet-600 hover:text-violet-800 flex items-center gap-1"
              >
                <span>Graph API Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                Page Access Token
              </label>
              <div className="relative">
                <input
                  type={showTokens['fb_token'] ? 'text' : 'password'}
                  value={localCreds.facebook.pageAccessToken}
                  onChange={(e) =>
                    setLocalCreds((prev) => ({
                      ...prev,
                      facebook: { ...prev.facebook, pageAccessToken: e.target.value },
                    }))
                  }
                  placeholder="EAAB..."
                  className="w-full px-2.5 py-1.5 pr-8 text-xs font-mono rounded-lg bg-white border border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => toggleShowToken('fb_token')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  {showTokens['fb_token'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                  Page ID / Page Name
                </label>
                <input
                  type="text"
                  value={localCreds.facebook.pageId}
                  onChange={(e) =>
                    setLocalCreds((prev) => ({
                      ...prev,
                      facebook: { ...prev.facebook, pageId: e.target.value },
                    }))
                  }
                  placeholder="juijui.fanpage.official"
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                  ชื่อแฟนเพจ
                </label>
                <input
                  type="text"
                  value={localCreds.facebook.pageName}
                  onChange={(e) =>
                    setLocalCreds((prev) => ({
                      ...prev,
                      facebook: { ...prev.facebook, pageName: e.target.value },
                    }))
                  }
                  placeholder="จุ๊ยจุ๊ย จุ๊ย"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
                />
              </div>
            </div>

            {/* Facebook Individual Test Box */}
            <PlatformTestBox
              platformId="facebook"
              platformName="Facebook Page"
              isLoading={Boolean(singleTestLoading['facebook'])}
              testResult={singleTestResults['facebook'] || null}
              onRunTest={(forceSim) =>
                onTestSinglePlatform?.('facebook', draftCreator.platforms, localCreds, forceSim)
              }
              onClear={() => onClearSingleTestResult?.('facebook')}
              onApplyToDiff={(data) => onApplySinglePlatformToDiff?.(data, draftCreator.platforms)}
            />
          </div>
        </div>
      </div>

      {/* 4. Snapshot History (ประวัติย้อนหลังสูงสุด 5 รายการ พร้อมปุ่ม Restore) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-violet-700" />
              <span>ประวัติการซิงค์ข้อมูลย้อนหลัง (Snapshot Rollback History)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              ระบบจัดเก็บจุดคืนค่าอัตโนมัติสูงสุด 5 เวอร์ชันล่าสุด สามารถกดปุ่ม Rollback เพื่อย้อนกลับไปใช้ตัวเลขเดิมได้ทันที
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {syncHistory.length} / 5 สแนปช็อต
          </span>
        </div>

        {syncHistory.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 space-y-2">
            <Clock className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">ยังไม่มีประวัติการซิงค์ข้อมูลในหน่วยความจำ</p>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              เมื่อคุณกดดึงข้อมูลสดและกดยืนยันบันทึก ระบบจะบันทึกสถานะของตัวเลขปัจจุบันเก็บเป็นประวัติให้คุณสามารถย้อนกลับมาใช้ได้ทุกเมื่อ
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {syncHistory.map((item, index) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      เวอร์ชัน #{syncHistory.length - index} • {item.dateFormatted}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        item.triggerType === 'official_api'
                          ? 'bg-violet-100 text-violet-800'
                          : item.triggerType === 'simulation'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.triggerType === 'official_api'
                        ? 'Official API'
                        : item.triggerType === 'simulation'
                        ? 'Simulation Feed'
                        : 'Manual Restore'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    {item.summary.platformChangesSummary}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-mono mt-1">
                    <span>ผู้ติดตามรวม: <strong className="text-slate-800 font-bold">{item.summary.totalFollowers}</strong></span>
                    <span>•</span>
                    <span>Reach ต่อเดือน: <strong className="text-slate-800 font-bold">{item.summary.totalReach}</strong></span>
                    <span>•</span>
                    <span>ER เฉลี่ย: <strong className="text-slate-800 font-bold">{item.summary.totalEr}</strong></span>
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    type="button"
                    disabled={isRollingBack === item.id}
                    onClick={() => handleRollback(item)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 text-slate-600 ${isRollingBack === item.id ? 'animate-spin' : ''}`} />
                    <span>{isRollingBack === item.id ? 'กำลังย้อนกลับ...' : '↺ ย้อนกลับไปใช้เวอร์ชันนี้'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Comprehensive API Setup Guide Modal */}
      {showApiGuideModal && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowApiGuideModal(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-violet-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    คู่มือการขอ API & Token ทั้ง 4 แพลตฟอร์ม
                  </h3>
                  <p className="text-xs text-slate-300">
                    ขั้นตอนการรับ Official Credentials สำหรับช่อง "จุ๊ยจุ๊ย" แบบละเอียดทีละขั้นตอน
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowApiGuideModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-1 overflow-x-auto">
              {[
                { id: 'youtube', label: 'YouTube API v3', icon: 'youtube' },
                { id: 'facebook', label: 'Facebook Page API', icon: 'facebook' },
                { id: 'instagram', label: 'Instagram Graph API', icon: 'instagram' },
                { id: 'tiktok', label: 'TikTok Open API', icon: 'tiktok' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setGuideActivePlatform(tab.id as any)}
                  className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
                    guideActivePlatform === tab.id
                      ? 'border-violet-600 text-violet-900 bg-white shadow-xs'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PlatformBrandIcon platform={tab.icon} size="xs" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
              {/* YouTube Guide */}
              {guideActivePlatform === 'youtube' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">ระดับความยาก: ง่ายมาก (ใช้เวลา 3 นาที)</span>
                      <p className="text-[11px] text-rose-800 mt-0.5">
                        YouTube API ใช้งานฟรี มีโควตา 10,000 units ต่อวัน (ดึงได้นับพันครั้งต่อวันสบายๆ) ไม่ต้องรอรีวิวจาก Google
                      </p>
                    </div>
                  </div>

                  <h5 className="font-bold text-slate-900 text-sm">ขั้นตอนการขอ YouTube API Key:</h5>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>
                      ไปที่{' '}
                      <a
                        href="https://console.cloud.google.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-violet-600 font-bold underline inline-flex items-center gap-0.5"
                      >
                        Google Cloud Console <ExternalLink className="w-3 h-3 inline" />
                      </a>{' '}
                      และเข้าสู่ระบบด้วยบัญชี Google
                    </li>
                    <li>
                      สร้าง Project ใหม่ (หรือเลือก Project เดิมที่มีอยู่) ที่เมนูด้านบนซ้าย
                    </li>
                    <li>
                      ไปที่เมนู <strong>APIs & Services &gt; Library</strong> ค้นหาคำว่า{' '}
                      <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono">
                        YouTube Data API v3
                      </code>{' '}
                      แล้วกดปุ่ม <strong>Enable</strong>
                    </li>
                    <li>
                      ไปที่ <strong>APIs & Services &gt; Credentials</strong> คลิกปุ่ม{' '}
                      <strong>+ Create Credentials &gt; API key</strong>
                    </li>
                    <li>
                      คัดลอกรหัสที่ขึ้นต้นด้วย{' '}
                      <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono">
                        AIzaSy...
                      </code>{' '}
                      มาใส่ในช่อง <strong>YouTube API Key</strong> ในหน้าแอดมินนี้
                    </li>
                    <li>
                      <strong>Channel ID / Handle:</strong> ใส่{' '}
                      <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono">
                        @JUIJUIChannel
                      </code>{' '}
                      หรือ Channel ID ที่ได้จาก YouTube Studio &gt; Settings &gt; Channel &gt; Advanced settings
                    </li>
                  </ol>
                </div>
              )}

              {/* Facebook Guide */}
              {guideActivePlatform === 'facebook' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">ระดับความยาก: ปานกลาง (ใช้เวลา 5-8 นาที)</span>
                      <p className="text-[11px] text-blue-800 mt-0.5">
                        ต้องเป็นผู้ดูแล (Admin) ของแฟนเพจ "จุ๊ยจุ๊ย จุ๊ย" บน Facebook
                      </p>
                    </div>
                  </div>

                  <h5 className="font-bold text-slate-900 text-sm">ขั้นตอนการขอ Facebook Page Token:</h5>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>
                      ไปที่{' '}
                      <a
                        href="https://developers.facebook.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-violet-600 font-bold underline inline-flex items-center gap-0.5"
                      >
                        Meta for Developers <ExternalLink className="w-3 h-3 inline" />
                      </a>{' '}
                      ล็อกอินด้วย Facebook ที่เป็นแอดมินเพจ
                    </li>
                    <li>
                      ไปที่ <strong>My Apps &gt; Create App</strong> เลือกประเภท Use case เป็น{' '}
                      <strong>Other</strong> หรือ <strong>Business</strong> แล้วตั้งชื่อ App
                    </li>
                    <li>
                      เปิดเครื่องมือ{' '}
                      <a
                        href="https://developers.facebook.com/tools/explorer/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-violet-600 font-bold underline inline-flex items-center gap-0.5"
                      >
                        Graph API Explorer <ExternalLink className="w-3 h-3 inline" />
                      </a>
                    </li>
                    <li>
                      ที่เมนูด้านขวา:
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>ช่อง <strong>Meta App:</strong> เลือก App ที่สร้างไว้</li>
                        <li>ช่อง <strong>User or Page:</strong> คลิกเลือก <strong>เพจ จุ๊ยจุ๊ย จุ๊ย</strong></li>
                        <li>
                          ช่อง <strong>Permissions:</strong> เพิ่มสิทธิ์{' '}
                          <code className="px-1 bg-slate-100 rounded font-mono">pages_read_engagement</code>,{' '}
                          <code className="px-1 bg-slate-100 rounded font-mono">pages_show_list</code>
                        </li>
                      </ul>
                    </li>
                    <li>
                      คลิกปุ่ม <strong>Generate Access Token</strong> แล้วกดยืนยันสิทธิ์กับเพจ
                    </li>
                    <li>
                      คัดลอก Token (ขึ้นต้นด้วย EAAB...) มาวางในช่อง <strong>Page Access Token</strong>
                    </li>
                    <li>
                      <strong>Page ID:</strong> ดูได้ที่หน้าแฟนเพจ เมนู <em>About (เกี่ยวกับ) &gt; Page transparency</em> หรือใช้ชื่อ url ของเพจ
                    </li>
                  </ol>
                </div>
              )}

              {/* Instagram Guide */}
              {guideActivePlatform === 'instagram' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3 rounded-xl bg-fuchsia-50 border border-fuchsia-200 text-fuchsia-900 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-fuchsia-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">เงื่อนไขสำคัญก่อนเริ่ม:</span>
                      <p className="text-[11px] text-fuchsia-800 mt-0.5">
                        บัญชี Instagram ของจุ๊ยจุ๊ยต้องเป็นประเภท <strong>Creator หรือ Business Account</strong> และต้องเชื่อมโยงเข้ากับ Facebook Page แล้ว (ทำได้ใน Instagram Settings &gt; Account &gt; Linked Accounts)
                      </p>
                    </div>
                  </div>

                  <h5 className="font-bold text-slate-900 text-sm">ขั้นตอนการขอ Instagram Token & IG User ID:</h5>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>
                      สร้าง App บน{' '}
                      <a
                        href="https://developers.facebook.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-violet-600 font-bold underline inline-flex items-center gap-0.5"
                      >
                        Meta for Developers <ExternalLink className="w-3 h-3 inline" />
                      </a>{' '}
                      (ใช้ App เดียวกับของ Facebook ได้)
                    </li>
                    <li>
                      เปิดเครื่องมือ{' '}
                      <a
                        href="https://developers.facebook.com/tools/explorer/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-violet-600 font-bold underline inline-flex items-center gap-0.5"
                      >
                        Graph API Explorer <ExternalLink className="w-3 h-3 inline" />
                      </a>
                    </li>
                    <li>
                      เพิ่ม Permissions ต่อไปนี้:
                      <div className="flex flex-wrap gap-1.5 mt-1 font-mono text-[11px]">
                        <span className="px-2 py-0.5 bg-slate-100 rounded border">instagram_basic</span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded border">instagram_manage_insights</span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded border">pages_show_list</span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded border">pages_read_engagement</span>
                      </div>
                    </li>
                    <li>
                      คลิกปุ่ม <strong>Generate Access Token</strong>
                    </li>
                    <li>
                      <strong>วิธีหา IG User ID:</strong> ใน Graph API Explorer พิมพ์คำสั่ง{' '}
                      <code className="px-1.5 py-0.5 bg-slate-100 rounded font-mono text-violet-700">
                        me/accounts?fields=instagram_business_account&#123;id,username&#125;
                      </code>{' '}
                      แล้วกด Submit จะได้รับ ID ตัวเลข 17 หลัก (เช่น 178414000...)
                    </li>
                    <li>
                      คัดลอก Token และ IG User ID มาวางในช่องของ Instagram
                    </li>
                    <li>
                      <em>คำแนะนำ:</em> Token เริ่มต้นมีอายุ 1-2 ชั่วโมง คุณสามารถขยายเป็น Long-lived Token (อายุ 60 วัน) ได้ที่{' '}
                      <a
                        href="https://developers.facebook.com/tools/accesstoken/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-violet-600 underline font-bold"
                      >
                        Access Token Tool
                      </a>
                    </li>
                  </ol>
                </div>
              )}

              {/* TikTok Guide */}
              {guideActivePlatform === 'tiktok' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3 rounded-xl bg-violet-50 border border-violet-200 text-violet-900 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">เชื่อมต่อง่ายผ่าน Official OAuth 2.0 (Connect TikTok)</span>
                      <p className="text-[11px] text-violet-800 mt-0.5">
                        ระบบใหม่นี้รองรับทั้ง <strong>Sandbox Mode (ทดสอบระหว่างพัฒนา)</strong> และ <strong>Production Mode</strong> โดยผู้ดูแลระบบไม่ต้องคัดลอก Access Token มาวางเอง เพียงกดปุ่มเดียวระบบจะเชื่อมต่อและรีเฟรชสิทธิ์ให้อัตโนมัติ
                      </p>
                    </div>
                  </div>

                  <h5 className="font-bold text-slate-900 text-sm">ขั้นตอนการติดตั้ง TikTok OAuth 2.0 (รวม Sandbox Mode):</h5>
                  <ol className="list-decimal pl-5 space-y-2.5">
                    <li>
                      ไปที่{' '}
                      <a
                        href="https://developers.tiktok.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-violet-600 font-bold underline inline-flex items-center gap-0.5"
                      >
                        TikTok for Developers <ExternalLink className="w-3 h-3 inline" />
                      </a>{' '}
                      และเข้าสู่ระบบด้วยบัญชีผู้พัฒนา
                    </li>
                    <li>
                      คลิก <strong>Manage Apps &gt; Create App</strong> และตั้งชื่อแอปของคุณ
                    </li>
                    <li>
                      ในเมนู <strong>App Details &gt; Redirect domains</strong>:
                      <div className="p-2 my-1 rounded-lg bg-slate-100 border border-slate-200 font-mono text-[11px] text-slate-800 flex items-center justify-between">
                        <span>{tiktokOAuth?.redirectUri || (typeof window !== 'undefined' ? `${window.location.origin}/api/tiktok/callback` : '')}</span>
                        <button
                          type="button"
                          onClick={handleCopyRedirectUri}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white cursor-pointer hover:bg-slate-800 shrink-0"
                        >
                          {copiedRedirectUri ? 'คัดลอกแล้ว!' : 'คัดลอก'}
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        *นำ URL ด้านบนนี้ไปวางในช่อง Redirect domain หรือ Redirect URL ของ TikTok
                      </span>
                    </li>
                    <li>
                      เพิ่มผลิตภัณฑ์ <strong>Login Kit</strong> หรือ <strong>Display API</strong> และเลือก Scopes:
                      <div className="flex flex-wrap gap-1.5 mt-1 font-mono text-[11px]">
                        <span className="px-2 py-0.5 bg-slate-100 rounded border">user.info.basic</span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded border">user.info.stats</span>
                      </div>
                    </li>
                    <li>
                      <strong>การตั้งค่าโหมดทดสอบ (Sandbox Mode - ไม่ต้องรอ App Review):</strong>
                      <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                        <li>ไปที่แท็บ <strong>Roles &amp; Access &gt; Sandbox Testers</strong></li>
                        <li>คลิก <strong>+ Add Sandbox Tester</strong> แล้วกรอก Username ช่อง TikTok ของคุณ (เช่น <code className="text-violet-700 font-bold font-mono">@juijui.j</code>)</li>
                        <li>เปิดแอป TikTok ในสมาร์ตโฟน &gt; กล่องข้อความ (Inbox) จาก TikTok แล้วกดยืนยันคำขอเป็น Tester</li>
                      </ul>
                    </li>
                    <li>
                      คัดลอก <strong>Client Key</strong> และ <strong>Client Secret</strong> จากหน้า TikTok Developer Console มากรอกในกล่อง "ตั้งค่า TikTok Client Credentials" ในหน้านี้ แล้วกด <strong>"บันทึกการตั้งค่า"</strong>
                    </li>
                    <li>
                      คลิกปุ่ม <strong>"เชื่อมต่อบัญชี TikTok (Connect TikTok)"</strong> ในหน้าแอดมินนี้ หน้าต่าง Popup จะเปิดขึ้นเพื่อให้คุณล็อกอินและกดยืนยันสิทธิ์ เมื่อสำเร็จระบบจะดึงยอดผู้ติดตามและสถิติจริงมาใช้งานทันที!
                    </li>
                  </ol>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                ข้อมูล API Key ทั้งหมดจะถูกจัดเก็บในเครื่องเบราว์เซอร์ของคุณอย่างปลอดภัย (Local Storage)
              </span>
              <button
                type="button"
                onClick={() => setShowApiGuideModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
              >
                เข้าใจแล้ว / ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
