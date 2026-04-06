#!/usr/bin/env node
/**
 * Scan Supabase migration files for weak RLS policies.
 * Detects: USING(true), WITH CHECK(true), auth.uid() IS NOT NULL on sensitive tables.
 */
import { readFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';

const MIGRATIONS_DIR = 'supabase/migrations';
const SENSITIVE_TABLES = [
  'user_roles', 'profiles', 'orders', 'payment_credentials', 'email_credentials',
  'company_info', 'api_keys', 'audit_logs', 'automation_workflows',
  'workflow_executions', 'whatsapp_instances', 'whatsapp_messages',
  'cash_transactions', 'hostinger_email_credentials', 'company_tax_settings',
];

const WEAK_PATTERNS = [
  { regex: /USING\s*\(\s*true\s*\)/gi, label: 'USING(true) - unrestricted read' },
  { regex: /WITH\s+CHECK\s*\(\s*true\s*\)/gi, label: 'WITH CHECK(true) - unrestricted write' },
  { regex: /auth\.uid\(\)\s+IS\s+NOT\s+NULL/gi, label: 'auth.uid() IS NOT NULL - any authenticated user' },
];

const findings = [];

try {
  const files = readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();
  
  for (const file of files) {
    const fullPath = join(MIGRATIONS_DIR, file);
    const content = readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');
    
    for (const pat of WEAK_PATTERNS) {
      lines.forEach((line, i) => {
        if (pat.regex.test(line)) {
          pat.regex.lastIndex = 0;
          // Check if it's on a sensitive table
          const context = lines.slice(Math.max(0, i - 5), i + 1).join(' ');
          const isSensitive = SENSITIVE_TABLES.some(t => context.toLowerCase().includes(t));
          
          findings.push({
            file: relative('.', fullPath),
            line: i + 1,
            pattern: pat.label,
            code: line.trim().substring(0, 120),
            severity: isSensitive ? 'critical' : 'medium',
            sensibleTable: isSensitive,
          });
        }
      });
    }
  }
} catch (e) {
  console.warn('Could not read migrations directory:', e.message);
}

console.log(JSON.stringify({ total: findings.length, findings }, null, 2));

if (findings.some(f => f.severity === 'critical')) {
  console.error(`\n❌ FAIL: ${findings.filter(f => f.severity === 'critical').length} weak RLS policies on sensitive tables.`);
  process.exit(1);
}

if (findings.length > 0) {
  console.warn(`\n⚠️  WARN: ${findings.length} weak RLS patterns found in migrations.`);
} else {
  console.log('\n✅ PASS: No weak RLS patterns detected.');
}
