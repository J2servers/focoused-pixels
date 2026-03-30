import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VideoStory {
  id: string;
  title: string | null;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  display_order: number;
  status: string;
  views_count: number;
  likes_count: number;
  duration_seconds: number | null;
  tags: string[] | null;
  cta_text: string | null;
  cta_link: string | null;
  created_at: string;
  updated_at: string;
}

export function useVideoStories() {
  return useQuery({
    queryKey: ['video-stories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_stories')
        .select('*')
        .eq('status', 'active')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return (data || []) as VideoStory[];
    },
  });
}

export function useAllVideoStories() {
  return useQuery({
    queryKey: ['video-stories-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_stories')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return (data || []) as VideoStory[];
    },
  });
}

export function useCreateVideoStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (story: Partial<VideoStory>) => {
      const { data, error } = await supabase
        .from('video_stories')
        .insert(story as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['video-stories'] }),
  });
}

export function useUpdateVideoStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<VideoStory> & { id: string }) => {
      const { data, error } = await supabase
        .from('video_stories')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['video-stories'] }),
  });
}

export function useDeleteVideoStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('video_stories')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['video-stories'] }),
  });
}

export function useIncrementVideoView() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('increment_video_view' as any, { video_id: id });
      if (error) {
        // Fallback: direct update
        await supabase
          .from('video_stories')
          .update({ views_count: supabase.rpc as any } as any)
          .eq('id', id);
      }
    },
  });
}
