/**
 * DarkVideoStories — Versão dark/glassmorphism do carrossel para Teste2Page
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight, Eye, Heart, ExternalLink } from 'lucide-react';
import { useVideoStories } from '@/hooks/useVideoStories';
import { cn } from '@/lib/utils';

export function DarkVideoStories() {
  const { data: stories = [], isLoading } = useVideoStories();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeStory = stories[activeIndex];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => {
      if (video.duration) setProgress((video.currentTime / video.duration) * 100);
    };
    const onEnd = () => {
      setIsPlaying(false);
      if (activeIndex < stories.length - 1) setActiveIndex(p => p + 1);
    };
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('ended', onEnd);
    return () => { video.removeEventListener('timeupdate', onTime); video.removeEventListener('ended', onEnd); };
  }, [activeIndex, stories.length]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeStory) return;
    video.load();
    setProgress(0);
    setIsPlaying(false);
  }, [activeIndex, activeStory?.video_url]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) { video.play(); setIsPlaying(true); }
    else { video.pause(); setIsPlaying(false); }
  }, []);

  const goTo = useCallback((idx: number) => {
    if (idx >= 0 && idx < stories.length) setActiveIndex(idx);
  }, [stories.length]);

  if (isLoading || stories.length === 0) return null;

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[hsl(var(--primary))/0.06] blur-[120px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 relative">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-3 justify-center">
            <span className="w-9 h-px bg-gradient-to-r from-transparent to-[hsl(var(--primary))]" />
            <span className="font-mono text-xs tracking-[0.18em] uppercase text-[hsl(var(--primary))]">
              Vídeos
            </span>
            <span className="w-9 h-px bg-gradient-to-l from-transparent to-[hsl(var(--primary))]" />
          </div>
          <h2 className="font-bebas text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.92] tracking-[0.09em] uppercase text-white">
            Descubra Cada<br />
            <span className="text-[hsl(var(--primary))]">Detalhe em Vídeo</span>
          </h2>
        </div>

        {/* Carousel */}
        <div className="relative">
          {stories.length > 1 && (
            <>
              <button onClick={() => goTo(activeIndex - 1)} disabled={activeIndex === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] hover:bg-white/[0.12] p-3 rounded-full transition-all disabled:opacity-20 shadow-xl">
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>
              <button onClick={() => goTo(activeIndex + 1)} disabled={activeIndex === stories.length - 1}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] hover:bg-white/[0.12] p-3 rounded-full transition-all disabled:opacity-20 shadow-xl">
                <ChevronRight className="h-5 w-5 text-white" />
              </button>
            </>
          )}

          <div className="flex items-center justify-center gap-3 md:gap-4 overflow-x-auto scrollbar-hide py-4 px-12" style={{ scrollbarWidth: 'none' }}>
            {stories.map((story, index) => {
              const isActive = index === activeIndex;
              const distance = Math.abs(index - activeIndex);

              return (
                <motion.div
                  key={story.id}
                  layout
                  onClick={() => goTo(index)}
                  className={cn(
                    "relative flex-shrink-0 rounded-3xl overflow-hidden cursor-pointer transition-all duration-500",
                    isActive
                      ? "w-[220px] h-[390px] md:w-[260px] md:h-[460px] ring-2 ring-[hsl(var(--primary))] shadow-[0_0_40px_hsl(var(--primary)/0.2)] z-10"
                      : "w-[130px] h-[230px] md:w-[150px] md:h-[265px] opacity-60 hover:opacity-80",
                    distance > 3 && "hidden md:block",
                    distance > 4 && "hidden lg:block",
                  )}
                  animate={{
                    scale: isActive ? 1 : 0.93,
                    filter: isActive ? 'brightness(1)' : 'brightness(0.5)',
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {isActive ? (
                    <div className="w-full h-full relative bg-black">
                      <video ref={videoRef} src={story.video_url} poster={story.thumbnail_url || undefined}
                        className="w-full h-full object-cover" muted={isMuted} playsInline preload="metadata" />

                      {/* Progress */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-10">
                        <div className="h-full bg-[hsl(var(--primary))] transition-all duration-200" style={{ width: `${progress}%` }} />
                      </div>

                      {/* Play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center z-10"
                        onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                        <AnimatePresence>
                          {!isPlaying && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                              className="w-14 h-14 rounded-full bg-[hsl(var(--primary))/0.9] flex items-center justify-center shadow-[0_0_30px_hsl(var(--primary)/0.4)]">
                              <Play className="h-6 w-6 text-white ml-1" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Bottom controls */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent z-10">
                        <div className="flex items-center justify-between mb-2">
                          <button onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                            className="p-1.5 rounded-full bg-white/10 backdrop-blur-sm">
                            {isMuted ? <VolumeX className="h-3.5 w-3.5 text-white" /> : <Volume2 className="h-3.5 w-3.5 text-white" />}
                          </button>
                          <div className="flex items-center gap-3 text-white/50 text-[10px]">
                            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {story.views_count}</span>
                            <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {story.likes_count}</span>
                          </div>
                        </div>
                        {story.title && <p className="text-white text-xs font-semibold line-clamp-2">{story.title}</p>}
                        {story.cta_text && story.cta_link && (
                          <a href={story.cta_link}
                            className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[hsl(var(--primary))] bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                            {story.cta_text} <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full relative bg-[#0a1628]">
                      {story.thumbnail_url ? (
                        <img src={story.thumbnail_url} alt={story.title || 'Story'} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Play className="h-8 w-8 text-white/30" /></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white/80 text-[10px] font-medium line-clamp-2">{story.title}</p>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                          <Play className="h-3.5 w-3.5 text-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Dots */}
          {stories.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-4">
              {stories.map((_, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === activeIndex ? "w-6 bg-[hsl(var(--primary))]" : "w-1.5 bg-white/20"
                  )} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
