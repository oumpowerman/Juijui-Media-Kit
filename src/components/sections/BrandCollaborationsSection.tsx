import React, { useState, useMemo } from 'react';
import {
  Search,
  Repeat,
  Sparkles,
  SlidersHorizontal,
  CheckCircle2,
  FileText,
  ExternalLink,
  Filter,
  Crown,
  Building2,
  Clapperboard,
  RotateCcw,
  Eye,
} from 'lucide-react';
import {
  BrandCollaborationItem,
  BrandCategoryType,
  CreatorProfile,
} from '../../data/creatorData';
import { AdminTabType } from '../../hooks/useCreatorStudio';
import { BrandInfiniteStream } from '../BrandInfiniteStream';
import {
  getBrandTier,
  LogoFirstBrandToken,
} from '../BrandTokenShared';

interface BrandCollaborationsSectionProps {
  creator: CreatorProfile;
  onSelectBrand: (brand: BrandCollaborationItem) => void;
  onOpenAdminTab?: (tab: AdminTabType) => void;
}

const CATEGORY_FILTERS: { id: 'ALL' | BrandCategoryType; label: string }[] = [
  { id: 'ALL', label: 'ทั้งหมด (All Brands)' },
  { id: 'Food & Beverage', label: 'อาหารและเครื่องดื่ม (F&B)' },
  { id: 'Tech, Telecom & Apps', label: 'เทคโนโลยี & แอปพลิเคชัน' },
  { id: 'Beauty & Personal Care', label: 'บิวตี้ & ของใช้ส่วนตัว' },
  { id: 'Retail, Home & Lifestyle', label: 'ห้างสรรพสินค้า & ไลฟ์สไตล์' },
  { id: 'Gaming & Entertainment', label: 'เกม & เอ็นเตอร์เทนเมนต์' },
];

export const BrandCollaborationsSection: React.FC<BrandCollaborationsSectionProps> = ({
  creator,
  onSelectBrand,
  onOpenAdminTab,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | BrandCategoryType>('ALL');
  const [repeatOnly, setRepeatOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSlidePreview, setShowSlidePreview] = useState(false);

  const brands = creator.brandCollaborations || [];
  const config = creator.brandShowcaseConfig || {
    badgeText: 'BRAND PARTNERSHIPS · 60+ TRUSTED CLIENTS',
    sectionTitle: 'ประวัติการร่วมงาน 60 กว่าแบรนด์ชั้นนำ',
    sectionSubtitle:
      'รวมผลงานแคมเปญโฆษณาจริงจากแบรนด์ระดับประเทศและโกลบอล แบ่งตามความถี่ในการร่วมงาน ชี้เมาส์ที่โลโก้เพื่อดูสถิติ หรือคลิกเพื่อดูคลิปตัวอย่างได้ทันที',
    totalBrandsStat: `${brands.length}+ แบรนด์`,
    repeatRateStat: '78% ลูกค้าจ้างซ้ำ',
    sponsoredViewsStat: '45M+ ยอดวิวสะสม',
    referenceSlideUrl: '/assets/aistudio/_______0d429d60.pdf',
  };

  const totalCampaignsCount = useMemo(
    () => brands.reduce((acc, item) => acc + (Number(item.campaignCount) || 1), 0),
    [brands]
  );

  const repeatPartnersCount = useMemo(
    () => brands.filter((b) => b.isRepeatPartner || b.campaignCount > 1).length,
    [brands]
  );

  const filteredBrands = useMemo(() => {
    return brands.filter((b) => {
      if (selectedCategory !== 'ALL' && b.category !== selectedCategory) return false;
      if (repeatOnly && !b.isRepeatPartner && b.campaignCount <= 1) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchEn = b.brandName.toLowerCase().includes(q);
        const matchTh = b.brandNameTh?.toLowerCase().includes(q);
        const matchStyle = b.videoStyles.some((s) => s.toLowerCase().includes(q));
        const matchCat = b.category.toLowerCase().includes(q);
        return matchEn || matchTh || matchStyle || matchCat;
      }
      return true;
    });
  }, [brands, selectedCategory, repeatOnly, searchQuery]);

  // Grouped by 3 Tiers: VIP (5+ times), Repeat (3-4 times), Standard (1-2 times)
  const tieredGroups = useMemo(() => {
    const sorted = [...filteredBrands].sort(
      (a, b) => (b.campaignCount || 1) - (a.campaignCount || 1)
    );
    return {
      vip: sorted.filter((b) => getBrandTier(b) === 'vip'),
      repeat: sorted.filter((b) => getBrandTier(b) === 'repeat'),
      standard: sorted.filter((b) => getBrandTier(b) === 'standard'),
    };
  }, [filteredBrands]);

  return (
    <section id="brands" className="scroll-mt-16">
      {/* TOP SEAM CONVEYOR: Before reaching the Brand Collaborations section */}
      <BrandInfiniteStream
        brands={brands}
        onSelectBrand={onSelectBrand}
        direction="left"
        tooltipPosition="bottom"
      />

      <div className="pt-16 sm:pt-20 pb-8 sm:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header + Quick Edit Button */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-violet-700 tracking-wider uppercase mb-2.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{config.badgeText}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                {config.sectionTitle}
              </h2>
              <p className="mt-2.5 text-sm sm:text-base text-slate-600 leading-relaxed">
                {config.sectionSubtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {config.referenceSlideUrl && (
                <button
                  type="button"
                  onClick={() => setShowSlidePreview((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5 text-violet-700" />
                  <span>
                    {showSlidePreview
                      ? 'ซ่อนสไลด์ต้นฉบับ (Page 04)'
                      : 'ดูสไลด์ต้นฉบับ (Page 04)'}
                  </span>
                </button>
              )}
              {onOpenAdminTab && (
                <button
                  type="button"
                  onClick={() => onOpenAdminTab('brands')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-violet-200 bg-violet-50/80 hover:bg-violet-100 text-violet-900 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-violet-700" />
                  <span>จัดการโลโก้และประวัติแบรนด์ (CMS)</span>
                </button>
              )}
            </div>
          </div>

          {/* Optional Original PDF Slide 04 Reference Drawer */}
          {showSlidePreview && config.referenceSlideUrl && (
            <div className="mb-8 bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    สไลด์ต้นฉบับจาก Media Kit (Page 04: ประวัติการร่วมงาน 60 กว่าแบรนด์)
                  </h3>
                  <p className="text-xs text-slate-500">
                    ข้อมูลแบรนด์ทั้งหมดด้านล่างถูกถอดรหัสจากสไลด์นี้ พร้อมเพิ่มระบบคลิกดูรายละเอียดเชิงลึกและอัปโหลดโลโก้ผ่าน Google Drive
                  </p>
                </div>
                <a
                  href={config.referenceSlideUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <span>เปิดไฟล์สไลด์เต็ม</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="w-full h-[380px] sm:h-[460px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-900">
                <iframe
                  src={config.referenceSlideUrl}
                  title="Brand Collaborations Slide 04"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}

          {/* Executive Track Record KPI Strip with Clean Glassmorphism & Uncontaminated Thai Typography */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {/* CARD 1: Total Brands */}
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-[0_10px_28px_-10px_rgba(79,70,229,0.08),inset_0_1px_1.5px_rgba(255,255,255,1)] hover:-translate-y-1 hover:border-violet-300 transition-all duration-200 relative overflow-hidden group">
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-linear-to-r from-transparent via-violet-300/60 to-transparent pointer-events-none" />
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-xs font-semibold text-slate-500 line-clamp-1">
                  จำนวนแบรนด์ที่ไว้วางใจร่วมงาน
                </span>
                <div className="w-8 h-8 rounded-xl bg-violet-100/90 text-violet-700 border border-violet-200/70 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-violet-700 group-hover:text-white transition-colors duration-200">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5">
                <span className="text-3xl sm:text-4xl font-bold font-mono-num text-slate-900 tracking-tight">
                  {config.totalBrandsStat
                    ? config.totalBrandsStat.replace(/[^0-9+M%k]/gi, '').trim() || `${brands.length}+`
                    : `${brands.length}+`}
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-700 font-sans">
                  แบรนด์
                </span>
              </div>
              <div className="mt-2 text-[11px] font-semibold text-violet-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3 shrink-0" />
                <span>ครอบคลุม 5 อุตสาหกรรมหลัก</span>
              </div>
            </div>

            {/* CARD 2: Total Campaigns */}
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-[0_10px_28px_-10px_rgba(79,70,229,0.08),inset_0_1px_1.5px_rgba(255,255,255,1)] hover:-translate-y-1 hover:border-indigo-300 transition-all duration-200 relative overflow-hidden group">
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-linear-to-r from-transparent via-indigo-300/60 to-transparent pointer-events-none" />
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-xs font-semibold text-slate-500 line-clamp-1">
                  จำนวนแคมเปญโฆษณาสะสม
                </span>
                <div className="w-8 h-8 rounded-xl bg-indigo-100/90 text-indigo-700 border border-indigo-200/70 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-indigo-700 group-hover:text-white transition-colors duration-200">
                  <Clapperboard className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5">
                <span className="text-3xl sm:text-4xl font-bold font-mono-num text-slate-900 tracking-tight">
                  {totalCampaignsCount}+
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-700 font-sans">
                  แคมเปญ
                </span>
              </div>
              <div className="mt-2 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-600" />
                <span>ส่งมอบงานตรงเวลา 100%</span>
              </div>
            </div>

            {/* CARD 3: Repeat Clients */}
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-[0_10px_28px_-10px_rgba(16,185,129,0.08),inset_0_1px_1.5px_rgba(255,255,255,1)] hover:-translate-y-1 hover:border-emerald-300 transition-all duration-200 relative overflow-hidden group">
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-linear-to-r from-transparent via-emerald-300/60 to-transparent pointer-events-none" />
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-xs font-semibold text-slate-500 line-clamp-1">
                  สัดส่วนลูกค้าประจำ (Repeat Clients)
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100/90 text-emerald-700 border border-emerald-200/70 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-emerald-700 group-hover:text-white transition-colors duration-200">
                  <RotateCcw className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5">
                <span className="text-3xl sm:text-4xl font-bold font-mono-num text-emerald-700 tracking-tight">
                  {config.repeatRateStat
                    ? config.repeatRateStat.replace(/[^0-9%]/g, '').trim() || '78%'
                    : '78%'}
                </span>
                <span className="text-sm sm:text-base font-bold text-emerald-800 font-sans">
                  ลูกค้าจ้างซ้ำ
                </span>
              </div>
              <div className="mt-2 text-[11px] font-semibold text-slate-600">
                {repeatPartnersCount} แบรนด์กลับมาจ้างซ้ำต่อเนื่อง
              </div>
            </div>

            {/* CARD 4: Sponsored Views */}
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-[0_10px_28px_-10px_rgba(245,158,11,0.08),inset_0_1px_1.5px_rgba(255,255,255,1)] hover:-translate-y-1 hover:border-amber-300 transition-all duration-200 relative overflow-hidden group">
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-linear-to-r from-transparent via-amber-300/60 to-transparent pointer-events-none" />
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-xs font-semibold text-slate-500 line-clamp-1">
                  ยอดวิวรวมเฉพาะคลิปสปอนเซอร์
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-100/90 text-amber-700 border border-amber-200/70 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-amber-600 group-hover:text-white transition-colors duration-200">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5">
                <span className="text-3xl sm:text-4xl font-bold font-mono-num text-slate-900 tracking-tight">
                  {config.sponsoredViewsStat
                    ? config.sponsoredViewsStat.replace(/[^0-9+M%k]/gi, '').trim() || '45M+'
                    : '45M+'}
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-700 font-sans">
                  ยอดวิวสะสม
                </span>
              </div>
              <div className="mt-2 text-[11px] font-semibold text-slate-600">
                ป้ายยาแนบเนียน คนดูไม่ปัดหนี
              </div>
            </div>
          </div>

          {/* Clean Filter & Search Bar */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 mb-6 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
              {/* Category Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 mr-1 shrink-0">
                  <Filter className="w-3.5 h-3.5" />
                  <span>หมวดหมู่:</span>
                </span>
                {CATEGORY_FILTERS.map((cat) => {
                  const active = selectedCategory === cat.id;
                  const count =
                    cat.id === 'ALL'
                      ? brands.length
                      : brands.filter((b) => b.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                        active
                          ? 'bg-[#1E1B4B] text-white shadow-2xs'
                          : 'bg-slate-50 text-slate-600 border border-slate-200/70 hover:bg-slate-100'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono-num font-bold ${
                          active ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search & Repeat Filter */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setRepeatOnly((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    repeatOnly
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>เฉพาะลูกค้าจ้างซ้ำ ({repeatPartnersCount})</span>
                </button>

                <div className="relative flex-1 sm:w-60">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ค้นหาชื่อแบรนด์ หรือแนวคลิป..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-900 focus:outline-none focus:border-violet-600 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SINGLE UNIFIED VIEW: STATIC 3-TIERED LOGO SHOWCASE */}
          {filteredBrands.length > 0 ? (
            <div className="space-y-6">
              {/* Tier 1: VIP Partners (5+ Campaigns — Largest XL Logos) */}
              {tieredGroups.vip.length > 0 && (
                <div className="bg-white border border-amber-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Crown className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                          ระดับที่ 1 · VIP Flagship Partners (ร่วมงาน 5 ครั้งขึ้นไป)
                        </h3>
                        <p className="text-xs text-slate-500">
                          แบรนด์หลักที่ไว้วางใจจ้างซ้ำสูงสุด · ชี้เมาส์ที่โลโก้เพื่อดูยอดวิวและคลิกเพื่อดูคลิปตัวอย่าง
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono-num font-semibold text-amber-800">
                      {tieredGroups.vip.length} แบรนด์
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-5 sm:gap-6 pt-1 pb-3">
                    {tieredGroups.vip.map((brand) => (
                      <LogoFirstBrandToken
                        key={brand.id}
                        brand={brand}
                        sizeOverride="vip"
                        onSelectBrand={onSelectBrand}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Tier 2: Regular Repeat Partners (3–4 Campaigns — Medium MD Logos) */}
              {tieredGroups.repeat.length > 0 && (
                <div className="bg-white border border-emerald-200/80 rounded-3xl p-5 sm:p-6 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Repeat className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                          ระดับที่ 2 · Regular Repeat Partners (ร่วมงาน 3–4 ครั้ง)
                        </h3>
                        <p className="text-xs text-slate-500">
                          ลูกค้าประจำที่กลับมาจ้างซ้ำต่อเนื่องจากผลลัพธ์แคมเปญที่คุ้มค่า
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono-num font-semibold text-emerald-800">
                      {tieredGroups.repeat.length} แบรนด์
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 sm:gap-5 pt-1 pb-3">
                    {tieredGroups.repeat.map((brand) => (
                      <LogoFirstBrandToken
                        key={brand.id}
                        brand={brand}
                        sizeOverride="repeat"
                        onSelectBrand={onSelectBrand}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Tier 3: Trusted Brand Partners (1–2 Campaigns — Compact SM Logos) */}
              {tieredGroups.standard.length > 0 && (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                          ระดับที่ 3 · Trusted Brand Partners (ร่วมงาน 1–2 ครั้ง)
                        </h3>
                        <p className="text-xs text-slate-500">
                          พาร์ทเนอร์แบรนด์ชั้นนำจากหลากหลายอุตสาหกรรม จัดเรียงขนาดกะทัดรัดดูง่าย
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono-num font-semibold text-slate-600">
                      {tieredGroups.standard.length} แบรนด์
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 pt-1 pb-3">
                    {tieredGroups.standard.map((brand) => (
                      <LogoFirstBrandToken
                        key={brand.id}
                        brand={brand}
                        sizeOverride="standard"
                        onSelectBrand={onSelectBrand}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty Filter State */
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center my-4">
              <p className="text-sm font-bold text-slate-800 mb-1">
                ไม่พบรายชื่อแบรนด์ที่ตรงกับตัวกรอง
              </p>
              <p className="text-xs text-slate-500 mb-4">
                ลองเปลี่ยนคำค้นหา หรือกดดูหมวดหมู่ทั้งหมด
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('ALL');
                  setRepeatOnly(false);
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-[#1E1B4B] text-white text-xs font-semibold cursor-pointer"
              >
                แสดงแบรนด์ทั้งหมด ({brands.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM SEAM CONVEYOR: After finishing the Brand Collaborations section */}
      <div className="pb-8 sm:pb-10">
        <BrandInfiniteStream
          brands={[...brands].reverse()}
          onSelectBrand={onSelectBrand}
          direction="left"
          tooltipPosition="top"
        />
      </div>
    </section>
  );
};
