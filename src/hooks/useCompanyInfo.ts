import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CompanyInfo {
  id: string;
  company_name: string;
  cnpj: string | null;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  business_hours: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
  social_tiktok: string | null;
  social_youtube: string | null;
  social_linkedin: string | null;
  social_pinterest: string | null;
  copyright_text: string | null;
  privacy_policy: string | null;
  terms_of_service: string | null;
  returns_policy: string | null;
  footer_logo: string | null;
  header_logo: string | null;
  free_shipping_minimum: number | null;
  free_shipping_message: string | null;
  installments: number | null;
  production_time: string | null;
  warranty: string | null;
}

// Default fallback values when no data is in the database
const defaultCompanyInfo: Omit<CompanyInfo, 'id'> = {
  company_name: 'GOAT Comunicação Visual',
  cnpj: '00.000.000/0001-00',
  address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
  phone: '(11) 99999-9999',
  whatsapp: '5511999999999',
  email: 'contato@goatcomunicacaovisual.com.br',
  business_hours: 'Seg-Sex 9h às 18h',
  social_instagram: 'https://instagram.com/goatcomunicacaovisual',
  social_facebook: 'https://facebook.com/goatcomunicacaovisual',
  social_tiktok: 'https://tiktok.com/@goatcomunicacaovisual',
  social_youtube: 'https://youtube.com/@goatcomunicacaovisual',
  social_linkedin: null,
  social_pinterest: 'https://pinterest.com/goatcomunicacaovisual',
  copyright_text: '© 2025 GOAT Comunicação Visual. Todos os direitos reservados.',
  privacy_policy: null,
  terms_of_service: null,
  returns_policy: null,
  footer_logo: null,
  header_logo: null,
  free_shipping_minimum: 159,
  free_shipping_message: 'Frete grátis em compras acima de R$ 159',
  installments: 12,
  production_time: '4 a 10 dias úteis',
  warranty: '3 meses',
};

export function useCompanyInfo() {
  return useQuery({
    queryKey: ['company-info'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching company info:', error);
      }

      // Merge database data with defaults
      if (data) {
        return {
          ...defaultCompanyInfo,
          ...data,
        } as CompanyInfo;
      }

      return { id: '', ...defaultCompanyInfo } as CompanyInfo;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function useUpdateCompanyInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string | null; data: Partial<CompanyInfo> }) => {
      // Ensure company_name is present for insert operations
      const insertData = { company_name: data.company_name || 'GOAT Comunicação Visual', ...data };
      
      if (id) {
        const { error } = await supabase
          .from('company_info')
          .update(data)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('company_info')
          .insert([insertData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-info'] });
    },
  });
}
