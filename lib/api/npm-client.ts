import { API_CONFIG } from '../constants';
import type { NpmPackageResponse } from '../types';
import { apiCache } from './cache';

const NPM_REQUEST_TIMEOUT_MS = API_CONFIG.requestTimeout;

type NpmAbbreviatedResponse = {
  name: string;
  'dist-tags': Record<string, string>;
  time?: {
    modified?: string;
  };
};

async function fetchWithTimeout<T>(url: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), NPM_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`npm registry request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`npm registry request timed out after ${NPM_REQUEST_TIMEOUT_MS}ms`);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('npm registry request failed with an unknown error');
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchNpmPackage(name: string): Promise<NpmPackageResponse> {
  const encodedName = encodeURIComponent(name);
  const cacheKey = `npm:full:${encodedName}`;
  const cached = apiCache.get(cacheKey);

  if (cached) {
    return cached as NpmPackageResponse;
  }

  const url = `${API_CONFIG.npmRegistryUrl}/${encodedName}`;

  try {
    const pkg = await fetchWithTimeout<NpmPackageResponse>(url);
    apiCache.set(cacheKey, pkg);
    return pkg;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'unknown error';
    throw new Error(`Failed to fetch npm package "${name}": ${message}`);
  }
}

export async function fetchNpmPackageAbbreviated(
  name: string,
): Promise<{ name: string; 'dist-tags': Record<string, string>; modified: string }> {
  const encodedName = encodeURIComponent(name);
  const cacheKey = `npm:abbrev:${encodedName}`;
  const cached = apiCache.get(cacheKey);

  if (cached) {
    return cached as { name: string; 'dist-tags': Record<string, string>; modified: string };
  }

  const url = `${API_CONFIG.npmRegistryUrl}/${encodedName}`;

  try {
    const pkg = await fetchWithTimeout<NpmAbbreviatedResponse>(url, {
      headers: {
        Accept: 'application/vnd.npm.install-v1+json',
      },
    });

    const normalized = {
      name: pkg.name,
      'dist-tags': pkg['dist-tags'],
      modified: pkg.time?.modified ?? '',
    };

    apiCache.set(cacheKey, normalized);
    return normalized;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'unknown error';
    throw new Error(`Failed to fetch abbreviated npm package "${name}": ${message}`);
  }
}

export function parseGitHubRepo(pkg: NpmPackageResponse): { owner: string; repo: string } | null {
  const repoField = pkg.repository;
  const rawUrl = typeof repoField === 'object' && repoField !== null ? repoField.url : '';

  if (!rawUrl) {
    return null;
  }

  let candidate = rawUrl.trim();

  if (candidate.startsWith('github:')) {
    candidate = candidate.slice('github:'.length);
  }

  if (candidate.startsWith('git+')) {
    candidate = candidate.slice('git+'.length);
  }

  const patterns = [
    /^https?:\/\/github\.com\/([^/]+)\/([^/#?]+?)(?:\.git)?(?:[/?#].*)?$/i,
    /^git@github\.com:([^/]+)\/([^/#?]+?)(?:\.git)?$/i,
    /^ssh:\/\/git@github\.com\/([^/]+)\/([^/#?]+?)(?:\.git)?(?:[/?#].*)?$/i,
    /^([^/\s]+)\/([^/\s]+)$/,
  ];

  for (const pattern of patterns) {
    const match = candidate.match(pattern);
    if (!match) {
      continue;
    }

    const owner = match[1]?.trim();
    const repo = match[2]?.replace(/\.git$/i, '').trim();

    if (owner && repo) {
      return { owner, repo };
    }
  }

  return null;
}
