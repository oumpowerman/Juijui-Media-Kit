import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Pin,
  Image as ImageIcon,
  Video as VideoIcon,
  Play,
  Film,
  Sparkles,
  X,
  Check,
  Search,
  MonitorPlay,
  Smartphone,
} from 'lucide-react';
import {
  ViralWorkItem,
  resolveGoogleDriveImage,
  extractGoogleDriveId,
  resolveVideoSource,
} from '../../data/creatorData';
import { PlatformBrandIcon } from '../ui/PlatformBrandIcon';

interface ViralMediaTabProps {
  viralWorks: ViralWorkItem[];
  editingMediaItem: ViralWorkItem | null;
  onSetEditingMediaItem: (item: ViralWorkItem | null) => void;
  onUpsertViralWork: (payload: {
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
    driveVideoUrl?: string;
    isPinned?: boolean;
    topCommentUser?: string;
    topCommentText?: string;
  }) => Promise<void>;
  onTogglePinViralWork: (workId: string) => Promise<void>;
  onDeleteViralWork: (workId: string) => Promise<void>;
}

type FormatFilter = 'all' | 'pinned' | 'vertical' | 'horizontal';

export const ViralMediaTab: React.FC<ViralMediaTabProps> = ({
  viralWorks,
  editingMediaItem,
  onSetEditingMediaItem,
  onUpsertViralWork,
  onTogglePinViralWork,
  onDeleteViralWork,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [views, setViews] = useState('500K');
  const [likes, setLikes] = useState('45K');
  const [commentsCount, setCommentsCount] = useState('850');
  const [sharesCount, setSharesCount] = useState('6.2K');
  const [platform, setPlatform] = useState<ViralWorkItem['platform']>('TikTok');
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical');
  const [duration, setDuration] = useState('00:45');
  const [category, setCategory] = useState('Lifestyle & Comedy');
  const [tiktokUrl, setTiktokUrl] = useState('https://www.tiktok.com/@juijui.j');
  const [driveImageUrl, setDriveImageUrl] = useState('');
  const [driveVideoUrl, setDriveVideoUrl] = useState('');
  const [showVideoTest, setShowVideoTest] = useState(false);
  const [isPinned, setIsPinned] = useState(true);
  const [topCommentUser, setTopCommentUser] = useState('@fanclub_juijui');
  const [topCommentText, setTopCommentText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<FormatFilter>('all');

  useEffect(() => {
    if (editingMediaItem) {
      setTitle(editingMediaItem.title);
      setSubtitle(editingMediaItem.subtitle);
      setViews(editingMediaItem.views);
      setLikes(editingMediaItem.likes);
      setCommentsCount(editingMediaItem.commentsCount);
      setSharesCount(editingMediaItem.sharesCount);
      setPlatform(editingMediaItem.platform);
      setOrientation(editingMediaItem.orientation || 'vertical');
      setDuration(editingMediaItem.duration || '00:45');
      setCategory(editingMediaItem.category);
      setTiktokUrl(editingMediaItem.tiktokUrl || 'https://www.tiktok.com/@juijui.j');
      setDriveImageUrl(editingMediaItem.driveImageUrl || '');
      setDriveVideoUrl(editingMediaItem.driveVideoUrl || '');
      setShowVideoTest(false);
      setIsPinned(Boolean(editingMediaItem.isPinned));
      setTopCommentUser(editingMediaItem.topComments?.[0]?.user || '@fanclub_juijui');
      setTopCommentText(editingMediaItem.topComments?.[0]?.text || '');
    } else {
      setTitle('');
      setSubtitle('');
      setViews('500K');
      setLikes('45K');
      setCommentsCount('850');
      setSharesCount('6.2K');
      setPlatform('TikTok');
      setOrientation('vertical');
      setDuration('00:45');
      setCategory('Lifestyle & Comedy');
      setTiktokUrl('https://www.tiktok.com/@juijui.j');
      setDriveImageUrl('');
      setDriveVideoUrl('');
      setShowVideoTest(false);
      setIsPinned(true);
      setTopCommentUser('@fanclub_juijui');
      setTopCommentText('');
    }
  }, [editingMediaItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onUpsertViralWork({
      id: editingMediaItem?.id,
      title,
      subtitle,
      views,
      likes,
      commentsCount,
      sharesCount,
      platform,
      orientation,
      duration,
      category,
      tiktokUrl,
      driveImageUrl,
      driveVideoUrl,
      isPinned,
      topCommentUser,
      topCommentText,
    });
  };

  const driveIdPreview = extractGoogleDriveId(driveImageUrl);
  const videoSourcePreview = resolveVideoSource(driveVideoUrl);
  const filteredWorks = viralWorks.filter((w) => {
    if (formatFilter === 'pinned' && !w.isPinned) return false;
    if (formatFilter === 'vertical' && (w.orientation || 'vertical') !== 'vertical') return false;
    if (formatFilter === 'horizontal' && w.orientation !== 'horizontal') return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      w.title.toLowerCase().includes(q) ||
      w.category.toLowerCase().includes(q) ||
      w.platform.toLowerCase().includes(q)
    );
  });

  const pinnedCount = viralWorks.filter((w) => w.isPinned).length;
  const verticalCount = viralWorks.filter((w) => (w.orientation || 'vertical') === 'vertical').length;
  const horizontalCount = viralWorks.filter((w) => w.orientation === 'horizontal').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Left: Sticky Add / Edit Form (5 cols on desktop) */}
      <form
        onSubmit={handleSubmit}
        className={`lg:col-span-5 lg:sticky lg:top-0 space-y-3.5 p-5 rounded-xl border transition-colors ${
          editingMediaItem
            ? 'bg-violet-50/70 border-violet-300'
            : 'bg-white border-slate-200/90'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 min-w-0">
            {editingMediaItem ? (
              <>
                <Edit3 className="w-4 h-4 text-violet-700 shrink-0" />
                <span className="truncate">แก้ไขผลงาน: {editingMediaItem.title}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-violet-700 shrink-0" />
                <span>เพิ่มคลิปไวรัลใหม่ (9:16 หรือ 16:9)</span>
              </>
            )}
          </h4>

          {editingMediaItem && (
            <button
              type="button"
              onClick={() => onSetEditingMediaItem(null)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>ยกเลิก</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อผลงาน / ชื่อคลิปไวรัล <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น ทริปตะลุยกินเยาวราชกับเพื่อนซี้"
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300 focus:border-violet-600 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              คำโปรยย่อย (Subtitle)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="เช่น ไลฟ์สไตล์ท่องเที่ยว · ยอดแชร์สูง"
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300 focus:border-violet-600 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">แพลตฟอร์ม</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as ViralWorkItem['platform'])}
              className="w-full px-2.5 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300"
            >
              <option value="TikTok">TikTok</option>
              <option value="YouTube">YouTube (16:9)</option>
              <option value="YouTube Shorts">YouTube Shorts</option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram Reels">Instagram Reels</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">สัดส่วนคลิป</label>
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as 'vertical' | 'horizontal')}
              className="w-full px-2.5 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300"
            >
              <option value="vertical">แนวตั้ง 9:16</option>
              <option value="horizontal">แนวนอน 16:9</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ความยาวคลิป</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="เช่น 12:45 หรือ 00:55"
              className="w-full px-2.5 py-2 text-xs font-mono-num rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-50/70 border border-slate-300 w-full cursor-pointer text-xs font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="accent-violet-700 rounded"
              />
              <span>Pinned</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">หมวดหมู่คอนเทนต์</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="เช่น Comedy & Food หรือ Widescreen Vlog"
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300"
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">ยอดวิว</label>
            <input
              type="text"
              value={views}
              onChange={(e) => setViews(e.target.value)}
              placeholder="1.5M"
              className="w-full px-2.5 py-1.5 text-xs font-mono-num rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">ยอดไลค์</label>
            <input
              type="text"
              value={likes}
              onChange={(e) => setLikes(e.target.value)}
              placeholder="180K"
              className="w-full px-2.5 py-1.5 text-xs font-mono-num rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">คอมเมนต์</label>
            <input
              type="text"
              value={commentsCount}
              onChange={(e) => setCommentsCount(e.target.value)}
              placeholder="1.2K"
              className="w-full px-2.5 py-1.5 text-xs font-mono-num rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">แชร์</label>
            <input
              type="text"
              value={sharesCount}
              onChange={(e) => setSharesCount(e.target.value)}
              placeholder="12K"
              className="w-full px-2.5 py-1.5 text-xs font-mono-num rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5 text-violet-700" />
            <span>ลิงก์รูปภาพปกจาก Google Drive หรือ Image URL</span>
          </label>
          <input
            type="text"
            value={driveImageUrl}
            onChange={(e) => setDriveImageUrl(e.target.value)}
            placeholder="วางลิงก์ https://drive.google.com/file/d/xxxx/view?usp=sharing"
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300"
          />
          {driveImageUrl.trim() && (
            <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-3">
              <img
                src={resolveGoogleDriveImage(driveImageUrl)}
                alt="Google Drive Preview"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/assets/juijui/viral-2.jpg';
                }}
                className="w-12 h-14 rounded object-cover bg-white shrink-0"
              />
              <div className="text-[11px] text-slate-600 min-w-0">
                <p className="font-semibold text-emerald-700">
                  {driveIdPreview
                    ? `✓ แปลงลิงก์ Google Drive สำเร็จ (ID: ${driveIdPreview})`
                    : '✓ พรีวิวรูปภาพจาก URL พร้อมใช้งาน'}
                </p>
                <p className="truncate text-slate-400">{resolveGoogleDriveImage(driveImageUrl)}</p>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <VideoIcon className="w-3.5 h-3.5 text-rose-600" />
              <span>ลิงก์วิดีโอ In-App Preview (Google Drive หรือ MP4)</span>
            </label>
            {driveVideoUrl.trim() && (
              <button
                type="button"
                onClick={() => setShowVideoTest(!showVideoTest)}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <Play className="w-3 h-3" />
                <span>{showVideoTest ? 'ซ่อนตัวทดสอบวิดีโอ' : 'ทดสอบเล่นวิดีโอ (Live Test)'}</span>
              </button>
            )}
          </div>
          <input
            type="text"
            value={driveVideoUrl}
            onChange={(e) => setDriveVideoUrl(e.target.value)}
            placeholder="วางลิงก์ Google Drive (เช่น https://drive.google.com/file/d/.../view) หรือไฟล์ .mp4"
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            💡 คำแนะนำ: สำหรับ Google Drive ให้ตั้งค่าการแชร์ไฟล์เป็น <b>"ทุกคนที่มีลิงก์มีสิทธิ์ดู" (Anyone with the link)</b> เพื่อให้สามารถเล่นสตรีมบนหน้าจอสมาร์ตโฟนได้ทันที
          </p>

          {driveVideoUrl.trim() && (
            <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-[11px]">
                <p className="font-semibold text-emerald-700 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  {videoSourcePreview.type === 'drive'
                    ? `พร้อมพรีวิวผ่าน Google Drive Embed (ID: ${videoSourcePreview.fileId})`
                    : videoSourcePreview.type === 'direct'
                    ? 'พร้อมพรีวิวผ่าน Direct HTML5 Video'
                    : videoSourcePreview.type === 'youtube'
                    ? 'พร้อมพรีวิวผ่าน YouTube Embed'
                    : 'ลิงก์วิดีโอพร้อมแสดงผล'}
                </p>
                <button
                  type="button"
                  onClick={() => setShowVideoTest(!showVideoTest)}
                  className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 font-semibold cursor-pointer"
                >
                  {showVideoTest ? 'ปิดพรีวิว' : 'เปิดทดสอบเล่น'}
                </button>
              </div>

              {showVideoTest && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-200">
                  <div className="w-full max-w-[280px] mx-auto aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-md relative">
                    {videoSourcePreview.type === 'drive' ? (
                      <iframe
                        src={videoSourcePreview.embedUrl}
                        title="Drive Video Test"
                        allow="autoplay; fullscreen"
                        className="w-full h-full border-0"
                      />
                    ) : videoSourcePreview.type === 'direct' ? (
                      <video
                        src={videoSourcePreview.src}
                        controls
                        autoPlay
                        loop
                        className="w-full h-full object-cover"
                      />
                    ) : videoSourcePreview.type === 'youtube' ? (
                      <iframe
                        src={videoSourcePreview.embedUrl}
                        title="YouTube Test"
                        allow="autoplay; encrypted-media"
                        className="w-full h-full border-0"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 p-4 text-center">
                        ไม่สามารถเล่นวิดีโอจากลิงก์นี้ได้โดยตรง
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ลิงก์คลิปต้นฉบับ (TikTok / YouTube / Reels)
          </label>
          <input
            type="text"
            value={tiktokUrl}
            onChange={(e) => setTiktokUrl(e.target.value)}
            placeholder="https://www.tiktok.com/@juijui.j/video/..."
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อผู้คอมเมนต์
            </label>
            <input
              type="text"
              value={topCommentUser}
              onChange={(e) => setTopCommentUser(e.target.value)}
              placeholder="@fanclub"
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              คอมเมนต์ท็อปฮิตใต้คลิปนี้ (ถ้ามี)
            </label>
            <input
              type="text"
              value={topCommentText}
              onChange={(e) => setTopCommentText(e.target.value)}
              placeholder="เช่น ดูคลิปนี้แล้วอยากกดสั่งตามเลย ขำตั้งแต่ต้นจนจบ!"
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-violet-700 hover:bg-violet-800 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          <span>
            {editingMediaItem
              ? 'บันทึกการแก้ไขผลงานนี้'
              : '+ เพิ่มผลงานเข้าสู่หน้าเว็บทันที'}
          </span>
        </button>
      </form>

      {/* Right: Portfolio List with Format Filter & Search (7 cols on desktop) */}
      <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200/90 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              คลังผลงานไวรัลทั้งหมด ({filteredWorks.length}/{viralWorks.length})
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              คลิกไอคอนปักหมุดเพื่อแสดงในแถว Top Highlights หรือกดแก้ไขเพื่อปรับข้อมูล
            </p>
          </div>

          <div className="relative sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อคลิป หรือหมวดหมู่..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50/70 focus:bg-white text-slate-800 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Format Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFormatFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              formatFilter === 'all'
                ? 'bg-[#1E1B4B] text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด ({viralWorks.length})
          </button>
          <button
            type="button"
            onClick={() => setFormatFilter('pinned')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              formatFilter === 'pinned'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            ★ ปักหมุด ({pinnedCount})
          </button>
          <button
            type="button"
            onClick={() => setFormatFilter('vertical')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              formatFilter === 'vertical'
                ? 'bg-violet-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>แนวตั้ง 9:16 ({verticalCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFormatFilter('horizontal')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              formatFilter === 'horizontal'
                ? 'bg-violet-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <MonitorPlay className="w-3 h-3" />
            <span>แนวนอน 16:9 ({horizontalCount})</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {filteredWorks.map((work) => {
            const isBeingEdited = editingMediaItem?.id === work.id;
            return (
              <div
                key={work.id}
                className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-colors ${
                  isBeingEdited
                    ? 'border-violet-600 bg-violet-50/50'
                    : 'border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={
                      work.driveImageUrl
                        ? resolveGoogleDriveImage(work.driveImageUrl)
                        : work.thumbnailUrl
                    }
                    alt={work.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/assets/juijui/viral-1.jpg';
                    }}
                    className={`rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200 ${
                      work.orientation === 'horizontal' ? 'w-20 h-12' : 'w-12 h-15'
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <PlatformBrandIcon platform={work.platform} size="xs" />
                      <span
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          work.orientation === 'horizontal'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-violet-100 text-violet-800'
                        }`}
                      >
                        {work.orientation === 'horizontal' ? (
                          <>
                            <MonitorPlay className="w-2.5 h-2.5" /> 16:9
                          </>
                        ) : (
                          <>
                            <Smartphone className="w-2.5 h-2.5" /> 9:16
                          </>
                        )}
                      </span>
                      {work.isPinned && (
                        <span className="text-[11px] font-bold text-amber-600">★ Pinned</span>
                      )}
                      {work.driveVideoUrl && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                          <Film className="w-2.5 h-2.5" /> วิดีโอ In-App
                        </span>
                      )}
                      <p className="text-xs font-bold text-slate-900 truncate">{work.title}</p>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono-num mt-0.5">
                      {work.platform} · วิว {work.views} · ไลค์ {work.likes} · แชร์ {work.sharesCount}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onTogglePinViralWork(work.id)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      work.isPinned
                        ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                    title={work.isPinned ? 'ยกเลิกปักหมุด' : 'ปักหมุดเป็นท็อปไวรัล'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onSetEditingMediaItem(work)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-violet-700 hover:bg-violet-50 transition-colors cursor-pointer"
                    title="แก้ไขรายการนี้"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteViralWork(work.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="ลบผลงานนี้"
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
  );
};
