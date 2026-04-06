#!/usr/bin/env node
/**
 * Scan for unsafe `any`, `as any`, `@ts-ignore`, `@ts-expect-error` usage
 * in critical project files.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const CRITICAL_DIRS = ['src/hooks', 'src/contexts', 'src/pages/admin', 'supabase/functions'];
const PATTERNS = [
  { regex: /:\s*any\b/g, label: ': any' },
  { regex: /as\s+any\b/g, label: 'as any' },
  { regex: /@ts-ignore/g, label: '@ts-ignore' },
  { regex: /@ts-expect-error/g, label: '@ts-expect-error' },
];
const EXCLUDE = ['types.ts', 'node_modules', '.d.ts'];

function walk(dir) {
  let results = [];
  try {
    for (const f of readdirSync(dir)) {
      const full = join(dir, f);
      if (EXCLUDE.some(e => full.includes(e))) continue;
      const s = statSync(full);
      if (s.isDirectory()) results.push(...walk(full));
      else if (/\.(ts|tsx)$/.test(f)) results.push(full);
    }
  } catch {}
  return results;
}

const findings = [];
let totalCount = 0;

for (const dir of CRITICAL_DIRS) {
  for (const file of walk(dir)) {
    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    for (const pat of PATTERNS) {
      lines.forEach((line, i) => {
        const matches = line.match(pat.regex);
        if (matches) {
          matches.forEach(() => {
            totalCount++;
            findings.push({
              file: relative('.', file),
              line: i + 1,
              pattern: pat.label,
              code: line.trim().substring(0, 120),
              severity: pat.label.includes('ignore') ? 'high' : 'medium',
            });
          });
        }
      });
    }
  }
}

console.log(JSON.stringify({ total: totalCount, findings }, null, 2));

if (findings.some(f => f.severity === 'high')) {
  console.error(`\n❌ FAIL: ${findings.filter(f => f.severity === 'high').length} high-severity unsafe type suppressions found.`);
  process.exit(1);
}

if (totalCount > 0) {
  console.warn(`\n⚠️  WARN: ${totalCount} unsafe type usages found in critical files.`);
}
