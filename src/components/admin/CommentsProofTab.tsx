import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  X,
  Check,
  Image as ImageIcon,
  Search,
  Sparkles,
  MessageCircle,
  Heart,
  Pin,
} from 'lucide-react';
import {
  CommentProofItem,
  ProofSummaryConfig,
  resolveGoogleDriveImage,
} from '../../data/creatorData';

interface CommentsProofTabProps {
  commentProofs: CommentProofItem[];
  proofSummaryConfig?: ProofSummaryConfig;
  onUpdateProofSummaryConfig: (field: keyof ProofSummaryConfig, value: string) => void;
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
    commentTime?: string;
    userAvatarUrl?: string;
    replyCount?: number;
    isPinned?: boolean;
    isCreatorLiked?: boolean;
    brandReply?: CommentProofItem['brandReply'];
  }) => Promise<void>;
  onDeleteCommentProof: (commentId: string) => Promise<void>;
}

export const CommentsProofTab: React.FC<CommentsProofTabProps> = ({
  commentProofs,
  proofSummaryConfig,
  onUpdateProofSummaryConfig,
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
  const [commentTime, setCommentTime] = useState('2 วันที่แล้ว');
  const [userAvatarUrl, setUserAvatarUrl] = useState('');
  const [replyCount, setReplyCount] = useState<number>(14);
  const [isPinned, setIsPinned] = useState(false);
  const [isCreatorLiked, setIsCreatorLiked] = useState(true);
  const [replyAuthor, setReplyAuthor] = useState('JUIJUI (จุ๊ยจุ๊ย)');
  const [replyContent, setReplyContent] = useState('');
  const [replyTime, setReplyTime] = useState('14:32 น.');
  const [replyReadStatus, setReplyReadStatus] = useState<boolean>(true);

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
      setCommentTime(editingCommentItem.commentTime || '2 วันที่แล้ว');
      setUserAvatarUrl(editingCommentItem.userAvatarUrl || '');
      setReplyCount(editingCommentItem.replyCount ?? 14);
      setIsPinned(Boolean(editingCommentItem.isPinned));
      setIsCreatorLiked(editingCommentItem.isCreatorLiked ?? true);
      setReplyAuthor(editingCommentItem.brandReply?.author || 'JUIJUI (จุ๊ยจุ๊ย)');
      setReplyContent(editingCommentItem.brandReply?.content || '');
      setReplyTime(editingCommentItem.brandReply?.time || '14:32 น.');
      setReplyReadStatus(editingCommentItem.brandReply?.readStatus ?? true);
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
      setCommentTime('2 วันที่แล้ว');
      setUserAvatarUrl('');
      setReplyCount(14);
      setIsPinned(false);
      setIsCreatorLiked(true);
      setReplyAuthor('JUIJUI (จุ๊ยจุ๊ย)');
      setReplyContent('');
      setReplyTime('14:32 น.');
      setReplyReadStatus(true);
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
      commentTime,
      userAvatarUrl,
      replyCount: Number(replyCount) || 0,
      isPinned,
      isCreatorLiked,
      brandReply:
        authorType === 'ลูกค้าแบรนด์ / เอเจนซี่' && replyContent.trim()
          ? {
              author: replyAuthor.trim() || 'JUIJUI (จุ๊ยจุ๊ย)',
              content: replyContent.trim(),
              time: replyTime.trim() || '14:32 น.',
              readStatus: replyReadStatus,
            }
          : undefined,
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

  const psc = proofSummaryConfig || {};

  return (
    <div className="space-y-6">
      {/* 1. Top 3-Card Satisfaction & Sentiment Summary Customizer */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-800">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>ตั้งค่าแถบสรุปความพึงพอใจ 3 การ์ดด้านบนหมวดเสียงตอบรับ (กดปุ่มสีม่วงด้านล่างเพื่อบันทึก)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Rating */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
            <p className="text-xs font-bold text-slate-800">การ์ดที่ 1 · คะแนนความพึงพอใจ</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">ตัวเลขคะแนน</label>
                <input
                  type="text"
                  value={psc.ratingScore ?? ''}
                  onChange={(e) => onUpdateProofSummaryConfig('ratingScore', e.target.value)}
                  placeholder="4.9"
                  className="w-full px-2.5 py-1.5 text-xs font-mono-num font-bold rounded-lg bg-white border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">ป้ายเต็ม (เช่น / 5.0)</label>
                <input
                  type="text"
                  value={psc.ratingLabel ?? ''}
                  onChange={(e) => onUpdateProofSummaryConfig('ratingLabel', e.target.value)}
                  placeholder="/ 5.0 คะแนนความพึงพอใจ"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">คำอธิบายด้านล่าง</label>
              <input
                type="text"
                value={psc.ratingSubtitle ?? ''}
                onChange={(e) => onUpdateProofSummaryConfig('ratingSubtitle', e.target.value)}
                placeholder="ส่งงานตรงเวลา บรีฟเข้าใจง่าย และยอดวิวทะลุเป้า"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
              />
            </div>
          </div>

          {/* Card 2: Sentiment */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
            <p className="text-xs font-bold text-slate-800">การ์ดที่ 2 · สัดส่วนคอมเมนต์เชิงบวก</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">เปอร์เซ็นต์ (%)</label>
                <input
                  type="text"
                  value={psc.sentimentPercent ?? ''}
                  onChange={(e) => onUpdateProofSummaryConfig('sentimentPercent', e.target.value)}
                  placeholder="98%"
                  className="w-full px-2.5 py-1.5 text-xs font-mono-num font-bold text-emerald-700 rounded-lg bg-white border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">หัวข้อหลัก</label>
                <input
                  type="text"
                  value={psc.sentimentTitle ?? ''}
                  onChange={(e) => onUpdateProofSummaryConfig('sentimentTitle', e.target.value)}
                  placeholder="Positive Audience Sentiment"
                  className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">คำอธิบายด้านล่าง</label>
              <input
                type="text"
                value={psc.sentimentSubtitle ?? ''}
                onChange={(e) => onUpdateProofSummaryConfig('sentimentSubtitle', e.target.value)}
                placeholder="คอมเมนต์เชิงบวก แท็กเพื่อนมาดู และถามหาพิกัดสินค้า"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
              />
            </div>
          </div>

          {/* Card 3: Verified */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
            <p className="text-xs font-bold text-slate-800">การ์ดที่ 3 · การยืนยันข้อมูลจริง</p>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">หัวข้อหลัก</label>
              <input
                type="text"
                value={psc.verifiedTitle ?? ''}
                onChange={(e) => onUpdateProofSummaryConfig('verifiedTitle', e.target.value)}
                placeholder="Verified Social & Brand Proof"
                className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">คำอธิบายด้านล่าง</label>
              <input
                type="text"
                value={psc.verifiedSubtitle ?? ''}
                onChange={(e) => onUpdateProofSummaryConfig('verifiedSubtitle', e.target.value)}
                placeholder="มีลิงก์อ้างอิงคลิปต้นทางและหลักฐานแชทจริงทุกแคมเปญ"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Editor & List */}
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
                <option value="LINE Chat">LINE Chat</option>
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

          {/* Extra Social Proof / Avatar / Time / Replies / Badges */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                  เวลาที่แสดงบนการ์ด
                </label>
                <input
                  type="text"
                  value={commentTime}
                  onChange={(e) => setCommentTime(e.target.value)}
                  placeholder="เช่น 2 วันที่แล้ว หรือ 14:28 น."
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                  จำนวนตอบกลับ (Replies)
                </label>
                <input
                  type="number"
                  min={0}
                  value={replyCount}
                  onChange={(e) => setReplyCount(Number(e.target.value) || 0)}
                  placeholder="เช่น 14"
                  className="w-full px-2.5 py-1.5 text-xs font-mono-num rounded-lg bg-white border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                  ลิงก์รูปโปรไฟล์ผู้รีวิว (ถ้ามี)
                </label>
                <input
                  type="text"
                  value={userAvatarUrl}
                  onChange={(e) => setUserAvatarUrl(e.target.value)}
                  placeholder="URL หรือ Google Drive"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="accent-violet-700 rounded"
                />
                <Pin className="w-3.5 h-3.5 text-amber-600" />
                <span>แสดงป้ายปักหมุด (Pinned Comment)</span>
              </label>

              <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isCreatorLiked}
                  onChange={(e) => setIsCreatorLiked(e.target.checked)}
                  className="accent-rose-600 rounded"
                />
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>แสดงป้ายครีเอเตอร์กดหัวใจ (Liked by Creator)</span>
              </label>
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
              ข้อความคอมเมนต์ / ข้อความแชทจากลูกค้า <span className="text-rose-600">*</span>
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

          {/* LINE Chat Creator Reply Bubble Editor (shown when authorType is Brand/Agency) */}
          {authorType === 'ลูกค้าแบรนด์ / เอเจนซี่' && (
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>กล่องข้อความตอบกลับของครีเอเตอร์ในแชท LINE (บอลลูนสีเขียวขวา)</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-emerald-800 mb-0.5">
                    ชื่อผู้ตอบกลับ
                  </label>
                  <input
                    type="text"
                    value={replyAuthor}
                    onChange={(e) => setReplyAuthor(e.target.value)}
                    placeholder="JUIJUI (จุ๊ยจุ๊ย)"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-emerald-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-emerald-800 mb-0.5">
                    เวลาที่ตอบ
                  </label>
                  <input
                    type="text"
                    value={replyTime}
                    onChange={(e) => setReplyTime(e.target.value)}
                    placeholder="14:32 น."
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-emerald-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-emerald-800 mb-0.5">
                    ป้าย Read (อ่านแล้ว)
                  </label>
                  <select
                    value={replyReadStatus ? 'true' : 'false'}
                    onChange={(e) => setReplyReadStatus(e.target.value === 'true')}
                    className="w-full px-2 py-1.5 text-xs rounded-lg bg-white border border-emerald-300 font-semibold text-emerald-900"
                  >
                    <option value="true">แสดง Read</option>
                    <option value="false">ซ่อน Read</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-emerald-800 mb-0.5">
                  ข้อความตอบกลับจากครีเอเตอร์ (เว้นว่างเพื่อใช้ข้อความมาตรฐาน)
                </label>
                <textarea
                  rows={2}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="เช่น ขอบคุณทีมแบรนด์มากๆ เลยนะคะ ยินดีที่ได้ร่วมงานกันค่ะ..."
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-emerald-300"
                />
              </div>
            </div>
          )}

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
                      {cm.isPinned && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                          ★ Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 leading-relaxed">“{cm.content}”</p>
                    {cm.brandReply?.content && (
                      <p className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                        ↳ ตอบกลับ ({cm.brandReply.author}): “{cm.brandReply.content}”
                      </p>
                    )}
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
    </div>
  );
};

