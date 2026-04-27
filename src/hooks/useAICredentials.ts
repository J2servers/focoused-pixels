import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AICredentials {
  id: string;
  enabled: boolean;
  provider: string | null;
  model: string | null;
  api_url: string | null;
  api_key: string | null;
  updated_at: string;
}

const defaults: Omit<AICredentials, 'id' | 'updated_at'> = {
  enabled: false,
  provider: 'openai',
  model: '',
  api_url: '',
  api_key: '',
};

export function useAICredentials() {
  return useQuery({
    queryKey: ['ai-credentials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_credentials')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching AI credentials:', error);
        return { id: '', updated_at: new Date().toISOString(), ...defaults } as AICredentials;
      }

      return { ...defaults, ...(data ?? {}) } as AICredentials;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateAICredentials() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string | null; data: Partial<AICredentials> }) => {
      if (id) {
        const { error } = await supabase.from('ai_credentials').update(data).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('ai_credentials').insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-credentials'] });
    },
  });
}
