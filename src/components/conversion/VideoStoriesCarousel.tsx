/**
 * VideoStoriesCarousel — Carrossel estilo stories com vídeo central destacado
 * Inspirado no layout da imagem de referência com thumbnails laterais
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight, Eye, Heart, ExternalLink } from 'lucide-react';
import { useVideoStories } from '@/hooks/useVideoStories';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function VideoStoriesCarousel() {
  const { data: stories = [], isLoading } = useVideoStories();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeStory = stories[activeIndex];

  // Auto-scroll thumbnails to center active
  useEffect(() => {
    if (!containerRef.current) return;
    const thumbs = containerRef.current.querySelectorAll('[data-thumb]');
    thumbs[activeIndex]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeIndex]);

  // Video progress tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => {
      if (video.duration) setProgress((video.currentTime / video.duration) * 100);
    };
    const onEnd = () => {
      setIsPlaying(false);
      if (activeIndex < stories.length - 1) {
        setActiveIndex(prev => prev + 1);
      }
    };
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('ended', onEnd);
    return () => {
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('ended', onEnd);
    };
  }, [activeIndex, stories.length]);

  // Reset & autoplay on slide change
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
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const goTo = useCallback((idx: number) => {
    if (idx >= 0 && idx < stories.length) setActiveIndex(idx);
  }, [stories.length]);

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-64 mx-auto mb-8" />
          <div className="flex gap-3 justify-center">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="w-[140px] h-[250px] rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (stories.length === 0) return null;

  // Calculate visible range (show up to 4 on each side)
  const visibleCount = Math.min(stories.length, 9);

  return (
    <section className="py-16 lg:py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            Descubra cada detalhe em vídeo
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Veja nossos produtos de perto em vídeos exclusivos
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Arrows */}
          {stories.length > 1 && (
            <>
              <button
                onClick={() => goTo(activeIndex - 1)}
                disabled={activeIndex === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm border border-border hover:bg-accent p-2.5 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
              <button
                onClick={() => goTo(activeIndex + 1)}
                disabled={activeIndex === stories.length - 1}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm border border-border hover:bg-accent p-2.5 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                aria-label="Próximo"
              >
                <ChevronRight className="h-5 w-5 text-foreground" />
              </button>
            </>
          )}

          {/* Stories Strip */}
          <div
            ref={containerRef}
            className="flex items-center justify-center gap-3 md:gap-4 overflow-x-auto scrollbar-hide py-4 px-10"
            style={{ scrollbarWidth: 'none' }}
          >
            {stories.map((story, index) => {
              const isActive = index === activeIndex;
              const distance = Math.abs(index - activeIndex);

              return (
                <motion.div
                  key={story.id}
                  data-thumb
                  layout
                  onClick={() => goTo(index)}
                  className={cn(
                    "relative flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500",
                    isActive
                      ? "w-[220px] h-[390px] md:w-[260px] md:h-[460px] ring-2 ring-primary shadow-2xl z-10"
                      : "w-[130px] h-[230px] md:w-[150px] md:h-[265px] opacity-70 hover:opacity-90",
                    distance > 3 && "hidden md:block",
                    distance > 4 && "hidden lg:block",
                  )}
                  animate={{
                    scale: isActive ? 1 : 0.95,
                    filter: isActive ? 'brightness(1)' : 'brightness(0.7)',
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Thumbnail / Video */}
                  {isActive ? (
                    <div className="w-full h-full relative bg-black">
                      <video
                        ref={videoRef}
                        src={story.video_url}
                        poster={story.thumbnail_url || undefined}
                        className="w-full h-full object-cover"
                        muted={isMuted}
                        playsInline
                        preload="metadata"
                      />

                      {/* Progress bar */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-black/30 z-10">
                        <div
                          className="h-full bg-primary transition-all duration-200"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      {/* Play/Pause overlay */}
                      <div
                        className="absolute inset-0 flex items-center justify-center z-10"
                        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                      >
                        <AnimatePresence>
                          {!isPlaying && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg"
                            >
                              <Play className="h-6 w-6 text-primary-foreground ml-1" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Controls bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent z-10">
                        <div className="flex items-center justify-between mb-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                            className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm"
                          >
                            {isMuted ? <VolumeX className="h-3.5 w-3.5 text-white" /> : <Volume2 className="h-3.5 w-3.5 text-white" />}
                          </button>
                          <div className="flex items-center gap-3 text-white/70 text-[10px]">
                            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {story.views_count}</span>
                            <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {story.likes_count}</span>
                          </div>
                        </div>
                        {story.title && (
                          <p className="text-white text-xs font-semibold line-clamp-2">{story.title}</p>
                        )}
                        {story.cta_text && story.cta_link && (
                          <a href={story.cta_link} className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                            {story.cta_text} <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full relative bg-muted">
                      {story.thumbnail_url ? (
                        <img
                          src={story.thumbnail_url}
                          alt={story.title || 'Story'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <Play className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      {/* Gradient bottom */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-[10px] font-medium line-clamp-2">{story.title}</p>
                      </div>
                      {/* Play icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                          <Play className="h-3.5 w-3.5 text-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Dots indicator */}
          {stories.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-4">
              {stories.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === activeIndex ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
