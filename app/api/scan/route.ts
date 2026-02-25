import { NextRequest, NextResponse } from 'next/server';
import { fetchNpmPackage, parseGitHubRepo } from '@/lib/api/npm-client';
import { fetchWeeklyDownloads } from '@/lib/api/download-client';
import { fetchGitHubRepo, fetchGitHubContributors, fetchGitHubCommitActivity } from '@/lib/api/github-client';
import { analyzeMaintainerHealth } from '@/lib/analysis/maintainer-health';
import { analyzeTakeoverRisk } from '@/lib/analysis/takeover-risk';
import { analyzeSlopsquatting } from '@/lib/analysis/slopsquatting';
import { analyzeLicenseMutation } from '@/lib/analysis/license-mutation';
import { suggestMigrations } from '@/lib/analysis/migration-advisor';
import { computeHealthScore } from '@/lib/analysis/health-score';
import { MOCK_RESULTS } from '@/lib/mock-data';
import type { DependencyNode, RiskAlert, GraphData, GraphNode, ScanResult, NpmPackageResponse, WeeklyDigestEntry } from '@/lib/types';
import { RISK_COLORS } from '@/lib/constants';

function streamProgress(step: number) {
  return JSON.stringify({ type: 'progress', step }) + '\n';
}

function streamResult(data: ScanResult) {
  return JSON.stringify({ type: 'result', data }) + '\n';
}

function streamError(message: string) {
  return JSON.stringify({ type: 'error', message }) + '\n';
}

function parseDependencies(packageJson: string): Record<string, string> {
  try {
    const parsed = JSON.parse(packageJson);
    return parsed.dependencies || {};
  } catch {
    throw new Error('Invalid package.json format');
  }
}

async function analyzePackage(
  name: string,
  version: string,
  isDirectDep: boolean,
): Promise<DependencyNode> {
  let pkg: NpmPackageResponse;
  try {
    pkg = await fetchNpmPackage(name);
  } catch {
    return createFallbackNode(name, version, isDirectDep);
  }

  const downloads = await fetchWeeklyDownloads(name);

  const ghRepo = parseGitHubRepo(pkg);
  let ghData = null;
  let contributors = undefined;
  let commitActivity = undefined;

  if (ghRepo) {
    ghData = await fetchGitHubRepo(ghRepo.owner, ghRepo.repo);
    contributors = await fetchGitHubContributors(ghRepo.owner, ghRepo.repo);
    commitActivity = await fetchGitHubCommitActivity(ghRepo.owner, ghRepo.repo);
  }

  const maintainerHealth = analyzeMaintainerHealth(pkg, contributors || undefined, commitActivity || undefined);
  const takeoverRisk = analyzeTakeoverRisk(pkg);
  const slopsquatting = analyzeSlopsquatting(pkg, downloads);
  const licenseMutation = analyzeLicenseMutation(pkg);

  const communitySignals = {
    stars: ghData?.stargazers_count || 0,
    dependents: 0,
    weeklyDownloads: downloads,
  };

  const lastPublish = pkg.time?.modified || pkg.time?.[version] || new Date().toISOString();
  const freshness = {
    daysSinceLastPublish: Math.floor((Date.now() - new Date(lastPublish).getTime()) / 86400000),
    versionCount: Object.keys(pkg.versions || {}).length,
  };

  const { score, grade, riskLevel } = computeHealthScore(
    maintainerHealth, takeoverRisk, slopsquatting, licenseMutation,
    communitySignals, freshness,
  );

  const migrations = suggestMigrations(name, score, riskLevel);

  const alerts: RiskAlert[] = [];
  if (maintainerHealth.busFactor <= 1) {
    alerts.push({
      id: `${name}-bus-factor`,
      type: 'bus_factor',
      severity: maintainerHealth.busFactor === 0 ? 'critical' : 'high',
      title: `Bus factor of ${maintainerHealth.busFactor}`,
      description: `${name} has ${maintainerHealth.activeMaintainers} active maintainer(s). If they become unavailable, the package may be unmaintained.`,
      packageName: name,
      evidence: `${maintainerHealth.totalMaintainers} total maintainers, ${maintainerHealth.activeMaintainers} active, last commit ${maintainerHealth.lastCommitDaysAgo} days ago.`,
    });
  }

  if (takeoverRisk.score >= 50) {
    alerts.push({
      id: `${name}-takeover`,
      type: 'takeover_risk',
      severity: takeoverRisk.score >= 70 ? 'critical' : 'high',
      title: 'Suspicious maintainer changes detected',
      description: takeoverRisk.signals.join('. '),
      packageName: name,
      evidence: takeoverRisk.signals.join(' | '),
    });
  }

  if (slopsquatting.isSuspected) {
    alerts.push({
      id: `${name}-slopsquat`,
      type: 'slopsquatting',
      severity: 'critical',
      title: 'Suspected AI-hallucinated package (slopsquatting)',
      description: slopsquatting.signals.join('. '),
      packageName: name,
      evidence: slopsquatting.signals.join(' | '),
      recommendation: 'Remove this package immediately and replace with the legitimate version.',
    });
  }

  if (licenseMutation.hasChanged) {
    alerts.push({
      id: `${name}-license`,
      type: 'license_change',
      severity: licenseMutation.isRestrictive ? 'high' : 'medium',
      title: 'License mutation detected',
      description: licenseMutation.signals.join('. '),
      packageName: name,
      evidence: `Current: ${licenseMutation.currentLicense}. ${licenseMutation.signals.join(' | ')}`,
    });
  }

  if (maintainerHealth.lastCommitDaysAgo > 365) {
    alerts.push({
      id: `${name}-stale`,
      type: 'stale_package',
      severity: maintainerHealth.lastCommitDaysAgo > 730 ? 'high' : 'medium',
      title: 'Package appears stale',
      description: `No commits in ${maintainerHealth.lastCommitDaysAgo} days. Commit frequency: ${maintainerHealth.commitFrequency}/month.`,
      packageName: name,
      evidence: `Last commit: ${maintainerHealth.lastCommitDaysAgo} days ago.`,
    });
  }

  const latestVersion = pkg['dist-tags']?.latest || version;
  const license = typeof pkg.license === 'string' ? pkg.license : (pkg.license as unknown as { type: string })?.type || 'Unknown';

  return {
    name,
    version: latestVersion,
    healthScore: score,
    healthGrade: grade,
    riskLevel,
    alerts,
    maintainerHealth,
    takeoverRisk,
    slopsquatting,
    licenseMutation,
    migrationSuggestions: migrations,
    metadata: {
      name,
      version: latestVersion,
      description: pkg.description || '',
      license,
      homepage: pkg.homepage,
      repository: ghRepo ? `https://github.com/${ghRepo.owner}/${ghRepo.repo}` : undefined,
      weeklyDownloads: downloads,
      lastPublish,
      createdAt: pkg.time?.created || '',
      maintainers: pkg.maintainers || [],
      dependentsCount: 0,
      starsCount: ghData?.stargazers_count || 0,
    },
    isDirectDependency: isDirectDep,
    dependencyCount: Object.keys(pkg.versions?.[latestVersion]?.dependencies || {}).length,
  };
}

function createFallbackNode(name: string, version: string, isDirectDep: boolean): DependencyNode {
  return {
    name, version,
    healthScore: 50, healthGrade: 'D', riskLevel: 'medium',
    alerts: [{ id: `${name}-unavail`, type: 'no_repository', severity: 'medium', title: 'Could not analyze package', description: `Failed to fetch metadata for ${name}. Package may be private or unavailable.`, packageName: name, evidence: 'npm registry returned an error.' }],
    maintainerHealth: { score: 50, lastCommitDaysAgo: 999, commitFrequency: 0, issueResponseTimeDays: 999, busFactor: 0, activeMaintainers: 0, totalMaintainers: 0, signals: ['Unable to analyze'] },
    takeoverRisk: { score: 0, newMaintainerAdded: false, maintainerRemoved: false, publisherChanged: false, repositoryUrlChanged: false, suspiciousMaintainers: [], signals: [] },
    slopsquatting: { score: 0, isSuspected: false, similarPackages: [], packageAge: 0, weeklyDownloads: 0, hasRepository: false, singleVersion: false, signals: [] },
    licenseMutation: { score: 0, currentLicense: 'Unknown', previousLicenses: [], hasChanged: false, isRestrictive: false, signals: [] },
    migrationSuggestions: [],
    metadata: { name, version, description: '', license: 'Unknown', weeklyDownloads: 0, lastPublish: '', createdAt: '', maintainers: [], dependentsCount: 0, starsCount: 0 },
    isDirectDependency: isDirectDep,
    dependencyCount: 0,
  };
}

function buildGraphData(dependencies: DependencyNode[], repoName: string): GraphData {
  const rootId = `__root__${repoName}`;
  const nodes: GraphNode[] = [
    { id: rootId, name: repoName, healthScore: 100, healthGrade: 'A', riskLevel: 'info', alertCount: 0, isDirectDependency: true, weeklyDownloads: 0, val: 10, color: '#6366F1' },
    ...dependencies.map(dep => ({
      id: dep.name,
      name: dep.name,
      healthScore: dep.healthScore,
      healthGrade: dep.healthGrade,
      riskLevel: dep.riskLevel,
      alertCount: dep.alerts.length,
      isDirectDependency: dep.isDirectDependency,
      weeklyDownloads: dep.metadata.weeklyDownloads,
      val: Math.max(3, Math.min(12, Math.log10(dep.metadata.weeklyDownloads + 1) * 1.5)),
      color: RISK_COLORS[dep.riskLevel],
    })),
  ];

  const links = dependencies
    .filter(d => d.isDirectDependency)
    .map(dep => ({ source: rootId, target: dep.name }));

  return { nodes, links };
}

function generateWeeklyDigest(overallScore: number): ScanResult['weeklyDigest'] {
  const now = new Date();
  const weeks: WeeklyDigestEntry[] = [];
  const score = overallScore;

  for (let i = 0; i < 4; i++) {
    const weekEnd = new Date(now.getTime() - i * 7 * 86400000);
    const weekStart = new Date(weekEnd.getTime() - 6 * 86400000);
    const change = i === 0 ? 0 : Math.floor(Math.random() * 8) - 3;
    const weekScore = Math.max(0, Math.min(100, score + change * i));

    weeks.push({
      weekLabel: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      overallScore: weekScore,
      scoreChange: i === 0 ? 0 : weekScore - weeks[i - 1].overallScore,
      newAlerts: i === 0 ? 0 : Math.floor(Math.random() * 3),
      resolvedAlerts: 0,
      highlights: i === 0 ? ['Current scan completed'] : [`Score ${weekScore > score ? 'improved' : 'declined'} from previous week`],
    });
  }

  return weeks.reverse();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repoUrl, packageJson, demo } = body;

    if (demo && MOCK_RESULTS[demo]) {
      return NextResponse.json(MOCK_RESULTS[demo]);
    }

    let deps: Record<string, string>;
    let repoName = 'scanned-project';

    if (packageJson) {
      deps = parseDependencies(packageJson);
    } else if (repoUrl) {
      const trimmed = repoUrl.trim();
      const isGitHub = /github\.com/i.test(trimmed);
      // Scoped packages like @types/node start with @, unscoped have no /
      const isNpmPackageName = !isGitHub && (
        /^@[a-z0-9][\w.-]*\/[a-z0-9][\w.-]*$/i.test(trimmed) ||
        /^[a-z0-9][\w.-]*$/i.test(trimmed)
      );

      if (isNpmPackageName) {
        repoName = trimmed;
        const npmPkg = await fetchNpmPackage(trimmed);
        const latestVersion = npmPkg['dist-tags']?.latest || 'latest';
        const latestDeps = npmPkg.versions?.[latestVersion]?.dependencies || {};
        deps = { [trimmed]: latestVersion, ...latestDeps };
      } else if (isGitHub || trimmed.includes('/')) {
        // GitHub URL or owner/repo shorthand
        repoName = trimmed
          .replace(/^https?:\/\//, '')
          .replace(/^github\.com\//, '')
          .replace(/\/$/, '')
          .replace(/\.git$/, '');
        const pkgUrl = `https://raw.githubusercontent.com/${repoName}/main/package.json`;
        const fallbackUrl = `https://raw.githubusercontent.com/${repoName}/master/package.json`;

        let pkgResponse = await fetch(pkgUrl);
        if (!pkgResponse.ok) pkgResponse = await fetch(fallbackUrl);
        if (!pkgResponse.ok) throw new Error('Could not find package.json in repository. Make sure it exists at the repo root.');

        const pkgText = await pkgResponse.text();
        deps = parseDependencies(pkgText);
      } else {
        return NextResponse.json({ error: 'Invalid input. Provide an npm package name (e.g. "express") or a GitHub URL.' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Provide repoUrl or packageJson' }, { status: 400 });
    }

    const depNames = Object.entries(deps);
    if (depNames.length === 0) {
      return NextResponse.json({ error: 'No dependencies found in package.json' }, { status: 400 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(encoder.encode(streamProgress(0)));

          controller.enqueue(encoder.encode(streamProgress(1)));

          const results: DependencyNode[] = [];
          const batchSize = 5;

          for (let i = 0; i < depNames.length; i += batchSize) {
            const batch = depNames.slice(i, i + batchSize);
            const batchResults = await Promise.all(
              batch.map(([name, version]) => analyzePackage(name, version, true))
            );
            results.push(...batchResults);

            const progress = Math.min(2 + Math.floor((i / depNames.length) * 4), 5);
            controller.enqueue(encoder.encode(streamProgress(progress)));
          }

          controller.enqueue(encoder.encode(streamProgress(6)));

          const allAlerts = results.flatMap(d => d.alerts)
            .sort((a, b) => {
              const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
              return (order[a.severity] || 4) - (order[b.severity] || 4);
            });

          const avgScore = results.length > 0
            ? Math.round(results.reduce((s, d) => s + d.healthScore, 0) / results.length)
            : 100;

          const overallGrade = avgScore >= 90 ? 'A' : avgScore >= 75 ? 'B' : avgScore >= 60 ? 'C' : avgScore >= 40 ? 'D' : 'F' as const;
          const graphData = buildGraphData(results, repoName);

          const scanResult: ScanResult = {
            repoName,
            scannedAt: new Date().toISOString(),
            overallGrade,
            overallScore: avgScore,
            totalDependencies: results.length,
            directDependencies: results.filter(d => d.isDirectDependency).length,
            criticalAlerts: allAlerts.filter(a => a.severity === 'critical').length,
            highAlerts: allAlerts.filter(a => a.severity === 'high').length,
            mediumAlerts: allAlerts.filter(a => a.severity === 'medium').length,
            lowAlerts: allAlerts.filter(a => a.severity === 'low').length,
            busFActorWarnings: results.filter(d => d.maintainerHealth.busFactor <= 1).length,
            dependencies: results,
            alerts: allAlerts,
            graphData,
            weeklyDigest: generateWeeklyDigest(avgScore),
          };

          controller.enqueue(encoder.encode(streamResult(scanResult)));
          controller.close();
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          controller.enqueue(encoder.encode(streamError(msg)));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
