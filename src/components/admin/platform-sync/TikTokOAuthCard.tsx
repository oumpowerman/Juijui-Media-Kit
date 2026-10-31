import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Key,
  ExternalLink,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
} from 'lucide-react';
import { PlatformBrandIcon } from '../../ui/PlatformBrandIcon';
import {
  PlatformApiCredentials,
  SinglePlatformTestResult,
  FetchedPlatformData,
} from '../../../services/platformApiService';
import { TikTokOAuthState } from './types';
import { PlatformTestBox } from './PlatformTestBox';

interface TikTokOAuthCardProps {
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
  const [tiktokClientKeyInput, setTiktokClientKeyInput] = useState(
    tiktokOAuth?.clientKey || tiktokCreds.clientKey || ''
  );
  const [tiktokClientSecretInput, setTiktokClientSecretInput] = useState('');
  const [showTikTokSecret, setShowTikTokSecret] = useState(false);
  const [showTikTokSettings, setShowTikTokSettings] = useState(false);
  const [showTikTokManualFallback, setShowTikTokManualFallback] = useState(false);
  const [copiedRedirectUri, setCopiedRedirectUri] = useState(false);
  const [isSavingTikTokConfig, setIsSavingTikTokConfig] = useState(false);
  const [tiktokConfigSavedToast, setTiktokConfigSavedToast] = useState(false);

  useEffect(() => {
    const incomingKey = tiktokOAuth?.clientKey || tiktokCreds.clientKey || '';
    if (incomingKey && !tiktokClientKeyInput) {
      setTiktokClientKeyInput(incomingKey);
    }
  }, [tiktokOAuth?.clientKey, tiktokCreds.clientKey, tiktokClientKeyInput]);

  const handleSaveTikTokConfig = async () => {
    if (!onSaveTikTokConfig) return;
    setIsSavingTikTokConfig(true);
    try {
      const ok = await onSaveTikTokConfig(tiktokClientKeyInput, tiktokClientSecretInput);
      if (ok) {
        setTiktokConfigSavedToast(true);
        setTimeout(() => setTiktokConfigSavedToast(false), 2400);
      }
    } finally {
      setIsSavingTikTokConfig(false);
    }
  };

  const handleCopyRedirectUri = () => {
    const uri =
      tiktokOAuth?.redirectUri ||
      (typeof window !== 'undefined' ? `${window.location.origin}/api/tiktok/callback` : '');
    if (!uri) return;
    navigator.clipboard.writeText(uri);
    setCopiedRedirectUri(true);
    setTimeout(() => setCopiedRedirectUri(false), 2000);
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <PlatformBrandIcon platform="tiktok" size="sm" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                TikTok Official OAuth 2.0
              </span>
              {tiktokOAuth?.isConnected ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  เชื่อมต่อแล้ว
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  ยังไม่ได้เชื่อมต่อ
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              ระบบดึงข้อมูลสถิติสดผ่าน TikTok Open API v2 อัตโนมัติ
            </p>
          </div>
        </div>

        <a
          href="https://developers.tiktok.com/"
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-violet-600 hover:text-violet-800 flex items-center gap-1 font-semibold"
        >
          <span>TikTok Developers</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Error or Success notification banner */}
      {tiktokOAuth?.error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">การเชื่อมต่อ TikTok ขัดข้อง:</span>
            <p className="mt-0.5 text-rose-700">{tiktokOAuth.error}</p>
          </div>
        </div>
      )}

      {tiktokOAuth?.successMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">{tiktokOAuth.successMessage}</span>
        </div>
      )}

      {/* Main Action Area */}
      {tiktokOAuth?.isConnected ? (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {tiktokOAuth.avatarUrl ? (
                <img
                  src={tiktokOAuth.avatarUrl}
                  alt="TikTok Avatar"
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                  TT
                </div>
              )}
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {tiktokOAuth.displayName || 'TikTok Official Creator'}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {tiktokOAuth.openId ? `OpenID: ${tiktokOAuth.openId.substring(0, 14)}...` : 'Authorized'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={tiktokOAuth.isRefreshing}
                onClick={onRefreshTikTokToken}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="ขอรีเฟรชอายุ Access Token ใหม่"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    tiktokOAuth.isRefreshing ? 'animate-spin text-violet-600' : 'text-slate-500'
                  }`}
                />
                <span>{tiktokOAuth.isRefreshing ? 'กำลังรีเฟรช...' : 'รีเฟรชสิทธิ์'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('คุณต้องการตัดการเชื่อมต่อบัญชี TikTok นี้ใช่หรือไม่?')) {
                    onDisconnectTikTok?.();
                  }
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                ตัดการเชื่อมต่อ
              </button>
            </div>
          </div>

          {/* Cached Stats Badges */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/70 text-center">
            <div className="p-2 bg-white rounded-lg border border-slate-100">
              <div className="text-[10px] text-slate-500 font-medium">ผู้ติดตาม</div>
              <div className="text-xs font-bold text-slate-900 font-mono mt-0.5">
                {tiktokOAuth.followerCount != null
                  ? tiktokOAuth.followerCount.toLocaleString()
                  : 'พร้อมดึง'}
              </div>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-100">
              <div className="text-[10px] text-slate-500 font-medium">ยอดถูกใจรวม</div>
              <div className="text-xs font-bold text-slate-900 font-mono mt-0.5">
                {tiktokOAuth.likesCount != null
                  ? tiktokOAuth.likesCount.toLocaleString()
                  : 'พร้อมดึง'}
              </div>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-100">
              <div className="text-[10px] text-slate-500 font-medium">คลิปวิดีโอ</div>
              <div className="text-xs font-bold text-slate-900 font-mono mt-0.5">
                {tiktokOAuth.videoCount != null
                  ? tiktokOAuth.videoCount.toLocaleString()
                  : 'พร้อมดึง'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            type="button"
            disabled={tiktokOAuth?.isConnecting || !onConnectTikTok}
            onClick={() =>
              onConnectTikTok?.(
                tiktokClientKeyInput || undefined,
                tiktokClientSecretInput || undefined
              )
            }
            className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs shadow-md shadow-slate-950/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer border border-slate-800 disabled:opacity-50"
          >
            <PlatformBrandIcon platform="tiktok" size="xs" />
            <span>
              {tiktokOAuth?.isConnecting
                ? 'กำลังรอการยืนยันสิทธิ์จากหน้าต่าง TikTok...'
                : 'เชื่อมต่อบัญชี TikTok (Connect TikTok OAuth 2.0)'}
            </span>
          </button>
          <p className="text-[11px] text-slate-500 text-center">
            คลิกเพื่อเปิดหน้าต่าง Popup เข้าสู่ระบบ TikTok และยืนยันสิทธิ์อย่างปลอดภัยตามมาตรฐาน Official API
          </p>
        </div>
      )}

      {/* Collapsible TikTok Client Key & Secret Settings */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowTikTokSettings(!showTikTokSettings)}
          className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Key className="w-3.5 h-3.5 text-slate-500" />
            <span>ตั้งค่า TikTok Client Credentials & Redirect URI</span>
            {tiktokOAuth?.hasClientSecret && (
              <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Secret บันทึกแล้ว
              </span>
            )}
          </div>
          {showTikTokSettings ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {showTikTokSettings && (
          <div className="p-3.5 bg-white space-y-3 border-t border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                  TikTok Client Key
                </label>
                <input
                  type="text"
                  value={tiktokClientKeyInput}
                  onChange={(e) => setTiktokClientKeyInput(e.target.value)}
                  placeholder="aw1234567890..."
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white border border-slate-300 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
                  <span>TikTok Client Secret</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {tiktokOAuth?.hasClientSecret ? '(มีค่าบันทึกอยู่บนเซิร์ฟเวอร์แล้ว)' : '(ยังไม่ได้บันทึก)'}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showTikTokSecret ? 'text' : 'password'}
                    value={tiktokClientSecretInput}
                    onChange={(e) => setTiktokClientSecretInput(e.target.value)}
                    placeholder={
                      tiktokOAuth?.hasClientSecret
                        ? '••••••••••••••••••••'
                        : 'กรอก Client Secret...'
                    }
                    className="w-full px-2.5 py-1.5 pr-8 text-xs font-mono rounded-lg bg-white border border-slate-300 focus:outline-none focus:border-violet-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTikTokSecret(!showTikTokSecret)}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                  >
                    {showTikTokSecret ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Redirect URI Box with 1-Click Copy */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                OAuth Redirect URI (นำไปใส่ใน TikTok Developer Portal)
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-2.5 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 truncate select-all">
                  {tiktokOAuth?.redirectUri ||
                    (typeof window !== 'undefined'
                      ? `${window.location.origin}/api/tiktok/callback`
                      : '')}
                </div>
                <button
                  type="button"
                  onClick={handleCopyRedirectUri}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                >
                  {copiedRedirectUri ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedRedirectUri ? 'คัดลอกแล้ว!' : 'คัดลอก URL'}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                ตั้งค่าใน TikTok Developer Console &gt; App Details &gt; Redirect domain
              </p>
            </div>

            {/* Save Credentials Button */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                {tiktokConfigSavedToast ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> บันทึกการตั้งค่าเรียบร้อยแล้ว
                  </span>
                ) : (
                  'บันทึก Client Key & Secret เพื่อเปิดใช้งาน OAuth 2.0 Flow'
                )}
              </span>
              <button
                type="button"
                disabled={isSavingTikTokConfig}
                onClick={handleSaveTikTokConfig}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white cursor-pointer disabled:opacity-50"
              >
                {isSavingTikTokConfig ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Collapsible Manual Token Fallback Accordion */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowTikTokManualFallback(!showTikTokManualFallback)}
          className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
        >
          <span>ทางเลือกสำรอง: กรอก User Access Token ด้วยตนเอง (Sandbox Mode Fallback)</span>
          {showTikTokManualFallback ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {showTikTokManualFallback && (
          <div className="p-3.5 bg-white space-y-3 border-t border-slate-200">
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                TikTok User Access Token (Bearer)
              </label>
              <div className="relative">
                <input
                  type={showManualToken ? 'text' : 'password'}
                  value={tiktokCreds.accessToken}
                  onChange={(e) =>
                    onChangeTiktokCreds({
                      ...tiktokCreds,
                      accessToken: e.target.value,
                    })
                  }
                  placeholder="act.example_tiktok_token..."
                  className="w-full px-2.5 py-1.5 pr-8 text-xs font-mono rounded-lg bg-white border border-slate-300"
                />
                <button
                  type="button"
                  onClick={onToggleShowManualToken}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  {showManualToken ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                Username (@)
              </label>
              <input
                type="text"
                value={tiktokCreds.username}
                onChange={(e) =>
                  onChangeTiktokCreds({
                    ...tiktokCreds,
                    username: e.target.value,
                  })
                }
                placeholder="juijui.j"
                className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white border border-slate-300"
              />
            </div>
          </div>
        )}
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
