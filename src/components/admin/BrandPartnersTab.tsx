import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Repeat,
  Check,
  Search,
  Image as ImageIcon,
  ExternalLink,
  Sparkles,
  Play,
} from 'lucide-react';
import {
  BrandCollaborationItem,
  BrandCategoryType,
  BrandSampleClip,
  BrandShowcaseConfig,
  resolveGoogleDriveImage,
} from '../../data/creatorData';

interface BrandPartnersTabProps {
  brands: BrandCollaborationItem[];
  showcaseConfig: BrandShowcaseConfig;
  editingBrandItem: BrandCollaborationItem | null;
  onSetEditingBrandItem: (item: BrandCollaborationItem | null) => void;
  onUpdateShowcaseConfig: (field: keyof BrandShowcaseConfig, value: string) => void;
  onUpsertBrandCollaboration: (payload: {
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
  }) => Promise<void>;
  onDeleteBrandCollaboration: (brandId: string) => Promise<void>;
}

const CATEGORIES: BrandCategoryType[] = [
  'Food & Beverage',
  'Tech, Telecom & Apps',
  'Beauty & Personal Care',
  'Retail, Home & Lifestyle',
  'Gaming & Entertainment',
];

export const BrandPartnersTab: React.FC<BrandPartnersTabProps> = ({
  brands,
  showcaseConfig,
  editingBrandItem,
  onSetEditingBrandItem,
  onUpdateShowcaseConfig,
  onUpsertBrandCollaboration,
  onDeleteBrandCollaboration,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [brandName, setBrandName] = useState('');
  const [brandNameTh, setBrandNameTh] = useState('');
  const [category, setCategory] = useState<BrandCategoryType>('Food & Beverage');
  const [logoUrl, setLogoUrl] = useState('');
  const [brandColor, setBrandColor] = useState('#4C1D95');
  const [campaignCount, setCampaignCount] = useState(2);
  const [isRepeatPartner, setIsRepeatPartner] = useState(true);
  const [totalViews, setTotalViews] = useState('1.2M+');
  const [avgEngagement, setAvgEngagement] = useState('7.8%');
  const [latestPeriod, setLatestPeriod] = useState('มีนาคม 2569');
  const [videoStylesText, setVideoStylesText] = useState(
    'Comedy Sketch คู่เพื่อน, ป้ายยาสินค้าเนียนๆ'
  );
  const [deliverablesSummary, setDeliverablesSummary] = useState(
    'TikTok 2 คลิป + IG Reels Cross-post'
  );
  const [campaignHighlight, setCampaignHighlight] = useState('');
  const [clientQuote, setClientQuote] = useState('');
  const [clientRole, setClientRole] = useState('');

  // Sample Clip #1 & #2 quick fields
  const [clip1Title, setClip1Title] = useState('');
  const [clip1Platform, setClip1Platform] =
    useState<BrandSampleClip['platform']>('TikTok');
  const [clip1Views, setClip1Views] = useState('850K');
  const [clip1Url, setClip1Url] = useState('https://www.tiktok.com/@juijui.j');
  const [clip1Format, setClip1Format] = useState('Comedy Sitcom (9:16)');
  const [clip1Desc, setClip1Desc] = useState('');
  const [clip1Campaign, setClip1Campaign] = useState('');

  useEffect(() => {
    if (editingBrandItem) {
      setBrandName(editingBrandItem.brandName);
      setBrandNameTh(editingBrandItem.brandNameTh || '');
      setCategory(editingBrandItem.category);
      setLogoUrl(editingBrandItem.logoUrl || '');
      setBrandColor(editingBrandItem.brandColor || '#4C1D95');
      setCampaignCount(editingBrandItem.campaignCount || 1);
      setIsRepeatPartner(Boolean(editingBrandItem.isRepeatPartner));
      setTotalViews(editingBrandItem.totalViews || '1.0M+');
      setAvgEngagement(editingBrandItem.avgEngagement || '7.5%');
      setLatestPeriod(editingBrandItem.latestPeriod || '2569');
      setVideoStylesText((editingBrandItem.videoStyles || []).join(', '));
      setDeliverablesSummary(editingBrandItem.deliverablesSummary || '');
      setCampaignHighlight(editingBrandItem.campaignHighlight || '');
      setClientQuote(editingBrandItem.clientQuote || '');
      setClientRole(editingBrandItem.clientRole || '');

      const firstClip = editingBrandItem.sampleClips?.[0];
      if (firstClip) {
        setClip1Title(firstClip.title);
        setClip1Platform(firstClip.platform);
        setClip1Views(firstClip.views);
        setClip1Url(firstClip.url);
        setClip1Format(firstClip.formatTag);
        setClip1Desc(firstClip.description || '');
        setClip1Campaign(firstClip.campaignName || '');
      } else {
        setClip1Title('');
        setClip1Platform('TikTok');
        setClip1Views('500K');
        setClip1Url('https://www.tiktok.com/@juijui.j');
        setClip1Format('Short Video (9:16)');
        setClip1Desc('');
        setClip1Campaign('');
      }
    } else {
      setBrandName('');
      setBrandNameTh('');
      setCategory('Food & Beverage');
      setLogoUrl('');
      setBrandColor('#4C1D95');
      setCampaignCount(2);
      setIsRepeatPartner(true);
      setTotalViews('1.2M+');
      setAvgEngagement('7.8%');
      setLatestPeriod('เมษายน 2569');
      setVideoStylesText('Comedy Sketch คู่เพื่อน, ป้ายยาไลฟ์สไตล์');
      setDeliverablesSummary('TikTok 2 คลิป + IG Reels');
      setCampaignHighlight('');
      setClientQuote('');
      setClientRole('');
      setClip1Title('');
      setClip1Platform('TikTok');
      setClip1Views('750K');
      setClip1Url('https://www.tiktok.com/@juijui.j');
      setClip1Format('Comedy Sitcom (9:16)');
      setClip1Desc('');
      setClip1Campaign('');
    }
  }, [editingBrandItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;

    const styles = videoStylesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const sampleClips: BrandSampleClip[] = clip1Title.trim()
      ? [
          {
            id: editingBrandItem?.sampleClips?.[0]?.id || `clip-${Date.now()}`,
            title: clip1Title.trim(),
            platform: clip1Platform,
            views: clip1Views.trim() || '500K',
            url: clip1Url.trim() || 'https://www.tiktok.com/@juijui.j',
            formatTag: clip1Format.trim() || 'Short Video',
            description: clip1Desc.trim() || undefined,
            campaignName: clip1Campaign.trim() || undefined,
          },
          ...(editingBrandItem?.sampleClips?.slice(1) || []),
        ]
      : editingBrandItem?.sampleClips || [];

    await onUpsertBrandCollaboration({
      id: editingBrandItem?.id,
      brandName: brandName.trim(),
      brandNameTh: brandNameTh.trim() || undefined,
      category,
      logoUrl: logoUrl.trim() || undefined,
      brandColor: brandColor.trim() || '#4C1D95',
      campaignCount: Number(campaignCount) || 1,
      isRepeatPartner,
      totalViews: totalViews.trim() || '1.0M+',
      avgEngagement: avgEngagement.trim() || '7.5%',
      latestPeriod: latestPeriod.trim() || '2569',
      videoStyles: styles.length ? styles : ['Lifestyle & Comedy'],
      deliverablesSummary: deliverablesSummary.trim() || 'TikTok + Reels',
      campaignHighlight:
        campaignHighlight.trim() ||
        `ร่วมงานแคมเปญโปรโมตสินค้ากับ ${brandName.trim()} ถ่ายทอดจุดขายอย่างเป็นธรรมชาติ`,
      clientQuote: clientQuote.trim() || undefined,
      clientRole: clientRole.trim() || undefined,
      sampleClips,
    });
  };

  const filteredBrands = brands.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.brandName.toLowerCase().includes(q) ||
      (b.brandNameTh && b.brandNameTh.toLowerCase().includes(q)) ||
      b.category.toLowerCase().includes(q)
    );
  });

  const previewLogoUrl = logoUrl ? resolveGoogleDriveImage(logoUrl) : '';

  return (
    <div className="space-y-6">
      {/* 1. Section Heading & KPI Banner Customizer */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-800 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>ตั้งค่าหัวข้อและสถิติภาพรวมส่วนลูกค้า 60+ แบรนด์ (กดปุ่มสีม่วงด้านล่างเพื่อบันทึก)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              ป้ายกำกับด้านบน (Badge Text)
            </label>
            <input
              type="text"
              value={showcaseConfig.badgeText}
              onChange={(e) => onUpdateShowcaseConfig('badgeText', e.target.value)}
              placeholder="BRAND PARTNERSHIPS · 62+ TRUSTED CLIENTS"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-violet-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              หัวข้อหลัก (Section Title)
            </label>
            <input
              type="text"
              value={showcaseConfig.sectionTitle}
              onChange={(e) => onUpdateShowcaseConfig('sectionTitle', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-violet-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              ตัวเลขจำนวนแบรนด์รวม (KPI 1)
            </label>
            <input
              type="text"
              value={showcaseConfig.totalBrandsStat}
              onChange={(e) => onUpdateShowcaseConfig('totalBrandsStat', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-violet-600"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              คำอธิบายใต้หัวข้อ (Section Subtitle)
            </label>
            <input
              type="text"
              value={showcaseConfig.sectionSubtitle}
              onChange={(e) => onUpdateShowcaseConfig('sectionSubtitle', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-violet-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              อัตราจ้างซ้ำ / ยอดวิวสะสม (KPI 2 & 4)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={showcaseConfig.repeatRateStat}
                onChange={(e) => onUpdateShowcaseConfig('repeatRateStat', e.target.value)}
                placeholder="78% ลูกค้าจ้างซ้ำ"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-violet-600"
              />
              <input
                type="text"
                value={showcaseConfig.sponsoredViewsStat}
                onChange={(e) =>
                  onUpdateShowcaseConfig('sponsoredViewsStat', e.target.value)
                }
                placeholder="45M+ ยอดวิวสะสม"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-violet-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Two-Column Layout: Form Editor (Left) + 60+ Brand Roster List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Add / Edit Brand Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {editingBrandItem
                  ? `กำลังแก้ไข: ${editingBrandItem.brandName}`
                  : 'เพิ่มแบรนด์ลูกค้าใหม่ (Add Brand Partner)'}
              </h3>
              <p className="text-[11px] text-slate-500">
                รองรับลิงก์รูปโลโก้จาก Google Drive (.png, .jpg, .webp)
              </p>
            </div>
            {editingBrandItem && (
              <button
                type="button"
                onClick={() => onSetEditingBrandItem(null)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-semibold cursor-pointer"
              >
                +โหมดเพิ่มแบรนด์ใหม่
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                ชื่อแบรนด์ (ภาษาอังกฤษ/หลัก) *
              </label>
              <input
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="เช่น KFC, Grab, Samsung"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                ชื่อไทย / รายละเอียดสั้น
              </label>
              <input
                type="text"
                value={brandNameTh}
                onChange={(e) => setBrandNameTh(e.target.value)}
                placeholder="เช่น เคเอฟซี ประเทศไทย"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                หมวดหมู่อุตสาหกรรม
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BrandCategoryType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                จำนวนครั้งที่ร่วมงาน (แคมเปญ)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={campaignCount}
                  onChange={(e) => setCampaignCount(Number(e.target.value))}
                  className="w-20 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono-num font-bold text-slate-900"
                />
                <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isRepeatPartner}
                    onChange={(e) => setIsRepeatPartner(e.target.checked)}
                    className="rounded border-slate-300 text-violet-700"
                  />
                  <span>ลูกค้าจ้างซ้ำ</span>
                </label>
              </div>
            </div>
          </div>

          {/* Google Drive Logo URL Input + Live Preview */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-violet-700" />
                <span>ลิงก์โลโก้แบรนด์ (Google Drive แชร์ลิงก์ หรือ URL รูป PNG/JPG)</span>
              </label>
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                title="สีประจำแบรนด์"
                className="w-6 h-6 rounded cursor-pointer border-0"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <div
                className="w-11 h-11 rounded-xl border border-slate-200 bg-white flex items-center justify-center shrink-0 overflow-hidden"
                style={{
                  backgroundColor: previewLogoUrl ? '#FFFFFF' : `${brandColor}15`,
                }}
              >
                {previewLogoUrl ? (
                  <img
                    src={previewLogoUrl}
                    alt="Logo preview"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <span
                    className="text-[10px] font-bold text-center px-1 truncate"
                    style={{ color: brandColor }}
                  >
                    {brandName || 'LOGO'}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="วางลิงก์ https://drive.google.com/file/d/... หรือ URL โลโก้"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900"
              />
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                ยอดวิวรวม
              </label>
              <input
                type="text"
                value={totalViews}
                onChange={(e) => setTotalViews(e.target.value)}
                placeholder="2.5M+"
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-mono-num font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                ER เฉลี่ย
              </label>
              <input
                type="text"
                value={avgEngagement}
                onChange={(e) => setAvgEngagement(e.target.value)}
                placeholder="8.1%"
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-mono-num font-semibold text-emerald-700"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                ช่วงเวลาล่าสุด
              </label>
              <input
                type="text"
                value={latestPeriod}
                onChange={(e) => setLatestPeriod(e.target.value)}
                placeholder="มีนาคม 2569"
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              แนวคลิปที่ผลิต (คั่นด้วยเครื่องหมายจุลภาค ,)
            </label>
            <input
              type="text"
              value={videoStylesText}
              onChange={(e) => setVideoStylesText(e.target.value)}
              placeholder="Comedy Sketch คู่เพื่อน, ชาเลนจ์กินแหลก, ป้ายยาโปรลับ"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              ขอบเขตงานที่ส่งมอบ (Deliverables)
            </label>
            <input
              type="text"
              value={deliverablesSummary}
              onChange={(e) => setDeliverablesSummary(e.target.value)}
              placeholder="TikTok 3 คลิป + IG Reels + Boost Code"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              ไฮไลต์และผลลัพธ์แคมเปญ
            </label>
            <textarea
              rows={2}
              value={campaignHighlight}
              onChange={(e) => setCampaignHighlight(e.target.value)}
              placeholder="สรุปผลลัพธ์ความสำเร็จหรือจุดเด่นของแคมเปญที่ทำร่วมกับแบรนด์นี้..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
            />
          </div>

          {/* Sample Clip Link Section */}
          <div className="p-3 rounded-xl bg-violet-50/50 border border-violet-200/70 space-y-2.5">
            <div className="text-[11px] font-bold text-violet-900 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>คลิปตัวอย่างไฮไลต์ของแบรนด์นี้ (Sample Video Link)</span>
            </div>
            <input
              type="text"
              value={clip1Title}
              onChange={(e) => setClip1Title(e.target.value)}
              placeholder="ชื่อคลิปตัวอย่าง เช่น เมื่อเพื่อนบอกจะกินแค่คำเดียว..."
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
            />
            <div className="grid grid-cols-3 gap-2">
              <select
                value={clip1Platform}
                onChange={(e) =>
                  setClip1Platform(e.target.value as BrandSampleClip['platform'])
                }
                className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800"
              >
                <option value="TikTok">TikTok</option>
                <option value="Instagram Reels">IG Reels</option>
                <option value="Facebook">Facebook</option>
                <option value="YouTube Shorts">YT Shorts</option>
                <option value="YouTube">YouTube</option>
              </select>
              <input
                type="text"
                value={clip1Views}
                onChange={(e) => setClip1Views(e.target.value)}
                placeholder="ยอดวิว เช่น 1.2M"
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono-num text-slate-900"
              />
              <input
                type="text"
                value={clip1Format}
                onChange={(e) => setClip1Format(e.target.value)}
                placeholder="แนวคลิป"
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={clip1Campaign}
                onChange={(e) => setClip1Campaign(e.target.value)}
                placeholder="ชื่อแคมเปญ (เช่น แคมเปญบักเก็ตเพื่อนซี้)"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
              />
              <input
                type="text"
                value={clip1Url}
                onChange={(e) => setClip1Url(e.target.value)}
                placeholder="ลิงก์คลิปจริง https://www.tiktok.com/..."
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
              />
            </div>
            <textarea
              rows={2}
              value={clip1Desc}
              onChange={(e) => setClip1Desc(e.target.value)}
              placeholder="คำบรรยายเฉพาะของคลิปนี้ (วัตถุประสงค์ / Hook / จุดขาย)..."
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
            />
            {editingBrandItem?.sampleClips && editingBrandItem.sampleClips.length > 1 && (
              <div className="pt-1 text-[11px] text-violet-700 font-medium">
                ✓ แบรนด์นี้มีคลิปสะสมทั้งหมด {editingBrandItem.sampleClips.length} คลิป (ระบบแสดงผลใน Modal ครบทุกคลิป)
              </div>
            )}
          </div>

          {/* Client Quote Optional */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                คำชมจากลูกค้า (ถ้ามี)
              </label>
              <input
                type="text"
                value={clientQuote}
                onChange={(e) => setClientQuote(e.target.value)}
                placeholder="ฟีดแบ็กความประทับใจจากแบรนด์"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                ตำแหน่ง / ชื่อทีมผู้รีวิว
              </label>
              <input
                type="text"
                value={clientRole}
                onChange={(e) => setClientRole(e.target.value)}
                placeholder="Brand Manager · Agency"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1E1B4B] hover:bg-violet-900 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            {editingBrandItem ? (
              <>
                <Check className="w-4 h-4 text-amber-300" />
                <span>อัปเดตข้อมูลแบรนด์ {editingBrandItem.brandName}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-amber-300" />
                <span>เพิ่มแบรนด์เข้าสู่ทำเนียบลูกค้า</span>
              </>
            )}
          </button>
        </form>

        {/* Right Column: Existing 60+ Brands Directory List */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                ทำเนียบแบรนด์ทั้งหมด ({brands.length} แบรนด์)
              </h3>
              <p className="text-[11px] text-slate-500">
                คลิกปุ่มแก้ไขที่แบรนด์ใดก็ได้เพื่อเปลี่ยนโลโก้ Google Drive หรืออัปเดตจำนวนแคมเปญ
              </p>
            </div>

            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาแบรนด์..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="max-h-[540px] overflow-y-auto slim-scroll divide-y divide-slate-100 pr-1">
            {filteredBrands.map((b) => {
              const resolvedLogo = b.logoUrl ? resolveGoogleDriveImage(b.logoUrl) : '';
              const isSelected = editingBrandItem?.id === b.id;

              return (
                <div
                  key={b.id}
                  className={`py-3 px-2.5 flex items-center justify-between gap-3 rounded-xl transition-colors ${
                    isSelected ? 'bg-violet-50/90' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden bg-white"
                      style={{
                        backgroundColor: resolvedLogo
                          ? '#FFFFFF'
                          : `${b.brandColor || '#4C1D95'}14`,
                      }}
                    >
                      {resolvedLogo ? (
                        <img
                          src={resolvedLogo}
                          alt={b.brandName}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <span
                          className="text-[10px] font-bold text-center px-1 truncate"
                          style={{ color: b.brandColor || '#4C1D95' }}
                        >
                          {b.brandName}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">
                          {b.brandName}
                        </span>
                        {b.brandNameTh && (
                          <span className="text-[11px] text-slate-500 truncate">
                            ({b.brandNameTh})
                          </span>
                        )}
                        {b.isRepeatPartner && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold font-mono-num">
                            <Repeat className="w-2.5 h-2.5" />
                            {b.campaignCount}x
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{b.category}</span>
                        <span>·</span>
                        <span className="font-mono-num font-semibold text-slate-700">
                          {b.totalViews} วิว
                        </span>
                        {b.sampleClips?.[0]?.url && (
                          <a
                            href={b.sampleClips[0].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-violet-700 hover:underline"
                          >
                            <span>คลิป</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onSetEditingBrandItem(b)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-violet-50 text-slate-700 hover:text-violet-800 text-xs font-semibold cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>แก้ไข</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteBrandCollaboration(b.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="ลบแบรนด์นี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
