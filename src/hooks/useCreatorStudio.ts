import { useState, useEffect, useCallback } from 'react';
import {
  CreatorProfile,
  BookingRecord,
  ViralWorkItem,
  CommentProofItem,
  RatePackage,
  AddOnItem,
  PlatformStat,
  BrandCollaborationItem,
  BrandCategoryType,
  BrandSampleClip,
  BrandShowcaseConfig,
  INITIAL_CREATORS,
  resolveGoogleDriveImage,
} from '../data/creatorData';

export type AdminTabType =
  | 'identity'
  | 'rates'
  | 'media'
  | 'brands'
  | 'comments'
  | 'bookings'
  | 'roster';

interface UseCreatorStudioParams {
  creator: CreatorProfile;
  allCreators: CreatorProfile[];
  bookings: BookingRecord[];
  initialTab?: AdminTabType;
  initialEditingBrand?: BrandCollaborationItem | null;
  onSaveCreator: (updated: CreatorProfile) => Promise<void>;
  onAddCreator: (newCreator: Partial<CreatorProfile>) => Promise<void>;
  onSelectCreatorId: (id: string) => void;
  onUpdateBookingStatus: (bookingId: string, status: BookingRecord['status']) => Promise<void>;
  onResetDefaults: () => Promise<void>;
}

export function useCreatorStudio({
  creator,
  allCreators,
  bookings,
  initialTab = 'identity',
  initialEditingBrand = null,
  onSaveCreator,
  onAddCreator,
  onSelectCreatorId,
  onUpdateBookingStatus,
  onResetDefaults,
}: UseCreatorStudioParams) {
  const [activeTab, setActiveTab] = useState<AdminTabType>(initialTab);
  const [draftCreator, setDraftCreator] = useState<CreatorProfile>(creator);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Sync activeTab when initialTab changes (e.g. from section Quick Edit button)
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Editing item states for Media, Brands & Comments
  const [editingMediaItem, setEditingMediaItem] = useState<ViralWorkItem | null>(null);
  const [editingBrandItem, setEditingBrandItem] = useState<BrandCollaborationItem | null>(
    initialEditingBrand
  );
  const [editingCommentItem, setEditingCommentItem] = useState<CommentProofItem | null>(null);

  useEffect(() => {
    if (initialEditingBrand) {
      setEditingBrandItem(initialEditingBrand);
    }
  }, [initialEditingBrand]);

  // Sync draft when active creator changes externally
  useEffect(() => {
    setDraftCreator(creator);
    setHasUnsavedChanges(false);
    setEditingMediaItem(null);
    setEditingCommentItem(null);
  }, [creator]);

  const triggerToast = useCallback((message: string) => {
    setSavedNotice(message);
    setTimeout(() => {
      setSavedNotice((prev) => (prev === message ? null : prev));
    }, 2800);
  }, []);

  // Save current draftCreator to Firestore + Backend
  const saveDraftChanges = useCallback(
    async (customDraft?: CreatorProfile, customMessage?: string) => {
      const target = customDraft || draftCreator;
      setIsSaving(true);
      try {
        await onSaveCreator(target);
        setHasUnsavedChanges(false);
        triggerToast(customMessage || 'บันทึกข้อมูลลงฐานข้อมูลเรียบร้อยแล้ว');
      } finally {
        setIsSaving(false);
      }
    },
    [draftCreator, onSaveCreator, triggerToast]
  );

  // 0. PROFILE IDENTITY, HERO, IMAGES, STRENGTHS & CONTACT MUTATORS
  const updateRootField = useCallback(
    <K extends keyof CreatorProfile>(field: K, value: CreatorProfile[K]) => {
      setDraftCreator((prev) => ({
        ...prev,
        [field]: value,
      }));
      setHasUnsavedChanges(true);
    },
    []
  );

  const updateStrengthItem = useCallback(
    (index: number, field: 'title' | 'subtitle' | 'description', value: string) => {
      setDraftCreator((prev) => ({
        ...prev,
        strengths: prev.strengths.map((st, idx) =>
          idx === index ? { ...st, [field]: value } : st
        ),
      }));
      setHasUnsavedChanges(true);
    },
    []
  );

  const addStrengthItem = useCallback(
    (title: string, subtitle: string, description: string) => {
      setDraftCreator((prev) => ({
        ...prev,
        strengths: [
          ...prev.strengths,
          {
            title: title.trim(),
            subtitle: subtitle.trim() || 'จุดเด่นช่อง',
            description: description.trim() || 'รายละเอียดจุดขายของช่อง',
          },
        ],
      }));
      setHasUnsavedChanges(true);
    },
    []
  );

  const deleteStrengthItem = useCallback((index: number) => {
    setDraftCreator((prev) => ({
      ...prev,
      strengths: prev.strengths.filter((_, idx) => idx !== index),
    }));
    setHasUnsavedChanges(true);
  }, []);

  const updateContactField = useCallback(
    <K extends keyof CreatorProfile['contact']>(
      field: K,
      value: CreatorProfile['contact'][K]
    ) => {
      setDraftCreator((prev) => ({
        ...prev,
        contact: {
          ...prev.contact,
          [field]: value,
        },
      }));
      setHasUnsavedChanges(true);
    },
    []
  );

  // 1. RATES, PACKAGES, ADD-ONS, DEMOGRAPHICS & ANALYTICS MUTATORS
  const updatePackageField = useCallback(
    <K extends keyof RatePackage>(pkgId: string, field: K, value: RatePackage[K]) => {
      setDraftCreator((prev) => ({
        ...prev,
        packages: prev.packages.map((p) => (p.id === pkgId ? { ...p, [field]: value } : p)),
      }));
      setHasUnsavedChanges(true);
    },
    []
  );

  const updateAddOnField = useCallback(
    <K extends keyof AddOnItem>(addonId: string, field: K, value: AddOnItem[K]) => {
      setDraftCreator((prev) => ({
        ...prev,
        addOns: prev.addOns.map((a) => (a.id === addonId ? { ...a, [field]: value } : a)),
      }));
      setHasUnsavedChanges(true);
    },
    []
  );

  const addAddOnItem = useCallback(
    async (name: string, description: string, price: number) => {
      const newAddOn: AddOnItem = {
        id: `addon-${Date.now()}`,
        name: name.trim(),
        description: description.trim() || 'บริการเสริมสำหรับแคมเปญ',
        price: Number(price) || 500,
      };
      const updated: CreatorProfile = {
        ...draftCreator,
        addOns: [...draftCreator.addOns, newAddOn],
      };
      setDraftCreator(updated);
      await saveDraftChanges(updated, 'เพิ่มบริการเสริมใหม่เรียบร้อยแล้ว');
    },
    [draftCreator, saveDraftChanges]
  );

  const deleteAddOnItem = useCallback(
    async (addonId: string) => {
      const updated: CreatorProfile = {
        ...draftCreator,
        addOns: draftCreator.addOns.filter((a) => a.id !== addonId),
      };
      setDraftCreator(updated);
      await saveDraftChanges(updated, 'ลบบริการเสริมเรียบร้อยแล้ว');
    },
    [draftCreator, saveDraftChanges]
  );

  const updateOverviewStat = useCallback(
    (field: keyof CreatorProfile['overview'], value: string) => {
      setDraftCreator((prev) => ({
        ...prev,
        overview: {
          ...prev.overview,
          [field]: value,
        },
      }));
      setHasUnsavedChanges(true);
    },
    []
  );

  const updatePlatformStat = useCallback(
    <K extends keyof PlatformStat>(
      platformId: PlatformStat['id'],
      field: K,
      value: PlatformStat[K]
    ) => {
      setDraftCreator((prev) => ({
        ...prev,
        platforms: prev.platforms.map((pl) => {
          if (pl.id !== platformId) return pl;
          const updatedPlat: PlatformStat = { ...pl, [field]: value };
          if (field === 'followers' && typeof value === 'string') {
            const raw = value.trim().toUpperCase().replace(/,/g, '');
            const numMatch = raw.match(/[\d.]+/);
            if (numMatch) {
              let num = parseFloat(numMatch[0]);
              if (raw.includes('M')) num *= 1_000_000;
              else if (raw.includes('K')) num *= 1_000;
              if (!Number.isNaN(num) && num > 0) {
                updatedPlat.followersNum = Math.round(num);
              }
            }
          } else if (field === 'er' && typeof value === 'string') {
            const numMatch = value.match(/[\d.]+/);
            if (numMatch) {
              const num = parseFloat(numMatch[0]);
              if (!Number.isNaN(num)) {
                updatedPlat.erNum = num;
              }
            }
          }
          return updatedPlat;
        }),
      }));
      setHasUnsavedChanges(true);
    },
    []
  );

  const updateAgeGroupPercent = useCallback((index: number, percent: number) => {
    setDraftCreator((prev) => ({
      ...prev,
      demographics: {
        ...prev.demographics,
        ageGroups: prev.demographics.ageGroups.map((ag, idx) =>
          idx === index ? { ...ag, percent } : ag
        ),
      },
    }));
    setHasUnsavedChanges(true);
  }, []);

  const updateGenderPercent = useCallback((index: number, percent: number) => {
    setDraftCreator((prev) => ({
      ...prev,
      demographics: {
        ...prev.demographics,
        gender: prev.demographics.gender.map((g, idx) =>
          idx === index ? { ...g, percent } : g
        ),
      },
    }));
    setHasUnsavedChanges(true);
  }, []);

  const updateLocationField = useCallback(
    (index: number, field: 'name' | 'percent', value: string | number) => {
      setDraftCreator((prev) => ({
        ...prev,
        demographics: {
          ...prev.demographics,
          locations: prev.demographics.locations.map((loc, idx) =>
            idx === index ? { ...loc, [field]: value } : loc
          ),
        },
      }));
      setHasUnsavedChanges(true);
    },
    []
  );

  const updateFreePerkField = useCallback(
    (perkId: string, field: 'name' | 'priceLabel', value: string) => {
      setDraftCreator((prev) => ({
        ...prev,
        freePerks: prev.freePerks.map((pk) =>
          pk.id === perkId ? { ...pk, [field]: value } : pk
        ),
      }));
      setHasUnsavedChanges(true);
    },
    []
  );

  const updateCustomCollabNote = useCallback(
    (index: number, field: 'title' | 'description', value: string) => {
      setDraftCreator((prev) => ({
        ...prev,
        customCollabNotes: prev.customCollabNotes.map((n, idx) =>
          idx === index ? { ...n, [field]: value } : n
        ),
      }));
      setHasUnsavedChanges(true);
    },
    []
  );

  const updateSupportedFormats = useCallback((formats: string[]) => {
    setDraftCreator((prev) => ({
      ...prev,
      supportedFormats: formats,
    }));
    setHasUnsavedChanges(true);
  }, []);

  // 2. VIRAL MEDIA & GOOGLE DRIVE CRUD (CREATE + UPDATE + PIN + DELETE)
  const upsertViralWork = useCallback(
    async (payload: {
      id?: string;
      title: string;
      subtitle: string;
      views: string;
      likes: string;
      commentsCount: string;
      sharesCount: string;
      platform: ViralWorkItem['platform'];
      orientation?: 'vertical' | 'horizontal';
      duration?: string;
      category: string;
      tiktokUrl: string;
      driveImageUrl?: string;
      isPinned?: boolean;
      topCommentUser?: string;
      topCommentText?: string;
    }) => {
      const cleanDriveUrl = payload.driveImageUrl?.trim() || undefined;
      const isEditing = Boolean(payload.id);
      const existingItem = isEditing
        ? draftCreator.viralWorks.find((w) => w.id === payload.id)
        : undefined;

      const resolvedThumb = cleanDriveUrl
        ? resolveGoogleDriveImage(cleanDriveUrl)
        : existingItem?.thumbnailUrl || '/assets/juijui/viral-2.jpg';

      const constructed: ViralWorkItem = {
        id: payload.id || `work-${Date.now()}`,
        title: payload.title.trim(),
        subtitle: payload.subtitle.trim() || 'ผลงานไฮไลต์จากช่อง',
        views: payload.views.trim() || '100K',
        likes: payload.likes.trim() || '10K',
        commentsCount: payload.commentsCount.trim() || '200',
        sharesCount: payload.sharesCount.trim() || '1.5K',
        platform: payload.platform,
        orientation: payload.orientation || existingItem?.orientation || 'vertical',
        duration: payload.duration?.trim() || existingItem?.duration || '00:45',
        category: payload.category.trim() || 'Lifestyle',
        isPinned: payload.isPinned ?? true,
        isFeatured: true,
        thumbnailUrl: resolvedThumb,
        driveImageUrl: cleanDriveUrl,
        tiktokUrl: payload.tiktokUrl.trim() || 'https://www.tiktok.com/@juijui.j',
        topComments: payload.topCommentText?.trim()
          ? [
              {
                user: payload.topCommentUser?.trim() || '@viewer',
                text: payload.topCommentText.trim(),
                likes: existingItem?.topComments?.[0]?.likes || '1.2K',
              },
            ]
          : existingItem?.topComments || [],
      };

      const nextViralWorks = isEditing
        ? draftCreator.viralWorks.map((w) => (w.id === constructed.id ? constructed : w))
        : [constructed, ...draftCreator.viralWorks];

      const updated: CreatorProfile = {
        ...draftCreator,
        viralWorks: nextViralWorks,
      };

      setDraftCreator(updated);
      setEditingMediaItem(null);
      await saveDraftChanges(
        updated,
        isEditing ? 'อัปเดตข้อมูลผลงานไวรัลเรียบร้อยแล้ว' : 'เพิ่มผลงานไวรัลใหม่เรียบร้อยแล้ว'
      );
    },
    [draftCreator, saveDraftChanges]
  );

  const togglePinViralWork = useCallback(
    async (workId: string) => {
      const updated: CreatorProfile = {
        ...draftCreator,
        viralWorks: draftCreator.viralWorks.map((w) =>
          w.id === workId ? { ...w, isPinned: !w.isPinned } : w
        ),
      };
      setDraftCreator(updated);
      await saveDraftChanges(updated, 'อัปเดตสถานะการปักหมุด (Pinned) แล้ว');
    },
    [draftCreator, saveDraftChanges]
  );

  const deleteViralWork = useCallback(
    async (workId: string) => {
      const updated: CreatorProfile = {
        ...draftCreator,
        viralWorks: draftCreator.viralWorks.filter((w) => w.id !== workId),
      };
      setDraftCreator(updated);
      if (editingMediaItem?.id === workId) setEditingMediaItem(null);
      await saveDraftChanges(updated, 'ลบรายการผลงานเรียบร้อยแล้ว');
    },
    [draftCreator, editingMediaItem, saveDraftChanges]
  );

  // 3. COMMENTS & SOCIAL PROOF CRUD (CREATE + UPDATE + DELETE)
  const upsertCommentProof = useCallback(
    async (payload: {
      id?: string;
      authorName: string;
      authorHandle: string;
      authorType: CommentProofItem['authorType'];
      platform: string;
      content: string;
      likesCount: string;
      clipReference: string;
      clipUrl?: string;
      driveUrl?: string;
      dateLabel?: string;
    }) => {
      const isEditing = Boolean(payload.id);
      const cleanDrive = payload.driveUrl?.trim();
      const existing = isEditing
        ? draftCreator.commentProofs.find((c) => c.id === payload.id)
        : undefined;

      const constructed: CommentProofItem = {
        ...existing,
        id: payload.id || `cm-${Date.now()}`,
        authorName: payload.authorName.trim(),
        authorHandle: payload.authorHandle.trim() || 'Verified Audience',
        authorType: payload.authorType,
        platform: payload.platform.trim() || 'TikTok',
        content: payload.content.trim(),
        likesCount: payload.likesCount.trim() || '2.5K ไลค์',
        clipReference: payload.clipReference.trim() || `ผลงานช่อง ${draftCreator.nameTh}`,
        clipUrl: payload.clipUrl !== undefined ? payload.clipUrl.trim() : existing?.clipUrl,
        screenshotUrl: cleanDrive ? resolveGoogleDriveImage(cleanDrive) : existing?.screenshotUrl,
        dateLabel: payload.dateLabel?.trim() || 'พฤษภาคม 2569',
      };

      const nextComments = isEditing
        ? draftCreator.commentProofs.map((c) => (c.id === constructed.id ? constructed : c))
        : [constructed, ...draftCreator.commentProofs];

      const updated: CreatorProfile = {
        ...draftCreator,
        commentProofs: nextComments,
      };

      setDraftCreator(updated);
      setEditingCommentItem(null);
      await saveDraftChanges(
        updated,
        isEditing ? 'อัปเดตข้อความคอมเมนต์เรียบร้อยแล้ว' : 'เพิ่มคอมเมนต์รีวิวใหม่เรียบร้อยแล้ว'
      );
    },
    [draftCreator, saveDraftChanges]
  );

  const deleteCommentProof = useCallback(
    async (commentId: string) => {
      const updated: CreatorProfile = {
        ...draftCreator,
        commentProofs: draftCreator.commentProofs.filter((c) => c.id !== commentId),
      };
      setDraftCreator(updated);
      if (editingCommentItem?.id === commentId) setEditingCommentItem(null);
      await saveDraftChanges(updated, 'ลบคอมเมนต์รีวิวเรียบร้อยแล้ว');
    },
    [draftCreator, editingCommentItem, saveDraftChanges]
  );

  // 4. BOOKINGS CSV EXPORT
  const exportBookingsToCsv = useCallback(() => {
    if (!bookings.length) return;
    const headers = [
      'รหัสใบเสนอราคา',
      'วันที่ทำรายการ',
      'ครีเอเตอร์',
      'ชื่อแบรนด์/บริษัท',
      'ผู้ติดต่อ',
      'ช่องทางติดต่อ',
      'แพ็กเกจหลัก',
      'บริการเสริม',
      'ยอดรวมสุทธิ (บาท)',
      'วันที่เริ่มแคมเปญ',
      'สถานะ',
      'รายละเอียดบรีฟ',
    ];

    const escapeCsv = (val: string | number) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = bookings.map((bk) => [
      bk.quoteNumber,
      bk.createdAt,
      bk.creatorName,
      bk.brandName,
      bk.contactName,
      bk.contactChannel,
      bk.packageName,
      bk.selectedAddOns.map((a) => a.name).join(' + ') || '-',
      bk.totalPrice,
      bk.targetCampaignDate || 'ตามตกลง',
      bk.status,
      bk.productDetails || '-',
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.map(escapeCsv).join(','), ...rows.map((r) => r.map(escapeCsv).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JUIJUI_Bookings_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast('ดาวน์โหลดไฟล์ CSV รายการจองคิวงานแล้ว');
  }, [bookings, triggerToast]);

  // 5. ROSTER & JSON BACKUP EXPORT / IMPORT
  const exportCreatorJson = useCallback(() => {
    const jsonString = JSON.stringify(draftCreator, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MediaKit_Config_${draftCreator.nameEn.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast('ส่งออกไฟล์สำรองข้อมูล JSON เรียบร้อยแล้ว');
  }, [draftCreator, triggerToast]);

  const importCreatorJson = useCallback(
    async (jsonString: string) => {
      const parsed = JSON.parse(jsonString) as CreatorProfile;
      if (!parsed || !parsed.nameTh || !Array.isArray(parsed.packages)) {
        throw new Error('รูปแบบไฟล์ JSON ไม่ถูกต้อง');
      }
      const merged: CreatorProfile = {
        ...draftCreator,
        ...parsed,
        id: draftCreator.id,
      };
      setDraftCreator(merged);
      await saveDraftChanges(merged, 'นำเข้าและอัปเดตข้อมูลจากไฟล์ JSON สำเร็จ');
    },
    [draftCreator, saveDraftChanges]
  );

  const createNewRosterCreator = useCallback(
    async (params: {
      nameTh: string;
      nameEn: string;
      roleTitle: string;
      totalFollowers: string;
      starterPrice: number;
    }) => {
      const basePrice = Number(params.starterPrice) || 5000;
      await onAddCreator({
        id: `creator-${Date.now()}`,
        nameTh: params.nameTh.trim(),
        nameEn: params.nameEn.trim() || params.nameTh.trim().toUpperCase(),
        roleTitle: params.roleTitle.trim(),
        tierLabel: `Creator · ${params.totalFollowers} Followers`,
        overview: {
          ...creator.overview,
          totalFollowers: params.totalFollowers,
        },
        packages: [
          {
            ...creator.packages[0],
            id: `pkg-starter-${Date.now()}`,
            price: basePrice,
          },
          {
            ...creator.packages[1],
            id: `pkg-standard-${Date.now()}`,
            price: Math.round(basePrice * 1.25),
          },
          {
            ...creator.packages[2],
            id: `pkg-premium-${Date.now()}`,
            price: Math.round(basePrice * 2.4),
          },
        ],
      });
      triggerToast(`สร้างโปรไฟล์ ${params.nameTh} เรียบร้อยแล้ว`);
    },
    [creator, onAddCreator, triggerToast]
  );

  // 3B. BRAND COLLABORATIONS & SHOWCASE CRUD (60+ BRANDS)
  const updateShowcaseConfig = useCallback(
    (field: keyof BrandShowcaseConfig, value: string) => {
      setDraftCreator((prev) => {
        const currentConfig = prev.brandShowcaseConfig ||
          INITIAL_CREATORS[0].brandShowcaseConfig || {
            badgeText: 'BRAND PARTNERSHIPS · 62+ TRUSTED CLIENTS',
            sectionTitle: 'ประวัติการร่วมงาน 60 กว่าแบรนด์ชั้นนำ',
            sectionSubtitle: '',
            totalBrandsStat: '62+ แบรนด์',
            repeatRateStat: '78% ลูกค้าจ้างซ้ำ',
            sponsoredViewsStat: '45M+ ยอดวิวสะสม',
          };
        return {
          ...prev,
          brandShowcaseConfig: {
            ...currentConfig,
            [field]: value,
          },
        };
      });
      setHasUnsavedChanges(true);
    },
    []
  );

  const upsertBrandCollaboration = useCallback(
    async (payload: {
      id?: string;
      brandName: string;
      brandNameTh?: string;
      category: BrandCategoryType;
      logoUrl?: string;
      brandColor?: string;
      campaignCount: number;
      isRepeatPartner: boolean;
      totalViews: string;
      avgEngagement: string;
      latestPeriod: string;
      videoStyles: string[];
      deliverablesSummary: string;
      campaignHighlight: string;
      clientQuote?: string;
      clientRole?: string;
      sampleClips: BrandSampleClip[];
    }) => {
      const currentBrands =
        draftCreator.brandCollaborations || INITIAL_CREATORS[0].brandCollaborations || [];
      const isEditing = Boolean(payload.id);

      const constructed: BrandCollaborationItem = {
        id: payload.id || `brand-${Date.now()}`,
        brandName: payload.brandName.trim(),
        brandNameTh: payload.brandNameTh?.trim() || undefined,
        category: payload.category,
        logoUrl: payload.logoUrl?.trim() || undefined,
        brandColor: payload.brandColor || '#4C1D95',
        campaignCount: Number(payload.campaignCount) || 1,
        isRepeatPartner: Boolean(payload.isRepeatPartner),
        isFeatured: true,
        totalViews: payload.totalViews.trim() || '1.0M+',
        avgEngagement: payload.avgEngagement.trim() || '7.5%',
        latestPeriod: payload.latestPeriod.trim() || '2569',
        videoStyles: payload.videoStyles,
        deliverablesSummary: payload.deliverablesSummary.trim(),
        campaignHighlight: payload.campaignHighlight.trim(),
        clientQuote: payload.clientQuote?.trim() || undefined,
        clientRole: payload.clientRole?.trim() || undefined,
        sampleClips: payload.sampleClips,
      };

      const nextBrands = isEditing
        ? currentBrands.map((b) => (b.id === constructed.id ? constructed : b))
        : [constructed, ...currentBrands];

      const updated: CreatorProfile = {
        ...draftCreator,
        brandCollaborations: nextBrands,
      };

      setDraftCreator(updated);
      setEditingBrandItem(null);
      await saveDraftChanges(
        updated,
        isEditing
          ? `อัปเดตข้อมูลแบรนด์ ${constructed.brandName} เรียบร้อยแล้ว`
          : `เพิ่มแบรนด์ ${constructed.brandName} เข้าทำเนียบเรียบร้อยแล้ว`
      );
    },
    [draftCreator, saveDraftChanges]
  );

  const deleteBrandCollaboration = useCallback(
    async (brandId: string) => {
      const currentBrands =
        draftCreator.brandCollaborations || INITIAL_CREATORS[0].brandCollaborations || [];
      const updated: CreatorProfile = {
        ...draftCreator,
        brandCollaborations: currentBrands.filter((b) => b.id !== brandId),
      };
      setDraftCreator(updated);
      if (editingBrandItem?.id === brandId) setEditingBrandItem(null);
      await saveDraftChanges(updated, 'ลบรายชื่อแบรนด์เรียบร้อยแล้ว');
    },
    [draftCreator, editingBrandItem, saveDraftChanges]
  );

  return {
    activeTab,
    setActiveTab,
    draftCreator,
    allCreators,
    bookings,
    hasUnsavedChanges,
    isSaving,
    savedNotice,
    // Tab 0 (Identity & Contact) actions
    updateRootField,
    updateStrengthItem,
    addStrengthItem,
    deleteStrengthItem,
    updateContactField,
    // Tab 1 (Rates & Analytics) actions
    updatePackageField,
    updateAddOnField,
    addAddOnItem,
    deleteAddOnItem,
    updateOverviewStat,
    updatePlatformStat,
    updateAgeGroupPercent,
    updateGenderPercent,
    updateLocationField,
    updateFreePerkField,
    updateCustomCollabNote,
    updateSupportedFormats,
    saveDraftChanges,
    onResetDefaults,
    // Tab 2 (Media) actions
    editingMediaItem,
    setEditingMediaItem,
    upsertViralWork,
    togglePinViralWork,
    deleteViralWork,
    // Tab 3 (Brands 60+) actions
    editingBrandItem,
    setEditingBrandItem,
    updateShowcaseConfig,
    upsertBrandCollaboration,
    deleteBrandCollaboration,
    // Tab 4 (Comments) actions
    editingCommentItem,
    setEditingCommentItem,
    upsertCommentProof,
    deleteCommentProof,
    // Tab 5 (Bookings) actions
    onUpdateBookingStatus,
    exportBookingsToCsv,
    // Tab 6 (Roster) actions
    onSelectCreatorId,
    createNewRosterCreator,
    exportCreatorJson,
    importCreatorJson,
  };
}
