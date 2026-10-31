/**
 * src/components/admin/platform-sync/SmartPlatformCardDeck.tsx
 * Horizontal Snap-Scroll Card Deck for 4 platforms (YouTube, TikTok, Instagram, Facebook) in Smart Mode.
 */

import React, { useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Camera,
  FileSpreadsheet,
  AtSign,
  TrendingUp,
  Users,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { CreatorProfile, PlatformStat } from '../../../data/types';
import { PlatformBrandIcon } from '../../ui/PlatformBrandIcon';

interface SmartPlatformCardDeckProps {
  draftCreator: CreatorProfile;
  onSelectPlatformAndMode: (
    platformId: PlatformStat['id'],
    mode: 'ocr' | 'csv' | 'username'
  ) => void;
  onQuickFetchHandle?: (platformId: PlatformStat['id'], handle: string) => Promise<void>;
  isQuickFetching?: string | null;
}

export const SmartPlatformCardDeck: React.FC<SmartPlatformCardDeckProps> = ({
  draftCreator,
  onSelectPlatformAndMode,
  onQuickFetchHandle,
  isQuickFetching,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-3">
      {/* Header with Navigation Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <span>การ์ดสถิติแยกตามแพลตฟอร์ม (Platform Smart Cards)</span>
          </h4>
          <p className="text-xs text-slate-500">
            เลื่อนการ์ดแนวนอนเพื่อเลือกนำเข้าหรืออัปเดตสถิติเฉพาะแพลตฟอร์มที่ต้องการ
          </p>
        </div>

        {/* Scroll Chevrons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={scrollLeft}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs transition-colors cursor-pointer"
            aria-label="เลื่อนซ้าย"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={scrollRight}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs transition-colors cursor-pointer"
            aria-label="เลื่อนขวา"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Snap-Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent -mx-1 px-1"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {draftCreator.platforms.map((plat) => {
          const isFetchingThis = isQuickFetching === plat.id;

          return (
            <div
              key={plat.id}
              className="snap-start shrink-0 w-[300px] sm:w-[320px] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs hover:border-violet-200 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Platform Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <PlatformBrandIcon platform={plat.id} size="md" />
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 leading-tight">
                        {plat.name}
                      </h5>
                      <span className="text-[11px] font-medium text-slate-500">
                        {plat.handle || '@username'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    Smart Mode
                  </span>
                </div>

                {/* Stat Highlights */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>ผู้ติดตาม</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {plat.followers}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                      <TrendingUp className="w-3 h-3 text-slate-400" />
                      <span>Engagement</span>
                    </div>
                    <div className="text-sm font-bold text-violet-700 mt-0.5">
                      {plat.er || '3.5%'}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                      <Eye className="w-3 h-3 text-slate-400" />
                      <span>Views (60 วัน)</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-700 mt-0.5">
                      {plat.views || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                      <span>Likes สะสม</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-700 mt-0.5">
                      {plat.likes || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Smart Importer */}
              <div className="pt-3 border-t border-slate-100 space-y-1.5 mt-3">
                {/* 1. Quick Fetch via Username */}
                <button
                  type="button"
                  onClick={() => onSelectPlatformAndMode(plat.id, 'username')}
                  className="w-full px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <AtSign className="w-3.5 h-3.5 text-violet-600" />
                  <span>ดึงสถิติจาก Handle ({plat.handle})</span>
                </button>

                <div className="grid grid-cols-2 gap-1.5">
                  {/* 2. AI Screenshot OCR */}
                  <button
                    type="button"
                    onClick={() => onSelectPlatformAndMode(plat.id, 'ocr')}
                    className="px-2 py-1.5 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    title="อ่านตัวเลขจากภาพแคปหน้าจอ Analytics"
                  >
                    <Camera className="w-3 h-3 text-slate-600" />
                    <span>ภาพแคปจอ (AI OCR)</span>
                  </button>

                  {/* 3. CSV File Upload */}
                  <button
                    type="button"
                    onClick={() => onSelectPlatformAndMode(plat.id, 'csv')}
                    className="px-2 py-1.5 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    title="นำเข้าไฟล์ CSV สถิติ Analytics"
                  >
                    <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                    <span>นำเข้าไฟล์ CSV</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
