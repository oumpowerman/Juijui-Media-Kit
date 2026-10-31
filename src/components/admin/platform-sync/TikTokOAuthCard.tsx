import React from 'react';
import { CreatorProfile } from '../../../data/types';
import {
  PlatformApiCredentials,
  SinglePlatformTestResult,
  FetchedPlatformData,
} from '../../../services/platformApiService';
import { TikTokOAuthState } from './types';
import { SmartMediaKitImporter } from '../SmartMediaKitImporter';

interface TikTokOAuthCardProps {
  draftCreator?: CreatorProfile;
  onApplySmartImport?: (
    updatedCreator: CreatorProfile,
    summaryMessage: string
  ) => void;
  tiktokCreds: PlatformApiCredentials['tiktok'];
  tiktokOAuth?: TikTokOAuthState;
  showManualToken: boolean;
  onToggleShowManualToken: () => void;
  onChangeTiktokCreds: (next: PlatformApiCredentials['tiktok']) => void;
  onConnectTikTok?: (overrideClientKey?: string, overrideClientSecret?: string) => Promise<void>;
  onDisconnectTikTok?: () => Promise<void>;
  onRefreshTikTokToken?: () => Promise<void>;
  onSaveTikTokConfig?: (clientKey: string, clientSecret?: string) => Promise<boolean>;
  isTesting: boolean;
  testResult: SinglePlatformTestResult | null;
  onRunTest: (forceSim: boolean) => void;
  onClearTest: () => void;
  onApplyToDiff: (data: FetchedPlatformData) => void;
}

export const TikTokOAuthCard: React.FC<TikTokOAuthCardProps> = ({
  draftCreator,
  onApplySmartImport,
}) => {
  if (!draftCreator || !onApplySmartImport) {
    return null;
  }

  return (
    <div className="md:col-span-2">
      <SmartMediaKitImporter
        draftCreator={draftCreator}
        onApplyUpdatedCreator={onApplySmartImport}
      />
    </div>
  );
};
