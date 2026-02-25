import { PERMISSIVE_LICENSES, RESTRICTIVE_LICENSES } from '@/lib/constants';
import type { LicenseMutationResult, NpmPackageResponse, NpmVersionInfo } from '@/lib/types';

type VersionLicense = {
  version: string;
  license: string;
  publishedAtMs: number;
};

function normalizeLicense(license: NpmVersionInfo['license'] | string | undefined): string {
  if (!license) {
    return 'UNKNOWN';
  }

  if (typeof license === 'string') {
    const normalized = license.trim();
    return normalized.length > 0 ? normalized : 'UNKNOWN';
  }

  const normalized = license.type.trim();
  return normalized.length > 0 ? normalized : 'UNKNOWN';
}

function getVersionLicenses(pkg: NpmPackageResponse): VersionLicense[] {
  return Object.entries(pkg.versions)
    .map(([version, info]) => ({
      version,
      license: normalizeLicense(info.license),
      publishedAtMs: Date.parse(pkg.time[version] ?? '') || 0,
    }))
    .sort((a, b) => a.publishedAtMs - b.publishedAtMs);
}

export function analyzeLicenseMutation(pkg: NpmPackageResponse): LicenseMutationResult {
  const versions = getVersionLicenses(pkg);
  const latest = versions[versions.length - 1];
  const currentLicense = latest ? latest.license : normalizeLicense(pkg.license);

  const previousLicenses = versions.slice(0, -1).map((entry) => ({
    version: entry.version,
    license: entry.license,
  }));

  let changes = 0;
  for (let index = 1; index < versions.length; index += 1) {
    const prev = versions[index - 1].license;
    const curr = versions[index].license;
    if (curr !== prev && prev !== 'UNKNOWN' && curr !== 'UNKNOWN') {
      changes += 1;
    }
  }

  const hasChanged = changes > 0;
  const isRestrictive = RESTRICTIVE_LICENSES.includes(currentLicense as (typeof RESTRICTIVE_LICENSES)[number]);
  const isMissing = currentLicense === 'UNKNOWN';

  let score = 0;
  const signals: string[] = [];

  if (isMissing) {
    score = Math.max(score, 30);
    signals.push('Missing or unknown current license metadata');
  }

  if (!hasChanged && !isMissing) {
    score = 0;
  }

  if (hasChanged && isRestrictive) {
    score = Math.max(score, 60);
    signals.push(`License changed to restrictive license (${currentLicense})`);
  }

  if (changes > 1) {
    score = Math.max(score, 40);
    signals.push(`License changed multiple times across version history (${changes} changes)`);
  } else if (changes === 1 && !isRestrictive) {
    const previous = previousLicenses[previousLicenses.length - 1]?.license ?? 'UNKNOWN';
    const bothPermissive =
      PERMISSIVE_LICENSES.includes(previous as (typeof PERMISSIVE_LICENSES)[number]) &&
      PERMISSIVE_LICENSES.includes(currentLicense as (typeof PERMISSIVE_LICENSES)[number]);
    score = Math.max(score, 20);
    if (bothPermissive) {
      signals.push(`License changed between permissive licenses (${previous} -> ${currentLicense})`);
    } else {
      signals.push(`License changed (${previous} -> ${currentLicense})`);
    }
  }

  return {
    score,
    currentLicense,
    previousLicenses,
    hasChanged,
    isRestrictive,
    signals,
  };
}
