/**
 * src/hooks/platform-sync/usePlatformCredentials.ts
 * Manages API credentials state with localStorage caching and Cloud Firestore
 * bi-directional synchronization (/settings/platformConfig).
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import {
  PlatformApiCredentials,
  DEFAULT_API_CREDENTIALS,
} from '../../services/platformApiService';
import { StoredTikTokOAuthData } from '../../types/platformSync';

export const CREDENTIALS_STORAGE_KEY = 'juijui_platform_api_credentials';

export function usePlatformCredentials(tiktokOAuthRef: React.MutableRefObject<StoredTikTokOAuthData>) {
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

  const credentialsRef = useRef(credentials);
  credentialsRef.current = credentials;

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
    [tiktokOAuthRef]
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
      },
      () => {
        // Non-blocking error handler
      }
    );

    return () => unsubscribe();
  }, []);

  // Update credentials and persist to localStorage + Firestore
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
    [syncPlatformConfigToFirestore, tiktokOAuthRef]
  );

  return {
    credentials,
    credentialsRef,
    setCredentials,
    updateCredentials,
    syncPlatformConfigToFirestore,
  };
}
