import { logger } from '@/lib/logger';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { defaultCompanyInfo } from './defaults';
import type { CompanyInfo } from './types';

const FIVE_MIN = 1000 * 60 * 5;
const TWO_MIN = 1000 * 60 * 2;

const buildCompanyInfo = (raw: Record<string, unknown>): CompanyInfo => ({
  ...defaultCompanyInfo,
  ...raw,
} as CompanyInfo);

export function useCompanyInfo() {
  return useQuery({
    queryKey: ['company-info'],
    queryFn: async () => {
      // Try the public view first (works for all users, excludes sensitive fields).
      const { data: publicData, error: publicError } = await supabase
        .from('company_info_public')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (!publicError && publicData && typeof publicData === 'object') {
        return buildCompanyInfo(publicData as Record<string, unknown>);
      }

      // Fallback: read direct table (works for admins).
      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) console.error('Error fetching company info:', error);
      if (data) return buildCompanyInfo(data as Record<string, unknown>);

      return { id: '', ...defaultCompanyInfo } as CompanyInfo;
    },
    staleTime: FIVE_MIN,
  });
}

/** Admin-only hook that reads from the real table (includes sensitive fields like API keys). */
export function useCompanyInfoAdmin() {
  return useQuery({
    queryKey: ['company-info-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return buildCompanyInfo(data as Record<string, unknown>);
    },
    staleTime: TWO_MIN,
  });
}
