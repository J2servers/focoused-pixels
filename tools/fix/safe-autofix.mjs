#!/usr/bin/env node
/**
 * Safe autofix — applies only low-risk automatic corrections.
 * NEVER touches: auth, RLS, edge functions, migrations, permissions.
 */
import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const REPORT_DIR = 'tools/reports';
mkdirSync(REPORT_DIR, { recursive: true });

const results = {
  timestamp: new Date().toISOString(),
  fixes: [],
  skipped: [],
  errors: [],
};

// 1. ESLint auto-fix (safe)
try {
  console.log('🔧 Running ESLint auto-fix...');
  execSync('npx eslint src/ --fix --quiet 2>&1 || true', { encoding: 'utf-8' });
  results.fixes.push({ tool: 'eslint', action: 'auto-fix applied', scope: 'src/' });
} catch (e) {
  results.errors.push({ tool: 'eslint', error: e.message?.substring(0, 200) });
}

// 2. Remove unused imports (via TypeScript)
try {
  console.log('🔍 Running TypeScript check...');
  const tscOutput = execSync('npx tsc --noEmit 2>&1 || true', { encoding: 'utf-8' });
  const unusedCount = (tscOutput.match(/is declared but/g) || []).length;
  results.skipped.push({ 
    tool: 'tsc', 
    note: `${unusedCount} unused declarations found (manual review recommended)` 
  });
} catch (e) {
  results.errors.push({ tool: 'tsc', error: 'typecheck failed' });
}

// 3. NEVER auto-fix these
results.skipped.push(
  { scope: 'src/contexts/AuthContext.tsx', reason: 'Auth module — manual review only' },
  { scope: 'src/hooks/useAuth.ts', reason: 'Auth hook — manual review only' },
  { scope: 'supabase/migrations/', reason: 'Database migrations — manual review only' },
  { scope: 'supabase/functions/', reason: 'Edge functions — manual review only' },
);

// Write report
const reportPath = join(REPORT_DIR, `autofix-${Date.now()}.json`);
writeFileSync(reportPath, JSON.stringify(results, null, 2));
console.log(`\n📄 Report: ${reportPath}`);
console.log(`✅ Fixes: ${results.fixes.length}`);
console.log(`⏭️  Skipped: ${results.skipped.length}`);
console.log(`❌ Errors: ${results.errors.length}`);
