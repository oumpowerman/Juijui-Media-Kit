/**
 * src/components/admin/platform-sync/CredentialsGrid.tsx
 * Modular grid rendering platform credential cards and integration status.
 * Architecture driven by PLATFORM_REGISTRY with clean extensibility for future networks.
 */

import React from 'react';
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

export interface CredentialsGridProps {
  draftCreator: CreatorProfile;
  localCreds: PlatformApiCredentials;
  setLocalCreds: React.Dispatch<React.SetStateAction<PlatformApiCredentials>>;
  showTokens: Record<string, boolean>;
  toggleShowToken: (key: string) => void;
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
  onApplySmartImport?: (
    updatedCreator: CreatorProfile,
    summaryMessage: string
  ) => void;
  onUpdateCredentials: (creds: PlatformApiCredentials) => void;
}

export const CredentialsGrid: React.FC<CredentialsGridProps> = ({
  draftCreator,
  localCreds,
  setLocalCreds,
  showTokens,
  toggleShowToken,
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
  onApplySmartImport,
  onUpdateCredentials,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. YouTube Data API v3 */}
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

      {/* 2. TikTok Official OAuth 2.0 & API */}
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

      {/* 3. Instagram Graph API v20.0 */}
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

      {/* 4. Facebook Page Graph API v20.0 */}
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
  );
};
