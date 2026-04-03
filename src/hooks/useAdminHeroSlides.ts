import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface HeroSlide {
  id: string;
  title: string | null;
  subtitle: string | null;
  cta_text: string | null;
  cta_link: string | null;
  desktop_image: string;
  mobile_image: string | null;
  display_order: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
  theme: string;
  created_at: string;
}

export interface HeroSlideFormData {
  title: string | null;
  subtitle: string | null;
  cta_text: string | null;
  cta_link: string | null;
  desktop_image: string;
  mobile_image: string | null;
  display_order: number;
  status: string;
  theme: string;
}

export function useAdminHeroSlides() {
  return useQuery({
    queryKey: ['admin-hero-slides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as HeroSlide[];
    },
  });
}

export function useCreateHeroSlide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: HeroSlideFormData) => {
      const { error } = await supabase.from('hero_slides').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-hero-slides'] });
      toast.success('Banner criado com sucesso!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateHeroSlide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<HeroSlideFormData> }) => {
      const { error } = await supabase.from('hero_slides').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-hero-slides'] });
      toast.success('Banner atualizado com sucesso!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteHeroSlide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('hero_slides').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-hero-slides'] });
      toast.success('Banner excluído com sucesso!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
