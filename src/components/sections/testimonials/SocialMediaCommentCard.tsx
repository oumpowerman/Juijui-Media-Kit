import React from 'react';
import { motion } from 'motion/react';
import {
  Heart,
  Pin,
  Film,
  Calendar,
  MessageCircle,
  Share2,
  Check,
  CornerDownRight,
  ExternalLink,
} from 'lucide-react';
import { CommentProofItem, CreatorProfile } from '../../../data/creatorData';
import { PlatformBrandIcon } from '../../ui/PlatformBrandIcon';

interface SocialMediaCommentCardProps {
  comment: CommentProofItem;
  creator: CreatorProfile;
}

export const SocialMediaCommentCard: React.FC<SocialMediaCommentCardProps> = ({
  comment,
  creator,
}) => {
  const isTikTok = comment.platform.toLowerCase().includes('tiktok');
  const isInstagram = comment.platform.toLowerCase().includes('instagram') || comment.platform.toLowerCase().includes('reels');
  const isYouTube = comment.platform.toLowerCase().includes('youtube');

  // Avatar initial or avatar letter
  const displayInitial = comment.authorName.replace('@', '').charAt(0).toUpperCase() || 'U';

  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className={`group relative rounded-2xl border transition-all overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md ${
        isTikTok
          ? 'border-slate-800 bg-[#0F0F12] text-white hover:border-pink-500/50'
          : isInstagram
          ? 'border-rose-100 bg-white text-slate-900 hover:border-rose-300'
          : 'border-slate-200 bg-white text-slate-900 hover:border-violet-300'
      }`}
    >
      {/* Social Platform Header Bar */}
      <div
        className={`px-4 py-2.5 border-b flex items-center justify-between text-xs ${
          isTikTok
            ? 'border-slate-800/80 bg-slate-900/60'
            : isInstagram
            ? 'border-rose-100/80 bg-rose-50/40'
            : 'border-slate-100 bg-slate-50/70'
        }`}
      >
        <div className="flex items-center gap-2">
          <PlatformBrandIcon platform={comment.platform} size="sm" />
          <span
            className={`font-semibold text-[11px] ${
              isTikTok ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            {comment.platform} Comment
          </span>
          {comment.isPinned && (
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                isTikTok
                  ? 'bg-slate-800 text-pink-400 border border-pink-500/30'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              <Pin className="w-2.5 h-2.5 rotate-45" />
              <span>ปักหมุด</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Calendar className="w-3 h-3" />
          <span>{comment.dateLabel}</span>
        </div>
      </div>

      {/* Main Comment Body */}
      <div className="p-4 sm:p-5 space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* User Avatar with Platform Ring */}
            <div
              className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-bold text-xs shadow-2xs ${
                isInstagram
                  ? 'p-[2px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600'
                  : isTikTok
                  ? 'bg-gradient-to-br from-cyan-500 to-pink-500 text-white'
                  : 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white'
              }`}
            >
              <div
                className={`w-full h-full rounded-full flex items-center justify-center ${
                  isInstagram ? 'bg-white text-rose-600 font-bold' : ''
                }`}
              >
                {comment.userAvatarUrl ? (
                  <img
                    src={comment.userAvatarUrl}
                    alt={comment.authorName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{displayInitial}</span>
                )}
              </div>
            </div>

            {/* Author Handle and Metadata */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className={`font-bold text-sm tracking-tight truncate ${
                    isTikTok ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {comment.authorName.startsWith('@')
                    ? comment.authorName
                    : `@${comment.authorName}`}
                </span>
                <span className="w-3.5 h-3.5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[8px] shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </span>
              </div>
              <p
                className={`text-[11px] font-normal truncate ${
                  isTikTok ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {comment.authorHandle} · {comment.commentTime || 'ล่าสุด'}
              </p>
            </div>
          </div>

          {/* Social Like Button with Heart */}
          <div
            className={`flex flex-col items-center shrink-0 px-2.5 py-1.5 rounded-xl border text-xs font-semibold ${
              isTikTok
                ? 'bg-slate-900/90 border-slate-800 text-pink-400'
                : 'bg-rose-50/80 border-rose-200/70 text-rose-600'
            }`}
          >
            <Heart className="w-4 h-4 fill-current text-pink-500" />
            <span className="text-[11px] font-mono-num font-bold mt-0.5">
              {comment.likesCount}
            </span>
          </div>
        </div>

        {/* Comment Text Content */}
        <p
          className={`text-xs sm:text-[13px] leading-relaxed ${
            isTikTok ? 'text-slate-200' : 'text-slate-700'
          }`}
        >
          {comment.content}
        </p>

        {/* Creator Liked Badge (Badge of Honor on TikTok/IG/YouTube) */}
        {comment.isCreatorLiked && (
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
              isTikTok
                ? 'bg-slate-900 border border-pink-500/30 text-pink-300'
                : 'bg-pink-50 border border-pink-200 text-pink-700'
            }`}
          >
            <div className="w-4 h-4 rounded-full overflow-hidden border border-pink-300 shrink-0">
              <img
                src={creator.avatarUrl}
                alt={creator.nameTh}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/assets/juijui/avatar-main.jpg';
                }}
              />
            </div>
            <span>{creator.nameTh} กดใจให้คอมเมนต์นี้</span>
            <Heart className="w-3 h-3 fill-pink-500 text-pink-500" />
          </div>
        )}

        {comment.screenshotUrl && (
          <div className="pt-1">
            <div className="rounded-xl overflow-hidden border border-slate-700/50 bg-black/40 p-1">
              <img
                src={comment.screenshotUrl}
                alt={comment.authorName}
                referrerPolicy="no-referrer"
                className="max-h-40 rounded-lg object-contain w-full"
              />
            </div>
          </div>
        )}

        {/* Comment Interactions Sub-bar */}
        <div
          className={`flex items-center justify-between text-[11px] pt-1 ${
            isTikTok ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="font-semibold hover:underline cursor-pointer">
              ตอบกลับ
            </span>
            <span className="flex items-center gap-1 hover:underline cursor-pointer">
              <Share2 className="w-3 h-3" />
              แชร์
            </span>
          </div>

          {comment.replyCount && comment.replyCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-pink-500 font-semibold cursor-pointer hover:underline">
              <CornerDownRight className="w-3 h-3" />
              ดูการตอบกลับ ({comment.replyCount})
            </span>
          )}
        </div>
      </div>

      {/* Footer: Clip Reference */}
      <div
        className={`px-4 py-2.5 border-t flex items-center justify-between text-xs gap-2 ${
          isTikTok
            ? 'bg-slate-950/80 border-slate-800/80 text-slate-400'
            : isInstagram
            ? 'bg-rose-50/30 border-rose-100 text-slate-600'
            : 'bg-slate-50 border-slate-100 text-slate-600'
        }`}
      >
        {comment.clipUrl ? (
          <a
            href={comment.clipUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`เปิดชมคลิป: ${comment.clipReference}`}
            className={`group/clip flex items-center gap-1.5 min-w-0 transition-colors cursor-pointer ${
              isTikTok
                ? 'hover:text-pink-400'
                : isInstagram
                ? 'hover:text-rose-600'
                : 'hover:text-violet-700'
            }`}
          >
            <Film
              className={`w-3.5 h-3.5 shrink-0 ${
                isTikTok ? 'text-pink-400' : isInstagram ? 'text-rose-500' : 'text-violet-600'
              }`}
            />
            <span className="truncate font-medium text-[11px] group-hover/clip:underline">
              {comment.clipReference}
            </span>
            <ExternalLink className="w-3 h-3 shrink-0 opacity-70 group-hover/clip:opacity-100 transition-opacity" />
          </a>
        ) : (
          <div className="flex items-center gap-1.5 min-w-0">
            <Film
              className={`w-3.5 h-3.5 shrink-0 ${
                isTikTok ? 'text-pink-400' : isInstagram ? 'text-rose-500' : 'text-violet-600'
              }`}
            />
            <span className="truncate font-medium text-[11px]">
              {comment.clipReference}
            </span>
          </div>
        )}

        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
            isTikTok
              ? 'bg-slate-800 text-slate-300'
              : 'bg-slate-200/80 text-slate-700'
          }`}
        >
          Top Comment
        </span>
      </div>
    </motion.div>
  );
};
