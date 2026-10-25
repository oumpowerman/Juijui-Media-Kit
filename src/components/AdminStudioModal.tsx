import React, { useState } from 'react';
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
  Save,
  RotateCcw,
  Briefcase,
} from 'lucide-react';
import {
  CreatorProfile,
  BookingRecord,
  BrandCollaborationItem,
  INITIAL_CREATORS,
} from '../data/creatorData';
import { useCreatorStudio, AdminTabType } from '../hooks/useCreatorStudio';
import { ProfileIdentityTab } from './admin/ProfileIdentityTab';
import { RatesAnalyticsTab } from './admin/RatesAnalyticsTab';
import { ViralMediaTab } from './admin/ViralMediaTab';
import { BrandPartnersTab } from './admin/BrandPartnersTab';
import { CommentsProofTab } from './admin/CommentsProofTab';
import { BookingsLedgerTab } from './admin/BookingsLedgerTab';
import { RosterBackupTab } from './admin/RosterBackupTab';
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
  onLoginGoogle: () => Promise<void>;
  onLogoutGoogle: () => Promise<void>;
  onSaveCreator: (updated: CreatorProfile) => Promise<void>;
  onAddCreator: (newCreator: Partial<CreatorProfile>) => Promise<void>;
  onSelectCreatorId: (id: string) => void;
  onUpdateBookingStatus: (bookingId: string, status: BookingRecord['status']) => Promise<void>;
  onResetDefaults: () => Promise<void>;
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
  const [authLoading, setAuthLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      await onLoginGoogle();
    } finally {
      setAuthLoading(false);
    }
  };

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
  ];

  const showDraftSaveFooter =
    studio.activeTab === 'identity' ||
    studio.activeTab === 'rates' ||
    studio.activeTab === 'brands';

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
            className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl w-full max-w-6xl h-[90vh] max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
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
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        isCloudConnected
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      <Cloud className="w-3 h-3" />
                      <span>
                        {isCloudConnected ? 'Firestore Cloud Sync' : 'Local + Server Sync'}
                      </span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    ระบบจัดการข้อมูล Media Kit & Rate Card แบบ Real-time ครบ 100% ทุกส่วนบนหน้าเว็บ
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
                      onUpdateStrengthItem={studio.updateStrengthItem}
                      onAddStrengthItem={studio.addStrengthItem}
                      onDeleteStrengthItem={studio.deleteStrengthItem}
                      onUpdateContactField={studio.updateContactField}
                      onSaveDraftChanges={() => studio.saveDraftChanges()}
                    />
                  )}

                  {studio.activeTab === 'rates' && (
                    <RatesAnalyticsTab
                      draftCreator={studio.draftCreator}
                      isSaving={studio.isSaving}
                      hasUnsavedChanges={studio.hasUnsavedChanges}
                      onUpdatePackageField={studio.updatePackageField}
                      onUpdateAddOnField={studio.updateAddOnField}
                      onAddAddOnItem={studio.addAddOnItem}
                      onDeleteAddOnItem={studio.deleteAddOnItem}
                      onUpdateOverviewStat={studio.updateOverviewStat}
                      onUpdatePlatformStat={studio.updatePlatformStat}
                      onUpdateAgeGroupPercent={studio.updateAgeGroupPercent}
                      onUpdateGenderPercent={studio.updateGenderPercent}
                      onUpdateLocationField={studio.updateLocationField}
                      onUpdateFreePerkField={studio.updateFreePerkField}
                      onUpdateCustomCollabNote={studio.updateCustomCollabNote}
                      onUpdateSupportedFormats={studio.updateSupportedFormats}
                      onSaveDraftChanges={() => studio.saveDraftChanges()}
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
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Persistent Studio Action Footer for Draft Editing Tabs */}
            {showDraftSaveFooter && (
              <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-3 border-t border-slate-200 bg-white">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={studio.onResetDefaults}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>รีเซ็ตค่าเริ่มต้นตาม PDF</span>
                  </button>
                  {studio.hasUnsavedChanges ? (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                      มีการแก้ไขที่ยังไม่ได้กดบันทึก
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      ข้อมูลล่าสุดซิงก์กับหน้าเว็บเรียบร้อยแล้ว
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
                    onClick={() => studio.saveDraftChanges()}
                    disabled={studio.isSaving}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-700 hover:bg-violet-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
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
