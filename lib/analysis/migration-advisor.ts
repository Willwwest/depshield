import { ALTERNATIVES_MAP } from '@/lib/alternatives-map';
import type { MigrationSuggestion, RiskLevel } from '@/lib/types';

export function suggestMigrations(
  packageName: string,
  healthScore: number,
  riskLevel: RiskLevel,
): MigrationSuggestion[] {
  const alternatives = ALTERNATIVES_MAP[packageName.toLowerCase()];
  if (!alternatives || alternatives.length === 0) {
    return [];
  }

  const shouldSuggest = healthScore < 60 || riskLevel === 'critical' || riskLevel === 'high';
  if (!shouldSuggest) {
    return [];
  }

  return alternatives.map((alternative) => ({
    from: packageName,
    to: alternative.name,
    toDescription: alternative.description,
    weeklyDownloads: alternative.weeklyDownloads,
    healthGrade: alternative.healthGrade,
    effort: alternative.effort,
    reason: alternative.reason,
  }));
}
