import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RawMaterial {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
  quantity: number;
  min_quantity: number | null;
  cost_per_unit: number | null;
  supplier: string | null;
  category: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RawMaterialInput {
  name: string;
  sku?: string;
  unit: string;
  quantity: number;
  min_quantity?: number;
  cost_per_unit?: number;
  supplier?: string;
  category?: string;
  notes?: string;
}

export function useRawMaterials() {
  return useQuery({
    queryKey: ['raw-materials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('raw_materials')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as RawMaterial[];
    },
  });
}

export function useCreateRawMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: RawMaterialInput) => {
      const { error } = await supabase.from('raw_materials').insert(input);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['raw-materials'] }); toast.success('Material criado!'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateRawMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<RawMaterialInput> }) => {
      const { error } = await supabase.from('raw_materials').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['raw-materials'] }); toast.success('Material atualizado!'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteRawMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('raw_materials').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['raw-materials'] }); toast.success('Material excluído!'); },
    onError: (e: Error) => toast.error(e.message),
  });
}
