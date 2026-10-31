/**
 * platformApiService.ts
 * Enterprise-grade multi-platform statistics synchronization facade for "จุ๊ยจุ๊ย".
 *
 * Refactored into domain-specific platform modules under `./platform-api/` for long-term
 * maintainability and horizontal scalability while preserving 100% backward compatibility.
 *
 * Modules:
 * - `./platform-api/types`: Shared interfaces, types, and `DEFAULT_API_CREDENTIALS`
 * - `./platform-api/formatters`: Compact number formatters, parsers, and `safeParseJsonResponse`
 * - `./platform-api/youtubeService`: YouTube Data API v3 channel & playlist engagement fetcher
 * - `./platform-api/instagramService`: Meta Graph API v20.0+ IG Business discovery, 28d insights & media aggregation
 * - `./platform-api/facebookService`: Meta Graph API v20.0 Facebook Page & post engagement fetcher
 * - `./platform-api/tiktokService`: TikTok Open API v2 server-side proxy & auto-refresh client
 * - `./platform-api/simulationAndDiffService`: Live simulation generator & delta diff builder
 * - `./platform-api/diagnosticsService`: Single-platform latency benchmark & diagnostic test runner
 */

export * from './platform-api';
