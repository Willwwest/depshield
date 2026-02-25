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
import type { DependencyNode, RiskAlert } from '@/lib/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const packageName = decodeURIComponent(name);

  try {
    const pkg = await fetchNpmPackage(packageName);
    const downloads = await fetchWeeklyDownloads(packageName);

    const ghRepo = parseGitHubRepo(pkg);
    let ghData = null;
    let contributors = undefined;
    let commitActivity = undefined;

    if (ghRepo) {
      [ghData, contributors, commitActivity] = await Promise.all([
        fetchGitHubRepo(ghRepo.owner, ghRepo.repo),
        fetchGitHubContributors(ghRepo.owner, ghRepo.repo),
        fetchGitHubCommitActivity(ghRepo.owner, ghRepo.repo),
      ]);
    }

    const maintainerHealth = analyzeMaintainerHealth(pkg, contributors || undefined, commitActivity || undefined);
    const takeoverRisk = analyzeTakeoverRisk(pkg);
    const slopsquatting = analyzeSlopsquatting(pkg, downloads);
    const licenseMutation = analyzeLicenseMutation(pkg);

    const latestVersion = pkg['dist-tags']?.latest || 'unknown';
    const lastPublish = pkg.time?.modified || pkg.time?.[latestVersion] || new Date().toISOString();

    const { score, grade, riskLevel } = computeHealthScore(
      maintainerHealth, takeoverRisk, slopsquatting, licenseMutation,
      { stars: ghData?.stargazers_count || 0, dependents: 0, weeklyDownloads: downloads },
      { daysSinceLastPublish: Math.floor((Date.now() - new Date(lastPublish).getTime()) / 86400000), versionCount: Object.keys(pkg.versions || {}).length },
    );

    const migrations = suggestMigrations(packageName, score, riskLevel);

    const alerts: RiskAlert[] = [];
    if (maintainerHealth.busFactor <= 1) {
      alerts.push({ id: `${packageName}-bus`, type: 'bus_factor', severity: maintainerHealth.busFactor === 0 ? 'critical' : 'high', title: `Bus factor of ${maintainerHealth.busFactor}`, description: `Only ${maintainerHealth.activeMaintainers} active maintainer(s).`, packageName, evidence: `${maintainerHealth.totalMaintainers} total, ${maintainerHealth.activeMaintainers} active.` });
    }
    if (takeoverRisk.score >= 50) {
      alerts.push({ id: `${packageName}-takeover`, type: 'takeover_risk', severity: takeoverRisk.score >= 70 ? 'critical' : 'high', title: 'Suspicious maintainer changes', description: takeoverRisk.signals.join('. '), packageName, evidence: takeoverRisk.signals.join(' | ') });
    }
    if (slopsquatting.isSuspected) {
      alerts.push({ id: `${packageName}-slopsquat`, type: 'slopsquatting', severity: 'critical', title: 'Suspected slopsquatting', description: slopsquatting.signals.join('. '), packageName, evidence: slopsquatting.signals.join(' | '), recommendation: 'Remove immediately.' });
    }
    if (licenseMutation.hasChanged) {
      alerts.push({ id: `${packageName}-license`, type: 'license_change', severity: licenseMutation.isRestrictive ? 'high' : 'medium', title: 'License mutation', description: licenseMutation.signals.join('. '), packageName, evidence: `Current: ${licenseMutation.currentLicense}` });
    }

    const license = typeof pkg.license === 'string' ? pkg.license : 'Unknown';

    const result: DependencyNode = {
      name: packageName,
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
        name: packageName,
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
      isDirectDependency: true,
      dependencyCount: Object.keys(pkg.versions?.[latestVersion]?.dependencies || {}).length,
    };

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
