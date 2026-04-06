#!/usr/bin/env node
/**
 * Scan for secrets/credentials exposed in frontend code.
 * Detects API keys, tokens, secrets in code that reaches the browser.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const SCAN_DIRS = ['src'];
const EXCLUDE = ['node_modules', '.d.ts', 'types.ts'];

const SECRET_PATTERNS = [
  { regex: /(?:api[_-]?key|apiKey)\s*[:=]\s*['"`][^'"`]{8,}/gi, label: 'API key in code' },
  { regex: /(?:secret|client[_-]?secret|clientSecret)\s*[:=]\s*['"`][^'"`]{8,}/gi, label: 'Secret in code' },
  { regex: /(?:access[_-]?token|accessToken)\s*[:=]\s*['"`][^'"`]{8,}/gi, label: 'Access token in code' },
  { regex: /(?:bearer|authorization)\s*[:=]\s*['"`][^'"`]{8,}/gi, label: 'Bearer token in code' },
  { regex: /(?:password|passwd|pwd)\s*[:=]\s*['"`][^'"`]{4,}/gi, label: 'Password in code' },
  { regex: /(?:private[_-]?key|privateKey)\s*[:=]\s*['"`][^'"`]{8,}/gi, label: 'Private key in code' },
];

// Allow known safe patterns
const SAFE_PATTERNS = [
  /VITE_SUPABASE/,
  /supabaseKey|anonKey|publishable/i,
  /placeholder|example|your[_-]?key/i,
  /import\.meta\.env/,
  /process\.env/,
  /Deno\.env/,
];

function walk(dir) {
  let results = [];
  try {
    for (const f of readdirSync(dir)) {
      const full = join(dir, f);
      if (EXCLUDE.some(e => full.includes(e))) continue;
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
    for (const pat of SECRET_PATTERNS) {
      lines.forEach((line, i) => {
        if (pat.regex.test(line)) {
          pat.regex.lastIndex = 0;
          // Check if it's a safe pattern
          const isSafe = SAFE_PATTERNS.some(sp => sp.test(line));
          if (!isSafe) {
            findings.push({
              file: relative('.', file),
              line: i + 1,
              pattern: pat.label,
              code: line.trim().substring(0, 100),
              severity: 'critical',
            });
          }
        }
      });
    }
  }
}

console.log(JSON.stringify({ total: findings.length, findings }, null, 2));

if (findings.length > 0) {
  console.error(`\n❌ FAIL: ${findings.length} potential secrets found in frontend code.`);
  process.exit(1);
}

console.log('\n✅ PASS: No exposed secrets detected in frontend.');
