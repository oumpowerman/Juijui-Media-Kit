import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, X, Check, Image as ImageIcon, Search } from 'lucide-react';
import { CommentProofItem, resolveGoogleDriveImage } from '../../data/creatorData';

interface CommentsProofTabProps {
  commentProofs: CommentProofItem[];
  editingCommentItem: CommentProofItem | null;
  onSetEditingCommentItem: (item: CommentProofItem | null) => void;
  onUpsertCommentProof: (payload: {
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
  }) => Promise<void>;
  onDeleteCommentProof: (commentId: string) => Promise<void>;
}

export const CommentsProofTab: React.FC<CommentsProofTabProps> = ({
  commentProofs,
  editingCommentItem,
  onSetEditingCommentItem,
  onUpsertCommentProof,
  onDeleteCommentProof,
}) => {
  const [authorName, setAuthorName] = useState('');
  const [authorHandle, setAuthorHandle] = useState('');
  const [authorType, setAuthorType] =
    useState<CommentProofItem['authorType']>('แฟนคลับ / ผู้ชม');
  const [platform, setPlatform] = useState('TikTok');
  const [content, setContent] = useState('');
  const [likesCount, setLikesCount] = useState('2.5K ไลค์');
  const [clipReference, setClipReference] = useState('');
  const [clipUrl, setClipUrl] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [dateLabel, setDateLabel] = useState('พฤษภาคม 2569');
  const [typeFilter, setTypeFilter] = useState<'all' | CommentProofItem['authorType']>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (editingCommentItem) {
      setAuthorName(editingCommentItem.authorName);
      setAuthorHandle(editingCommentItem.authorHandle);
      setAuthorType(editingCommentItem.authorType);
      setPlatform(editingCommentItem.platform);
      setContent(editingCommentItem.content);
      setLikesCount(editingCommentItem.likesCount);
      setClipReference(editingCommentItem.clipReference);
      setClipUrl(editingCommentItem.clipUrl || '');
      setDriveUrl(editingCommentItem.screenshotUrl || '');
      setDateLabel(editingCommentItem.dateLabel || 'พฤษภาคม 2569');
    } else {
      setAuthorName('');
      setAuthorHandle('');
      setAuthorType('แฟนคลับ / ผู้ชม');
      setPlatform('TikTok');
      setContent('');
      setLikesCount('2.5K ไลค์');
      setClipReference('');
      setClipUrl('');
      setDriveUrl('');
      setDateLabel('พฤษภาคม 2569');
    }
  }, [editingCommentItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;

    await onUpsertCommentProof({
      id: editingCommentItem?.id,
      authorName,
      authorHandle,
      authorType,
      platform,
      content,
      likesCount,
      clipReference,
      clipUrl,
      driveUrl,
      dateLabel,
    });
  };

  const filteredComments = commentProofs.filter((cm) => {
    if (typeFilter !== 'all' && cm.authorType !== typeFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      cm.authorName.toLowerCase().includes(q) ||
      cm.content.toLowerCase().includes(q) ||
      cm.clipReference.toLowerCase().includes(q)
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Left: Sticky Add / Edit Form (5 cols on desktop) */}
      <form
        onSubmit={handleSubmit}
        className={`lg:col-span-5 lg:sticky lg:top-0 space-y-3.5 p-5 rounded-xl border transition-colors ${
          editingCommentItem
            ? 'bg-violet-50/70 border-violet-300'
            : 'bg-white border-slate-200/90'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 min-w-0">
            {editingCommentItem ? (
              <>
                <Edit3 className="w-4 h-4 text-violet-700 shrink-0" />
                <span className="truncate">แก้ไขรีวิวของ: {editingCommentItem.authorName}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-violet-700 shrink-0" />
                <span>เพิ่มคอมเมนต์ผู้ชม / รีวิวจากแบรนด์</span>
              </>
            )}
          </h4>

          {editingCommentItem && (
            <button
              type="button"
              onClick={() => onSetEditingCommentItem(null)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>ยกเลิก</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อผู้คอมเมนต์ / ชื่อลูกค้า <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="เช่น @ploy_tiktok หรือ คุณนนท์ PR"
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ประเภทผู้รีวิว</label>
            <select
              value={authorType}
              onChange={(e) => setAuthorType(e.target.value as CommentProofItem['authorType'])}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300"
            >
              <option value="แฟนคลับ / ผู้ชม">แฟนคลับ / ผู้ชม</option>
              <option value="ลูกค้าแบรนด์ / เอเจนซี่">ลูกค้าแบรนด์ / เอเจนซี่</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              แพลตฟอร์ม
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300"
            >
              <option value="TikTok">TikTok</option>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
              <option value="YouTube">YouTube</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ตำแหน่ง / แอคเคานต์
            </label>
            <input
              type="text"
              value={authorHandle}
              onChange={(e) => setAuthorHandle(e.target.value)}
              placeholder="เช่น Marketing Manager"
              className="w-full px-2.5 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              เดือน/ปี ที่รีวิว
            </label>
            <input
              type="text"
              value={dateLabel}
              onChange={(e) => setDateLabel(e.target.value)}
              placeholder="เช่น พฤษภาคม 2569"
              className="w-full px-2.5 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ยอดไลค์คอมเมนต์ / สถานะ
            </label>
            <input
              type="text"
              value={likesCount}
              onChange={(e) => setLikesCount(e.target.value)}
              placeholder="เช่น 5,400 ไลค์ หรือ Verified Brand"
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              อ้างอิงคลิป / แคมเปญ
            </label>
            <input
              type="text"
              value={clipReference}
              onChange={(e) => setClipReference(e.target.value)}
              placeholder="เช่น คลิป Sunset in พัทยา"
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ลิงก์คลิปต้นทาง (TikTok / IG / YouTube / Facebook)
          </label>
          <input
            type="url"
            value={clipUrl}
            onChange={(e) => setClipUrl(e.target.value)}
            placeholder="เช่น https://www.tiktok.com/@juijui.j/video/..."
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ข้อความคอมเมนต์ <span className="text-rose-600">*</span>
          </label>
          <textarea
            rows={3}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="พิมพ์ข้อความคอมเมนต์จากผู้ชมหรือฟีดแบ็กจากลูกค้า..."
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300 slim-scroll"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5 text-violet-700" />
            <span>แนบลิงก์ภาพแคปหน้าจอคอมเมนต์จาก Google Drive (ถ้ามี)</span>
          </label>
          <input
            type="text"
            value={driveUrl}
            onChange={(e) => setDriveUrl(e.target.value)}
            placeholder="วางลิงก์ Google Drive ของภาพแคปคอมเมนต์"
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50/70 focus:bg-white border border-slate-300"
          />
          {driveUrl.trim() && (
            <div className="mt-2 p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2.5">
              <img
                src={resolveGoogleDriveImage(driveUrl)}
                alt="Screenshot preview"
                referrerPolicy="no-referrer"
                className="h-12 rounded object-contain bg-white border border-slate-200"
              />
              <span className="text-[11px] font-semibold text-emerald-700">
                ✓ พรีวิวภาพแคปหน้าจอพร้อมแสดงผล
              </span>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-violet-700 hover:bg-violet-800 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          <span>
            {editingCommentItem
              ? 'บันทึกการแก้ไขคอมเมนต์นี้'
              : '+ บันทึกคอมเมนต์ขึ้นหน้าเว็บ'}
          </span>
        </button>
      </form>

      {/* Right: Existing Comments List (7 cols on desktop) */}
      <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200/90 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              เสียงตอบรับและรีวิวทั้งหมด ({filteredComments.length}/{commentProofs.length})
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              แสดงผลในส่วน Social Proof เพื่อสร้างความมั่นใจให้แบรนด์และเอเจนซี่
            </p>
          </div>

          <div className="relative sm:w-52">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อ หรือข้อความ..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50/70 focus:bg-white text-slate-800 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Reviewer Type Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              typeFilter === 'all'
                ? 'bg-[#1E1B4B] text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด ({commentProofs.length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('แฟนคลับ / ผู้ชม')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              typeFilter === 'แฟนคลับ / ผู้ชม'
                ? 'bg-violet-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            แฟนคลับ / ผู้ชม (
            {commentProofs.filter((c) => c.authorType === 'แฟนคลับ / ผู้ชม').length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('ลูกค้าแบรนด์ / เอเจนซี่')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              typeFilter === 'ลูกค้าแบรนด์ / เอเจนซี่'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            ลูกค้าแบรนด์ / เอเจนซี่ (
            {commentProofs.filter((c) => c.authorType === 'ลูกค้าแบรนด์ / เอเจนซี่').length})
          </button>
        </div>

        <div className="space-y-2.5">
          {filteredComments.map((cm) => {
            const isBeingEdited = editingCommentItem?.id === cm.id;
            return (
              <div
                key={cm.id}
                className={`p-3.5 rounded-xl border transition-colors flex items-start justify-between gap-3 ${
                  isBeingEdited
                    ? 'border-violet-600 bg-violet-50/50'
                    : 'border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="text-xs space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900">{cm.authorName}</span>
                    <span className="text-slate-300">·</span>
                    <span
                      className={`font-semibold ${
                        cm.authorType === 'ลูกค้าแบรนด์ / เอเจนซี่'
                          ? 'text-emerald-700'
                          : 'text-violet-700'
                      }`}
                    >
                      {cm.authorType}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">“{cm.content}”</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                    <span>{cm.clipReference} · {cm.likesCount}</span>
                    {cm.clipUrl && (
                      <span className="text-violet-600 font-semibold">
                        · มีลิงก์คลิป
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onSetEditingCommentItem(cm)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-violet-700 hover:bg-violet-50 transition-colors cursor-pointer"
                    title="แก้ไขคอมเมนต์นี้"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteCommentProof(cm.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="ลบคอมเมนต์นี้"
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
