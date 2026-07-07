'use client';

import { useEffect, useRef } from 'react';
import { LyricLine } from '@/mocks/lyrics';
import { cn } from '@/lib/utils';

interface LyricsHighlightProps {
  lyrics: LyricLine[];
  currentTime: number;
  onSeek?: (time: number) => void;
  fontSize?: 'sm' | 'md' | 'lg' | 'xl';
}

export function LyricsHighlight({
  lyrics,
  currentTime,
  onSeek,
  fontSize = 'lg',
}: LyricsHighlightProps) {
  const activeIndex = lyrics.findLastIndex((l) => l.time <= currentTime);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      const container = containerRef.current;
      const active = activeRef.current;
      const offsetTop = active.offsetTop - container.clientHeight / 2 + active.clientHeight / 2;
      container.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  }, [activeIndex]);

  const sizes = {
    sm: 'text-base md:text-lg',
    md: 'text-lg md:text-xl',
    lg: 'text-xl md:text-2xl',
    xl: 'text-2xl md:text-4xl',
  };

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto scrollbar-hide py-32 px-4"
    >
      <div className="max-w-3xl mx-auto space-y-6 text-center">
        {lyrics.map((line, idx) => {
          const isActive = idx === activeIndex;
          const isPassed = idx < activeIndex;
          return (
            <p
              key={idx}
              ref={isActive ? activeRef : null}
              onClick={() => onSeek?.(line.time)}
              className={cn(
                'lyrics-line cursor-pointer font-semibold transition-all',
                sizes[fontSize],
                isActive && 'active',
                isPassed && 'passed',
              )}
            >
              {line.text}
            </p>
          );
        })}
      </div>
    </div>
  );
}
