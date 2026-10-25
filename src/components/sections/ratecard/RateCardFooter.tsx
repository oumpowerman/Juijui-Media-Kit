import React from 'react';
import { FileText, Settings } from 'lucide-react';

export interface RateCardFooterProps {
  nameTh: string;
  nameEn: string;
  onOpenPdf: () => void;
  onOpenAdmin?: () => void;
  onUnlockAdminToolbar?: () => void;
}

export const RateCardFooter: React.FC<RateCardFooterProps> = ({
  nameTh,
  nameEn,
  onOpenPdf,
  onOpenAdmin,
  onUnlockAdminToolbar,
}) => {
  return (
    <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
      <div className="w-full max-w-7xl xl:max-w-[94vw] 2xl:max-w-[95vw] min-[2400px]:max-w-[2280px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-6 2xl:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-bold text-slate-900">
            {nameTh} | {nameEn}
          </span>
          <span className="mx-2">·</span>
          <span>ราคาอาจมีการเปลี่ยนแปลงตามรายละเอียดและระยะเวลาแคมเปญ</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onOpenPdf}
            className="inline-flex items-center gap-1 hover:text-violet-700 font-medium cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF Media Kit</span>
          </button>
          {onOpenAdmin ? (
            <>
              <span>·</span>
              <button
                type="button"
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1 hover:text-violet-700 font-medium cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Creator Studio</span>
              </button>
            </>
          ) : (
            onUnlockAdminToolbar && (
              <button
                type="button"
                onClick={onUnlockAdminToolbar}
                title="สำหรับเจ้าของช่อง (Creator Admin)"
                className="opacity-25 hover:opacity-80 text-slate-400 hover:text-violet-700 transition-opacity cursor-pointer p-1"
              >
                <Settings className="w-3 h-3" />
              </button>
            )
          )}
        </div>
      </div>
    </footer>
  );
};
