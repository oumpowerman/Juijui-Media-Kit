/**
 * Shared Metric Formatters, Number Parsers, and Safe JSON Response Handler
 */

export function formatFollowerCount(num: number): string {
  if (num >= 1_000_000) {
    const val = num / 1_000_000;
    return val >= 10 ? `${val.toFixed(1)}M` : `${val.toFixed(2).replace(/\.?0+$/, '')}M`;
  }
  if (num >= 1_000) {
    const val = num / 1_000;
    return val >= 100 ? `${Math.round(val)}K` : `${val.toFixed(1).replace(/\.0$/, '')}K`;
  }
  return num.toLocaleString('en-US');
}

export function formatCompactMetric(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toLocaleString('en-US');
}

export function parseCountToNumber(raw: string | number): number {
  if (typeof raw === 'number') return raw;
  if (!raw) return 0;
  const cleaned = raw.trim().toUpperCase().replace(/,/g, '');
  const match = cleaned.match(/[\d.]+/);
  if (!match) return 0;
  let num = parseFloat(match[0]);
  if (cleaned.includes('M')) num *= 1_000_000;
  else if (cleaned.includes('K')) num *= 1_000;
  return Number.isNaN(num) ? 0 : Math.round(num);
}

/**
 * Safely parses a fetch Response as JSON, preventing "Unexpected token '<', <!doctype... is not valid JSON"
 * when a static host or misconfigured rewrite returns index.html instead of an API response.
 */
export async function safeParseJsonResponse<T = any>(
  resp: Response,
  endpointLabel = 'API'
): Promise<T> {
  const contentType = resp.headers.get('content-type') || '';
  const rawText = await resp.text();
  const trimmed = rawText.trimStart().toLowerCase();

  if (
    contentType.includes('text/html') ||
    trimmed.startsWith('<!doctype') ||
    trimmed.startsWith('<html')
  ) {
    throw new Error(
      `เซิร์ฟเวอร์ (${endpointLabel}) ตอบกลับเป็นหน้าเว็บ HTML แทนที่จะเป็นข้อมูล JSON กรุณาตรวจสอบว่าได้ Deploy โค้ดล่าสุดที่มีโฟลเดอร์ /api/tiktok/* และไฟล์ vercel.json ขึ้น Vercel แล้ว`
    );
  }

  try {
    return rawText ? (JSON.parse(rawText) as T) : ({} as T);
  } catch {
    const preview = rawText.replace(/\s+/g, ' ').trim().slice(0, 120);
    throw new Error(
      `ข้อมูลที่ได้รับจาก ${endpointLabel} (HTTP ${resp.status}) ไม่ใช่รูปแบบ JSON ที่ถูกต้อง${preview ? `: "${preview}"` : ''}`
    );
  }
}
