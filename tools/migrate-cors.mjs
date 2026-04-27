#!/usr/bin/env node
// Migrates edge functions to use shared CORS helper.
import fs from 'node:fs';
import path from 'node:path';

const FUNCS = [
  'abandoned-cart-insights','admin-gate-check','admin-reset-password','boleto-reminder-cron',
  'calculate-freight','execute-workflow','notify-customer','payment-efi','payment-mercadopago',
  'payment-stripe','recover-abandoned-carts','send-email','track-correios',
  'trigger-abandoned-cart-recovery','upsert-abandoned-cart','whatsapp-evolution'
];

const IMPORT_LINE = `import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";\n`;

for (const fn of FUNCS) {
  const file = path.resolve('supabase/functions', fn, 'index.ts');
  let src = fs.readFileSync(file, 'utf8');
  const original = src;

  // 1. Remove the local `const corsHeaders = { ... };` declaration (handles single or multi-line)
  src = src.replace(/const\s+corsHeaders\s*=\s*\{[\s\S]*?\};\s*\n/, '');

  // 2. Inject import after the last top-of-file import block (or at very top if no imports)
  if (!src.includes('_shared/cors.ts')) {
    const importMatches = [...src.matchAll(/^import .*?;\s*$/gm)];
    if (importMatches.length > 0) {
      const lastImport = importMatches[importMatches.length - 1];
      const insertPos = lastImport.index + lastImport[0].length;
      src = src.slice(0, insertPos) + '\n' + IMPORT_LINE + src.slice(insertPos);
    } else {
      src = IMPORT_LINE + src;
    }
  }

  // 3. Replace the OPTIONS preflight block with helper calls.
  // Pattern variants: `if (req.method === "OPTIONS") { return new Response(...corsHeaders... ); }`
  src = src.replace(
    /if\s*\(\s*req\.method\s*===\s*['"]OPTIONS['"]\s*\)\s*\{\s*return\s+new\s+Response\([^)]*?\{\s*headers:\s*corsHeaders\s*\}\s*\)\s*;?\s*\}/,
    `const corsHeaders = buildCorsHeaders(req);\n  const __pre = handlePreflight(req);\n  if (__pre) return __pre;`
  );

  if (src === original) {
    console.log(`SKIP ${fn} (no change)`);
    continue;
  }
  fs.writeFileSync(file, src);
  console.log(`OK   ${fn}`);
}
