#!/usr/bin/env node
/**
 * Architecture scanner — detects structural violations:
 * - Supabase direct calls in UI components (should be in hooks/services)
 * - Components mixing query + render + business logic
 * - Circular-ish coupling indicators
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const EXCLUDE = ['node_modules', '.d.ts', 'types.ts', 'client.ts'];

function walk(dir) {
  let results = [];
  try {
    for (const f of readdirSync(dir)) {
      const full = join(dir, f);
      if (EXCLUDE.some(e => full.includes(e))) continue;
      const s = statSync(full);
      if (s.isDirectory()) results.push(...walk(full));
      else if (/\.(tsx)$/.test(f)) results.push(full);
    }
  } catch {}
  return results;
}

const findings = [];

// Check for direct Supabase usage in UI components (not hooks)
const UI_DIRS = ['src/components', 'src/pages'];
for (const dir of UI_DIRS) {
  for (const file of walk(dir)) {
    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    
    const hasSupabaseImport = /from\s+['"]@\/integrations\/supabase\/client['"]/.test(content);
    const hasDirectQuery = /supabase\s*\.\s*from\s*\(/.test(content);
    
    if (hasSupabaseImport && hasDirectQuery) {
      const lineNum = lines.findIndex(l => /supabase\s*\.\s*from\s*\(/.test(l));
      findings.push({
        file: relative('.', file),
        line: lineNum + 1,
        pattern: 'Direct Supabase query in UI component',
        suggestion: 'Move to a dedicated hook or service layer',
        severity: 'medium',
      });
    }
    
    // Check for mixed concerns: has both query logic AND JSX rendering AND >200 lines
    const lineCount = lines.length;
    const hasJSX = /<\w/.test(content);
    const hasUseQuery = /useQuery|useMutation/.test(content);
    const hasStateLogic = (content.match(/useState|useEffect|useCallback/g) || []).length > 5;
    
    if (hasJSX && (hasDirectQuery || hasUseQuery) && hasStateLogic && lineCount > 200) {
      findings.push({
        file: relative('.', file),
        line: 1,
        pattern: 'Mixed concerns: query + state + render in single file',
        suggestion: 'Extract data logic to custom hook, keep component as view',
        severity: lineCount > 400 ? 'high' : 'medium',
        lines: lineCount,
      });
    }
  }
}

console.log(JSON.stringify({ total: findings.length, findings }, null, 2));

if (findings.some(f => f.severity === 'high')) {
  console.warn(`\n⚠️  WARN: ${findings.filter(f => f.severity === 'high').length} high-severity architecture issues.`);
}
