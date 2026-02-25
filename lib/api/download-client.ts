import { API_CONFIG } from '../constants';
import type { NpmDownloadResponse } from '../types';
import { apiCache } from './cache';

export async function fetchWeeklyDownloads(name: string): Promise<number> {
  const encodedName = encodeURIComponent(name);
  const cacheKey = `npm:downloads:${encodedName}`;
  const cached = apiCache.get(cacheKey);

  if (typeof cached === 'number') {
    return cached;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.requestTimeout);
  const url = `${API_CONFIG.npmDownloadsUrl}/${encodedName}`;

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      return 0;
    }

    const data = (await response.json()) as NpmDownloadResponse;
    const downloads = typeof data.downloads === 'number' ? data.downloads : 0;
    apiCache.set(cacheKey, downloads);
    return downloads;
  } catch {
    return 0;
  } finally {
    clearTimeout(timeoutId);
  }
}
