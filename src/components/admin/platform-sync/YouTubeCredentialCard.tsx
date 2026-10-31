import React from 'react';
import { Eye, EyeOff, ExternalLink } from 'lucide-react';
import { PlatformBrandIcon } from '../../ui/PlatformBrandIcon';
import {
  PlatformApiCredentials,
  SinglePlatformTestResult,
  FetchedPlatformData,
} from '../../../services/platformApiService';
import { PlatformTestBox } from './PlatformTestBox';

interface YouTubeCredentialCardProps {
  youtubeCreds: PlatformApiCredentials['youtube'];
  showToken: boolean;
  onToggleShowToken: () => void;
  onChangeYoutubeCreds: (next: PlatformApiCredentials['youtube']) => void;
  isTesting: boolean;
  testResult: SinglePlatformTestResult | null;
  onRunTest: (forceSim: boolean) => void;
  onClearTest: () => void;
  onApplyToDiff: (data: FetchedPlatformData) => void;
}

export const YouTubeCredentialCard: React.FC<YouTubeCredentialCardProps> = ({
  youtubeCreds,
  showToken,
  onToggleShowToken,
  onChangeYoutubeCreds,
  isTesting,
  testResult,
  onRunTest,
  onClearTest,
  onApplyToDiff,
}) => {
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PlatformBrandIcon platform="youtube" size="sm" />
          <span className="text-xs font-bold text-slate-900">YouTube Data API v3</span>
        </div>
        <a
          href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-violet-600 hover:text-violet-800 flex items-center gap-1"
        >
          <span>รับ API Key</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-slate-600 mb-1">
          YouTube API Key (Google Cloud)
        </label>
        <div className="relative">
          <input
            type={showToken ? 'text' : 'password'}
            value={youtubeCreds.apiKey}
            onChange={(e) =>
              onChangeYoutubeCreds({
                ...youtubeCreds,
                apiKey: e.target.value,
              })
            }
            placeholder="AIzaSy..."
            className="w-full px-2.5 py-1.5 pr-8 text-xs font-mono rounded-lg bg-white border border-slate-300"
          />
          <button
            type="button"
            onClick={onToggleShowToken}
            className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
          >
            {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-semibold text-slate-600 mb-1">
            Channel ID
          </label>
          <input
            type="text"
            value={youtubeCreds.channelId}
            onChange={(e) =>
              onChangeYoutubeCreds({
                ...youtubeCreds,
                channelId: e.target.value,
              })
            }
            placeholder="UC_..."
            className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white border border-slate-300"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-slate-600 mb-1">
            Custom Handle
          </label>
          <input
            type="text"
            value={youtubeCreds.customHandle}
            onChange={(e) =>
              onChangeYoutubeCreds({
                ...youtubeCreds,
                customHandle: e.target.value,
              })
            }
            placeholder="@JUIJUIChannel"
            className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white border border-slate-300"
          />
        </div>
      </div>

      {/* YouTube Individual Test Box */}
      <PlatformTestBox
        platformId="youtube"
        platformName="YouTube"
        isLoading={isTesting}
        testResult={testResult}
        onRunTest={onRunTest}
        onClear={onClearTest}
        onApplyToDiff={onApplyToDiff}
      />
    </div>
  );
};
