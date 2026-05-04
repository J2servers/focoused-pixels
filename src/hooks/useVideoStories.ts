import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type VideoStoryRow = Database['public']['Tables']['video_stories']['Row'];
type VideoStoryInsert = Database['public']['Tables']['video_stories']['Insert'];
type VideoStoryUpdate = Database['public']['Tables']['video_stories']['Update'];

export type VideoStory = VideoStoryRow;

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
    mutationFn: async (story: VideoStoryInsert) => {
      const { data, error } = await supabase
        .from('video_stories')
        .insert(story)
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
    mutationFn: async ({ id, ...updates }: VideoStoryUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('video_stories')
        .update(updates)
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
      // Best-effort fetch + increment fallback (no RPC dependency)
      const { data } = await supabase
        .from('video_stories')
        .select('views_count')
        .eq('id', id)
        .maybeSingle();
      const current = data?.views_count ?? 0;
      await supabase
        .from('video_stories')
        .update({ views_count: current + 1 })
        .eq('id', id);
    },
  });
}
