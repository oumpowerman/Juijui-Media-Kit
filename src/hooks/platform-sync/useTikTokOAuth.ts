/**
 * src/hooks/platform-sync/useTikTokOAuth.ts
 * Manages TikTok OAuth 2.0 lifecycle, popup authentication flow, token refresh,
 * state persistence to localStorage and Firestore.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { safeParseJsonResponse, PlatformApiCredentials } from '../../services/platformApiService';
import { TikTokOAuthState, StoredTikTokOAuthData } from '../../types/platformSync';
import { CREDENTIALS_STORAGE_KEY } from './usePlatformCredentials';

export const TIKTOK_OAUTH_STORAGE_KEY = 'juijui_tiktok_oauth_state';

interface UseTikTokOAuthOptions {
  credentialsRef: React.MutableRefObject<PlatformApiCredentials>;
  setCredentials: React.Dispatch<React.SetStateAction<PlatformApiCredentials>>;
  syncPlatformConfigToFirestore: (
    nextCreds: PlatformApiCredentials,
    nextOAuth: Partial<StoredTikTokOAuthData>
  ) => Promise<void>;
}

export function useTikTokOAuth({
  credentialsRef,
  setCredentials,
  syncPlatformConfigToFirestore,
}: UseTikTokOAuthOptions) {
  const [tiktokOAuth, setTiktokOAuth] = useState<TikTokOAuthState>(() => {
    const defaultRedirectUri =
      typeof window !== 'undefined' ? `${window.location.origin}/api/tiktok/callback` : '';
    try {
      const stored = localStorage.getItem(TIKTOK_OAUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          clientKey: parsed.clientKey || '',
          clientSecret: parsed.clientSecret || '',
          hasClientSecret: Boolean(parsed.hasClientSecret || parsed.clientSecret),
          isConnected: Boolean(parsed.isConnected || parsed.accessToken),
          accessToken: parsed.accessToken || '',
          refreshToken: parsed.refreshToken || '',
          expiresAt: parsed.expiresAt || null,
          openId: parsed.openId || null,
          displayName: parsed.displayName || null,
          avatarUrl: parsed.avatarUrl || null,
          followerCount: parsed.followerCount ?? null,
          likesCount: parsed.likesCount ?? null,
          videoCount: parsed.videoCount ?? null,
          lastSyncedAt: parsed.lastSyncedAt || null,
          redirectUri: defaultRedirectUri,
          isConnecting: false,
          isRefreshing: false,
          error: null,
          successMessage: null,
        };
      }
    } catch {
      // Ignore
    }

    return {
      clientKey: '',
      clientSecret: '',
      hasClientSecret: false,
      isConnected: false,
      accessToken: '',
      refreshToken: '',
      expiresAt: null,
      openId: null,
      displayName: null,
      avatarUrl: null,
      followerCount: null,
      likesCount: null,
      videoCount: null,
      lastSyncedAt: null,
      redirectUri: defaultRedirectUri,
      isConnecting: false,
      isRefreshing: false,
      error: null,
      successMessage: null,
    };
  });

  const tiktokOAuthRef = useRef<StoredTikTokOAuthData>({
    clientKey: tiktokOAuth.clientKey,
    clientSecret: tiktokOAuth.clientSecret,
    hasClientSecret: tiktokOAuth.hasClientSecret,
    isConnected: tiktokOAuth.isConnected,
    accessToken: tiktokOAuth.accessToken,
    refreshToken: tiktokOAuth.refreshToken,
    expiresAt: tiktokOAuth.expiresAt,
    openId: tiktokOAuth.openId,
    displayName: tiktokOAuth.displayName,
    avatarUrl: tiktokOAuth.avatarUrl,
    followerCount: tiktokOAuth.followerCount,
    likesCount: tiktokOAuth.likesCount,
    videoCount: tiktokOAuth.videoCount,
    lastSyncedAt: tiktokOAuth.lastSyncedAt,
    redirectUri: tiktokOAuth.redirectUri,
  });
  tiktokOAuthRef.current = tiktokOAuth;

  // Sync remote Firestore updates to local state
  useEffect(() => {
    const configDocRef = doc(db, 'settings', 'platformConfig');
    const unsubscribe = onSnapshot(
      configDocRef,
      (snapshot) => {
        if (!snapshot.exists()) return;
        const data = snapshot.data();
        if (data?.tiktokOAuth && typeof data.tiktokOAuth === 'object') {
          const remoteOAuth = data.tiktokOAuth;
          setTiktokOAuth((prev) => {
            const updated = {
              ...prev,
              clientKey: remoteOAuth.clientKey || prev.clientKey,
              clientSecret: remoteOAuth.clientSecret || prev.clientSecret,
              hasClientSecret: Boolean(
                remoteOAuth.hasClientSecret || remoteOAuth.clientSecret || prev.hasClientSecret
              ),
              isConnected: Boolean(
                remoteOAuth.isConnected || remoteOAuth.accessToken || prev.isConnected
              ),
              accessToken: remoteOAuth.accessToken || prev.accessToken,
              refreshToken: remoteOAuth.refreshToken || prev.refreshToken,
              expiresAt: remoteOAuth.expiresAt || prev.expiresAt,
              openId: remoteOAuth.openId || prev.openId,
              displayName: remoteOAuth.displayName || prev.displayName,
              avatarUrl: remoteOAuth.avatarUrl || prev.avatarUrl,
              followerCount: remoteOAuth.followerCount ?? prev.followerCount,
              likesCount: remoteOAuth.likesCount ?? prev.likesCount,
              videoCount: remoteOAuth.videoCount ?? prev.videoCount,
              lastSyncedAt: remoteOAuth.lastSyncedAt || prev.lastSyncedAt,
            };
            try {
              localStorage.setItem(TIKTOK_OAUTH_STORAGE_KEY, JSON.stringify(updated));
            } catch {
              // Ignore
            }
            return updated;
          });
        }
      },
      () => {
        // Non-blocking error handler
      }
    );

    return () => unsubscribe();
  }, []);

  // Listen for popup window postMessage callbacks
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'TIKTOK_OAUTH_SUCCESS') {
        const payload = event.data.payload || {};
        const nextOAuthState: StoredTikTokOAuthData = {
          clientKey: payload.clientKey || tiktokOAuthRef.current.clientKey,
          clientSecret: tiktokOAuthRef.current.clientSecret,
          hasClientSecret: tiktokOAuthRef.current.hasClientSecret,
          isConnected: true,
          accessToken: payload.accessToken || '',
          refreshToken: payload.refreshToken || '',
          expiresAt: payload.expiresAt || null,
          openId: payload.openId || null,
          displayName: payload.displayName || null,
          avatarUrl: payload.avatarUrl || null,
          followerCount: payload.followerCount ?? null,
          likesCount: payload.likesCount ?? null,
          videoCount: payload.videoCount ?? null,
          lastSyncedAt: new Date().toISOString(),
          redirectUri: `${window.location.origin}/api/tiktok/callback`,
        };

        setTiktokOAuth((prev) => ({
          ...prev,
          ...nextOAuthState,
          isConnecting: false,
          error: null,
          successMessage: 'เชื่อมต่อกับ TikTok ทางการสำเร็จแล้ว!',
        }));

        try {
          localStorage.setItem(TIKTOK_OAUTH_STORAGE_KEY, JSON.stringify(nextOAuthState));
        } catch {
          // Ignore
        }

        const updatedCreds: PlatformApiCredentials = {
          ...credentialsRef.current,
          tiktok: {
            ...credentialsRef.current.tiktok,
            clientKey: nextOAuthState.clientKey || credentialsRef.current.tiktok.clientKey,
            accessToken: payload.accessToken || credentialsRef.current.tiktok.accessToken,
            refreshToken: payload.refreshToken || credentialsRef.current.tiktok.refreshToken,
          },
        };
        setCredentials(updatedCreds);
        try {
          localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(updatedCreds));
        } catch {
          // Ignore
        }

        syncPlatformConfigToFirestore(updatedCreds, nextOAuthState);

        setTimeout(() => {
          setTiktokOAuth((prev) => ({ ...prev, successMessage: null }));
        }, 5000);
      } else if (event.data?.type === 'TIKTOK_OAUTH_ERROR') {
        setTiktokOAuth((prev) => ({
          ...prev,
          isConnecting: false,
          error: event.data.error || 'การเชื่อมต่อ TikTok ล้มเหลว',
        }));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [credentialsRef, setCredentials, syncPlatformConfigToFirestore]);

  // Save TikTok client credentials
  const saveTikTokConfig = useCallback(
    async (clientKey: string, clientSecret?: string) => {
      const trimmedKey = clientKey.trim();
      const trimmedSecret = clientSecret ? clientSecret.trim() : undefined;

      try {
        const nextCreds: PlatformApiCredentials = {
          ...credentialsRef.current,
          tiktok: {
            ...credentialsRef.current.tiktok,
            clientKey: trimmedKey,
            clientSecret: trimmedSecret || credentialsRef.current.tiktok.clientSecret || '',
          },
        };
        setCredentials(nextCreds);
        try {
          localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(nextCreds));
        } catch {
          // Ignore
        }

        const nextOAuth: StoredTikTokOAuthData = {
          ...tiktokOAuthRef.current,
          clientKey: trimmedKey,
          clientSecret: trimmedSecret || tiktokOAuthRef.current.clientSecret || '',
          hasClientSecret: Boolean(
            trimmedSecret ||
              tiktokOAuthRef.current.clientSecret ||
              tiktokOAuthRef.current.hasClientSecret
          ),
        };
        setTiktokOAuth((prev) => ({
          ...prev,
          ...nextOAuth,
          error: null,
        }));
        try {
          localStorage.setItem(TIKTOK_OAUTH_STORAGE_KEY, JSON.stringify(nextOAuth));
        } catch {
          // Ignore
        }

        await syncPlatformConfigToFirestore(nextCreds, nextOAuth);

        // Also sync to backend/serverless cookies
        try {
          const resp = await fetch('/api/tiktok/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientKey: trimmedKey,
              clientSecret: trimmedSecret || nextOAuth.clientSecret,
            }),
          });
          if (resp.ok) {
            await safeParseJsonResponse(resp, '/api/tiktok/config').catch(() => {});
          }
        } catch {
          // Non-blocking
        }
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'บันทึกการตั้งค่าไม่สำเร็จ';
        setTiktokOAuth((prev) => ({ ...prev, error: msg }));
        return false;
      }
    },
    [credentialsRef, setCredentials, syncPlatformConfigToFirestore]
  );

  // Helper to build TikTok v2 OAuth URL
  const buildClientTikTokAuthUrl = useCallback(
    (clientKey: string, clientSecret: string, redirectUri: string): string => {
      const nonce = Math.random().toString(36).substring(2, 12);
      const stateJson = JSON.stringify({
        n: nonce,
        ck: clientKey,
        cs: clientSecret || '',
        ru: redirectUri,
      });
      const bytes = new TextEncoder().encode(stateJson);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const statePayload = btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const params = new URLSearchParams({
        client_key: clientKey,
        scope: 'user.info.basic,user.info.stats',
        response_type: 'code',
        redirect_uri: redirectUri,
        state: statePayload,
      });
      return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
    },
    []
  );

  // Launch TikTok OAuth popup
  const connectTikTok = useCallback(
    async (overrideClientKey?: string, overrideClientSecret?: string) => {
      setTiktokOAuth((prev) => ({ ...prev, isConnecting: true, error: null }));
      try {
        const envClientKey =
          (typeof import.meta !== 'undefined' &&
            (import.meta as any).env?.VITE_TIKTOK_CLIENT_KEY) ||
          '';
        const envClientSecret =
          (typeof import.meta !== 'undefined' &&
            (import.meta as any).env?.VITE_TIKTOK_CLIENT_SECRET) ||
          '';

        const effectiveClientKey = String(
          overrideClientKey ||
            tiktokOAuthRef.current.clientKey ||
            credentialsRef.current.tiktok.clientKey ||
            envClientKey ||
            ''
        ).trim();
        const effectiveClientSecret = String(
          overrideClientSecret ||
            tiktokOAuthRef.current.clientSecret ||
            credentialsRef.current.tiktok.clientSecret ||
            envClientSecret ||
            ''
        ).trim();

        if (effectiveClientKey) {
          saveTikTokConfig(effectiveClientKey, effectiveClientSecret).catch(() => {});
        }

        const redirectUri = `${window.location.origin}/api/tiktok/callback`;
        let targetAuthUrl = '';

        if (effectiveClientKey) {
          targetAuthUrl = buildClientTikTokAuthUrl(
            effectiveClientKey,
            effectiveClientSecret,
            redirectUri
          );

          fetch('/api/tiktok/auth-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientKey: effectiveClientKey,
              clientSecret: effectiveClientSecret,
              redirectUri,
            }),
          }).catch(() => {});
        } else {
          try {
            const resp = await fetch('/api/tiktok/auth-url', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                clientKey: '',
                clientSecret: effectiveClientSecret,
                redirectUri,
              }),
            });

            const data = await safeParseJsonResponse<{
              authUrl?: string;
              error?: string;
              redirectUri?: string;
            }>(resp, '/api/tiktok/auth-url');

            if (resp.ok && data.authUrl) {
              targetAuthUrl = data.authUrl;
            } else {
              throw new Error(
                data.error ||
                  'กรุณาระบุ TikTok Client Key และ Client Secret ในส่วนตั้งค่าก่อนกดเชื่อมต่อ'
              );
            }
          } catch (serverErr) {
            const rawMsg = serverErr instanceof Error ? serverErr.message : '';
            if (rawMsg.includes('TikTok Client Key')) {
              throw serverErr;
            }
            throw new Error(
              'กรุณาระบุ TikTok Client Key และ Client Secret ในช่องตั้งค่าก่อนทำการเชื่อมต่อ OAuth'
            );
          }
        }

        const popupWidth = 600;
        const popupHeight = 720;
        const left = window.screenX + (window.outerWidth - popupWidth) / 2;
        const top = window.screenY + (window.outerHeight - popupHeight) / 2;
        const popup = window.open(
          targetAuthUrl,
          'tiktok_oauth_window',
          `width=${popupWidth},height=${popupHeight},left=${left},top=${top},status=no,menubar=no,toolbar=no`
        );

        if (!popup) {
          throw new Error('เบราว์เซอร์บล็อกป๊อปอัป กรุณาอนุญาตป๊อปอัปสำหรับเว็บไซต์นี้');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'ไม่สามารถเปิดหน้าต่างเชื่อมต่อได้';
        setTiktokOAuth((prev) => ({ ...prev, isConnecting: false, error: msg }));
      }
    },
    [saveTikTokConfig, buildClientTikTokAuthUrl, credentialsRef]
  );

  // Disconnect TikTok
  const disconnectTikTok = useCallback(async () => {
    try {
      await fetch('/api/tiktok/disconnect', { method: 'POST' }).catch(() => {});
      const nextOAuth: StoredTikTokOAuthData = {
        ...tiktokOAuthRef.current,
        isConnected: false,
        accessToken: '',
        refreshToken: '',
        expiresAt: null,
        openId: null,
        displayName: null,
        avatarUrl: null,
      };
      setTiktokOAuth((prev) => ({
        ...prev,
        ...nextOAuth,
        successMessage: 'ตัดการเชื่อมต่อ TikTok เรียบร้อยแล้ว',
      }));
      try {
        localStorage.setItem(TIKTOK_OAUTH_STORAGE_KEY, JSON.stringify(nextOAuth));
      } catch {
        // Ignore
      }

      const nextCreds: PlatformApiCredentials = {
        ...credentialsRef.current,
        tiktok: {
          ...credentialsRef.current.tiktok,
          accessToken: '',
          refreshToken: '',
        },
      };
      setCredentials(nextCreds);
      try {
        localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(nextCreds));
      } catch {
        // Ignore
      }

      await syncPlatformConfigToFirestore(nextCreds, nextOAuth);

      setTimeout(() => {
        setTiktokOAuth((prev) => ({ ...prev, successMessage: null }));
      }, 4000);
    } catch {
      // Ignore
    }
  }, [credentialsRef, setCredentials, syncPlatformConfigToFirestore]);

  // Refresh token
  const refreshTikTokToken = useCallback(async () => {
    setTiktokOAuth((prev) => ({ ...prev, isRefreshing: true, error: null }));
    try {
      const resp = await fetch('/api/tiktok/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken:
            tiktokOAuthRef.current.refreshToken || credentialsRef.current.tiktok.refreshToken,
          clientKey: tiktokOAuthRef.current.clientKey || credentialsRef.current.tiktok.clientKey,
          clientSecret:
            tiktokOAuthRef.current.clientSecret || credentialsRef.current.tiktok.clientSecret,
        }),
      });
      const data = await safeParseJsonResponse<any>(resp, '/api/tiktok/refresh-token');
      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'รีเฟรชสิทธิ์ไม่สำเร็จ');
      }

      const nextOAuth: StoredTikTokOAuthData = {
        ...tiktokOAuthRef.current,
        accessToken: data.accessToken || tiktokOAuthRef.current.accessToken,
        refreshToken: data.refreshToken || tiktokOAuthRef.current.refreshToken,
        expiresAt: data.expiresAt || tiktokOAuthRef.current.expiresAt,
        lastSyncedAt: data.lastSyncedAt || new Date().toISOString(),
      };
      setTiktokOAuth((prev) => ({
        ...prev,
        ...nextOAuth,
        isRefreshing: false,
        successMessage: 'รีเฟรชสิทธิ์การเข้าถึง TikTok สำเร็จแล้ว',
      }));
      try {
        localStorage.setItem(TIKTOK_OAUTH_STORAGE_KEY, JSON.stringify(nextOAuth));
      } catch {
        // Ignore
      }

      const nextCreds: PlatformApiCredentials = {
        ...credentialsRef.current,
        tiktok: {
          ...credentialsRef.current.tiktok,
          accessToken: nextOAuth.accessToken || credentialsRef.current.tiktok.accessToken,
          refreshToken: nextOAuth.refreshToken || credentialsRef.current.tiktok.refreshToken,
        },
      };
      setCredentials(nextCreds);
      try {
        localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(nextCreds));
      } catch {
        // Ignore
      }

      await syncPlatformConfigToFirestore(nextCreds, nextOAuth);

      setTimeout(() => {
        setTiktokOAuth((prev) => ({ ...prev, successMessage: null }));
      }, 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'รีเฟรชสิทธิ์ไม่สำเร็จ';
      setTiktokOAuth((prev) => ({ ...prev, isRefreshing: false, error: msg }));
    }
  }, [credentialsRef, setCredentials, syncPlatformConfigToFirestore]);

  return {
    tiktokOAuth,
    tiktokOAuthRef,
    saveTikTokConfig,
    connectTikTok,
    disconnectTikTok,
    refreshTikTokToken,
  };
}
