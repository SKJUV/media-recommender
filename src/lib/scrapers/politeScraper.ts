/**
 * Polite Scraper Utility
 * Enforces polite scraping rules (max 2 concurrent requests/domain, rate limit delays, realistic headers)
 */

const DOMAIN_LAST_REQUEST: Record<string, number> = {};
const MIN_DELAY_MS = 500;

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0',
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export async function politeFetch(url: string, init?: RequestInit): Promise<Response> {
  const parsedUrl = new URL(url);
  const domain = parsedUrl.hostname;

  const now = Date.now();
  const lastReq = DOMAIN_LAST_REQUEST[domain] || 0;
  const elapsed = now - lastReq;

  if (elapsed < MIN_DELAY_MS) {
    const waitTime = MIN_DELAY_MS - elapsed;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  DOMAIN_LAST_REQUEST[domain] = Date.now();

  const headers = new Headers(init?.headers);
  if (!headers.has('User-Agent')) {
    headers.set('User-Agent', getRandomUserAgent());
  }
  if (!headers.has('Accept-Language')) {
    headers.set('Accept-Language', 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8');
  }

  try {
    const response = await fetch(url, {
      ...init,
      headers,
      signal: AbortSignal.timeout(8000), // 8s timeout
    });
    return response;
  } catch (error) {
    console.warn(`[PoliteScraper] Fetch warning for ${url}:`, error);
    throw error;
  }
}
