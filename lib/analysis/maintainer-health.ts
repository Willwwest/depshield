import type {
  GitHubCommitActivity,
  GitHubContributor,
  MaintainerHealthResult,
  NpmPackageResponse,
} from '@/lib/types';

function daysBetween(nowMs: number, isoDate: string | undefined): number {
  if (!isoDate) {
    return Number.POSITIVE_INFINITY;
  }

  const parsed = Date.parse(isoDate);
  if (Number.isNaN(parsed)) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.max(0, Math.floor((nowMs - parsed) / (1000 * 60 * 60 * 24)));
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function analyzeMaintainerHealth(
  pkg: NpmPackageResponse,
  githubContributors: GitHubContributor[] = [],
  commitActivity: GitHubCommitActivity[] = [],
): MaintainerHealthResult {
  const nowMs = Date.now();

  const activityByWeek = [...commitActivity].sort((a, b) => a.week - b.week);
  const lastActiveWeek = [...activityByWeek].reverse().find((week) => week.total > 0);
  const lastCommitDaysAgo = lastActiveWeek
    ? Math.max(0, Math.floor((nowMs - lastActiveWeek.week * 1000) / (1000 * 60 * 60 * 24)))
    : daysBetween(nowMs, pkg.time.modified);

  const recentWeeks = activityByWeek.slice(-12);
  const commitsInLast12Weeks = recentWeeks.reduce((sum, week) => sum + week.total, 0);
  const commitFrequency = commitsInLast12Weeks / 3;

  const totalContributions = githubContributors.reduce((sum, contributor) => sum + contributor.contributions, 0);
  const sortedContributors = [...githubContributors].sort((a, b) => b.contributions - a.contributions);
  let runningShare = 0;
  let busFactor = 0;

  if (totalContributions > 0) {
    for (const contributor of sortedContributors) {
      runningShare += contributor.contributions / totalContributions;
      busFactor += 1;
      if (runningShare > 0.8) {
        break;
      }
    }
  }

  const contributorLogins = new Set(sortedContributors.map((contributor) => normalize(contributor.login)));
  const hasRecentCommits = commitsInLast12Weeks > 0;
  const activeMaintainerMatches = pkg.maintainers.filter((maintainer) => {
    const maintainerName = normalize(maintainer.name);
    const localPart = normalize(maintainer.email.split('@')[0] ?? '');
    return contributorLogins.has(maintainerName) || contributorLogins.has(localPart);
  }).length;

  const totalMaintainers = pkg.maintainers.length;
  const activeMaintainers = Math.min(
    totalMaintainers,
    Math.max(activeMaintainerMatches, hasRecentCommits && totalMaintainers > 0 ? 1 : 0),
  );

  const openIssuesCount = (pkg as NpmPackageResponse & { open_issues_count?: number }).open_issues_count ?? 0;

  const recencyScore =
    lastCommitDaysAgo < 30
      ? 30
      : lastCommitDaysAgo < 90
        ? 20
        : lastCommitDaysAgo < 365
          ? 10
          : 0;

  const commitFrequencyScore =
    commitFrequency >= 4
      ? 25
      : commitFrequency >= 2
        ? 15
        : commitFrequency >= 0.5
          ? 5
          : 0;

  const busFactorScore = busFactor >= 3 ? 25 : busFactor === 2 ? 15 : busFactor === 1 ? 5 : 0;
  const issueResponseScore = openIssuesCount < 50 ? 20 : openIssuesCount < 200 ? 10 : 0;

  const signals: string[] = [];

  if (lastCommitDaysAgo >= 365) {
    signals.push(`No recent commit in ${lastCommitDaysAgo} days`);
  }

  if (commitFrequency < 0.5) {
    signals.push(`Low commit velocity (${commitFrequency.toFixed(2)} commits/month)`);
  }

  if (busFactor <= 1 && totalContributions > 0) {
    signals.push('Critical bus factor: one contributor dominates over 80% of commits');
  } else if (busFactor === 2) {
    signals.push('Bus factor warning: top two contributors control most commits');
  }

  if (openIssuesCount >= 200) {
    signals.push(`High open issue backlog (${openIssuesCount} open issues)`);
  } else if (openIssuesCount >= 50) {
    signals.push(`Moderate open issue backlog (${openIssuesCount} open issues)`);
  }

  if (activeMaintainers <= 1 && totalMaintainers > 1) {
    signals.push(`Only ${activeMaintainers} active maintainer inferred from ${totalMaintainers} maintainers`);
  }

  const score = Math.max(0, Math.min(100, recencyScore + commitFrequencyScore + busFactorScore + issueResponseScore));

  return {
    score,
    lastCommitDaysAgo,
    commitFrequency,
    issueResponseTimeDays: openIssuesCount < 50 ? 3 : openIssuesCount < 200 ? 14 : 45,
    busFactor,
    activeMaintainers,
    totalMaintainers,
    signals,
  };
}
