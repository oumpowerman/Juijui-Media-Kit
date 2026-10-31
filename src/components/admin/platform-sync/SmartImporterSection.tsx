/**
 * src/components/admin/platform-sync/SmartImporterSection.tsx
 * Complete Smart Media Kit Importer Suite for all 4 platforms without API keys.
 */

import React, { useState, useRef } from 'react';
import { Sparkles, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { CreatorProfile, PlatformStat } from '../../../data/types';
import { UnifiedOverviewCard } from './UnifiedOverviewCard';
import { SmartPlatformCardDeck } from './SmartPlatformCardDeck';
import { SmartMediaKitImporter } from '../SmartMediaKitImporter';

interface SmartImporterSectionProps {
  draftCreator: CreatorProfile;
  onApplySmartImport: (updatedCreator: CreatorProfile, summaryMessage: string) => void;
}

export const SmartImporterSection: React.FC<SmartImporterSectionProps> = ({
  draftCreator,
  onApplySmartImport,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformStat['id']>('youtube');
  const [activeImportMode, setActiveImportMode] = useState<'ocr' | 'csv' | 'username'>('username');
  const [isWorkbenchOpen, setIsWorkbenchOpen] = useState(true);

  const workbenchRef = useRef<HTMLDivElement>(null);

  const handleSelectPlatformAndMode = (
    platformId: PlatformStat['id'],
    mode: 'ocr' | 'csv' | 'username'
  ) => {
    setSelectedPlatform(platformId);
    setActiveImportMode(mode);
    setIsWorkbenchOpen(true);

    // Smooth scroll down to the workbench tool
    setTimeout(() => {
      workbenchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* 1. Executive 4-Platform Unified Overview Card (1-Click Sync All) */}
      <UnifiedOverviewCard
        draftCreator={draftCreator}
        onApplySmartImport={onApplySmartImport}
        onOpenDetailedImporter={(platId, mode) =>
          handleSelectPlatformAndMode(platId, mode || 'ocr')
        }
      />

      {/* 2. Horizontal Snap-Scroll Platform Card Deck (เลื่อนเป็น CARD) */}
      <SmartPlatformCardDeck
        draftCreator={draftCreator}
        onSelectPlatformAndMode={handleSelectPlatformAndMode}
      />

      {/* 3. Interactive Workbench: Smart Media Kit Importer Engine */}
      <div
        ref={workbenchRef}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all"
      >
        <button
          type="button"
          onClick={() => setIsWorkbenchOpen((prev) => !prev)}
          className="w-full px-5 py-3.5 bg-slate-50/70 hover:bg-slate-100/70 border-b border-slate-200/80 flex items-center justify-between transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-bold text-slate-900">
              กล่องเครื่องมือนำเข้าอัจฉริยะ (Smart Media Kit Importer Workbench)
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 font-semibold hidden sm:inline">
              ไม่ต้องใช้ API Key
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>{isWorkbenchOpen ? 'ย่อหน้าต่าง' : 'ขยายเครื่องมือ'}</span>
            {isWorkbenchOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {isWorkbenchOpen && (
          <div className="p-4 sm:p-6">
            <SmartMediaKitImporter
              draftCreator={draftCreator}
              onApplyUpdatedCreator={onApplySmartImport}
              defaultMode={activeImportMode}
              compactHeader={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};
