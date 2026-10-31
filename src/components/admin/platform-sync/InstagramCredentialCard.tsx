import React, { useState } from 'react';
import { Eye, EyeOff, ExternalLink, Sparkles, X } from 'lucide-react';
import { PlatformBrandIcon } from '../../ui/PlatformBrandIcon';
import {
  PlatformApiCredentials,
  SinglePlatformTestResult,
  FetchedPlatformData,
  discoverInstagramBusinessAccount,
} from '../../../services/platformApiService';
import { PlatformTestBox } from './PlatformTestBox';

interface InstagramCredentialCardProps {
  instagramCreds: PlatformApiCredentials['instagram'];
  showToken: boolean;
  onToggleShowToken: () => void;
  onChangeInstagramCreds: (
    next: PlatformApiCredentials['instagram'],
    persistImmediately?: boolean
  ) => void;
  isTesting: boolean;
  testResult: SinglePlatformTestResult | null;
  onRunTest: (forceSim: boolean) => void;
  onClearTest: () => void;
  onApplyToDiff: (data: FetchedPlatformData) => void;
}

export const InstagramCredentialCard: React.FC<InstagramCredentialCardProps> = ({
  instagramCreds,
  showToken,
  onToggleShowToken,
  onChangeInstagramCreds,
  isTesting,
  testResult,
  onRunTest,
  onClearTest,
  onApplyToDiff,
}) => {
  const [igDiscoverLoading, setIgDiscoverLoading] = useState(false);
  const [igDiscoverMessage, setIgDiscoverMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleDiscoverIgAccount = async () => {
    setIgDiscoverLoading(true);
    setIgDiscoverMessage(null);
    try {
      const found = await discoverInstagramBusinessAccount(instagramCreds.accessToken);
      const nextIgCreds: PlatformApiCredentials['instagram'] = {
        ...instagramCreds,
        igUserId: found.igUserId,
        username: found.username || instagramCreds.username,
      };
      onChangeInstagramCreds(nextIgCreds, true);
      setIgDiscoverMessage({
        type: 'success',
        text: `พบบัญชี @${found.username || found.name} (IG ID: ${found.igUserId} · ผู้ติดตาม ${found.followersCount.toLocaleString()} คน) และบันทึกให้อัตโนมัติแล้ว!`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ไม่พบบัญชี IG Business จาก Token นี้';
      setIgDiscoverMessage({ type: 'error', text: msg });
    } finally {
      setIgDiscoverLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PlatformBrandIcon platform="instagram" size="sm" />
          <span className="text-xs font-bold text-slate-900">Instagram Graph API v20.0</span>
        </div>
        <a
          href="https://developers.facebook.com/docs/instagram-platform/instagram-graph-api"
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-violet-600 hover:text-violet-800 flex items-center gap-1"
        >
          <span>Meta Developers</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-slate-600 mb-1">
          Meta User / Page Access Token
        </label>
        <div className="relative">
          <input
            type={showToken ? 'text' : 'password'}
            value={instagramCreds.accessToken}
            onChange={(e) =>
              onChangeInstagramCreds({
                ...instagramCreds,
                accessToken: e.target.value,
              })
            }
            placeholder="EAAG..."
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
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-semibold text-slate-600">
              IG Business / User ID
            </label>
            <button
              type="button"
              disabled={igDiscoverLoading || !instagramCreds.accessToken}
              onClick={handleDiscoverIgAccount}
              className="text-[10px] font-bold text-violet-600 hover:text-violet-800 disabled:opacity-40 cursor-pointer flex items-center gap-0.5"
              title="ดึงรหัส 17 หลักของ IG Business Account อัตโนมัติจาก Token ที่ใส่ไว้"
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>{igDiscoverLoading ? 'กำลังค้นหา...' : 'ค้นหา ID อัตโนมัติ'}</span>
            </button>
          </div>
          <input
            type="text"
            value={instagramCreds.igUserId}
            onChange={(e) =>
              onChangeInstagramCreds({
                ...instagramCreds,
                igUserId: e.target.value,
              })
            }
            placeholder="17841400..."
            className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white border border-slate-300"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-slate-600 mb-1">
            IG Username
          </label>
          <input
            type="text"
            value={instagramCreds.username}
            onChange={(e) =>
              onChangeInstagramCreds({
                ...instagramCreds,
                username: e.target.value,
              })
            }
            placeholder="juijui.official"
            className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white border border-slate-300"
          />
        </div>
      </div>

      {igDiscoverMessage && (
        <div
          className={`p-2 rounded-lg border text-[11px] flex items-center justify-between gap-2 ${
            igDiscoverMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <span>{igDiscoverMessage.text}</span>
          <button
            type="button"
            onClick={() => setIgDiscoverMessage(null)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Instagram Individual Test Box */}
      <PlatformTestBox
        platformId="instagram"
        platformName="Instagram"
        isLoading={isTesting}
        testResult={testResult}
        onRunTest={onRunTest}
        onClear={onClearTest}
        onApplyToDiff={onApplyToDiff}
      />
    </div>
  );
};
