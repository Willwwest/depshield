// ============================================================
// DepShield — Core Type Definitions
// ============================================================

// --- Risk & Health Enums ---

export type HealthGrade = 'A' | 'B' | 'C' | 'D' | 'F';
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type AlertType =
  | 'maintainer_burnout'
  | 'bus_factor'
  | 'takeover_risk'
  | 'slopsquatting'
  | 'license_change'
  | 'stale_package'
  | 'no_repository'
  | 'download_anomaly'
  | 'deprecated'
  | 'single_maintainer';

// --- Scan Progress ---

export type ScanStepStatus = 'pending' | 'active' | 'complete' | 'error';

export interface ScanStep {
  id: string;
  label: string;
  description: string;
  status: ScanStepStatus;
}

export interface ScanProgress {
  steps: ScanStep[];
  currentStep: number;
  totalSteps: number;
  packagesProcessed: number;
  totalPackages: number;
}

// --- Maintainer & Contributor Data ---

export interface MaintainerProfile {
  name: string;
  email: string;
  npmPackageCount: number;
  npmAccountAge: number; // days since first publish
  githubUsername?: string;
  githubFollowers?: number;
  isNewMaintainer: boolean; // added in last 90 days
}

export interface ContributorStats {
  totalContributors: number;
  activeContributors: number; // committed in last 90 days
  topContributorShare: number; // % of commits from top contributor
  busFactor: number; // how many people need to leave to stall the project
}

// --- Risk Alerts ---

export interface RiskAlert {
  id: string;
  type: AlertType;
  severity: RiskLevel;
  title: string;
  description: string;
  packageName: string;
  evidence: string;
  recommendation?: string;
}

// --- Package Analysis Results ---

export interface MaintainerHealthResult {
  score: number; // 0-100
  lastCommitDaysAgo: number;
  commitFrequency: number; // commits per month (90-day avg)
  issueResponseTimeDays: number;
  busFactor: number;
  activeMaintainers: number;
  totalMaintainers: number;
  signals: string[];
}

export interface TakeoverRiskResult {
  score: number; // 0-100
  newMaintainerAdded: boolean;
  maintainerRemoved: boolean;
  publisherChanged: boolean;
  repositoryUrlChanged: boolean;
  suspiciousMaintainers: MaintainerProfile[];
  signals: string[];
}

export interface SlopsquattingResult {
  score: number; // 0-100
  isSuspected: boolean;
  similarPackages: Array<{ name: string; distance: number; downloads: number }>;
  packageAge: number; // days
  weeklyDownloads: number;
  hasRepository: boolean;
  singleVersion: boolean;
  signals: string[];
}

export interface LicenseMutationResult {
  score: number; // 0-100
  currentLicense: string;
  previousLicenses: Array<{ version: string; license: string }>;
  hasChanged: boolean;
  isRestrictive: boolean;
  signals: string[];
}

export interface MigrationSuggestion {
  from: string;
  to: string;
  toDescription: string;
  weeklyDownloads: number;
  healthGrade: HealthGrade;
  effort: 'low' | 'medium' | 'high';
  reason: string;
}

// --- Dependency Node (per-package summary) ---

export interface DependencyNode {
  name: string;
  version: string;
  healthScore: number; // 0-100
  healthGrade: HealthGrade;
  riskLevel: RiskLevel;
  alerts: RiskAlert[];
  maintainerHealth: MaintainerHealthResult;
  takeoverRisk: TakeoverRiskResult;
  slopsquatting: SlopsquattingResult;
  licenseMutation: LicenseMutationResult;
  migrationSuggestions: MigrationSuggestion[];
  metadata: PackageSummary;
  isDirectDependency: boolean;
  dependencyCount: number; // number of its own dependencies
}

export interface PackageSummary {
  name: string;
  version: string;
  description: string;
  license: string;
  homepage?: string;
  repository?: string;
  weeklyDownloads: number;
  lastPublish: string; // ISO date
  createdAt: string; // ISO date
  maintainers: Array<{ name: string; email: string }>;
  dependentsCount: number;
  starsCount: number;
}

// --- Graph Data (for react-force-graph) ---

export interface GraphNode {
  id: string;
  name: string;
  healthScore: number;
  healthGrade: HealthGrade;
  riskLevel: RiskLevel;
  alertCount: number;
  isDirectDependency: boolean;
  weeklyDownloads: number;
  val: number; // node size (downloads-based)
  color: string;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// --- Top-level Scan Result ---

export interface ScanResult {
  repoName: string;
  scannedAt: string; // ISO date
  overallGrade: HealthGrade;
  overallScore: number; // 0-100
  totalDependencies: number;
  directDependencies: number;
  criticalAlerts: number;
  highAlerts: number;
  mediumAlerts: number;
  lowAlerts: number;
  busFActorWarnings: number;
  dependencies: DependencyNode[];
  alerts: RiskAlert[];
  graphData: GraphData;
  weeklyDigest: WeeklyDigestEntry[];
}

// --- Weekly Digest ---

export interface WeeklyDigestEntry {
  weekLabel: string; // e.g. "Feb 17 - Feb 23"
  overallScore: number;
  scoreChange: number; // delta from previous week
  newAlerts: number;
  resolvedAlerts: number;
  highlights: string[];
}

// --- npm Registry API shapes (raw) ---

export interface NpmPackageResponse {
  name: string;
  'dist-tags': Record<string, string>;
  versions: Record<string, NpmVersionInfo>;
  time: Record<string, string>; // version -> ISO date, plus "created" and "modified"
  maintainers: Array<{ name: string; email: string }>;
  description?: string;
  homepage?: string;
  repository?: { type: string; url: string };
  license?: string;
  readme?: string;
}

export interface NpmVersionInfo {
  name: string;
  version: string;
  description?: string;
  license?: string | { type: string };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  maintainers?: Array<{ name: string; email: string }>;
  _npmUser?: { name: string; email: string };
  repository?: { type: string; url: string };
}

export interface NpmDownloadResponse {
  downloads: number;
  start: string;
  end: string;
  package: string;
}

// --- GitHub API shapes (raw) ---

export interface GitHubRepoResponse {
  full_name: string;
  stargazers_count: number;
  open_issues_count: number;
  forks_count: number;
  subscribers_count: number;
  pushed_at: string;
  created_at: string;
  license?: { spdx_id: string };
}

export interface GitHubContributor {
  login: string;
  contributions: number;
  avatar_url: string;
}

export interface GitHubCommitActivity {
  total: number;
  week: number;
  days: number[];
}
