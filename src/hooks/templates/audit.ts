import { supabase } from '@/integrations/supabase/client';
import type { AuditAction } from './types';

/** Records a CRUD action in audit_logs. Silent on failure to never block user flow. */
export async function logTemplateAudit(
  action: AuditAction,
  table: 'email_templates' | 'whatsapp_templates',
  recordId: string | undefined,
  oldData: unknown,
  newData: unknown,
): Promise<void> {
  try {
    await supabase.from('audit_logs').insert([{
      action,
      table_name: table,
      record_id: recordId ?? null,
      old_data: oldData ? JSON.parse(JSON.stringify(oldData)) : null,
      new_data: newData ? JSON.parse(JSON.stringify(newData)) : null,
    }]);
  } catch {
    /* audit must never break user flow */
  }
}
