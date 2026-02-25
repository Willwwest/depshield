// ============================================================
// DepShield — Scoring Constants & Configuration
// ============================================================

import type { HealthGrade, RiskLevel } from './types';

// --- Health Grade Thresholds ---

export const GRADE_THRESHOLDS: Record<HealthGrade, { min: number; max: number }> = {
  A: { min: 90, max: 100 },
  B: { min: 75, max: 89 },
  C: { min: 60, max: 74 },
  D: { min: 40, max: 59 },
  F: { min: 0, max: 39 },
};

export function scoreToGrade(score: number): HealthGrade {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

// --- Health Score Dimension Weights ---

export const DIMENSION_WEIGHTS = {
  maintainerHealth: 0.30,
  securitySignals: 0.25,
  communityHealth: 0.25,
  freshness: 0.20,
} as const;

// --- Maintainer Health Scoring ---

export const MAINTAINER_THRESHOLDS = {
  /** Days since last commit considered "active" */
  activeDays: 90,
  /** Days since last commit considered "stale" */
  staleDays: 365,
  /** Days since last commit considered "abandoned" */
  abandonedDays: 730,
  /** Minimum commits per month for "healthy" */
  healthyCommitRate: 2,
  /** Maximum issue response time (days) considered "good" */
  goodResponseDays: 7,
  /** Bus factor of 1 = critical risk */
  criticalBusFactor: 1,
  /** Bus factor of 2 = warning */
  warningBusFactor: 2,
} as const;

// --- Takeover Risk Scoring ---

export const TAKEOVER_THRESHOLDS = {
  /** Days for a maintainer to be considered "new" */
  newMaintainerDays: 90,
  /** Minimum packages for a maintainer to be "established" */
  establishedPackageCount: 5,
  /** Minimum npm account age (days) for trust */
  trustedAccountAgeDays: 365,
} as const;

// --- Slopsquatting Detection ---

export const SLOPSQUATTING_THRESHOLDS = {
  /** Package age below this (days) is suspicious */
  suspiciousAgeDays: 90,
  /** Weekly downloads below this is suspicious */
  suspiciousDownloads: 500,
  /** Max Levenshtein distance from popular package to flag */
  maxLevenshteinDistance: 2,
  /** Minimum downloads for a package to be considered "popular" (for comparison) */
  popularPackageDownloads: 100000,
} as const;

// --- License Risk Classification ---

export const RESTRICTIVE_LICENSES = [
  'GPL-2.0',
  'GPL-3.0',
  'AGPL-3.0',
  'SSPL-1.0',
  'BSL-1.1',
  'EUPL-1.2',
  'CPAL-1.0',
  'OSL-3.0',
] as const;

export const PERMISSIVE_LICENSES = [
  'MIT',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  'Unlicense',
  '0BSD',
  'CC0-1.0',
] as const;

// --- Risk Level Colors (for graph/UI) ---

export const RISK_COLORS: Record<RiskLevel, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#FACC15',
  low: '#22D3EE',
  info: '#10B981',
};

export const GRADE_COLORS: Record<HealthGrade, string> = {
  A: '#10B981',
  B: '#22D3EE',
  C: '#FACC15',
  D: '#F97316',
  F: '#EF4444',
};

// --- Risk Level from Score ---

export function scoreToRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'info';
  if (score >= 65) return 'low';
  if (score >= 45) return 'medium';
  if (score >= 25) return 'high';
  return 'critical';
}

// --- Top 100 Popular npm Packages (for slopsquatting comparison) ---

export const POPULAR_PACKAGES = [
  'lodash', 'chalk', 'react', 'express', 'debug', 'moment', 'commander',
  'axios', 'glob', 'semver', 'uuid', 'minimist', 'yargs', 'mkdirp',
  'rimraf', 'async', 'bluebird', 'underscore', 'request', 'webpack',
  'typescript', 'eslint', 'prettier', 'babel', 'jest', 'mocha', 'chai',
  'next', 'vue', 'angular', 'svelte', 'jquery', 'bootstrap', 'tailwindcss',
  'dotenv', 'cors', 'helmet', 'mongoose', 'sequelize', 'prisma',
  'graphql', 'apollo', 'socket.io', 'redis', 'pg', 'mysql2',
  'sharp', 'jimp', 'puppeteer', 'playwright', 'cheerio',
  'zod', 'yup', 'joi', 'ajv', 'date-fns', 'dayjs', 'luxon',
  'inquirer', 'ora', 'boxen', 'nanoid', 'cuid', 'ulid',
  'pino', 'winston', 'bunyan', 'morgan', 'node-fetch', 'got',
  'fastify', 'koa', 'hapi', 'restify', 'nest', 'strapi',
  'three', 'd3', 'chart.js', 'recharts', 'echarts',
  'framer-motion', 'gsap', 'anime', 'lottie-web',
  'nodemailer', 'stripe', 'aws-sdk', 'firebase',
  'bcrypt', 'jsonwebtoken', 'passport', 'argon2',
  'ramda', 'rxjs', 'immer', 'mobx', 'zustand', 'jotai', 'recoil',
  'sass', 'less', 'postcss', 'autoprefixer', 'cssnano',
  'webpack', 'rollup', 'vite', 'esbuild', 'parcel', 'turbopack',
] as const;

// --- Scan Steps ---

export const SCAN_STEPS = [
  { id: 'parse', label: 'Parsing Dependencies', description: 'Reading package.json and extracting dependency tree' },
  { id: 'metadata', label: 'Fetching Metadata', description: 'Retrieving package information from npm registry' },
  { id: 'maintainers', label: 'Analyzing Maintainers', description: 'Evaluating maintainer health and bus factor' },
  { id: 'takeover', label: 'Detecting Takeovers', description: 'Checking for suspicious maintainer changes' },
  { id: 'slopsquat', label: 'Scanning for Slopsquatting', description: 'Identifying potentially AI-hallucinated packages' },
  { id: 'license', label: 'Checking Licenses', description: 'Tracking license mutations and compatibility' },
  { id: 'report', label: 'Generating Report', description: 'Computing health scores and building dependency graph' },
] as const;

// --- API Configuration ---

export const API_CONFIG = {
  npmRegistryUrl: 'https://registry.npmjs.org',
  npmDownloadsUrl: 'https://api.npmjs.org/downloads/point/last-week',
  githubApiUrl: 'https://api.github.com',
  /** Max concurrent API requests */
  maxConcurrency: 5,
  /** Cache TTL in milliseconds (1 hour) */
  cacheTtl: 3600000,
  /** Request timeout in milliseconds */
  requestTimeout: 10000,
} as const;
