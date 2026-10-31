/**
 * src/hooks/usePlatformSync.ts
 * Enterprise-grade hook for managing live API platform data fetching,
 * diff review, selective application, and 5-version snapshot rollback ring buffer.
 *
 * NOTE: Refactored into modular domain sub-hooks in `./platform-sync/`.
 * This file maintains 100% backwards compatibility for existing imports.
 */

export * from './platform-sync';
export { usePlatformSync as default } from './platform-sync';
