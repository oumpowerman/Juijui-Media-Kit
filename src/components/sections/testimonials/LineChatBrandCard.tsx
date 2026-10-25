import React from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  CheckCheck,
  Film,
  Sparkles,
  Phone,
  MoreVertical,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { CommentProofItem, CreatorProfile } from '../../../data/creatorData';

interface LineChatBrandCardProps {
  comment: CommentProofItem;
  creator: CreatorProfile;
}

export const LineChatBrandCard: React.FC<LineChatBrandCardProps> = ({
  comment,
  creator,
}) => {
  const brandReply = comment.brandReply || {
    author: `${creator.nameTh} (Creator)`,
    content:
      'ขอบพระคุณทางแบรนด์และทีมงานมากครับ ยินดีที่ได้ร่วมงานและสร้างยอดวิวปังๆ ให้แคมเปญครับผม 💚🙏',
    time: '14:32 น.',
    readStatus: true,
    avatarUrl: creator.avatarUrl,
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="group relative rounded-2xl border border-emerald-200/80 bg-white shadow-2xs hover:shadow-md hover:border-emerald-400/80 transition-all overflow-hidden flex flex-col justify-between"
    >
      {/* LINE App Inspired Top Header */}
      <div className="bg-gradient-to-r from-[#06C755] to-[#05B34C] px-4 py-3 text-white flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 text-white font-bold text-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight truncate block">
                {comment.authorName}
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-white/25 text-[10px] font-semibold uppercase tracking-wider shrink-0">
                LINE Chat
              </span>
            </div>
            <p className="text-[11px] text-white/85 truncate font-normal">
              {comment.authorHandle} · บรีฟงานและส่งมอบแคมเปญ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-white/80 shrink-0">
          <span className="p-1 rounded-md hover:bg-white/10 transition-colors">
            <Phone className="w-3.5 h-3.5" />
          </span>
          <span className="p-1 rounded-md hover:bg-white/10 transition-colors">
            <MoreVertical className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Chat Room Surface */}
      <div className="p-4 sm:p-5 bg-gradient-to-b from-[#7A9EB8]/10 via-[#8EB4D0]/5 to-slate-50/50 space-y-4">
        {/* Date Divider */}
        <div className="flex justify-center">
          <span className="px-3 py-1 rounded-full bg-slate-200/80 backdrop-blur-xs text-[10px] font-semibold text-slate-600 flex items-center gap-1 shadow-2xs">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>{comment.dateLabel}</span>
          </span>
        </div>

        {/* Message 1: Brand / Client (Left Side) */}
        <div className="flex items-start gap-2.5 max-w-[92%] sm:max-w-[85%]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs mt-1">
            {comment.authorName.charAt(0) || 'B'}
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-700 block">
              {comment.authorName}
            </span>
            <div className="flex items-end gap-1.5">
              <div className="relative p-3 rounded-2xl rounded-tl-xs bg-white border border-slate-200/80 shadow-2xs text-slate-800 text-xs sm:text-[13px] leading-relaxed">
                <p className="whitespace-pre-line">{comment.content}</p>
              </div>
              <span className="text-[10px] text-slate-500 font-mono-num shrink-0 pb-0.5">
                {comment.commentTime || '14:28'}
              </span>
            </div>
          </div>
        </div>

        {/* Message 2: Juijui / Creator Reply (Right Side) */}
        <div className="flex items-start justify-end gap-2.5 ml-auto max-w-[92%] sm:max-w-[85%]">
          <div className="space-y-1 text-right">
            <span className="text-[11px] font-semibold text-emerald-800 block">
              {brandReply.author}
            </span>
            <div className="flex items-end justify-end gap-1.5">
              <div className="text-[10px] text-slate-500 font-mono-num flex flex-col items-end shrink-0 pb-0.5 leading-tight">
                {brandReply.readStatus && (
                  <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                    <CheckCheck className="w-3 h-3" />
                    อ่านแล้ว
                  </span>
                )}
                <span>{brandReply.time}</span>
              </div>
              <div className="relative p-3 rounded-2xl rounded-tr-xs bg-[#85E249]/35 border border-[#6CC832]/40 shadow-2xs text-slate-900 text-xs sm:text-[13px] leading-relaxed text-left">
                <p className="whitespace-pre-line">{brandReply.content}</p>
              </div>
            </div>
          </div>

          <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 shadow-2xs border border-emerald-400 mt-1 bg-white">
            <img
              src={brandReply.avatarUrl || creator.avatarUrl}
              alt={creator.nameTh}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/assets/juijui/avatar-main.jpg';
              }}
            />
          </div>
        </div>

        {comment.screenshotUrl && (
          <div className="pt-2">
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-white p-1">
              <img
                src={comment.screenshotUrl}
                alt={comment.authorName}
                referrerPolicy="no-referrer"
                className="max-h-40 rounded-lg object-contain w-full bg-slate-50"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer: Verified Campaign Info */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600 gap-2">
        {comment.clipUrl ? (
          <a
            href={comment.clipUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`เปิดชมคลิปแคมเปญ: ${comment.clipReference}`}
            className="group/clip flex items-center gap-1.5 min-w-0 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            <Film className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate font-medium text-[11px] text-slate-700 group-hover/clip:text-emerald-700 group-hover/clip:underline">
              {comment.clipReference}
            </span>
            <ExternalLink className="w-3 h-3 shrink-0 opacity-70 group-hover/clip:opacity-100 transition-opacity" />
          </a>
        ) : (
          <div className="flex items-center gap-1.5 min-w-0">
            <Film className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate font-medium text-[11px] text-slate-700">
              {comment.clipReference}
            </span>
          </div>
        )}

        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 text-[10px] font-semibold shrink-0">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>{comment.likesCount}</span>
        </div>
      </div>
    </motion.div>
  );
};
