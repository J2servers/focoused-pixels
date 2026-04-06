#!/usr/bin/env node
/**
 * Scan for files exceeding line count thresholds.
 * Pages: 350, Hooks: 180, Edge Functions: 250, Components: 220
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const LIMITS = [
  { dir: 'src/pages', limit: 350, label: 'Page' },
  { dir: 'src/hooks', limit: 180, label: 'Hook' },
  { dir: 'src/components', limit: 220, label: 'Component' },
  { dir: 'supabase/functions', limit: 250, label: 'Edge Function' },
];
const EXCLUDE = ['node_modules', '.d.ts', 'types.ts', 'index.ts'];

function walk(dir) {
  let results = [];
  try {
    for (const f of readdirSync(dir)) {
      const full = join(dir, f);
      if (EXCLUDE.some(e => f === e || full.includes('node_modules'))) continue;
      const s = statSync(full);
      if (s.isDirectory()) results.push(...walk(full));
      else if (/\.(ts|tsx)$/.test(f)) results.push(full);
    }
  } catch {}
  return results;
}

const violations = [];

for (const { dir, limit, label } of LIMITS) {
  for (const file of walk(dir)) {
    const lines = readFileSync(file, 'utf-8').split('\n').length;
    if (lines > limit) {
      violations.push({
        file: relative('.', file),
        lines,
        limit,
        label,
        excess: lines - limit,
        severity: lines > limit * 2 ? 'critical' : lines > limit * 1.5 ? 'high' : 'medium',
      });
    }
  }
}

violations.sort((a, b) => b.lines - a.lines);

console.log(JSON.stringify({ total: violations.length, violations }, null, 2));

if (violations.some(v => v.severity === 'critical')) {
  console.error(`\n❌ FAIL: ${violations.filter(v => v.severity === 'critical').length} files exceed 2x line limit.`);
  process.exit(1);
}

if (violations.length > 0) {
  console.warn(`\n⚠️  WARN: ${violations.length} files exceed recommended limits.`);
}
