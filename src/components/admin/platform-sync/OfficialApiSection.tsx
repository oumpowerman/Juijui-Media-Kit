/**
 * src/components/admin/platform-sync/OfficialApiSection.tsx
 * Official API and Developer Mode section with Horizontal Snap-Scroll Card Deck.
 */

import React, { useRef } from 'react';
import {
  Key,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { CreatorProfile, PlatformStat } from '../../../data/types';
import {
  PlatformApiCredentials,
  SinglePlatformTestResult,
  FetchedPlatformData,
} from '../../../services/platformApiService';
import { TikTokOAuthState } from './types';
import { YouTubeCredentialCard } from './YouTubeCredentialCard';
import { TikTokOAuthCard } from './TikTokOAuthCard';
import { InstagramCredentialCard } from './InstagramCredentialCard';
import { FacebookCredentialCard } from './FacebookCredentialCard';
import { getAllRegisteredPlatforms } from '../../../config/platformRegistry';

interface OfficialApiSectionProps {
  draftCreator: CreatorProfile;
  localCreds: PlatformApiCredentials;
  setLocalCreds: React.Dispatch<React.SetStateAction<PlatformApiCredentials>>;
  showTokens: Record<string, boolean>;
  toggleShowToken: (key: string) => void;
  credentialsSavedToast: boolean;
  onSaveCredentials: () => void;
  onOpenApiGuide: () => void;
  tiktokOAuth?: TikTokOAuthState;
  onConnectTikTok?: (overrideClientKey?: string, overrideClientSecret?: string) => Promise<void>;
  onDisconnectTikTok?: () => Promise<void>;
  onRefreshTikTokToken?: () => Promise<void>;
  onSaveTikTokConfig?: (clientKey: string, clientSecret?: string) => Promise<boolean>;
  singleTestLoading?: Record<string, boolean>;
  singleTestResults?: Record<string, SinglePlatformTestResult | null>;
  onTestSinglePlatform?: (
    platformId: PlatformStat['id'],
    currentPlatforms: PlatformStat[],
    customCreds?: PlatformApiCredentials,
    forceSimulation?: boolean
  ) => Promise<SinglePlatformTestResult>;
  onClearSingleTestResult?: (platformId: PlatformStat['id']) => void;
  onApplySinglePlatformToDiff?: (
    data: FetchedPlatformData,
    currentPlatforms: PlatformStat[]
  ) => void;
  onUpdateCredentials: (creds: PlatformApiCredentials) => void;
}

export const OfficialApiSection: React.FC<OfficialApiSectionProps> = ({
  draftCreator,
  localCreds,
  setLocalCreds,
  showTokens,
  toggleShowToken,
  credentialsSavedToast,
  onSaveCredentials,
  onOpenApiGuide,
  tiktokOAuth,
  onConnectTikTok,
  onDisconnectTikTok,
  onRefreshTikTokToken,
  onSaveTikTokConfig,
  singleTestLoading = {},
  singleTestResults = {},
  onTestSinglePlatform,
  onClearSingleTestResult,
  onApplySinglePlatformToDiff,
  onUpdateCredentials,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const registeredPlatforms = getAllRegisteredPlatforms();

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -420, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 420, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-5">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-violet-100 text-violet-700">
              <Key className="w-4 h-4" />
            </span>
            <h4 className="text-base font-bold text-slate-900">
              การตั้งค่าคีย์ API & โทเค็นทั้ง 4 แพลตฟอร์ม (Official Developer Mode)
            </h4>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            เลื่อนการ์ดแนวนอนเพื่อตั้งค่าคีย์ API แต่ละแพลตฟอร์ม พร้อมปุ่ม{' '}
            <strong className="text-violet-700 font-semibold">[ทดสอบเชื่อมต่อสด]</strong> หรือ{' '}
            <strong className="text-amber-700 font-semibold">[จำลองทดสอบ]</strong> ได้แบบ Real-Time
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenApiGuide}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-violet-600" />
            <span>วิธีขอ API</span>
          </button>

          {credentialsSavedToast && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 animate-in fade-in">
              <Check className="w-3.5 h-3.5" /> บันทึกแล้ว
            </span>
          )}

          <button
            type="button"
            onClick={onSaveCredentials}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-2xs"
          >
            บันทึกคีย์ API
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Navigation Controls */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>การ์ดคีย์ API ทั้ง 4 แพลตฟอร์ม (เลื่อนการ์ดแนวนอน)</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={scrollLeft}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs transition-colors cursor-pointer"
            aria-label="เลื่อนการ์ดซ้าย"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={scrollRight}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs transition-colors cursor-pointer"
            aria-label="เลื่อนการ์ดขวา"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Snap-Scroll Card Deck */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent -mx-1 px-1"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {/* 1. YouTube Data API v3 */}
        <div className="snap-start shrink-0 w-[360px] sm:w-[440px]">
          <YouTubeCredentialCard
            youtubeCreds={localCreds.youtube}
            showToken={Boolean(showTokens['yt_key'])}
            onToggleShowToken={() => toggleShowToken('yt_key')}
            onChangeYoutubeCreds={(nextYoutube) =>
              setLocalCreds((prev) => ({ ...prev, youtube: nextYoutube }))
            }
            isTesting={Boolean(singleTestLoading['youtube'])}
            testResult={singleTestResults['youtube'] || null}
            onRunTest={(forceSim) =>
              onTestSinglePlatform?.('youtube', draftCreator.platforms, localCreds, forceSim)
            }
            onClearTest={() => onClearSingleTestResult?.('youtube')}
            onApplyToDiff={(data) =>
              onApplySinglePlatformToDiff?.(data, draftCreator.platforms)
            }
          />
        </div>

        {/* 2. TikTok for Developers (OAuth 2.0) */}
        <div className="snap-start shrink-0 w-[360px] sm:w-[440px]">
          <TikTokOAuthCard
            tiktokCreds={localCreds.tiktok}
            tiktokOAuth={tiktokOAuth}
            showManualToken={Boolean(showTokens['tt_token'])}
            onToggleShowManualToken={() => toggleShowToken('tt_token')}
            onChangeTiktokCreds={(nextTiktok) =>
              setLocalCreds((prev) => ({ ...prev, tiktok: nextTiktok }))
            }
            onConnectTikTok={onConnectTikTok}
            onDisconnectTikTok={onDisconnectTikTok}
            onRefreshTikTokToken={onRefreshTikTokToken}
            onSaveTikTokConfig={onSaveTikTokConfig}
            isTesting={Boolean(singleTestLoading['tiktok'])}
            testResult={singleTestResults['tiktok'] || null}
            onRunTest={(forceSim) =>
              onTestSinglePlatform?.('tiktok', draftCreator.platforms, localCreds, forceSim)
            }
            onClearTest={() => onClearSingleTestResult?.('tiktok')}
            onApplyToDiff={(data) =>
              onApplySinglePlatformToDiff?.(data, draftCreator.platforms)
            }
          />
        </div>

        {/* 3. Instagram Graph API v20.0 */}
        <div className="snap-start shrink-0 w-[360px] sm:w-[440px]">
          <InstagramCredentialCard
            instagramCreds={localCreds.instagram}
            showToken={Boolean(showTokens['ig_token'])}
            onToggleShowToken={() => toggleShowToken('ig_token')}
            onChangeInstagramCreds={(nextIg, persistImmediately) => {
              const nextCreds: PlatformApiCredentials = {
                ...localCreds,
                instagram: nextIg,
              };
              setLocalCreds(nextCreds);
              if (persistImmediately) {
                onUpdateCredentials(nextCreds);
              }
            }}
            isTesting={Boolean(singleTestLoading['instagram'])}
            testResult={singleTestResults['instagram'] || null}
            onRunTest={(forceSim) =>
              onTestSinglePlatform?.('instagram', draftCreator.platforms, localCreds, forceSim)
            }
            onClearTest={() => onClearSingleTestResult?.('instagram')}
            onApplyToDiff={(data) =>
              onApplySinglePlatformToDiff?.(data, draftCreator.platforms)
            }
          />
        </div>

        {/* 4. Facebook Page Graph API */}
        <div className="snap-start shrink-0 w-[360px] sm:w-[440px]">
          <FacebookCredentialCard
            facebookCreds={localCreds.facebook}
            showToken={Boolean(showTokens['fb_token'])}
            onToggleShowToken={() => toggleShowToken('fb_token')}
            onChangeFacebookCreds={(nextFb) =>
              setLocalCreds((prev) => ({ ...prev, facebook: nextFb }))
            }
            isTesting={Boolean(singleTestLoading['facebook'])}
            testResult={singleTestResults['facebook'] || null}
            onRunTest={(forceSim) =>
              onTestSinglePlatform?.('facebook', draftCreator.platforms, localCreds, forceSim)
            }
            onClearTest={() => onClearSingleTestResult?.('facebook')}
            onApplyToDiff={(data) =>
              onApplySinglePlatformToDiff?.(data, draftCreator.platforms)
            }
          />
        </div>
      </div>

      {/* Enterprise Architecture Footer */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-violet-600" />
          <span>
            สถาปัตยกรรมระดับองค์กรรองรับแพลตฟอร์มผ่าน{' '}
            <code className="px-1.5 py-0.5 rounded bg-slate-100 text-violet-800 font-mono text-[11px]">
              PLATFORM_REGISTRY
            </code>{' '}
            (เปิดใช้งาน {registeredPlatforms.length} แพลตฟอร์ม)
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <span>ความปลอดภัย: เข้ารหัส Token ในระดับ Session & Firestore</span>
        </div>
      </div>
    </div>
  );
};
