import type { MaintainerProfile, NpmPackageResponse, NpmVersionInfo, TakeoverRiskResult } from '@/lib/types';

type VersionEntry = {
  version: string;
  info: NpmVersionInfo;
  publishedAtMs: number;
};

const PRIVACY_DOMAINS = new Set(['proton.me', 'protonmail.com', 'tutanota.com', 'tuta.com']);

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeRepoUrl(url: string | undefined): string {
  if (!url) {
    return '';
  }
  return normalize(url).replace(/^git\+/, '').replace(/\.git$/, '');
}

function getSortedVersions(pkg: NpmPackageResponse): VersionEntry[] {
  return Object.entries(pkg.versions)
    .map(([version, info]) => ({
      version,
      info,
      publishedAtMs: Date.parse(pkg.time[version] ?? '') || 0,
    }))
    .sort((a, b) => a.publishedAtMs - b.publishedAtMs);
}

function maintainerKey(maintainer: { name: string; email: string }): string {
  return `${normalize(maintainer.name)}<${normalize(maintainer.email)}>`;
}

export function analyzeTakeoverRisk(pkg: NpmPackageResponse): TakeoverRiskResult {
  const versions = getSortedVersions(pkg);
  const signals: string[] = [];
  const suspiciousMaintainers: MaintainerProfile[] = [];

  if (versions.length < 2) {
    return {
      score: 0,
      newMaintainerAdded: false,
      maintainerRemoved: false,
      publisherChanged: false,
      repositoryUrlChanged: false,
      suspiciousMaintainers,
      signals,
    };
  }

  const first = versions[0];
  const latest = versions[versions.length - 1];
  const previous = versions[versions.length - 2];

  const firstMaintainers = new Map(
    (first.info.maintainers ?? []).map((maintainer) => [maintainerKey(maintainer), maintainer] as const),
  );
  const latestMaintainers = new Map(
    (latest.info.maintainers ?? []).map((maintainer) => [maintainerKey(maintainer), maintainer] as const),
  );
  const previousMaintainerKeys = new Set((previous.info.maintainers ?? []).map((maintainer) => maintainerKey(maintainer)));

  const newlyAddedMaintainers = (latest.info.maintainers ?? []).filter(
    (maintainer) => !previousMaintainerKeys.has(maintainerKey(maintainer)),
  );

  const removedOriginalMaintainer = [...firstMaintainers.keys()].some((key) => !latestMaintainers.has(key));
  const newMaintainerAdded = newlyAddedMaintainers.length > 0;

  const publisherChanged = versions.some((entry, index) => {
    if (index === 0) {
      return false;
    }
    const prevPublisher = normalize(versions[index - 1].info._npmUser?.name ?? '');
    const nextPublisher = normalize(entry.info._npmUser?.name ?? '');
    return prevPublisher.length > 0 && nextPublisher.length > 0 && prevPublisher !== nextPublisher;
  });

  const repositoryUrlChanged = versions.some((entry, index) => {
    if (index === 0) {
      return false;
    }
    const prevUrl = normalizeRepoUrl(versions[index - 1].info.repository?.url);
    const nextUrl = normalizeRepoUrl(entry.info.repository?.url);
    return prevUrl.length > 0 && nextUrl.length > 0 && prevUrl !== nextUrl;
  });

  const maintainerOccurrences = new Map<string, number>();
  for (const version of versions) {
    for (const maintainer of version.info.maintainers ?? []) {
      const key = maintainerKey(maintainer);
      maintainerOccurrences.set(key, (maintainerOccurrences.get(key) ?? 0) + 1);
    }
  }

  let hasLowHistoryMaintainer = false;
  let hasPrivacyDomainMaintainer = false;

  for (const maintainer of newlyAddedMaintainers) {
    const key = maintainerKey(maintainer);
    const packageCountProxy = maintainerOccurrences.get(key) ?? 0;
    const domain = normalize(maintainer.email.split('@')[1] ?? '');
    const privacyDomain = PRIVACY_DOMAINS.has(domain);

    if (packageCountProxy < 5) {
      hasLowHistoryMaintainer = true;
    }

    if (privacyDomain) {
      hasPrivacyDomainMaintainer = true;
    }

    if (packageCountProxy < 5 || privacyDomain) {
      suspiciousMaintainers.push({
        name: maintainer.name,
        email: maintainer.email,
        npmPackageCount: packageCountProxy,
        npmAccountAge: privacyDomain ? 30 : 365,
        isNewMaintainer: true,
      });
    }
  }

  let score = 0;
  if (newMaintainerAdded) {
    score += 30;
    signals.push(`New maintainer(s) added in latest release: ${newlyAddedMaintainers.map((m) => m.name).join(', ')}`);
  }

  if (hasLowHistoryMaintainer) {
    score += 20;
    signals.push('New maintainer has limited package history (<5 package appearances in version history)');
  }

  if (publisherChanged) {
    score += 15;
    signals.push('Publisher identity changed across releases');
  }

  if (repositoryUrlChanged) {
    score += 15;
    signals.push('Repository URL changed between versions');
  }

  if (hasPrivacyDomainMaintainer) {
    score += 10;
    signals.push('New maintainer uses privacy-focused email domain');
  }

  if (removedOriginalMaintainer) {
    score += 10;
    signals.push('At least one original maintainer no longer appears in latest release');
  }

  score = Math.min(100, score);

  return {
    score,
    newMaintainerAdded,
    maintainerRemoved: removedOriginalMaintainer,
    publisherChanged,
    repositoryUrlChanged,
    suspiciousMaintainers,
    signals,
  };
}
