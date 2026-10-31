import React from 'react';
import { Eye, EyeOff, ExternalLink } from 'lucide-react';
import { PlatformBrandIcon } from '../../ui/PlatformBrandIcon';
import {
  PlatformApiCredentials,
  SinglePlatformTestResult,
  FetchedPlatformData,
} from '../../../services/platformApiService';
import { PlatformTestBox } from './PlatformTestBox';

interface FacebookCredentialCardProps {
  facebookCreds: PlatformApiCredentials['facebook'];
  showToken: boolean;
  onToggleShowToken: () => void;
  onChangeFacebookCreds: (next: PlatformApiCredentials['facebook']) => void;
  isTesting: boolean;
  testResult: SinglePlatformTestResult | null;
  onRunTest: (forceSim: boolean) => void;
  onClearTest: () => void;
  onApplyToDiff: (data: FetchedPlatformData) => void;
}

export const FacebookCredentialCard: React.FC<FacebookCredentialCardProps> = ({
  facebookCreds,
  showToken,
  onToggleShowToken,
  onChangeFacebookCreds,
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
          <PlatformBrandIcon platform="facebook" size="sm" />
          <span className="text-xs font-bold text-slate-900">Facebook Page API v20.0</span>
        </div>
        <a
          href="https://developers.facebook.com/tools/explorer/"
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-violet-600 hover:text-violet-800 flex items-center gap-1"
        >
          <span>Graph API Explorer</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-slate-600 mb-1">
          Page Access Token
        </label>
        <div className="relative">
          <input
            type={showToken ? 'text' : 'password'}
            value={facebookCreds.pageAccessToken}
            onChange={(e) =>
              onChangeFacebookCreds({
                ...facebookCreds,
                pageAccessToken: e.target.value,
              })
            }
            placeholder="EAAB..."
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
            Page ID / Page Name
          </label>
          <input
            type="text"
            value={facebookCreds.pageId}
            onChange={(e) =>
              onChangeFacebookCreds({
                ...facebookCreds,
                pageId: e.target.value,
              })
            }
            placeholder="juijui.fanpage.official"
            className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white border border-slate-300"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-slate-600 mb-1">
            ชื่อแฟนเพจ
          </label>
          <input
            type="text"
            value={facebookCreds.pageName}
            onChange={(e) =>
              onChangeFacebookCreds({
                ...facebookCreds,
                pageName: e.target.value,
              })
            }
            placeholder="จุ๊ยจุ๊ย จุ๊ย"
            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
          />
        </div>
      </div>

      {/* Facebook Individual Test Box */}
      <PlatformTestBox
        platformId="facebook"
        platformName="Facebook Page"
        isLoading={isTesting}
        testResult={testResult}
        onRunTest={onRunTest}
        onClear={onClearTest}
        onApplyToDiff={onApplyToDiff}
      />
    </div>
  );
};
