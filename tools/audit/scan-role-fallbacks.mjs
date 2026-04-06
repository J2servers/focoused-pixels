#!/usr/bin/env node
/**
 * Scan for dangerous role/permission fallback patterns.
 * Detects patterns like: `role || 'admin'`, `?? 'admin'`, default to elevated role.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const SCAN_DIRS = ['src'];
const DANGEROUS_PATTERNS = [
  { regex: /\|\|\s*['"`]admin['"`]/gi, label: 'fallback to admin role' },
  { regex: /\?\?\s*['"`]admin['"`]/gi, label: 'nullish coalescing to admin' },
  { regex: /default:\s*['"`]admin['"`]/gi, label: 'default admin role' },
  { regex: /role\s*=\s*['"`]admin['"`]/gi, label: 'hardcoded admin assignment' },
  { regex: /isAdmin\s*=\s*true/gi, label: 'hardcoded isAdmin=true' },
  { regex: /localStorage.*role/gi, label: 'role in localStorage' },
  { regex: /sessionStorage.*role/gi, label: 'role in sessionStorage' },
];

function walk(dir) {
  let results = [];
  try {
    for (const f of readdirSync(dir)) {
      const full = join(dir, f);
      if (full.includes('node_modules') || f.endsWith('.d.ts')) continue;
      const s = statSync(full);
      if (s.isDirectory()) results.push(...walk(full));
      else if (/\.(ts|tsx|js|jsx)$/.test(f)) results.push(full);
    }
  } catch {}
  return results;
}

const findings = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    for (const pat of DANGEROUS_PATTERNS) {
      lines.forEach((line, i) => {
        if (pat.regex.test(line)) {
          pat.regex.lastIndex = 0;
          findings.push({
            file: relative('.', file),
            line: i + 1,
            pattern: pat.label,
            code: line.trim().substring(0, 120),
            severity: 'critical',
          });
        }
      });
    }
  }
}

console.log(JSON.stringify({ total: findings.length, findings }, null, 2));

if (findings.length > 0) {
  console.error(`\n❌ FAIL: ${findings.length} dangerous role/permission fallbacks found.`);
  process.exit(1);
}

console.log('\n✅ PASS: No dangerous role fallbacks detected.');
