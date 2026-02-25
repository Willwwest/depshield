import { API_CONFIG } from '../constants';
import type { GitHubCommitActivity, GitHubContributor, GitHubRepoResponse } from '../types';
import { apiCache } from './cache';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (GITHUB_TOKEN) {
    headers.Authorization = `token ${GITHUB_TOKEN}`;
  }

  return headers;
}

async function fetchGitHubJson<T>(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.requestTimeout);

  try {
    return await fetch(url, {
      headers: githubHeaders(),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function isRateLimited(response: Response): boolean {
  const remaining = response.headers.get('x-ratelimit-remaining');
  return response.status === 429 || (response.status === 403 && remaining === '0');
}

export async function fetchGitHubRepo(owner: string, repo: string): Promise<GitHubRepoResponse | null> {
  const cacheKey = `github:repo:${owner}/${repo}`;
  const cached = apiCache.get(cacheKey);

  if (cached !== undefined) {
    return cached as GitHubRepoResponse | null;
  }

  const url = `${API_CONFIG.githubApiUrl}/repos/${owner}/${repo}`;
  const response = await fetchGitHubJson<GitHubRepoResponse>(url);

  if (response.status === 404 || isRateLimited(response)) {
    apiCache.set(cacheKey, null);
    return null;
  }

  if (!response.ok) {
    throw new Error(`GitHub repo request failed for ${owner}/${repo} with status ${response.status}`);
  }

  const data = (await response.json()) as GitHubRepoResponse;
  apiCache.set(cacheKey, data);
  return data;
}

export async function fetchGitHubContributors(owner: string, repo: string): Promise<GitHubContributor[]> {
  const url = `${API_CONFIG.githubApiUrl}/repos/${owner}/${repo}/contributors?per_page=30`;

  try {
    const response = await fetchGitHubJson<GitHubContributor[]>(url);
    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as GitHubContributor[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchGitHubCommitActivity(
  owner: string,
  repo: string,
): Promise<GitHubCommitActivity[]> {
  const url = `${API_CONFIG.githubApiUrl}/repos/${owner}/${repo}/stats/commit_activity`;

  try {
    let response = await fetchGitHubJson<GitHubCommitActivity[]>(url);

    if (response.status === 202) {
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 2000);
      });
      response = await fetchGitHubJson<GitHubCommitActivity[]>(url);
    }

    if (!response.ok || response.status === 202) {
      return [];
    }

    const data = (await response.json()) as GitHubCommitActivity[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export { GITHUB_TOKEN, githubHeaders };
