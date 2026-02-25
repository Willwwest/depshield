// ============================================================
// DepShield — Curated Package Alternatives Map
// ============================================================
// When a dependency is flagged as risky, suggest these alternatives.

import type { HealthGrade } from './types';

export interface AlternativePackage {
  name: string;
  description: string;
  weeklyDownloads: number;
  healthGrade: HealthGrade;
  effort: 'low' | 'medium' | 'high';
  reason: string;
}

export const ALTERNATIVES_MAP: Record<string, AlternativePackage[]> = {
  // --- Utility Libraries ---
  'lodash': [
    { name: 'es-toolkit', description: 'Modern, performant lodash alternative with tree-shaking', weeklyDownloads: 850000, healthGrade: 'A', effort: 'low', reason: 'Drop-in replacement for most lodash methods with better bundle size' },
    { name: 'radash', description: 'Functional utility library, zero dependencies', weeklyDownloads: 320000, healthGrade: 'A', effort: 'medium', reason: 'Modern API with TypeScript-first design' },
    { name: 'remeda', description: 'TypeScript-first utility library with lazy evaluation', weeklyDownloads: 180000, healthGrade: 'B', effort: 'medium', reason: 'Better TypeScript inference than lodash' },
  ],
  'underscore': [
    { name: 'lodash', description: 'Feature-rich utility library', weeklyDownloads: 45000000, healthGrade: 'B', effort: 'low', reason: 'Direct superset of underscore functionality' },
    { name: 'es-toolkit', description: 'Modern lodash alternative', weeklyDownloads: 850000, healthGrade: 'A', effort: 'medium', reason: 'Modern, tree-shakeable replacement' },
  ],
  'moment': [
    { name: 'date-fns', description: 'Modern date utility library with tree-shaking', weeklyDownloads: 22000000, healthGrade: 'A', effort: 'medium', reason: 'Modular design, much smaller bundle' },
    { name: 'dayjs', description: 'Tiny date library with Moment.js API', weeklyDownloads: 18000000, healthGrade: 'A', effort: 'low', reason: 'Nearly identical API to moment, 2KB vs 67KB' },
    { name: 'luxon', description: 'Modern date library by Moment team', weeklyDownloads: 8000000, healthGrade: 'A', effort: 'medium', reason: 'Built by Moment.js authors as its successor' },
  ],

  // --- HTTP Clients ---
  'request': [
    { name: 'axios', description: 'Promise-based HTTP client', weeklyDownloads: 48000000, healthGrade: 'B', effort: 'medium', reason: 'request is deprecated; axios is the most popular alternative' },
    { name: 'got', description: 'Human-friendly HTTP request library', weeklyDownloads: 12000000, healthGrade: 'A', effort: 'medium', reason: 'Modern, stream-based, TypeScript support' },
    { name: 'ky', description: 'Tiny HTTP client based on Fetch API', weeklyDownloads: 3000000, healthGrade: 'A', effort: 'medium', reason: 'Tiny bundle, modern Fetch-based API' },
  ],
  'node-fetch': [
    { name: 'undici', description: 'HTTP/1.1 client built for Node.js', weeklyDownloads: 35000000, healthGrade: 'A', effort: 'low', reason: 'Ships with Node.js 18+; no external dependency needed' },
  ],

  // --- Validation ---
  'joi': [
    { name: 'zod', description: 'TypeScript-first schema validation', weeklyDownloads: 14000000, healthGrade: 'A', effort: 'medium', reason: 'Better TypeScript integration, smaller bundle' },
    { name: 'valibot', description: 'Modular schema validation library', weeklyDownloads: 1200000, healthGrade: 'A', effort: 'medium', reason: 'Tree-shakeable, much smaller than Zod' },
  ],
  'yup': [
    { name: 'zod', description: 'TypeScript-first schema validation', weeklyDownloads: 14000000, healthGrade: 'A', effort: 'low', reason: 'Similar API, better TypeScript support' },
  ],

  // --- Logging ---
  'bunyan': [
    { name: 'pino', description: 'Very low overhead Node.js logger', weeklyDownloads: 7000000, healthGrade: 'A', effort: 'medium', reason: 'Much faster, actively maintained' },
  ],
  'winston': [
    { name: 'pino', description: 'Very low overhead Node.js logger', weeklyDownloads: 7000000, healthGrade: 'A', effort: 'medium', reason: '5x faster in benchmarks' },
  ],

  // --- CLI ---
  'commander': [
    { name: 'citty', description: 'Elegant CLI builder by unjs', weeklyDownloads: 2000000, healthGrade: 'A', effort: 'medium', reason: 'Modern, TypeScript-first, smaller footprint' },
  ],
  'minimist': [
    { name: 'mri', description: 'Minimist replacement, 2x faster', weeklyDownloads: 5000000, healthGrade: 'B', effort: 'low', reason: 'API-compatible, faster parsing' },
  ],

  // --- ORM ---
  'mongoose': [
    { name: 'prisma', description: 'Next-generation ORM with type safety', weeklyDownloads: 3500000, healthGrade: 'A', effort: 'high', reason: 'Auto-generated types, migration system, better DX' },
  ],
  'sequelize': [
    { name: 'prisma', description: 'Next-generation ORM with type safety', weeklyDownloads: 3500000, healthGrade: 'A', effort: 'high', reason: 'Modern, type-safe, better developer experience' },
    { name: 'drizzle-orm', description: 'Lightweight TypeScript ORM', weeklyDownloads: 1200000, healthGrade: 'A', effort: 'high', reason: 'SQL-like API, excellent TypeScript support' },
  ],

  // --- Testing ---
  'mocha': [
    { name: 'vitest', description: 'Vite-native testing framework', weeklyDownloads: 8000000, healthGrade: 'A', effort: 'medium', reason: 'Faster, ESM-first, Jest-compatible API' },
  ],
  'chai': [
    { name: 'vitest', description: 'Vite-native test framework with built-in assertions', weeklyDownloads: 8000000, healthGrade: 'A', effort: 'medium', reason: 'Includes assertion library, no separate dep needed' },
  ],

  // --- Async ---
  'bluebird': [
    { name: 'native-promises', description: 'Use native Promises (built into Node.js)', weeklyDownloads: 0, healthGrade: 'A', effort: 'low', reason: 'Native Promises are now fast enough; no library needed' },
  ],

  // --- UUID ---
  'uuid': [
    { name: 'nanoid', description: 'Tiny, secure URL-friendly unique string ID generator', weeklyDownloads: 25000000, healthGrade: 'A', effort: 'low', reason: 'Smaller, faster, URL-safe by default' },
  ],

  // --- CSS ---
  'node-sass': [
    { name: 'sass', description: 'Official Dart Sass implementation', weeklyDownloads: 12000000, healthGrade: 'A', effort: 'low', reason: 'node-sass is deprecated; sass is the official replacement' },
  ],
};
