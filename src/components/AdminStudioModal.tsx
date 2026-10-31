import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Check,
  Video,
  MessageSquarePlus,
  DollarSign,
  Users,
  ClipboardList,
  Sparkles,
  Cloud,
  LogIn,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Save,
  RotateCcw,
  Briefcase,
  RefreshCw,
} from 'lucide-react';
import {
  CreatorProfile,
  BookingRecord,
  BrandCollaborationItem,
  INITIAL_CREATORS,
} from '../data/creatorData';
import { useCreatorStudio, AdminTabType } from '../hooks/useCreatorStudio';
import { usePlatformSync } from '../hooks/usePlatformSync';
import { ProfileIdentityTab } from './admin/ProfileIdentityTab';
import { RatesAnalyticsTab } from './admin/RatesAnalyticsTab';
import { ViralMediaTab } from './admin/ViralMediaTab';
import { BrandPartnersTab } from './admin/BrandPartnersTab';
import { CommentsProofTab } from './admin/CommentsProofTab';
import { BookingsLedgerTab } from './admin/BookingsLedgerTab';
import { RosterBackupTab } from './admin/RosterBackupTab';
import { PlatformSyncTab } from './admin/PlatformSyncTab';
import { EASE_OUT_EXPO } from './sections/motionVariants';
import { User } from '../firebase';

interface AdminStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: AdminTabType;
  initialEditingBrand?: BrandCollaborationItem | null;
  creator: CreatorProfile;
  allCreators: CreatorProfile[];
  bookings: BookingRecord[];
  adminUser: User | null;
  isCloudConnected: boolean;
  authErrorNotice?: string | null;
  onClearAuthError?: () => void;
  cloudSyncError?: string | null;
  onClearCloudSyncError?: () => void;
  onLoginGoogle: () => Promise<void>;
  onLogoutGoogle: () => Promise<void>;
  onSaveCreator: (updated: CreatorProfile) => Promise<void>;
  onAddCreator: (newCreator: Partial<CreatorProfile>) => Promise<void>;
  onSelectCreatorId: (id: string) => void;
  onUpdateBookingStatus: (bookingId: string, status: BookingRecord['status']) => Promise<void>;
  onResetDefaults: () => Promise<void>;
  onSaveAndCloseSuccess?: (message: string) => void;
}

export const AdminStudioModal: React.FC<AdminStudioModalProps> = (props) => {
  const {
    isOpen,
    onClose,
    adminUser,
    isCloudConnected,
    onLoginGoogle,
    onLogoutGoogle,
  } = props;
  const studio = useCreatorStudio(props);
  const platformSync = usePlatformSync();
  const [authLoading, setAuthLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      await onLoginGoogle();
    } catch {
      // Ignore cancelled popup
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveAndClose = async () => {
    const isSaved = await studio.saveDraftChanges();
    if (isSaved) {
      props.onSaveAndCloseSuccess?.(
        'บันทึกข้อมูลขึ้น Firebase Cloud และอัปเดตหน้าเว็บเรียบร้อยแล้ว'
      );
      onClose();
    }
  };

  // Lock body scroll while Admin modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  const TABS: {
    id: AdminTabType;
    step: string;
    label: string;
    badge?: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    {
      id: 'identity',
      step: '01',
      label: 'โปรไฟล์ & ติดต่อ',
      icon: Sparkles,
    },
    {
      id: 'rates',
      step: '02',
      label: 'เรทการ์ด & สถิติผู้ชม',
      icon: DollarSign,
    },
    {
      id: 'media',
      step: '03',
      label: 'ผลงานไวรัล 16:9 / 9:16',
      badge: `${studio.draftCreator.viralWorks.length}`,
      icon: Video,
    },
    {
      id: 'brands',
      step: '04',
      label: 'ลูกค้า 60+ แบรนด์',
      badge: `${(studio.draftCreator.brandCollaborations || INITIAL_CREATORS[0].brandCollaborations || []).length}`,
      icon: Briefcase,
    },
    {
      id: 'comments',
      step: '05',
      label: 'เสียงตอบรับ & รีวิว',
      badge: `${studio.draftCreator.commentProofs.length}`,
      icon: MessageSquarePlus,
    },
    {
      id: 'bookings',
      step: '06',
      label: 'รายการจองคิวงาน',
      badge: `${studio.bookings.length}`,
      icon: ClipboardList,
    },
    {
      id: 'roster',
      step: '07',
      label: 'ครีเอเตอร์ & สำรองข้อมูล',
      badge: `${studio.allCreators.length}`,
      icon: Users,
    },
    {
      id: 'sync',
      step: '08',
      label: 'ดึงข้อมูลสด (API Sync)',
      icon: RefreshCw,
    },
  ];

  const showDraftSaveFooter = true;
  const activeErrorMessage = studio.saveErrorNotice || props.cloudSyncError;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="admin-studio-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
          onClick={onClose}
          className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            key="admin-studio-dialog"
            initial={{ opacity: 0, y: 36, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.38, ease: EASE_OUT_EXPO }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl w-full max-w-6xl xl:max-w-[90vw] 2xl:max-w-[1640px] h-[90vh] max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Top Studio Header */}
            <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-6 py-3.5 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={studio.draftCreator.avatarUrl}
                  alt={studio.draftCreator.nameTh}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/assets/juijui/page-1.png';
                  }}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      Creator Studio CMS — {studio.draftCreator.nameTh} ({studio.draftCreator.nameEn})
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                        isCloudConnected
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      <Cloud className="w-3.5 h-3.5" />
                      <span>
                        {isCloudConnected
                          ? 'Firebase Cloud Sync (ออนไลน์ 100% · ทุกคนเห็นข้อมูลเดียวกัน)'
                          : 'กำลังเชื่อมต่อ Firebase Cloud...'}
                      </span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    บันทึกข้อมูลตรงเข้าฐานข้อมูลกลาง Firebase Cloud Firestore ทันที (ไม่พึ่งพา Localhost · ทุกคนที่เปิดเว็บเห็นข้อมูลเดียวกัน 100%)
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Toast Notification */}
                <AnimatePresence>
                  {studio.savedNotice && (
                    <motion.span
                      initial={{ opacity: 0, y: -6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
                    >
                      <Check className="w-3.5 h-3.5" /> {studio.savedNotice}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Google Admin Login / Status Button */}
                {adminUser ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                      {adminUser.email}
                    </span>
                    <button
                      type="button"
                      onClick={onLogoutGoogle}
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-600 font-semibold ml-0.5 cursor-pointer transition-colors"
                      title="ออกจากระบบแอดมิน"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E1B4B] hover:bg-violet-900 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 text-amber-300" />
                    <span>
                      {authLoading ? 'กำลังเชื่อมต่อ...' : 'ล็อกอินแอดมิน (Google)'}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="ปิดหน้าต่าง"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Auth Error Banner (e.g. Unauthorized Domain on Vercel) */}
            {props.authErrorNotice && (
              <div className="shrink-0 mx-5 sm:mx-6 mt-3 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-start gap-2.5 min-w-0">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-950">ยังไม่สามารถล็อกอิน Google บนโดเมนนี้ได้:</p>
                    <p className="mt-0.5 text-slate-700">{props.authErrorNotice}</p>
                    <p className="mt-1 text-slate-500 text-[11px]">
                      วิธีเปิดใช้งาน: ไปที่ <strong>Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains</strong> แล้วกด Add domain โดเมนปัจจุบัน: <code className="bg-amber-100/90 text-amber-950 px-1 py-0.5 rounded font-mono font-bold">{typeof window !== 'undefined' ? window.location.hostname : ''}</code>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        navigator.clipboard.writeText(window.location.hostname);
                      }
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 font-bold rounded-lg border border-amber-300 cursor-pointer text-[11px] shadow-2xs"
                  >
                    คัดลอกชื่อโดเมน
                  </button>
                  {props.onClearAuthError && (
                    <button
                      type="button"
                      onClick={props.onClearAuthError}
                      className="p-1 text-amber-600 hover:text-amber-900 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Firestore Save / Sync Error Banner */}
            {activeErrorMessage && (
              <div className="shrink-0 mx-5 sm:mx-6 mt-3 p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-start gap-2.5 min-w-0">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-bold text-rose-950">
                      แจ้งเตือนการเชื่อมต่อ/บันทึกข้อมูล Firebase Cloud Firestore:
                    </p>
                    <p className="mt-0.5 text-rose-800 break-words">{activeErrorMessage}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => studio.saveDraftChanges()}
                    disabled={studio.isSaving}
                    className="px-2.5 py-1 bg-rose-700 hover:bg-rose-800 text-white font-semibold rounded-lg cursor-pointer text-[11px] shadow-2xs"
                  >
                    ลองบันทึกอีกครั้ง
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      studio.clearSaveErrorNotice();
                      props.onClearCloudSyncError?.();
                    }}
                    className="p-1 text-rose-600 hover:text-rose-900 cursor-pointer"
                    aria-label="ปิดการแจ้งเตือน"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 6-Tab Navigation Bar */}
            <div className="shrink-0 flex items-center gap-1.5 px-5 sm:px-6 py-2.5 border-b border-slate-200 bg-white overflow-x-auto no-scrollbar">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = studio.activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => studio.setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="adminStudioActiveTabPill"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        className="absolute inset-0 bg-[#1E1B4B] rounded-xl -z-0 shadow-xs"
                      />
                    )}
                    <Icon
                      className={`w-3.5 h-3.5 relative z-10 ${
                        isActive ? 'text-amber-300' : 'text-slate-400'
                      }`}
                    />
                    <span className="relative z-10">{tab.label}</span>
                    {tab.badge && (
                      <span
                        className={`relative z-10 px-1.5 py-0.2 rounded-md text-[10px] font-mono-num font-bold ${
                          isActive
                            ? 'bg-white/15 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Delegated Sub-Component Viewport with Ultra-Slim Scrollbar */}
            <div className="flex-1 min-h-0 overflow-y-auto slim-scroll p-5 sm:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={studio.activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
                >
                  {studio.activeTab === 'identity' && (
                    <ProfileIdentityTab
                      draftCreator={studio.draftCreator}
                      isSaving={studio.isSaving}
                      hasUnsavedChanges={studio.hasUnsavedChanges}
                      onUpdateRootField={studio.updateRootField}
                      onUpdateSectionHeaderField={studio.updateSectionHeaderField}
                      onUpdateStrengthItem={studio.updateStrengthItem}
                      onAddStrengthItem={studio.addStrengthItem}
                      onDeleteStrengthItem={studio.deleteStrengthItem}
                      onUpdateContactField={studio.updateContactField}
                      onSaveDraftChanges={handleSaveAndClose}
                    />
                  )}

                  {studio.activeTab === 'rates' && (
                    <RatesAnalyticsTab
                      onNavigateTab={studio.setActiveTab}
                      draftCreator={studio.draftCreator}
                      isSaving={studio.isSaving}
                      hasUnsavedChanges={studio.hasUnsavedChanges}
                      onUpdatePackageField={studio.updatePackageField}
                      onUpdateAddOnField={studio.updateAddOnField}
                      onAddAddOnItem={studio.addAddOnItem}
                      onDeleteAddOnItem={studio.deleteAddOnItem}
                      onUpdateOverviewStat={studio.updateOverviewStat}
                      onUpdatePlatformStat={studio.updatePlatformStat}
                      onUpdateDefaultStatsTimeframe={studio.updateDefaultStatsTimeframe}
                      onUpdateOverviewTimeframeStat={studio.updateOverviewTimeframeStat}
                      onUpdatePlatformTimeframeStat={studio.updatePlatformTimeframeStat}
                      onUpdateAgeGroupPercent={studio.updateAgeGroupPercent}
                      onUpdateAgeGroupField={studio.updateAgeGroupField}
                      onAddAgeGroupItem={studio.addAgeGroupItem}
                      onDeleteAgeGroupItem={studio.deleteAgeGroupItem}
                      onUpdateGenderPercent={studio.updateGenderPercent}
                      onUpdateGenderField={studio.updateGenderField}
                      onUpdateLocationField={studio.updateLocationField}
                      onAddLocationItem={studio.addLocationItem}
                      onDeleteLocationItem={studio.deleteLocationItem}
                      onUpdateDemographicsMeta={studio.updateDemographicsMeta}
                      onCopyDemographicsBetweenPlatforms={studio.copyDemographicsBetweenPlatforms}
                      onRecalculateDemographicsWeightedAverage={studio.recalculateDemographicsWeightedAverage}
                      onUpdateDefaultDemographicView={studio.updateDefaultDemographicView}
                      onApplySmartImport={studio.applySmartImportCreator}
                      onUpdateFreePerkField={studio.updateFreePerkField}
                      onAddFreePerkItem={studio.addFreePerkItem}
                      onDeleteFreePerkItem={studio.deleteFreePerkItem}
                      onUpdateCustomCollabNote={studio.updateCustomCollabNote}
                      onUpdateSupportedFormats={studio.updateSupportedFormats}
                      onSaveDraftChanges={handleSaveAndClose}
                      onResetDefaults={studio.onResetDefaults}
                    />
                  )}

                  {studio.activeTab === 'media' && (
                    <ViralMediaTab
                      viralWorks={studio.draftCreator.viralWorks}
                      editingMediaItem={studio.editingMediaItem}
                      onSetEditingMediaItem={studio.setEditingMediaItem}
                      onUpsertViralWork={studio.upsertViralWork}
                      onTogglePinViralWork={studio.togglePinViralWork}
                      onDeleteViralWork={studio.deleteViralWork}
                    />
                  )}

                  {studio.activeTab === 'brands' && (
                    <BrandPartnersTab
                      brands={
                        studio.draftCreator.brandCollaborations ||
                        INITIAL_CREATORS[0].brandCollaborations ||
                        []
                      }
                      showcaseConfig={
                        studio.draftCreator.brandShowcaseConfig ||
                        INITIAL_CREATORS[0].brandShowcaseConfig!
                      }
                      editingBrandItem={studio.editingBrandItem}
                      onSetEditingBrandItem={studio.setEditingBrandItem}
                      onUpdateShowcaseConfig={studio.updateShowcaseConfig}
                      onUpsertBrandCollaboration={studio.upsertBrandCollaboration}
                      onDeleteBrandCollaboration={studio.deleteBrandCollaboration}
                    />
                  )}

                  {studio.activeTab === 'comments' && (
                    <CommentsProofTab
                      commentProofs={studio.draftCreator.commentProofs}
                      proofSummaryConfig={studio.draftCreator.proofSummaryConfig}
                      onUpdateProofSummaryConfig={studio.updateProofSummaryConfig}
                      editingCommentItem={studio.editingCommentItem}
                      onSetEditingCommentItem={studio.setEditingCommentItem}
                      onUpsertCommentProof={studio.upsertCommentProof}
                      onDeleteCommentProof={studio.deleteCommentProof}
                    />
                  )}

                  {studio.activeTab === 'bookings' && (
                    <BookingsLedgerTab
                      bookings={studio.bookings}
                      onUpdateBookingStatus={studio.onUpdateBookingStatus}
                      onExportBookingsToCsv={studio.exportBookingsToCsv}
                    />
                  )}

                  {studio.activeTab === 'roster' && (
                    <RosterBackupTab
                      currentCreator={studio.draftCreator}
                      allCreators={studio.allCreators}
                      onSelectCreatorId={studio.onSelectCreatorId}
                      onCreateNewRosterCreator={studio.createNewRosterCreator}
                      onExportCreatorJson={studio.exportCreatorJson}
                      onImportCreatorJson={studio.importCreatorJson}
                    />
                  )}

                  {studio.activeTab === 'sync' && (
                    <PlatformSyncTab
                      draftCreator={studio.draftCreator}
                      credentials={platformSync.credentials}
                      syncHistory={platformSync.syncHistory}
                      diffItems={platformSync.diffItems}
                      isLoading={platformSync.isLoading}
                      syncError={platformSync.syncError}
                      lastSyncTimestamp={platformSync.lastSyncTimestamp}
                      activeSyncMode={platformSync.activeSyncMode}
                      onUpdateCredentials={platformSync.updateCredentials}
                      onExecuteSync={platformSync.executeSync}
                      onToggleDiffSelection={platformSync.toggleDiffSelection}
                      onToggleSelectAll={platformSync.toggleSelectAll}
                      onClearDiff={platformSync.clearDiff}
                      onApplyDiff={platformSync.applyDiff}
                      onRollbackToSnapshot={platformSync.rollbackToSnapshot}
                      saveDraftChanges={async (customDraft, customMessage) => {
                        await studio.saveDraftChanges(customDraft, customMessage);
                      }}
                      tiktokOAuth={platformSync.tiktokOAuth}
                      onConnectTikTok={platformSync.connectTikTok}
                      onDisconnectTikTok={platformSync.disconnectTikTok}
                      onRefreshTikTokToken={platformSync.refreshTikTokToken}
                      onSaveTikTokConfig={platformSync.saveTikTokConfig}
                      singleTestLoading={platformSync.singleTestLoading}
                      singleTestResults={platformSync.singleTestResults}
                      onTestSinglePlatform={platformSync.testSinglePlatformFn}
                      onClearSingleTestResult={platformSync.clearSingleTestResult}
                      onApplySinglePlatformToDiff={platformSync.applySinglePlatformToDiff}
                      onApplySmartImport={studio.applySmartImportCreator}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Persistent Studio Action Footer for All Tabs */}
            {showDraftSaveFooter && (
              <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-3 border-t border-slate-200 bg-white">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={studio.onResetDefaults}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>รีเซ็ตค่าเริ่มต้นตาม PDF</span>
                  </button>
                  {activeErrorMessage ? (
                    <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                      เกิดข้อผิดพลาดในการบันทึก — กรุณาตรวจสอบแถบแจ้งเตือนด้านบน
                    </span>
                  ) : studio.hasUnsavedChanges ? (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                      มีการแก้ไขที่ยังไม่ได้กดบันทึก
                    </span>
                  ) : (
                    <span className="text-xs text-emerald-700 bg-emerald-50/70 border border-emerald-200/80 px-2.5 py-1 rounded-lg hidden sm:inline">
                      ข้อมูลล่าสุดซิงก์กับ Firebase Cloud เรียบร้อยแล้ว
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    ปิดหน้าต่าง
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAndClose}
                    disabled={studio.isSaving}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-700 hover:bg-violet-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-60"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>
                      {studio.isSaving
                        ? 'กำลังบันทึกขึ้น Cloud...'
                        : 'บันทึกการเปลี่ยนแปลงทั้งหมด'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
