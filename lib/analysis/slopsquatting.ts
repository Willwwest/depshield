import { distance } from 'fastest-levenshtein';

import { POPULAR_PACKAGES, SLOPSQUATTING_THRESHOLDS } from '@/lib/constants';
import type { NpmPackageResponse, SlopsquattingResult } from '@/lib/types';

function daysSince(isoDate: string | undefined): number {
  if (!isoDate) {
    return Number.POSITIVE_INFINITY;
  }

  const parsed = Date.parse(isoDate);
  if (Number.isNaN(parsed)) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.max(0, Math.floor((Date.now() - parsed) / (1000 * 60 * 60 * 24)));
}

function hasLinkedRepository(pkg: NpmPackageResponse): boolean {
  if (pkg.repository?.url) {
    return true;
  }

  return Object.values(pkg.versions).some((version) => Boolean(version.repository?.url));
}

export function analyzeSlopsquatting(
  pkg: NpmPackageResponse,
  weeklyDownloads: number,
): SlopsquattingResult {
  const packageAge = daysSince(pkg.time.created);
  const versionCount = Object.keys(pkg.versions).length;
  const hasRepository = hasLinkedRepository(pkg);
  const singleVersion = versionCount === 1;

  const similarPackages = POPULAR_PACKAGES.map((popularName) => {
    const nameDistance = distance(pkg.name, popularName);
    return {
      name: popularName,
      distance: nameDistance,
      downloads: SLOPSQUATTING_THRESHOLDS.popularPackageDownloads,
    };
  })
    .filter((entry) => entry.distance <= SLOPSQUATTING_THRESHOLDS.maxLevenshteinDistance)
    .sort((a, b) => a.distance - b.distance || a.name.localeCompare(b.name));

  let score = 0;
  const signals: string[] = [];

  if (packageAge < SLOPSQUATTING_THRESHOLDS.suspiciousAgeDays) {
    score += 30;
    signals.push(`Recently published package (${packageAge} days old)`);
  }

  if (weeklyDownloads < SLOPSQUATTING_THRESHOLDS.suspiciousDownloads) {
    score += 25;
    signals.push(`Low adoption (${weeklyDownloads} weekly downloads)`);
  }

  if (!hasRepository) {
    score += 15;
    signals.push('No repository URL provided');
  }

  if (similarPackages.length > 0) {
    score += 20;
    const closest = similarPackages.slice(0, 3).map((entry) => `${entry.name} (distance ${entry.distance})`);
    signals.push(`Name closely resembles popular package(s): ${closest.join(', ')}`);
  }

  if (singleVersion) {
    score += 10;
    signals.push('Only one version published');
  }

  score = Math.min(100, score);
  const isSuspected = score >= 60;

  return {
    score,
    isSuspected,
    similarPackages,
    packageAge,
    weeklyDownloads,
    hasRepository,
    singleVersion,
    signals,
  };
}
