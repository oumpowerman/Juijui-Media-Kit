# Implementation Plan: Refactor `usePlatformSync.ts` & `PlatformSyncTab` Architecture

## Overview
Refactor the monolithic `usePlatformSync.ts` (1,175 lines) into cleanly separated, single-responsibility domain hooks coordinated through a unified façade hook. Introduce a centralized **Platform Registry** to easily scale and plug in future social platforms (e.g., Lemon8, Threads, X/Twitter), and modernize `PlatformSyncTab` UI components to ensure seamless maintenance and onboarding for new team members.

---

## User Review Required

> [!IMPORTANT]
> **Zero Breaking Changes**: The public API of `usePlatformSync()` and `PlatformSyncTabProps` remains 100% backwards-compatible. Any existing consumer in Admin Studio will continue functioning seamlessly without needing adjustments.

- **Hook Architecture**: Domain-driven sub-hooks (`usePlatformCredentials`, `useTikTokOAuth`, `usePlatformDiff`, `usePlatformSnapshots`, `usePlatformTester`) orchestrated by a lightweight façade `usePlatformSync`.
- **Platform Registry**: `src/config/platformRegistry.ts` centralizing platform definitions, sync capabilities (Official API, OAuth, Smart Import, Simulation), credentials fields, and brand colors.
- **UI Modernization**: Upgrading `PlatformSyncTab` and `platform-sync` sub-components to be data-driven and powered by the registry.

---

## Proposed Changes

### 1. Centralized Platform Registry & Types
#### `src/types/platformSync.ts` & `src/config/platformRegistry.ts`
- Define `PlatformDefinition` interface:
  - `id`: PlatformStat ID (`youtube` | `tiktok` | `instagram` | `facebook` | `lemon8` | `threads` | string)
  - `name`: Display label (e.g., "YouTube Data API v3", "TikTok Official OAuth 2.0")
  - `brandColor`: Primary brand accent hex color
  - `supportedMethods`: Array of supported sync engines (`['official_api', 'simulation', 'oauth', 'smart_import']`)
  - `credentialsSchema`: Field descriptors for API keys, tokens, page IDs, etc.
- Export `PLATFORM_REGISTRY`: The single source of truth for all supported social networks. Adding a new platform in the future only requires adding a configuration entry in this registry.

---

### 2. Domain Hooks Architecture (`src/hooks/platform-sync/`)
Split the 1,175-line monolith into dedicated, focused hooks:

#### `usePlatformCredentials.ts` (~120 lines)
- Manages credentials state (`PlatformApiCredentials`)
- LocalStorage caching (`CREDENTIALS_STORAGE_KEY`)
- Real-time Firestore synchronization (`doc(db, 'settings', 'platformConfig')`)
- Error-resilient update methods

#### `useTikTokOAuth.ts` (~200 lines)
- Manages TikTok OAuth 2.0 connection lifecycle (clientKey, clientSecret, token expiry, follower/likes/video count)
- Popup window listener (`window.addEventListener('message')`) and postMessage protocol
- Client-side base64url state generation and authorization URL builder
- Token refresh, manual disconnect, and Firestore sync

#### `usePlatformDiff.ts` (~180 lines)
- Manages calculated diff state (`diffItems: PlatformDiffItem[] | null`)
- Interactive toggles: `toggleDiffSelection`, `toggleSelectAll`, `clearDiff`
- Single platform diff merging (`applySinglePlatformToDiff`)
- Multi-timeframe profile updater (`applyDiff` calculating 28d, 60d, and Lifetime aggregates across views, likes, er)

#### `usePlatformSnapshots.ts` (~110 lines)
- Manages 5-version ring buffer history (`syncHistory: SyncSnapshotHistoryItem[]`)
- LocalStorage persistence (`HISTORY_STORAGE_KEY`)
- Pre-save snapshot generation
- Reversible snapshot rollback (`rollbackToSnapshot`)

#### `usePlatformTester.ts` (~120 lines)
- Manages single-platform test loading states (`singleTestLoading`)
- Test results storage (`singleTestResults`)
- Execution handlers (`testSinglePlatformFn`, `clearSingleTestResult`)
- Live sync runner (`executeSync` across all platforms)

#### `index.ts` & Facade Hook (`usePlatformSync.ts`) (~90 lines)
- Composes all 5 domain hooks into a cohesive interface.
- Preserves the exact return signature of `usePlatformSync()`.
- Re-exports types for full backwards compatibility.

---

### 3. UI Refactoring (`src/components/admin/PlatformSyncTab.tsx` & `platform-sync/`)
- **`PlatformSyncTab.tsx`**: Clean, declarative orchestrator component using props grouped cleanly.
- **`CredentialsGrid.tsx`**: Extracted grid component leveraging `PLATFORM_REGISTRY` to render platform cards cleanly.
- **`platform-sync/index.ts`**: Re-export all sub-modules for clean module resolution.

---

## Verification Plan

### Automated Verification
1. **Type Safety & Linting**:
   - Run `lint_applet` (`npx tsc --noEmit`) to verify zero TypeScript errors across all newly created hooks and components.
2. **Build Compilation**:
   - Run `compile_applet` (`npm run build`) to ensure the Vite production bundle builds cleanly.

### Manual Verification Flows
1. **TikTok OAuth State**: Verify existing stored tokens and Firestore listeners load without disruption.
2. **Platform Credential Editing**: Test saving API keys and verifying toast confirmation.
3. **Single Platform Test**: Test simulated/live test trigger on YouTube and Instagram.
4. **Diff & Apply**: Trigger diff preview, toggle selection checkboxes, and apply diff with 3-timeframe calculations.
5. **Snapshot History & Rollback**: Confirm rollback to previous snapshot restores overview and platform stats properly.
