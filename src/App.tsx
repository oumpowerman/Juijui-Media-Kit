import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Eye,
  Edit3,
  Link2,
  KeyRound,
  Check,
  X,
} from 'lucide-react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import {
  db,
  auth,
  sanitizeForFirestore,
  onAuthStateChanged,
  signInAdminWithGoogle,
  signOutAdmin,
  OperationType,
  handleFirestoreError,
  User,
} from './firebase';
import {
  INITIAL_CREATORS,
  CreatorProfile,
  BookingRecord,
  ViralWorkItem,
  BrandCollaborationItem,
} from './data/creatorData';
import { OriginalPdfModal } from './components/OriginalPdfModal';
import { MediaLightboxModal } from './components/MediaLightboxModal';
import { ViralPhoneModal } from './components/ViralPhoneModal';
import { BrandDetailModal } from './components/BrandDetailModal';
import { BookingQuoteModal } from './components/BookingQuoteModal';
import { AdminStudioModal } from './components/AdminStudioModal';
import { AdminTabType } from './hooks/useCreatorStudio';
import { NavbarSection } from './components/sections/NavbarSection';
import { HeroSection } from './components/sections/HeroSection';
import { AnalyticsSection } from './components/sections/AnalyticsSection';
import { BrandCollaborationsSection } from './components/sections/BrandCollaborationsSection';
import { ViralShowcaseSection } from './components/sections/ViralShowcaseSection';
import {
  AudienceProofSection,
  CommentFilterType,
} from './components/sections/AudienceProofSection';
import {
  RateCalculatorSection,
  RateViewMode,
} from './components/sections/RateCalculatorSection';
import { applyBrowserTabMeta } from './utils/faviconUtils';

function withBrandDefaults(creator: CreatorProfile): CreatorProfile {
  return {
    ...creator,
    faviconMode: creator.faviconMode || INITIAL_CREATORS[0].faviconMode || 'emoji',
    faviconEmoji: creator.faviconEmoji || INITIAL_CREATORS[0].faviconEmoji || '✨',
    faviconUrl: creator.faviconUrl ?? INITIAL_CREATORS[0].faviconUrl ?? '',
    faviconShape: creator.faviconShape || INITIAL_CREATORS[0].faviconShape || 'rounded',
    browserTabTitle:
      creator.browserTabTitle ||
      INITIAL_CREATORS[0].browserTabTitle ||
      `${creator.nameEn} Media Kit 2026 — Interactive Creator Rate Card`,
    brandShowcaseConfig:
      creator.brandShowcaseConfig || INITIAL_CREATORS[0].brandShowcaseConfig,
    brandCollaborations:
      creator.brandCollaborations && creator.brandCollaborations.length > 0
        ? creator.brandCollaborations
        : INITIAL_CREATORS[0].brandCollaborations,
  };
}

export default function App() {
  const [creators, setCreators] = useState<CreatorProfile[]>(INITIAL_CREATORS);
  const [activeCreatorId, setActiveCreatorId] = useState<string>(INITIAL_CREATORS[0].id);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);

  // Firebase Auth & Cloud Firestore state
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [authErrorNotice, setAuthErrorNotice] = useState<string | null>(null);

  // Interactive selections for Rate Card & Quote Calculator
  const [selectedPackageId, setSelectedPackageId] = useState<string>('pkg-standard');
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [rateViewMode, setRateViewMode] = useState<RateViewMode>('both');

  // Interactive filters for Portfolio & Comments
  const [portfolioFilter, setPortfolioFilter] = useState<string>('all');
  const [commentFilter, setCommentFilter] = useState<CommentFilterType>('all');
  const [activePlatformHighlight, setActivePlatformHighlight] = useState<string>('all');

  // Modals state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<ViralWorkItem | null>(null);
  const [selectedBrandDetail, setSelectedBrandDetail] =
    useState<BrandCollaborationItem | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingReferenceClip, setBookingReferenceClip] = useState<string | undefined>(undefined);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<AdminTabType>('identity');
  const [adminEditingBrand, setAdminEditingBrand] =
    useState<BrandCollaborationItem | null>(null);

  // Option A: URL Parameter (?admin=true) + LocalStorage Admin Mode UI Toggle Only
  // Default for clients visiting clean URL is FALSE (Public Read-Only Mode: 100% edit buttons hidden)
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const adminParam = params.get('admin') || params.get('edit');
    const modeParam = params.get('mode') || params.get('view');

    if (adminParam === 'true' || adminParam === '1' || modeParam === 'admin') {
      localStorage.setItem('juijui_admin_mode', 'true');
      localStorage.setItem('juijui_owner_toolbar', 'true');
      return true;
    }
    if (
      adminParam === 'false' ||
      adminParam === '0' ||
      modeParam === 'public' ||
      modeParam === 'client'
    ) {
      localStorage.removeItem('juijui_admin_mode');
      localStorage.setItem('juijui_owner_toolbar', 'false');
      return false;
    }
    return localStorage.getItem('juijui_admin_mode') === 'true';
  });

  // Floating Owner Switcher Bar visibility (lets owner preview Client Mode vs Edit Mode & copy links)
  const [showOwnerToolbar, setShowOwnerToolbar] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode') || params.get('view');
    const adminParam = params.get('admin');
    if (adminParam === 'false' || modeParam === 'public' || modeParam === 'client') {
      return false;
    }
    if (adminParam === 'true' || modeParam === 'admin') {
      return true;
    }
    // Show switcher bar if owner hasn't explicitly dismissed it
    return localStorage.getItem('juijui_owner_toolbar') !== 'false';
  });

  const [copiedLinkType, setCopiedLinkType] = useState<'client' | 'admin' | null>(null);

  const toggleAdminEditMode = (nextState: boolean) => {
    setIsAdminMode(nextState);
    if (nextState) {
      localStorage.setItem('juijui_admin_mode', 'true');
      localStorage.setItem('juijui_owner_toolbar', 'true');
      setShowOwnerToolbar(true);
    } else {
      localStorage.removeItem('juijui_admin_mode');
    }
  };

  const handleCopyShareLink = (type: 'client' | 'admin') => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    url.searchParams.delete('edit');
    url.searchParams.delete('mode');
    url.searchParams.delete('view');
    url.hash = '';
    if (type === 'admin') {
      url.searchParams.set('admin', 'true');
    }
    navigator.clipboard.writeText(url.toString()).catch(() => {});
    setCopiedLinkType(type);
    window.setTimeout(() => setCopiedLinkType(null), 2400);
  };

  const openAdminAtTab = (
    tab: AdminTabType,
    brandToEdit: BrandCollaborationItem | null = null
  ) => {
    setAdminInitialTab(tab);
    setAdminEditingBrand(brandToEdit);
    setIsAdminModalOpen(true);
  };

  // 1. Track Firebase Auth state & purge any old local data cache
  useEffect(() => {
    try {
      localStorage.removeItem('juijui_creators_store');
      localStorage.removeItem('juijui_bookings_store');
    } catch {
      // ignore
    }
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setAdminUser(user);
    });
    return () => unsubAuth();
  }, []);

  // 2. 100% Pure Firebase Cloud Firestore Real-Time Sync for /creators and /bookings (Shared by all visitors)
  useEffect(() => {
    const unsubCreators = onSnapshot(
      collection(db, 'creators'),
      (snapshot) => {
        setIsCloudConnected(true);
        if (!snapshot.empty) {
          const loadedCreators = snapshot.docs.map((d) =>
            withBrandDefaults(d.data() as CreatorProfile)
          );
          setCreators(loadedCreators);
        } else {
          // Auto-seed initial creator profile into Firestore Cloud when database collection is empty
          INITIAL_CREATORS.forEach((c) => {
            setDoc(doc(db, 'creators', c.id), sanitizeForFirestore(c)).catch((err) => {
              console.warn('Initial Firestore seed notice:', err);
            });
          });
        }
      },
      (error) => {
        console.warn('Firestore creators listener info:', error.message);
      }
    );

    const unsubBookings = onSnapshot(
      collection(db, 'bookings'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedBookings = snapshot.docs.map(
            (d) => d.data() as BookingRecord
          );
          setBookings(loadedBookings);
        }
      },
      (error) => {
        console.warn('Firestore bookings listener info:', error.message);
      }
    );

    return () => {
      unsubCreators();
      unsubBookings();
    };
  }, []);

  const currentCreator =
    creators.find((c) => c.id === activeCreatorId) || creators[0] || INITIAL_CREATORS[0];

  // Dynamically synchronize browser tab favicon (emoji / cropped image / avatar) and tab title
  useEffect(() => {
    if (!isAdminModalOpen) {
      applyBrowserTabMeta(currentCreator);
    }
  }, [currentCreator, isAdminModalOpen]);

  // Ensure selectedPackageId exists on currentCreator if set
  useEffect(() => {
    if (selectedPackageId && !currentCreator.packages.some((p) => p.id === selectedPackageId)) {
      const defaultPkg =
        currentCreator.packages.find((p) => p.isPopular) || currentCreator.packages[0];
      if (defaultPkg) setSelectedPackageId(defaultPkg.id);
    }
  }, [currentCreator, selectedPackageId]);

  const activePackage =
    currentCreator.packages.find((p) => p.id === selectedPackageId) ||
    currentCreator.packages[1] ||
    currentCreator.packages[0];

  const chosenAddOns = currentCreator.addOns.filter((a) => selectedAddOnIds.includes(a.id));
  const addOnsTotal = chosenAddOns.reduce((sum, a) => sum + a.price, 0);
  const estimatedNetTotal = (selectedPackageId ? activePackage.price : 0) + addOnsTotal;

  const handleToggleAddOn = (addonId: string) => {
    setSelectedAddOnIds((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  const handleOpenBookingForPackage = (pkgId?: string, referenceClip?: string) => {
    const targetPkgId = pkgId || selectedPackageId || currentCreator.packages[0].id;
    setSelectedPackageId(targetPkgId);
    setBookingReferenceClip(referenceClip);
    setIsBookingModalOpen(true);
  };

  const handleSaveCreator = async (updated: CreatorProfile) => {
    const cleanUpdated = sanitizeForFirestore(updated);
    // 1. Write directly to Firebase Cloud Firestore (/creators/{id}) as single source of truth
    try {
      await setDoc(doc(db, 'creators', cleanUpdated.id), cleanUpdated);
      setCreators((prev) => prev.map((c) => (c.id === cleanUpdated.id ? cleanUpdated : c)));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `creators/${cleanUpdated.id}`);
    }
  };

  const handleAddCreator = async (partial: Partial<CreatorProfile>) => {
    const created: CreatorProfile = sanitizeForFirestore({
      ...INITIAL_CREATORS[0],
      ...partial,
      id: partial.id || `creator-${Date.now()}`,
      nameTh: partial.nameTh || 'ครีเอเตอร์ใหม่',
    });

    try {
      await setDoc(doc(db, 'creators', created.id), created);
      setCreators((prev) => [...prev, created]);
      setActiveCreatorId(created.id);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `creators/${created.id}`);
    }
  };

  const handleUpdateBookingStatus = async (
    bookingId: string,
    status: BookingRecord['status']
  ) => {
    const existingBooking = bookings.find((b) => b.id === bookingId);
    if (!existingBooking) return;
    const updatedBooking: BookingRecord = sanitizeForFirestore({
      ...existingBooking,
      status,
    });

    try {
      await setDoc(doc(db, 'bookings', bookingId), updatedBooking);
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? updatedBooking : b)));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${bookingId}`);
    }
  };

  const handleResetDefaults = async () => {
    const freshDefaults = sanitizeForFirestore(structuredClone(INITIAL_CREATORS));
    for (const c of freshDefaults) {
      try {
        await setDoc(doc(db, 'creators', c.id), c);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `creators/${c.id}`);
      }
    }
    setCreators(freshDefaults);
    setActiveCreatorId(freshDefaults[0].id);
  };

  const handleLoginGoogle = async () => {
    setAuthErrorNotice(null);
    try {
      const user = await signInAdminWithGoogle();
      if (user) {
        for (const c of creators) {
          try {
            await setDoc(doc(db, 'creators', c.id), sanitizeForFirestore(c));
          } catch {
            // ignore
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setAuthErrorNotice(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#1E1B4B] flex flex-col selection:bg-violet-600 selection:text-white">
      {/* 01. TOP BAR SECTION (Scroll-Spy & Live Quote Trigger) */}
      <NavbarSection
        currentCreator={currentCreator}
        bookingsCount={bookings.length}
        activePackage={activePackage}
        chosenAddOnsCount={chosenAddOns.length}
        estimatedNetTotal={estimatedNetTotal}
        onOpenAdmin={isAdminMode ? () => openAdminAtTab('identity') : undefined}
        onOpenPdf={() => setIsPdfModalOpen(true)}
        onOpenBooking={() => handleOpenBookingForPackage(selectedPackageId)}
      />

      {/* MAIN ORCHESTRATED SECTIONS */}
      <main id="top" className="flex-1 overflow-x-hidden">
        {/* 02. HERO & SHOWREEL MARQUEE SECTION */}
        <HeroSection
          creators={creators}
          currentCreator={currentCreator}
          onSelectCreatorId={setActiveCreatorId}
          onOpenAdmin={isAdminMode ? () => openAdminAtTab('identity') : undefined}
          onOpenPdf={() => setIsPdfModalOpen(true)}
          onOpenBooking={() => handleOpenBookingForPackage(selectedPackageId)}
        />

        {/* 03. ANALYTICS & AUDIENCE INSIGHTS SECTION (Animated Telemetry Graph Canvas) */}
        <AnalyticsSection
          currentCreator={currentCreator}
          activePlatformHighlight={activePlatformHighlight}
          onSelectPlatformHighlight={setActivePlatformHighlight}
          onOpenAdmin={isAdminMode ? () => openAdminAtTab('rates') : undefined}
        />

        {/* 03B. 60+ BRAND COLLABORATIONS & CASE STUDY MATRIX SECTION */}
        <BrandCollaborationsSection
          creator={currentCreator}
          onSelectBrand={(brand) => setSelectedBrandDetail(brand)}
          onOpenAdminTab={isAdminMode ? (tab) => openAdminAtTab(tab) : undefined}
        />

        {/* 04. VIRAL SHOWCASE & GOOGLE DRIVE GALLERY SECTION (Cinema Film Strip Canvas) */}
        <ViralShowcaseSection
          currentCreator={currentCreator}
          portfolioFilter={portfolioFilter}
          onSelectPortfolioFilter={setPortfolioFilter}
          onOpenAdmin={isAdminMode ? () => openAdminAtTab('media') : undefined}
          onSelectLightboxItem={setLightboxItem}
          onBookSimilarClip={(clipTitle) =>
            handleOpenBookingForPackage(selectedPackageId, clipTitle)
          }
        />

        {/* 05. AUDIENCE ENGAGEMENT & BRAND TESTIMONIALS SECTION (Social Pulse & Quote Canvas) */}
        <AudienceProofSection
          currentCreator={currentCreator}
          commentFilter={commentFilter}
          onSelectCommentFilter={setCommentFilter}
          onOpenAdmin={isAdminMode ? () => openAdminAtTab('comments') : undefined}
        />

        {/* 06. RATE CARD, COMPARISON MATRIX, ADD-ONS & CONTACT SECTION (Blueprint Canvas) */}
        <RateCalculatorSection
          currentCreator={currentCreator}
          selectedPackageId={selectedPackageId}
          activePackage={activePackage}
          selectedAddOnIds={selectedAddOnIds}
          chosenAddOns={chosenAddOns}
          estimatedNetTotal={estimatedNetTotal}
          rateViewMode={rateViewMode}
          onSelectRateViewMode={setRateViewMode}
          onSelectPackageId={setSelectedPackageId}
          onToggleAddOn={handleToggleAddOn}
          onClearAddOns={() => setSelectedAddOnIds([])}
          onOpenBookingForPackage={(pkgId) => handleOpenBookingForPackage(pkgId)}
          onOpenPdf={() => setIsPdfModalOpen(true)}
          onOpenAdmin={isAdminMode ? () => openAdminAtTab('rates') : undefined}
          onOpenAdminContact={isAdminMode ? () => openAdminAtTab('identity') : undefined}
          onUnlockAdminToolbar={() => {
            setShowOwnerToolbar(true);
            localStorage.setItem('juijui_owner_toolbar', 'true');
          }}
        />
      </main>

      {/* FLOATING OWNER MODE & LINK SHARE TOOLBAR (Option A: ?admin=true Controller) */}
      {(isAdminMode || showOwnerToolbar) && (
        <div className="fixed bottom-4 left-4 z-[65] max-w-[calc(100vw-2rem)]">
          <div className="bg-[#130F2E]/95 backdrop-blur-xl border border-white/15 text-white rounded-2xl p-2 sm:px-3.5 sm:py-2.5 shadow-[0_20px_50px_-12px_rgba(15,10,40,0.65)] flex flex-wrap items-center gap-2 text-xs">
            {/* Mode Switcher Pill (Client View vs Admin Edit Mode) */}
            <div className="inline-flex items-center p-0.5 rounded-xl bg-white/10 border border-white/10">
              <button
                type="button"
                onClick={() => toggleAdminEditMode(false)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  !isAdminMode
                    ? 'bg-emerald-500 text-slate-950 shadow-2xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="ซ่อนปุ่มแก้ไขทั้งหมดทั่วเว็บไซต์ (มุมมองที่ลูกค้าเห็น)"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>มุมมองลูกค้า (ซ่อนปุ่มแก้ไข)</span>
              </button>
              <button
                type="button"
                onClick={() => toggleAdminEditMode(true)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  isAdminMode
                    ? 'bg-violet-600 text-white shadow-2xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="แสดงปุ่มแก้ไขทุกจุดและเปิดใช้งานโหมดเจ้าของช่อง (?admin=true)"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>โหมดแก้ไข (?admin=true)</span>
              </button>
            </div>

            {/* Direct CMS Studio Button */}
            <button
              type="button"
              onClick={() => openAdminAtTab('identity')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>เปิด Studio CMS</span>
            </button>

            {/* Copy Public Client Link (No ?admin=true) */}
            <button
              type="button"
              onClick={() => handleCopyShareLink('client')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-100 font-semibold transition-colors cursor-pointer"
              title="คัดลอกลิงก์สะอาดสำหรับส่งให้ลูกค้า (ไม่มีปุ่มแก้ไข)"
            >
              {copiedLinkType === 'client' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">คัดลอกลิงก์ลูกค้าแล้ว!</span>
                </>
              ) : (
                <>
                  <Link2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>คัดลอกลิงก์ส่งลูกค้า</span>
                </>
              )}
            </button>

            {/* Copy Secret Admin Link (?admin=true) */}
            <button
              type="button"
              onClick={() => handleCopyShareLink('admin')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-amber-200 font-semibold transition-colors cursor-pointer"
              title="คัดลอกลิงก์ลับสำหรับเจ้าของช่อง (?admin=true)"
            >
              {copiedLinkType === 'admin' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-amber-200">คัดลอกลิงก์ ?admin=true แล้ว!</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">ลิงก์เจ้าของ (?admin=true)</span>
                </>
              )}
            </button>

            {/* Dismiss Floating Bar Completely */}
            <button
              type="button"
              onClick={() => {
                toggleAdminEditMode(false);
                setShowOwnerToolbar(false);
                localStorage.setItem('juijui_owner_toolbar', 'false');
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="ซ่อนแถบควบคุมนี้ (เปิดกลับมาได้ผ่าน ?admin=true หรือไอคอนฟันเฟืองมุมขวาล่างสุดของหน้า)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* MODALS */}
      <OriginalPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        pdfUrl={currentCreator.pdfMediaKitUrl}
        creatorName={`${currentCreator.nameTh} (${currentCreator.nameEn})`}
      />

      <ViralPhoneModal
        item={lightboxItem}
        onClose={() => setLightboxItem(null)}
        onBookSimilar={(title) => handleOpenBookingForPackage(selectedPackageId, title)}
        onOpenAdmin={() => openAdminAtTab('media')}
      />

      <BrandDetailModal
        brand={selectedBrandDetail}
        creatorName={`${currentCreator.nameTh} (${currentCreator.nameEn})`}
        onClose={() => setSelectedBrandDetail(null)}
        onBookSimilarCampaign={(brand) => {
          setSelectedBrandDetail(null);
          handleOpenBookingForPackage(
            selectedPackageId,
            `แคมเปญสไตล์เดียวกับ ${brand.brandName} (${brand.videoStyles.join(', ')})`
          );
        }}
        onQuickEditBrand={
          isAdminMode
            ? (brand) => {
                setSelectedBrandDetail(null);
                openAdminAtTab('brands', brand);
              }
            : undefined
        }
      />

      <BookingQuoteModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        creator={currentCreator}
        selectedPackageId={selectedPackageId}
        onSelectPackageId={setSelectedPackageId}
        selectedAddOnIds={selectedAddOnIds}
        onToggleAddOnId={handleToggleAddOn}
        initialReferenceClip={bookingReferenceClip}
        onBookingCreated={(newBooking) => {
          setBookings((prev) => [newBooking, ...prev]);
        }}
      />

      <AdminStudioModal
        isOpen={isAdminModalOpen}
        onClose={() => {
          setIsAdminModalOpen(false);
          setAdminEditingBrand(null);
        }}
        initialTab={adminInitialTab}
        initialEditingBrand={adminEditingBrand}
        creator={currentCreator}
        allCreators={creators}
        bookings={bookings}
        adminUser={adminUser}
        isCloudConnected={isCloudConnected}
        authErrorNotice={authErrorNotice}
        onClearAuthError={() => setAuthErrorNotice(null)}
        onLoginGoogle={handleLoginGoogle}
        onLogoutGoogle={signOutAdmin}
        onSaveCreator={handleSaveCreator}
        onAddCreator={handleAddCreator}
        onSelectCreatorId={setActiveCreatorId}
        onUpdateBookingStatus={handleUpdateBookingStatus}
        onResetDefaults={handleResetDefaults}
      />
    </div>
  );
}
