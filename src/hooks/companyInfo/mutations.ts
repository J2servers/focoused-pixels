import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { isMissingColumnError, sanitizeCompanyPayload, stripOptionalCompanyColumns } from './sanitize';
import type { CompanyInfo } from './types';

type CompanyPayload = Record<string, unknown>;

const updateCompany = async (id: string, payload: Partial<CompanyInfo>) => {
  const { error } = await supabase
    .from('company_info')
    .update(payload as CompanyPayload)
    .eq('id', id);
  return error;
};

const insertCompany = async (payload: Partial<CompanyInfo> & { company_name: string }) => {
  const { error } = await supabase
    .from('company_info')
    .insert([payload as CompanyPayload & { company_name: string }]);
  return error;
};

export function useUpdateCompanyInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string | null; data: Partial<CompanyInfo> }) => {
      const sanitized = sanitizeCompanyPayload(data);

      if (id) {
        const error = await updateCompany(id, sanitized);
        if (!error) return;

        if (isMissingColumnError(error)) {
          const retry = stripOptionalCompanyColumns(sanitized);
          if (Object.keys(retry).length > 0) {
            const retryError = await updateCompany(id, retry);
            if (!retryError) return;
          }
        }
        throw error;
      }

      const insertData = {
        ...sanitized,
        company_name: (sanitized.company_name as string) || 'Pincel de Luz Personalizados',
      };
      const error = await insertCompany(insertData);
      if (!error) return;

      if (isMissingColumnError(error)) {
        const retry = {
          ...stripOptionalCompanyColumns(insertData),
          company_name: insertData.company_name,
        };
        const retryError = await insertCompany(retry);
        if (!retryError) return;
      }
      throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-info'] });
      queryClient.invalidateQueries({ queryKey: ['company-info-admin'] });
    },
  });
}
