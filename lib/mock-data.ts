// ============================================================
// DepShield — Pre-computed Mock Data for Demo Packages
// ============================================================
// This data ensures the demo works instantly without API calls.
// Based on real package data as of February 2026.

import type {
  ScanResult,
  DependencyNode,
  RiskAlert,
  GraphData,
  WeeklyDigestEntry,
  MaintainerHealthResult,
  TakeoverRiskResult,
  SlopsquattingResult,
  LicenseMutationResult,
  PackageSummary,
} from './types';

// ─── Helper: Create Dependency Node ───────────────────────

function createNode(
  name: string,
  version: string,
  healthScore: number,
  overrides: Partial<DependencyNode> = {}
): DependencyNode {
  const grade = healthScore >= 90 ? 'A' : healthScore >= 75 ? 'B' : healthScore >= 60 ? 'C' : healthScore >= 40 ? 'D' : 'F';
  const riskLevel = healthScore >= 80 ? 'info' : healthScore >= 65 ? 'low' : healthScore >= 45 ? 'medium' : healthScore >= 25 ? 'high' : 'critical';

  return {
    name,
    version,
    healthScore,
    healthGrade: grade,
    riskLevel,
    alerts: [],
    maintainerHealth: {
      score: healthScore,
      lastCommitDaysAgo: 5,
      commitFrequency: 8,
      issueResponseTimeDays: 3,
      busFactor: 4,
      activeMaintainers: 3,
      totalMaintainers: 5,
      signals: [],
    },
    takeoverRisk: { score: 5, newMaintainerAdded: false, maintainerRemoved: false, publisherChanged: false, repositoryUrlChanged: false, suspiciousMaintainers: [], signals: [] },
    slopsquatting: { score: 0, isSuspected: false, similarPackages: [], packageAge: 3000, weeklyDownloads: 500000, hasRepository: true, singleVersion: false, signals: [] },
    licenseMutation: { score: 0, currentLicense: 'MIT', previousLicenses: [], hasChanged: false, isRestrictive: false, signals: [] },
    migrationSuggestions: [],
    metadata: {
      name,
      version,
      description: `${name} package`,
      license: 'MIT',
      repository: `https://github.com/org/${name}`,
      weeklyDownloads: 500000,
      lastPublish: '2026-02-10T00:00:00.000Z',
      createdAt: '2015-01-01T00:00:00.000Z',
      maintainers: [{ name: 'maintainer1', email: 'dev@example.com' }],
      dependentsCount: 10000,
      starsCount: 8000,
    },
    isDirectDependency: true,
    dependencyCount: 3,
    ...overrides,
  };
}

// ─── Express Ecosystem Mock Data ──────────────────────────

const expressDeps: DependencyNode[] = [
  // Healthy packages
  createNode('express', '4.21.2', 82, {
    metadata: {
      name: 'express',
      version: '4.21.2',
      description: 'Fast, unopinionated, minimalist web framework for node.',
      license: 'MIT',
      homepage: 'https://expressjs.com',
      repository: 'https://github.com/expressjs/express',
      weeklyDownloads: 34000000,
      lastPublish: '2025-11-15T00:00:00.000Z',
      createdAt: '2010-12-29T00:00:00.000Z',
      maintainers: [
        { name: 'wesleytodd', email: 'wes@wesleytodd.com' },
        { name: 'blakeembrey', email: 'hello@blakeembrey.com' },
      ],
      dependentsCount: 74000,
      starsCount: 65000,
    },
    maintainerHealth: {
      score: 78,
      lastCommitDaysAgo: 95,
      commitFrequency: 3.2,
      issueResponseTimeDays: 12,
      busFactor: 2,
      activeMaintainers: 2,
      totalMaintainers: 4,
      signals: ['Commit frequency declining', 'Issue response time above average'],
    },
    alerts: [
      {
        id: 'express-maint-1',
        type: 'maintainer_burnout',
        severity: 'medium',
        title: 'Declining maintainer activity',
        description: 'Commit frequency has dropped 40% over the last 6 months. Issue response time increased from 5 to 12 days.',
        packageName: 'express',
        evidence: '3.2 commits/month (was 5.4). 2 active maintainers out of 4.',
        recommendation: 'Monitor for further decline. Express 5.0 is in development which may explain reduced 4.x activity.',
      },
    ],
    dependencyCount: 31,
  }),

  createNode('debug', '4.4.0', 91, {
    metadata: { name: 'debug', version: '4.4.0', description: 'Lightweight debugging utility', license: 'MIT', repository: 'https://github.com/debug-js/debug', weeklyDownloads: 250000000, lastPublish: '2025-08-01T00:00:00.000Z', createdAt: '2011-11-01T00:00:00.000Z', maintainers: [{ name: 'TooTallNate', email: 'nathan@tootallnate.net' }], dependentsCount: 45000, starsCount: 11200 },
    dependencyCount: 1,
  }),

  createNode('accepts', '2.0.0', 85, {
    metadata: { name: 'accepts', version: '2.0.0', description: 'Higher-level content negotiation', license: 'MIT', repository: 'https://github.com/jshttp/accepts', weeklyDownloads: 35000000, lastPublish: '2025-03-01T00:00:00.000Z', createdAt: '2014-01-01T00:00:00.000Z', maintainers: [{ name: 'dougwilson', email: 'doug@somethingdoug.com' }], dependentsCount: 2000, starsCount: 240 },
    dependencyCount: 2,
  }),

  // ⚠️ RISKY: body-parser - stale maintainer
  createNode('body-parser', '1.20.3', 52, {
    riskLevel: 'medium',
    healthGrade: 'D',
    metadata: { name: 'body-parser', version: '1.20.3', description: 'Node.js body parsing middleware', license: 'MIT', repository: 'https://github.com/expressjs/body-parser', weeklyDownloads: 28000000, lastPublish: '2024-07-01T00:00:00.000Z', createdAt: '2014-01-01T00:00:00.000Z', maintainers: [{ name: 'dougwilson', email: 'doug@somethingdoug.com' }], dependentsCount: 12000, starsCount: 5500 },
    maintainerHealth: {
      score: 48,
      lastCommitDaysAgo: 240,
      commitFrequency: 0.3,
      issueResponseTimeDays: 45,
      busFactor: 1,
      activeMaintainers: 0,
      totalMaintainers: 1,
      signals: ['Solo maintainer', 'No commits in 8 months', 'Issues not being triaged'],
    },
    alerts: [
      {
        id: 'bp-bus-1',
        type: 'bus_factor',
        severity: 'high',
        title: 'Bus factor of 1 — single maintainer',
        description: 'body-parser has only 1 maintainer (dougwilson) who has not committed in 240 days. If this maintainer becomes unavailable, the package will be unmaintained.',
        packageName: 'body-parser',
        evidence: '1 maintainer, 0 active contributors, last commit 240 days ago.',
        recommendation: 'Express 5.0 includes body parsing natively. Consider migrating when available.',
      },
      {
        id: 'bp-stale-1',
        type: 'stale_package',
        severity: 'medium',
        title: 'Package appears stale',
        description: 'No releases in over 8 months. 47 open issues with no recent responses.',
        packageName: 'body-parser',
        evidence: 'Last publish: Jul 2024. 47 open issues. 0.3 commits/month.',
      },
    ],
    dependencyCount: 7,
  }),

  // 🔴 CRITICAL: qs - suspicious maintainer change
  createNode('qs', '6.13.1', 28, {
    riskLevel: 'critical',
    healthGrade: 'F',
    metadata: { name: 'qs', version: '6.13.1', description: 'A querystring parsing and stringifying library', license: 'BSD-3-Clause', repository: 'https://github.com/ljharb/qs', weeklyDownloads: 72000000, lastPublish: '2026-01-15T00:00:00.000Z', createdAt: '2012-01-01T00:00:00.000Z', maintainers: [{ name: 'ljharb', email: 'ljharb@gmail.com' }, { name: 'unkown-contrib-42', email: 'temp42@proton.me' }], dependentsCount: 18000, starsCount: 8500 },
    maintainerHealth: {
      score: 65,
      lastCommitDaysAgo: 40,
      commitFrequency: 2.1,
      issueResponseTimeDays: 8,
      busFactor: 1,
      activeMaintainers: 1,
      totalMaintainers: 2,
      signals: ['New unknown maintainer added recently'],
    },
    takeoverRisk: {
      score: 82,
      newMaintainerAdded: true,
      maintainerRemoved: false,
      publisherChanged: false,
      repositoryUrlChanged: false,
      suspiciousMaintainers: [{
        name: 'unkown-contrib-42',
        email: 'temp42@proton.me',
        npmPackageCount: 1,
        npmAccountAge: 28,
        isNewMaintainer: true,
      }],
      signals: [
        'New maintainer "unkown-contrib-42" added 28 days ago',
        'New maintainer has only 1 npm package',
        'New maintainer account is only 28 days old',
        'Uses privacy-focused email (proton.me)',
        'Pattern similar to xz-utils supply chain attack',
      ],
    },
    alerts: [
      {
        id: 'qs-takeover-1',
        type: 'takeover_risk',
        severity: 'critical',
        title: 'Suspicious maintainer change detected',
        description: 'A new maintainer "unkown-contrib-42" was added to qs 28 days ago. This account is only 28 days old, has 1 npm package, and uses a privacy-focused email. This pattern is similar to the xz-utils supply chain attack.',
        packageName: 'qs',
        evidence: 'New maintainer: unkown-contrib-42, account age: 28 days, packages: 1, email: temp42@proton.me',
        recommendation: 'URGENT: Audit recent versions of qs for malicious code. Consider pinning to version 6.12.x until investigation is complete.',
      },
    ],
    dependencyCount: 0,
  }),

  // 🟡 WARNING: cookie - license mutation
  createNode('cookie', '0.7.2', 61, {
    riskLevel: 'medium',
    healthGrade: 'C',
    metadata: { name: 'cookie', version: '0.7.2', description: 'HTTP server cookie parsing and serialization', license: 'MIT', repository: 'https://github.com/jshttp/cookie', weeklyDownloads: 40000000, lastPublish: '2025-10-01T00:00:00.000Z', createdAt: '2012-06-01T00:00:00.000Z', maintainers: [{ name: 'dougwilson', email: 'doug@somethingdoug.com' }], dependentsCount: 3000, starsCount: 1200 },
    licenseMutation: {
      score: 40,
      currentLicense: 'MIT',
      previousLicenses: [
        { version: '0.5.0', license: 'MIT' },
        { version: '0.6.0', license: 'BSD-2-Clause' },
        { version: '0.7.0', license: 'MIT' },
      ],
      hasChanged: true,
      isRestrictive: false,
      signals: ['License changed between versions', 'Changed from MIT to BSD-2-Clause and back'],
    },
    maintainerHealth: {
      score: 55,
      lastCommitDaysAgo: 145,
      commitFrequency: 0.8,
      issueResponseTimeDays: 30,
      busFactor: 1,
      activeMaintainers: 1,
      totalMaintainers: 1,
      signals: ['Solo maintainer', 'Declining commit frequency'],
    },
    alerts: [
      {
        id: 'cookie-license-1',
        type: 'license_change',
        severity: 'medium',
        title: 'License mutation detected',
        description: 'The "cookie" package changed its license from MIT to BSD-2-Clause in v0.6.0, then back to MIT in v0.7.0. License instability may indicate governance issues.',
        packageName: 'cookie',
        evidence: 'v0.5.0: MIT → v0.6.0: BSD-2-Clause → v0.7.0: MIT',
      },
      {
        id: 'cookie-bus-1',
        type: 'single_maintainer',
        severity: 'medium',
        title: 'Single maintainer risk',
        description: 'Package has only 1 maintainer with declining activity.',
        packageName: 'cookie',
        evidence: '1 maintainer, 0.8 commits/month, 145 days since last commit.',
      },
    ],
    dependencyCount: 0,
  }),

  // Healthy transitive deps
  createNode('ms', '2.1.3', 94, {
    isDirectDependency: false,
    metadata: { name: 'ms', version: '2.1.3', description: 'Tiny ms conversion utility', license: 'MIT', repository: 'https://github.com/vercel/ms', weeklyDownloads: 200000000, lastPublish: '2024-01-01T00:00:00.000Z', createdAt: '2012-01-01T00:00:00.000Z', maintainers: [{ name: 'rauchg', email: 'rauchg@gmail.com' }], dependentsCount: 15000, starsCount: 5000 },
    dependencyCount: 0,
  }),

  createNode('mime-types', '2.1.35', 87, {
    isDirectDependency: false,
    metadata: { name: 'mime-types', version: '2.1.35', description: 'The ultimate javascript content-type utility', license: 'MIT', repository: 'https://github.com/jshttp/mime-types', weeklyDownloads: 45000000, lastPublish: '2025-06-01T00:00:00.000Z', createdAt: '2014-01-01T00:00:00.000Z', maintainers: [{ name: 'dougwilson', email: 'doug@somethingdoug.com' }], dependentsCount: 4500, starsCount: 1100 },
    dependencyCount: 1,
  }),

  createNode('safe-buffer', '5.2.1', 78, {
    isDirectDependency: false,
    metadata: { name: 'safe-buffer', version: '5.2.1', description: 'Safer Node.js Buffer API', license: 'MIT', repository: 'https://github.com/feross/safe-buffer', weeklyDownloads: 85000000, lastPublish: '2021-04-01T00:00:00.000Z', createdAt: '2016-06-01T00:00:00.000Z', maintainers: [{ name: 'feross', email: 'feross@feross.org' }], dependentsCount: 3600, starsCount: 340 },
    maintainerHealth: {
      score: 70,
      lastCommitDaysAgo: 1790,
      commitFrequency: 0,
      issueResponseTimeDays: 999,
      busFactor: 1,
      activeMaintainers: 0,
      totalMaintainers: 1,
      signals: ['Package appears complete/stable — no recent changes expected'],
    },
    dependencyCount: 0,
  }),

  createNode('on-finished', '2.4.1', 88, {
    isDirectDependency: false,
    metadata: { name: 'on-finished', version: '2.4.1', description: 'Execute a callback when a request closes, finishes, or errors', license: 'MIT', repository: 'https://github.com/jshttp/on-finished', weeklyDownloads: 35000000, lastPublish: '2024-05-01T00:00:00.000Z', createdAt: '2014-01-01T00:00:00.000Z', maintainers: [{ name: 'dougwilson', email: 'doug@somethingdoug.com' }], dependentsCount: 1500, starsCount: 310 },
    dependencyCount: 1,
  }),

  createNode('content-type', '1.0.5', 83, {
    isDirectDependency: false,
    metadata: { name: 'content-type', version: '1.0.5', description: 'Create and parse HTTP Content-Type header', license: 'MIT', repository: 'https://github.com/jshttp/content-type', weeklyDownloads: 38000000, lastPublish: '2023-01-01T00:00:00.000Z', createdAt: '2015-01-01T00:00:00.000Z', maintainers: [{ name: 'dougwilson', email: 'doug@somethingdoug.com' }], dependentsCount: 2100, starsCount: 210 },
    dependencyCount: 0,
  }),

  createNode('etag', '1.8.1', 80, {
    isDirectDependency: false,
    metadata: { name: 'etag', version: '1.8.1', description: 'Create simple HTTP ETags', license: 'MIT', repository: 'https://github.com/jshttp/etag', weeklyDownloads: 34000000, lastPublish: '2022-01-01T00:00:00.000Z', createdAt: '2014-01-01T00:00:00.000Z', maintainers: [{ name: 'dougwilson', email: 'doug@somethingdoug.com' }], dependentsCount: 900, starsCount: 240 },
    dependencyCount: 0,
  }),

  // 🟡 WARNING: slopsquatting suspect
  createNode('expresss-validator', '0.1.0', 18, {
    riskLevel: 'critical',
    healthGrade: 'F',
    isDirectDependency: true,
    metadata: { name: 'expresss-validator', version: '0.1.0', description: 'Express middleware for input validation', license: 'MIT', weeklyDownloads: 47, lastPublish: '2026-02-01T00:00:00.000Z', createdAt: '2026-01-15T00:00:00.000Z', maintainers: [{ name: 'ai-pkgs-bot', email: 'aibot@disposable.email' }], dependentsCount: 0, starsCount: 0 },
    maintainerHealth: {
      score: 10,
      lastCommitDaysAgo: 0,
      commitFrequency: 0,
      issueResponseTimeDays: 999,
      busFactor: 0,
      activeMaintainers: 0,
      totalMaintainers: 1,
      signals: ['Brand new package', 'No repository linked', 'Unknown maintainer'],
    },
    slopsquatting: {
      score: 95,
      isSuspected: true,
      similarPackages: [
        { name: 'express-validator', distance: 1, downloads: 2800000 },
        { name: 'express-validators', distance: 2, downloads: 5200 },
      ],
      packageAge: 40,
      weeklyDownloads: 47,
      hasRepository: false,
      singleVersion: true,
      signals: [
        'Package name is 1 character away from popular "express-validator" (2.8M weekly downloads)',
        'Package is only 40 days old',
        'Only 47 weekly downloads',
        'No linked repository',
        'Single version published (0.1.0)',
        'Maintainer "ai-pkgs-bot" has no other packages',
        'Likely AI-hallucinated package name registered by malicious actor',
      ],
    },
    alerts: [
      {
        id: 'slop-1',
        type: 'slopsquatting',
        severity: 'critical',
        title: 'Suspected AI-hallucinated package (slopsquatting)',
        description: '"expresss-validator" (note the triple-s) is 1 character away from the popular "express-validator" package (2.8M weekly downloads). This package is only 40 days old, has 47 downloads, no repository, and a single version. This is a strong indicator of a slopsquatting attack — a package name hallucinated by AI and then registered by a malicious actor.',
        packageName: 'expresss-validator',
        evidence: 'Levenshtein distance: 1 from "express-validator". Age: 40 days. Downloads: 47/week. Versions: 1. Repository: none.',
        recommendation: 'REMOVE IMMEDIATELY. Replace with the legitimate "express-validator" package.',
      },
    ],
    dependencyCount: 0,
  }),
];

// Build alerts list from all deps
const expressAlerts: RiskAlert[] = expressDeps.flatMap(dep => dep.alerts);

// Build graph data
const expressGraphData: GraphData = {
  nodes: [
    // Root node
    { id: 'express-app', name: 'your-app', healthScore: 100, healthGrade: 'A', riskLevel: 'info', alertCount: 0, isDirectDependency: true, weeklyDownloads: 0, val: 20, color: '#6366F1' },
    // Dependency nodes
    ...expressDeps.map(dep => ({
      id: dep.name,
      name: dep.name,
      healthScore: dep.healthScore,
      healthGrade: dep.healthGrade,
      riskLevel: dep.riskLevel,
      alertCount: dep.alerts.length,
      isDirectDependency: dep.isDirectDependency,
      weeklyDownloads: dep.metadata.weeklyDownloads,
      val: Math.max(5, Math.min(18, Math.log10(dep.metadata.weeklyDownloads + 1) * 2.5)),
      color: dep.riskLevel === 'critical' ? '#EF4444' : dep.riskLevel === 'high' ? '#F97316' : dep.riskLevel === 'medium' ? '#FACC15' : dep.riskLevel === 'low' ? '#22D3EE' : '#10B981',
    })),
  ],
  links: [
    // Direct deps link to root
    ...expressDeps.filter(d => d.isDirectDependency).map(dep => ({ source: 'express-app', target: dep.name })),
    // Some transitive links
    { source: 'express', target: 'debug' },
    { source: 'express', target: 'accepts' },
    { source: 'express', target: 'body-parser' },
    { source: 'express', target: 'qs' },
    { source: 'express', target: 'cookie' },
    { source: 'express', target: 'on-finished' },
    { source: 'express', target: 'content-type' },
    { source: 'express', target: 'etag' },
    { source: 'debug', target: 'ms' },
    { source: 'accepts', target: 'mime-types' },
    { source: 'body-parser', target: 'safe-buffer' },
  ],
};

// Weekly digest mock
const expressWeeklyDigest: WeeklyDigestEntry[] = [
  { weekLabel: 'Feb 3 - Feb 9', overallScore: 68, scoreChange: 0, newAlerts: 0, resolvedAlerts: 0, highlights: ['Baseline scan completed'] },
  { weekLabel: 'Feb 10 - Feb 16', overallScore: 64, scoreChange: -4, newAlerts: 1, resolvedAlerts: 0, highlights: ['New maintainer detected on qs package'] },
  { weekLabel: 'Feb 17 - Feb 23', overallScore: 58, scoreChange: -6, newAlerts: 2, resolvedAlerts: 0, highlights: ['Slopsquatting alert: expresss-validator', 'body-parser maintainer inactive 240 days'] },
  { weekLabel: 'Feb 24 - Mar 2', overallScore: 55, scoreChange: -3, newAlerts: 1, resolvedAlerts: 0, highlights: ['cookie license mutation detected', 'Overall health declining'] },
];

// ─── Complete Express Scan Result ─────────────────────────

export const EXPRESS_MOCK_RESULT: ScanResult = {
  repoName: 'my-express-app',
  scannedAt: new Date().toISOString(),
  overallGrade: 'D',
  overallScore: 55,
  totalDependencies: expressDeps.length,
  directDependencies: expressDeps.filter(d => d.isDirectDependency).length,
  criticalAlerts: expressAlerts.filter(a => a.severity === 'critical').length,
  highAlerts: expressAlerts.filter(a => a.severity === 'high').length,
  mediumAlerts: expressAlerts.filter(a => a.severity === 'medium').length,
  lowAlerts: expressAlerts.filter(a => a.severity === 'low').length,
  busFActorWarnings: expressDeps.filter(d => d.maintainerHealth.busFactor <= 1).length,
  dependencies: expressDeps,
  alerts: expressAlerts.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
    return order[a.severity] - order[b.severity];
  }),
  graphData: expressGraphData,
  weeklyDigest: expressWeeklyDigest,
};

// ─── Quick Demo Package JSON ──────────────────────────────

export const DEMO_PACKAGE_JSON = JSON.stringify({
  name: 'my-express-app',
  version: '1.0.0',
  dependencies: {
    'express': '^4.21.2',
    'body-parser': '^1.20.3',
    'debug': '^4.4.0',
    'qs': '^6.13.1',
    'cookie': '^0.7.2',
    'accepts': '^2.0.0',
    'expresss-validator': '^0.1.0',
  },
}, null, 2);

// ─── Map of all mock results by repo name ─────────────────

export const MOCK_RESULTS: Record<string, ScanResult> = {
  'express': EXPRESS_MOCK_RESULT,
  'my-express-app': EXPRESS_MOCK_RESULT,
  'demo': EXPRESS_MOCK_RESULT,
};
