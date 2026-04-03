import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  price: number;
  promotional_price: number | null;
  stock: number;
  sku: string | null;
  status: string;
  cover_image: string | null;
  gallery_images: string[] | null;
  category_id: string | null;
  is_featured: boolean;
  created_at: string;
  cost_material: number | null;
  cost_labor: number | null;
  cost_shipping: number | null;
  min_stock: number | null;
  weight_kg: number | null;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
}

export interface ProductFormData {
  name: string;
  slug: string;
  short_description: string | null;
  price: number;
  promotional_price: number | null;
  stock: number;
  sku: string | null;
  status: string;
  category_id: string | null;
  is_featured: boolean;
  cover_image: string | null;
  gallery_images: string[] | null;
  cost_material: number;
  cost_labor: number;
  cost_shipping: number;
  min_stock: number;
  weight_kg: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
}

export function useAdminProducts() {
  return useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin-categories-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, parent_id')
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      return data as { id: string; name: string; parent_id: string | null }[];
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: ProductFormData) => {
      const { error } = await supabase.from('products').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Produto criado com sucesso!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProductFormData> }) => {
      const { error } = await supabase.from('products').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Produto atualizado com sucesso!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Produto excluído com sucesso!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
