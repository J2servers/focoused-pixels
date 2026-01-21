import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  source: string;
  tags: string[];
  is_subscribed: boolean;
  subscribed_at: string | null;
  unsubscribed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Hook for fetching all leads (admin only)
export const useLeads = () => {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Lead[];
    },
  });
};

// Hook for subscribing a new lead
export const useSubscribeLead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (lead: { name: string; email: string; phone?: string; source?: string; tags?: string[] }) => {
      const { data, error } = await supabase
        .from('leads')
        .upsert({
          name: lead.name,
          email: lead.email,
          phone: lead.phone || null,
          source: lead.source || 'website',
          tags: lead.tags || [],
          is_subscribed: true,
          subscribed_at: new Date().toISOString(),
        }, {
          onConflict: 'email',
          ignoreDuplicates: false,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
};

// Hook for updating lead (admin only)
export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Lead> }) => {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
};

// Hook for deleting lead (admin only)
export const useDeleteLead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
};
