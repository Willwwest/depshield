import { DIMENSION_WEIGHTS, scoreToGrade, scoreToRiskLevel } from '@/lib/constants';
import type {
  HealthGrade,
  LicenseMutationResult,
  MaintainerHealthResult,
  RiskLevel,
  SlopsquattingResult,
  TakeoverRiskResult,
} from '@/lib/types';

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function scoreCommunityHealth(communitySignals: {
  stars: number;
  dependents: number;
  weeklyDownloads: number;
}): number {
  const starsScore = Math.min(40, (communitySignals.stars / 10000) * 40);
  const dependentsScore = Math.min(30, (communitySignals.dependents / 5000) * 30);
  const downloadsScore = Math.min(30, (communitySignals.weeklyDownloads / 1_000_000) * 30);
  return clampScore(starsScore + dependentsScore + downloadsScore);
}

function scoreFreshness(daysSinceLastPublish: number): number {
  if (daysSinceLastPublish < 30) return 100;
  if (daysSinceLastPublish < 90) return 80;
  if (daysSinceLastPublish < 180) return 60;
  if (daysSinceLastPublish < 365) return 40;
  if (daysSinceLastPublish < 730) return 20;
  return 0;
}

export function computeHealthScore(
  maintainerHealth: MaintainerHealthResult,
  takeoverRisk: TakeoverRiskResult,
  slopsquatting: SlopsquattingResult,
  licenseMutation: LicenseMutationResult,
  communitySignals: { stars: number; dependents: number; weeklyDownloads: number },
  freshness: { daysSinceLastPublish: number; versionCount: number },
): { score: number; grade: HealthGrade; riskLevel: RiskLevel } {
  void licenseMutation;

  const maintainerDimension = clampScore(maintainerHealth.score);

  const highestSecurityRisk = Math.max(takeoverRisk.score, slopsquatting.score);
  const securityDimension = clampScore(100 - highestSecurityRisk);

  const communityDimension = scoreCommunityHealth(communitySignals);
  const freshnessDimension = scoreFreshness(freshness.daysSinceLastPublish);

  const weightedScore =
    maintainerDimension * DIMENSION_WEIGHTS.maintainerHealth +
    securityDimension * DIMENSION_WEIGHTS.securitySignals +
    communityDimension * DIMENSION_WEIGHTS.communityHealth +
    freshnessDimension * DIMENSION_WEIGHTS.freshness;

  const score = clampScore(Math.round(weightedScore));

  return {
    score,
    grade: scoreToGrade(score),
    riskLevel: scoreToRiskLevel(score),
  };
}
