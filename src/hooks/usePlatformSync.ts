/**
 * usePlatformSync.ts
 * Enterprise-grade hook for managing live API platform data fetching,
 * diff review, selective application, and 5-version snapshot rollback ring buffer.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { CreatorProfile, PlatformStat } from '../data/types';
import {
  PlatformApiCredentials,
  DEFAULT_API_CREDENTIALS,
  PlatformDiffItem,
  SyncSnapshotHistoryItem,
  FetchedPlatformData,
  fetchYouTubeStats,
  fetchInstagramStats,
  fetchFacebookStats,
  fetchTikTokStats,
  generateSimulatedLiveStats,
  buildPlatformDiffList,
  formatFollowerCount,
  SinglePlatformTestResult,
  testSinglePlatform,
  safeParseJsonResponse,
} from '../services/platformApiService';

const CREDENTIALS_STORAGE_KEY = 'juijui_platform_api_credentials';
const TIKTOK_OAUTH_STORAGE_KEY = 'juijui_tiktok_oauth_state';
const HISTORY_STORAGE_KEY = 'juijui_platform_sync_history';
const MAX_HISTORY_ITEMS = 5;

export interface StoredTikTokOAuthData {
  clientKey: string;
  clientSecret?: string;
  hasClientSecret: boolean;
  isConnected: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt: number | null;
  openId: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  followerCount: number | null;
  likesCount: number | null;
  videoCount: number | null;
  lastSyncedAt: string | null;
  redirectUri: string;
}

export function usePlatformSync() {
  // Credentials state with localStorage persistence
  const [credentials, setCredentials] = useState<PlatformApiCredentials>(() => {
    try {
      const stored = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          youtube: { ...DEFAULT_API_CREDENTIALS.youtube, ...(parsed.youtube || {}) },
          tiktok: { ...DEFAULT_API_CREDENTIALS.tiktok, ...(parsed.tiktok || {}) },
          instagram: { ...DEFAULT_API_CREDENTIALS.instagram, ...(parsed.instagram || {}) },
          facebook: { ...DEFAULT_API_CREDENTIALS.facebook, ...(parsed.facebook || {}) },
        };
      }
    } catch {
      // Fallback to default
    }
    return DEFAULT_API_CREDENTIALS;
  });

  // History ring buffer (max 5 items)
  const [syncHistory, setSyncHistory] = useState<SyncSnapshotHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.slice(0, MAX_HISTORY_ITEMS);
      }
    } catch {
      // Fallback
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [diffItems, setDiffItems] = useState<PlatformDiffItem[] | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<string | null>(null);
  const [activeSyncMode, setActiveSyncMode] = useState<'official' | 'simulation'>('simulation');
  const [singleTestLoading, setSingleTestLoading] = useState<Record<string, boolean>>({});
  const [singleTestResults, setSingleTestResults] = useState<
    Record<string, SinglePlatformTestResult | null>
  >({});

  // TikTok Official OAuth 2.0 State (restored from localStorage immediately if available)
  const [tiktokOAuth, setTiktokOAuth] = useState<{
    clientKey: string;
    clientSecret?: string;
    hasClientSecret: boolean;
    isConnected: boolean;
    accessToken?: string;
    refreshToken?: string;
    expiresAt: number | null;
    openId: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    followerCount: number | null;
    likesCount: number | null;
    videoCount: number | null;
    lastSyncedAt: string | null;
    redirectUri: string;
    isConnecting: boolean;
    isRefreshing: boolean;
    error: string | null;
    successMessage: string | null;
  }>(() => {
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

  const credentialsRef = useRef(credentials);
  credentialsRef.current = credentials;
  const tiktokOAuthRef = useRef(tiktokOAuth);
  tiktokOAuthRef.current = tiktokOAuth;

  // Helper to persist both credentials and tiktokOAuth to Cloud Firestore (/settings/platformConfig)
  const syncPlatformConfigToFirestore = useCallback(
    async (
      nextCreds: PlatformApiCredentials,
      nextOAuth: Partial<StoredTikTokOAuthData>
    ) => {
      try {
        const configDocRef = doc(db, 'settings', 'platformConfig');
        const cleanOAuth: Record<string, any> = {
          clientKey: nextOAuth.clientKey ?? tiktokOAuthRef.current.clientKey ?? '',
          clientSecret: nextOAuth.clientSecret ?? tiktokOAuthRef.current.clientSecret ?? '',
          hasClientSecret: Boolean(
            nextOAuth.hasClientSecret ??
              nextOAuth.clientSecret ??
              tiktokOAuthRef.current.hasClientSecret
          ),
          isConnected: Boolean(
            nextOAuth.isConnected ?? nextOAuth.accessToken ?? tiktokOAuthRef.current.isConnected
          ),
          accessToken: nextOAuth.accessToken ?? tiktokOAuthRef.current.accessToken ?? '',
          refreshToken: nextOAuth.refreshToken ?? tiktokOAuthRef.current.refreshToken ?? '',
          expiresAt: nextOAuth.expiresAt ?? tiktokOAuthRef.current.expiresAt ?? null,
          openId: nextOAuth.openId ?? tiktokOAuthRef.current.openId ?? null,
          displayName: nextOAuth.displayName ?? tiktokOAuthRef.current.displayName ?? null,
          avatarUrl: nextOAuth.avatarUrl ?? tiktokOAuthRef.current.avatarUrl ?? null,
          followerCount: nextOAuth.followerCount ?? tiktokOAuthRef.current.followerCount ?? null,
          likesCount: nextOAuth.likesCount ?? tiktokOAuthRef.current.likesCount ?? null,
          videoCount: nextOAuth.videoCount ?? tiktokOAuthRef.current.videoCount ?? null,
          lastSyncedAt: nextOAuth.lastSyncedAt ?? tiktokOAuthRef.current.lastSyncedAt ?? null,
        };
        await setDoc(
          configDocRef,
          {
            id: 'platformConfig',
            credentials: JSON.parse(JSON.stringify(nextCreds)),
            tiktokOAuth: cleanOAuth,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch {
        // Non-blocking if offline
      }
    },
    []
  );

  // Subscribe to Cloud Firestore (/settings/platformConfig) so Vercel deployments stay synced across refreshes & devices
  useEffect(() => {
    const configDocRef = doc(db, 'settings', 'platformConfig');
    const unsubscribe = onSnapshot(
      configDocRef,
      (snapshot) => {
        if (!snapshot.exists()) return;
        const data = snapshot.data();
        if (data?.credentials && typeof data.credentials === 'object') {
          const mergedCreds: PlatformApiCredentials = {
            youtube: {
              ...DEFAULT_API_CREDENTIALS.youtube,
              ...(data.credentials.youtube || {}),
            },
            tiktok: {
              ...DEFAULT_API_CREDENTIALS.tiktok,
              ...(data.credentials.tiktok || {}),
            },
            instagram: {
              ...DEFAULT_API_CREDENTIALS.instagram,
              ...(data.credentials.instagram || {}),
            },
            facebook: {
              ...DEFAULT_API_CREDENTIALS.facebook,
              ...(data.credentials.facebook || {}),
            },
          };
          setCredentials(mergedCreds);
          try {
            localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(mergedCreds));
          } catch {
            // Ignore
          }
        }

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
              isConnected: Boolean(remoteOAuth.isConnected || remoteOAuth.accessToken),
              accessToken: remoteOAuth.accessToken ?? prev.accessToken,
              refreshToken: remoteOAuth.refreshToken ?? prev.refreshToken,
              expiresAt: remoteOAuth.expiresAt ?? prev.expiresAt,
              openId: remoteOAuth.openId ?? prev.openId,
              displayName: remoteOAuth.displayName ?? prev.displayName,
              avatarUrl: remoteOAuth.avatarUrl ?? prev.avatarUrl,
              followerCount: remoteOAuth.followerCount ?? prev.followerCount,
              likesCount: remoteOAuth.likesCount ?? prev.likesCount,
              videoCount: remoteOAuth.videoCount ?? prev.videoCount,
              lastSyncedAt: remoteOAuth.lastSyncedAt ?? prev.lastSyncedAt,
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
        // Ignore snapshot error if offline
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch TikTok OAuth status from server (merges with existing Firestore/localStorage state)
  const loadTikTokOAuthStatus = useCallback(async () => {
    try {
      const resp = await fetch('/api/tiktok/config');
      if (resp.ok) {
        const data = await safeParseJsonResponse<any>(resp, '/api/tiktok/config');
        setTiktokOAuth((prev) => {
          const next = {
            ...prev,
            clientKey: data.clientKey || prev.clientKey || credentialsRef.current.tiktok.clientKey,
            hasClientSecret: Boolean(
              data.hasClientSecret || prev.hasClientSecret || credentialsRef.current.tiktok.clientSecret
            ),
            isConnected: Boolean(data.isConnected || prev.isConnected || prev.accessToken),
            expiresAt: data.expiresAt ?? prev.expiresAt,
            openId: data.openId || prev.openId,
            displayName: data.displayName || prev.displayName,
            avatarUrl: data.avatarUrl || prev.avatarUrl,
            followerCount: data.followerCount ?? prev.followerCount,
            likesCount: data.likesCount ?? prev.likesCount,
            videoCount: data.videoCount ?? prev.videoCount,
            lastSyncedAt: data.lastSyncedAt || prev.lastSyncedAt,
            redirectUri:
              typeof window !== 'undefined'
                ? `${window.location.origin}/api/tiktok/callback`
                : data.redirectUri || prev.redirectUri,
          };
          try {
            localStorage.setItem(TIKTOK_OAUTH_STORAGE_KEY, JSON.stringify(next));
          } catch {
            // Ignore
          }
          return next;
        });
      }
    } catch {
      // Ignore background fetch failure
    }
  }, []);

  // Run on mount
  useEffect(() => {
    loadTikTokOAuthStatus();
  }, [loadTikTokOAuthStatus]);

  // Listen to popup postMessage events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'TIKTOK_OAUTH_SUCCESS') {
        const payload = event.data.data || {};
        const nextOAuthState = {
          ...tiktokOAuthRef.current,
          clientKey: payload.clientKey || tiktokOAuthRef.current.clientKey,
          hasClientSecret: true,
          isConnected: true,
          accessToken: payload.accessToken || tiktokOAuthRef.current.accessToken,
          refreshToken: payload.refreshToken || tiktokOAuthRef.current.refreshToken,
          expiresAt: payload.expiresAt || tiktokOAuthRef.current.expiresAt,
          openId: payload.openId || tiktokOAuthRef.current.openId,
          displayName: payload.displayName || tiktokOAuthRef.current.displayName,
          avatarUrl: payload.avatarUrl || tiktokOAuthRef.current.avatarUrl,
          followerCount: payload.followerCount ?? tiktokOAuthRef.current.followerCount,
          likesCount: payload.likesCount ?? tiktokOAuthRef.current.likesCount,
          videoCount: payload.videoCount ?? tiktokOAuthRef.current.videoCount,
          lastSyncedAt: payload.lastSyncedAt || new Date().toISOString(),
          isConnecting: false,
          error: null,
          successMessage: 'เชื่อมต่อบัญชี TikTok สำเร็จและบันทึกสิทธิ์ลง Cloud เรียบร้อยแล้ว!',
        };

        setTiktokOAuth(nextOAuthState);
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

        // Persist to Firestore so it survives page refreshes and works across devices on Vercel
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
  }, [syncPlatformConfigToFirestore]);

  // Save TikTok clientKey and clientSecret
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

        const nextOAuth = {
          ...tiktokOAuthRef.current,
          clientKey: trimmedKey,
          clientSecret: trimmedSecret || tiktokOAuthRef.current.clientSecret || '',
          hasClientSecret: Boolean(
            trimmedSecret ||
              tiktokOAuthRef.current.clientSecret ||
              tiktokOAuthRef.current.hasClientSecret
          ),
          error: null,
        };
        setTiktokOAuth(nextOAuth);
        try {
          localStorage.setItem(TIKTOK_OAUTH_STORAGE_KEY, JSON.stringify(nextOAuth));
        } catch {
          // Ignore
        }

        // Persist to Cloud Firestore immediately
        await syncPlatformConfigToFirestore(nextCreds, nextOAuth);

        // Also sync to backend/serverless cookies
        const resp = await fetch('/api/tiktok/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientKey: trimmedKey,
            clientSecret: trimmedSecret || nextOAuth.clientSecret,
          }),
        });
        if (resp.ok) {
          await safeParseJsonResponse(resp, '/api/tiktok/config');
        }
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'บันทึกการตั้งค่าไม่สำเร็จ';
        setTiktokOAuth((prev) => ({ ...prev, error: msg }));
        return false;
      }
    },
    [syncPlatformConfigToFirestore]
  );

  // Launch TikTok OAuth popup
  const connectTikTok = useCallback(
    async (overrideClientKey?: string, overrideClientSecret?: string) => {
      setTiktokOAuth((prev) => ({ ...prev, isConnecting: true, error: null }));
      try {
        const effectiveClientKey = (
          overrideClientKey ||
          tiktokOAuthRef.current.clientKey ||
          credentialsRef.current.tiktok.clientKey ||
          ''
        ).trim();
        const effectiveClientSecret = (
          overrideClientSecret ||
          tiktokOAuthRef.current.clientSecret ||
          credentialsRef.current.tiktok.clientSecret ||
          ''
        ).trim();

        if (overrideClientKey || overrideClientSecret) {
          // Trigger save without blocking popup gesture
          saveTikTokConfig(effectiveClientKey, effectiveClientSecret).catch(() => {});
        }

        const redirectUri = `${window.location.origin}/api/tiktok/callback`;
        let targetAuthUrl = '';

        try {
          const resp = await fetch('/api/tiktok/auth-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientKey: effectiveClientKey,
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
          } else if (!effectiveClientKey && data.error) {
            throw new Error(data.error);
          }
        } catch (serverErr) {
          // If server endpoint failed and no clientKey is available locally, rethrow
          if (!effectiveClientKey) {
            throw serverErr;
          }
        }

        // Fallback: construct TikTok v2 OAuth URL directly on client if needed
        if (!targetAuthUrl) {
          if (!effectiveClientKey) {
            throw new Error(
              'กรุณาระบุ TikTok Client Key ในส่วน "ตั้งค่า TikTok Client Credentials" ก่อนทำการเชื่อมต่อ OAuth'
            );
          }
          const nonce = Math.random().toString(36).substring(2, 12);
          const stateJson = JSON.stringify({
            n: nonce,
            ck: effectiveClientKey,
            cs: effectiveClientSecret || '',
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
            client_key: effectiveClientKey,
            scope: 'user.info.basic,user.info.stats',
            response_type: 'code',
            redirect_uri: redirectUri,
            state: statePayload,
          });
          targetAuthUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
        }

        // Open popup directly to TikTok authorization URL
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
    [saveTikTokConfig]
  );

  // Disconnect TikTok
  const disconnectTikTok = useCallback(async () => {
    try {
      await fetch('/api/tiktok/disconnect', { method: 'POST' }).catch(() => {});
      const nextOAuth = {
        ...tiktokOAuthRef.current,
        isConnected: false,
        accessToken: '',
        refreshToken: '',
        expiresAt: null,
        openId: null,
        displayName: null,
        avatarUrl: null,
        successMessage: 'ตัดการเชื่อมต่อ TikTok เรียบร้อยแล้ว',
      };
      setTiktokOAuth(nextOAuth);
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
  }, [syncPlatformConfigToFirestore]);

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

      const nextOAuth = {
        ...tiktokOAuthRef.current,
        accessToken: data.accessToken || tiktokOAuthRef.current.accessToken,
        refreshToken: data.refreshToken || tiktokOAuthRef.current.refreshToken,
        expiresAt: data.expiresAt || tiktokOAuthRef.current.expiresAt,
        lastSyncedAt: data.lastSyncedAt || new Date().toISOString(),
        isRefreshing: false,
        successMessage: 'รีเฟรชสิทธิ์การเข้าถึง TikTok สำเร็จแล้ว',
      };
      setTiktokOAuth(nextOAuth);
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
  }, [syncPlatformConfigToFirestore]);

  // Persist credentials to localStorage & Cloud Firestore
  const updateCredentials = useCallback(
    (newCreds: PlatformApiCredentials) => {
      setCredentials(newCreds);
      try {
        localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(newCreds));
      } catch {
        // Ignore storage error
      }
      syncPlatformConfigToFirestore(newCreds, tiktokOAuthRef.current);
    },
    [syncPlatformConfigToFirestore]
  );

  // Persist history ring buffer
  const pushToHistory = useCallback((item: SyncSnapshotHistoryItem) => {
    setSyncHistory((prev) => {
      const updated = [item, ...prev.filter((h) => h.id !== item.id)].slice(0, MAX_HISTORY_ITEMS);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage error
      }
      return updated;
    });
  }, []);

  // Fetch stats from official APIs or verified simulation
  const executeSync = useCallback(
    async (currentPlatforms: PlatformStat[], mode: 'official' | 'simulation' = 'simulation') => {
      setIsLoading(true);
      setSyncError(null);
      setActiveSyncMode(mode);

      try {
        let fetchedResults: FetchedPlatformData[] = [];

        if (mode === 'simulation') {
          // Add small realistic delay to feel authentic
          await new Promise((r) => setTimeout(r, 650));
          fetchedResults = generateSimulatedLiveStats(currentPlatforms);
        } else {
          // Official API Mode: Fetch each platform sequentially or in parallel with graceful error handling
          const promises = currentPlatforms.map(async (pl): Promise<FetchedPlatformData> => {
            try {
              if (pl.id === 'youtube') {
                return await fetchYouTubeStats(credentials.youtube, pl);
              }
              if (pl.id === 'instagram') {
                return await fetchInstagramStats(credentials.instagram, pl);
              }
              if (pl.id === 'facebook') {
                return await fetchFacebookStats(credentials.facebook, pl);
              }
              if (pl.id === 'tiktok') {
                return await fetchTikTokStats(credentials.tiktok, pl);
              }
            } catch (err: unknown) {
              const errMsg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล';
              return {
                platformId: pl.id,
                name: pl.name,
                handle: pl.handle,
                followersNum: pl.followersNum,
                followersFormatted: pl.followers,
                viewsFormatted: pl.views,
                erNum: pl.erNum,
                erFormatted: pl.er,
                source: 'official_api',
                status: 'error',
                statusMessage: errMsg,
                rawTimestamp: new Date().toISOString(),
              };
            }
            return {
              platformId: pl.id,
              name: pl.name,
              handle: pl.handle,
              followersNum: pl.followersNum,
              followersFormatted: pl.followers,
              viewsFormatted: pl.views,
              erNum: pl.erNum,
              erFormatted: pl.er,
              source: 'official_api',
              status: 'warning',
              statusMessage: 'ไม่มีการกำหนดค่าสำหรับแพลตฟอร์มนี้',
              rawTimestamp: new Date().toISOString(),
            };
          });

          fetchedResults = await Promise.all(promises);
        }

        const diff = buildPlatformDiffList(currentPlatforms, fetchedResults);
        setDiffItems(diff);
        setLastSyncTimestamp(new Date().toLocaleTimeString('th-TH'));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลสด';
        setSyncError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [credentials]
  );

  // Toggle selection checkbox for diff review
  const toggleDiffSelection = useCallback((platformId: PlatformStat['id']) => {
    setDiffItems((prev) =>
      prev
        ? prev.map((item) =>
            item.platformId === platformId ? { ...item, isSelected: !item.isSelected } : item
          )
        : null
    );
  }, []);

  const toggleSelectAll = useCallback((selectAll: boolean) => {
    setDiffItems((prev) =>
      prev ? prev.map((item) => ({ ...item, isSelected: selectAll })) : null
    );
  }, []);

  const clearDiff = useCallback(() => {
    setDiffItems(null);
  }, []);

  // Apply selected diff changes to draftCreator and record snapshot in history
  const applyDiff = useCallback(
    async (
      currentCreator: CreatorProfile,
      saveDraftChanges: (customDraft?: CreatorProfile, customMessage?: string) => Promise<void>
    ): Promise<boolean> => {
      if (!diffItems || diffItems.length === 0) return false;

      // 1. Create snapshot of current state before applying
      const beforeSnapshot: SyncSnapshotHistoryItem = {
        id: `snap-${Date.now()}`,
        timestamp: new Date().toISOString(),
        dateFormatted: new Date().toLocaleString('th-TH', {
          dateStyle: 'short',
          timeStyle: 'medium',
        }),
        triggerType: activeSyncMode === 'official' ? 'official_api' : 'simulation',
        summary: {
          totalFollowers: currentCreator.overview.totalFollowers,
          totalReach: currentCreator.overview.monthlyReach,
          totalEr: currentCreator.overview.totalEr,
          totalPlatformsCount: currentCreator.platforms.length,
          platformChangesSummary: diffItems
            .filter((d) => d.isSelected && d.followerDelta !== 0)
            .map((d) => `${d.name}: ${d.followerDelta > 0 ? '+' : ''}${d.followerDelta.toLocaleString()}`)
            .join(', ') || 'อัปเดตสถิติตามรอบสด',
        },
        platformsSnapshot: JSON.parse(JSON.stringify(currentCreator.platforms)),
        overviewSnapshot: JSON.parse(JSON.stringify(currentCreator.overview)),
      };

      // 2. Build updated platforms array
      const updatedPlatforms: PlatformStat[] = currentCreator.platforms.map((curr) => {
        const diff = diffItems.find((d) => d.platformId === curr.id && d.isSelected);
        if (!diff) return curr;

        return {
          ...curr,
          handle: diff.handle || curr.handle,
          followers: diff.newFollowers,
          followersNum: diff.newFollowersNum,
          views: diff.newViews || curr.views,
          likes: diff.newLikes || curr.likes,
          comments: diff.newComments || curr.comments,
          shares: diff.newShares || curr.shares,
          er: diff.newEr,
          erNum: parseFloat(diff.newEr.replace(/[^0-9.]/g, '')) || curr.erNum,
        };
      });

      // Calculate new total followers & average ER
      const totalFollowersNum = updatedPlatforms.reduce((sum, p) => sum + (p.followersNum || 0), 0);
      const totalFollowersFormatted = formatFollowerCount(totalFollowersNum);
      const validErCount = updatedPlatforms.filter((p) => p.erNum > 0).length;
      const avgEr =
        validErCount > 0
          ? (
              updatedPlatforms.reduce((sum, p) => sum + (p.erNum || 0), 0) / validErCount
            ).toFixed(1) + '%'
          : currentCreator.overview.totalEr;

      const updatedOverview = {
        ...currentCreator.overview,
        totalFollowers: totalFollowersFormatted,
        totalEr: avgEr,
      };

      const updatedCreator: CreatorProfile = {
        ...currentCreator,
        platforms: updatedPlatforms,
        overview: updatedOverview,
      };

      // Push previous snapshot to history
      pushToHistory(beforeSnapshot);

      // Save to Firestore and state
      await saveDraftChanges(
        updatedCreator,
        `อัปเดตข้อมูลสถิติสดสำเร็จ (${diffItems.filter((d) => d.isSelected).length} แพลตฟอร์ม)`
      );

      // Clear diff
      setDiffItems(null);
      return true;
    },
    [diffItems, activeSyncMode, pushToHistory]
  );

  // Rollback to a historical snapshot
  const rollbackToSnapshot = useCallback(
    async (
      snapshot: SyncSnapshotHistoryItem,
      currentCreator: CreatorProfile,
      saveDraftChanges: (customDraft?: CreatorProfile, customMessage?: string) => Promise<void>
    ): Promise<void> => {
      // Create a snapshot of right now before rollback so user can jump forward again if needed
      const currentBeforeRollback: SyncSnapshotHistoryItem = {
        id: `snap-${Date.now()}`,
        timestamp: new Date().toISOString(),
        dateFormatted: new Date().toLocaleString('th-TH', {
          dateStyle: 'short',
          timeStyle: 'medium',
        }),
        triggerType: 'manual_rollback',
        summary: {
          totalFollowers: currentCreator.overview.totalFollowers,
          totalReach: currentCreator.overview.monthlyReach,
          totalEr: currentCreator.overview.totalEr,
          totalPlatformsCount: currentCreator.platforms.length,
          platformChangesSummary: 'บันทึกก่อนทำการย้อนกลับ (Pre-Rollback State)',
        },
        platformsSnapshot: JSON.parse(JSON.stringify(currentCreator.platforms)),
        overviewSnapshot: JSON.parse(JSON.stringify(currentCreator.overview)),
      };

      const restoredCreator: CreatorProfile = {
        ...currentCreator,
        platforms: snapshot.platformsSnapshot,
        overview: snapshot.overviewSnapshot,
      };

      pushToHistory(currentBeforeRollback);

      await saveDraftChanges(
        restoredCreator,
        `ย้อนกลับข้อมูลสถิติไปยังเวอร์ชัน ${snapshot.dateFormatted} เรียบร้อยแล้ว`
      );
    },
    [pushToHistory]
  );

  // Test single platform connection & data independently
  const testSinglePlatformFn = useCallback(
    async (
      platformId: PlatformStat['id'],
      currentPlatforms: PlatformStat[],
      customCreds?: PlatformApiCredentials,
      forceSimulation: boolean = false
    ): Promise<SinglePlatformTestResult> => {
      setSingleTestLoading((prev) => ({ ...prev, [platformId]: true }));
      try {
        const currentPl = currentPlatforms.find((p) => p.id === platformId) || {
          id: platformId,
          name: platformId,
          handle: '',
          url: '',
          followers: '0',
          followersNum: 0,
          views: '0',
          likes: '0',
          comments: '0',
          shares: '0',
          er: '0%',
          erNum: 0,
          accentColor: '#6366f1',
        };

        const credsToUse = customCreds || credentials;
        const result = await testSinglePlatform(platformId, credsToUse, currentPl, forceSimulation);

        setSingleTestResults((prev) => ({ ...prev, [platformId]: result }));
        return result;
      } finally {
        setSingleTestLoading((prev) => ({ ...prev, [platformId]: false }));
      }
    },
    [credentials]
  );

  const clearSingleTestResult = useCallback((platformId: PlatformStat['id']) => {
    setSingleTestResults((prev) => ({ ...prev, [platformId]: null }));
  }, []);

  // Send single platform fetched data to Diff Preview
  const applySinglePlatformToDiff = useCallback(
    (fetchedData: FetchedPlatformData, currentPlatforms: PlatformStat[]) => {
      setDiffItems((prev) => {
        if (!prev) {
          const fullDiff = buildPlatformDiffList(currentPlatforms, [fetchedData]);
          return fullDiff.map((d) => ({
            ...d,
            isSelected: d.platformId === fetchedData.platformId,
          }));
        }
        return prev.map((item) => {
          if (item.platformId === fetchedData.platformId) {
            const currentNum = item.currentFollowersNum;
            const newNum = fetchedData.followersNum;
            const delta = newNum - currentNum;
            const deltaPercent =
              currentNum > 0 ? parseFloat(((delta / currentNum) * 100).toFixed(2)) : 0;
            const currentErVal = parseFloat(item.currentEr.replace(/[^0-9.]/g, '')) || 0;
            const erDelta = parseFloat((fetchedData.erNum - currentErVal).toFixed(2));
            return {
              ...item,
              handle: fetchedData.handle || item.handle,
              newFollowersNum: newNum,
              newFollowers: fetchedData.followersFormatted,
              followerDelta: delta,
              followerDeltaPercent: deltaPercent,
              newViews: fetchedData.viewsFormatted || item.currentViews,
              newLikes: fetchedData.likesFormatted || item.currentLikes,
              newComments: fetchedData.commentsFormatted || item.currentComments,
              newShares: fetchedData.sharesFormatted || item.currentShares,
              newEr: fetchedData.erFormatted,
              erDelta,
              status: fetchedData.status,
              statusMessage: fetchedData.statusMessage,
              source: fetchedData.source,
              isSelected: true,
            };
          }
          return item;
        });
      });
    },
    []
  );

  return {
    credentials,
    updateCredentials,
    syncHistory,
    isLoading,
    diffItems,
    syncError,
    lastSyncTimestamp,
    activeSyncMode,
    singleTestLoading,
    singleTestResults,
    testSinglePlatformFn,
    clearSingleTestResult,
    applySinglePlatformToDiff,
    executeSync,
    toggleDiffSelection,
    toggleSelectAll,
    clearDiff,
    applyDiff,
    rollbackToSnapshot,
    tiktokOAuth,
    loadTikTokOAuthStatus,
    saveTikTokConfig,
    connectTikTok,
    disconnectTikTok,
    refreshTikTokToken,
  };
}

