/**
 * src/components/admin/platform-sync/TikTokOAuthCard.tsx
 * Official TikTok for Developers OAuth 2.0 and API integration card.
 */

import React, { useState } from 'react';
import { Eye, EyeOff, ExternalLink, Link2, Unlink, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { PlatformBrandIcon } from '../../ui/PlatformBrandIcon';
import {
  PlatformApiCredentials,
  SinglePlatformTestResult,
  FetchedPlatformData,
} from '../../../services/platformApiService';
import { TikTokOAuthState } from './types';
import { PlatformTestBox } from './PlatformTestBox';

export interface TikTokOAuthCardProps {
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
  tiktokCreds,
  tiktokOAuth,
  showManualToken,
  onToggleShowManualToken,
  onChangeTiktokCreds,
  onConnectTikTok,
  onDisconnectTikTok,
  onRefreshTikTokToken,
  onSaveTikTokConfig,
  isTesting,
  testResult,
  onRunTest,
  onClearTest,
  onApplyToDiff,
}) => {
  const [clientKeyInput, setClientKeyInput] = useState(tiktokOAuth?.clientKey || tiktokCreds.clientKey || '');
  const [clientSecretInput, setClientSecretInput] = useState(tiktokOAuth?.clientSecret || '');
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSaveNotice, setConfigSaveNotice] = useState<string | null>(null);

  const isConnected = Boolean(tiktokOAuth?.isConnected || tiktokCreds.accessToken);

  const handleSaveAppConfig = async () => {
    if (!onSaveTikTokConfig) return;
    setIsSavingConfig(true);
    try {
      const ok = await onSaveTikTokConfig(clientKeyInput.trim(), clientSecretInput.trim() || undefined);
      if (ok) {
        onChangeTiktokCreds({
          ...tiktokCreds,
          clientKey: clientKeyInput.trim(),
        });
        setConfigSaveNotice('บันทึก Client Key & Secret สำเร็จ');
        setTimeout(() => setConfigSaveNotice(null), 3000);
      }
    } finally {
      setIsSavingConfig(false);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
      {/* Platform Title & Dev Portal Link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PlatformBrandIcon platform="tiktok" size="sm" />
          <span className="text-xs font-bold text-slate-900">TikTok for Developers (OAuth 2.0)</span>
        </div>
        <a
          href="https://developers.tiktok.com/"
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-violet-600 hover:text-violet-800 flex items-center gap-1"
        >
          <span>TikTok Portal</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* OAuth Connection Status Banner */}
      <div className={`p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
        isConnected
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
          : 'bg-slate-100/80 border-slate-200 text-slate-700'
      }`}>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
          )}
          <div>
            <div className="font-bold flex items-center gap-1.5">
              <span>{isConnected ? 'เชื่อมต่อ TikTok สำเร็จแล้ว' : 'ยังไม่ได้เชื่อมต่อ TikTok OAuth'}</span>
              {isConnected && tiktokOAuth?.displayName && (
                <span className="text-[11px] font-semibold text-emerald-700">
                  (@{tiktokOAuth.displayName})
                </span>
              )}
            </div>
            {isConnected && tiktokOAuth?.followerCount && (
              <p className="text-[11px] text-emerald-700 mt-0.5">
                ผู้ติดตาม: {tiktokOAuth.followerCount.toLocaleString()} คน · คลิป: {tiktokOAuth.videoCount?.toLocaleString() || '-'}
              </p>
            )}
          </div>
        </div>

        {/* OAuth Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!isConnected ? (
            <button
              type="button"
              onClick={() => onConnectTikTok?.(clientKeyInput, clientSecretInput)}
              disabled={tiktokOAuth?.isConnecting}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>{tiktokOAuth?.isConnecting ? 'กำลังเชื่อมต่อ...' : 'เชื่อมต่อ TikTok'}</span>
            </button>
          ) : (
            <>
              {onRefreshTikTokToken && (
                <button
                  type="button"
                  onClick={onRefreshTikTokToken}
                  disabled={tiktokOAuth?.isRefreshing}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="รีเฟรชโทเค็นก่อนหมดอายุ"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${tiktokOAuth?.isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">รีเฟรช</span>
                </button>
              )}
              {onDisconnectTikTok && (
                <button
                  type="button"
                  onClick={onDisconnectTikTok}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                  title="ตัดการเชื่อมต่อบัญชีนี้"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  <span>ตัดการเชื่อมต่อ</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Client Key & Client Secret Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-semibold text-slate-600 mb-1">
            Client Key (App ID)
          </label>
          <input
            type="text"
            value={clientKeyInput}
            onChange={(e) => setClientKeyInput(e.target.value)}
            placeholder="aw..."
            className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-slate-600 mb-1">
            Client Secret
          </label>
          <input
            type="password"
            value={clientSecretInput}
            onChange={(e) => setClientSecretInput(e.target.value)}
            placeholder="••••••••"
            className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] pt-1">
        {configSaveNotice ? (
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {configSaveNotice}
          </span>
        ) : (
          <span className="text-slate-400">บันทึกคีย์เพื่อใช้ใน Popup OAuth อัตโนมัติ</span>
        )}
        <button
          type="button"
          onClick={handleSaveAppConfig}
          disabled={isSavingConfig || !clientKeyInput}
          className="text-xs font-semibold text-violet-700 hover:text-violet-900 cursor-pointer disabled:opacity-40"
        >
          {isSavingConfig ? 'กำลังบันทึก...' : 'บันทึก Client Config'}
        </button>
      </div>

      {/* Manual Access Token Field (Foldable) */}
      <div className="pt-1 border-t border-slate-200">
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-semibold text-slate-600">
            Manual TikTok User Access Token (ทางเลือกสำหรับโหมดตรง)
          </label>
          <button
            type="button"
            onClick={onToggleShowManualToken}
            className="text-[10px] font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1"
          >
            {showManualToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            <span>{showManualToken ? 'ซ่อน' : 'แสดง'}</span>
          </button>
        </div>
        <input
          type={showManualToken ? 'text' : 'password'}
          value={tiktokCreds.accessToken}
          onChange={(e) =>
            onChangeTiktokCreds({
              ...tiktokCreds,
              accessToken: e.target.value,
            })
          }
          placeholder="act.example_token..."
          className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
      </div>

      {/* TikTok Individual Test Box */}
      <PlatformTestBox
        platformId="tiktok"
        platformName="TikTok"
        isLoading={isTesting}
        testResult={testResult}
        onRunTest={onRunTest}
        onClear={onClearTest}
        onApplyToDiff={onApplyToDiff}
      />
    </div>
  );
};
