'use client';
import React, { useRef, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { usePlayer } from '@/hooks/usePlayer';

export function WaveformScrubber() {
  const progress = usePlayerStore(state => state.progress);
  const duration = usePlayerStore(state => state.duration);
  const seek = usePlayerStore(state => state.seek);
  const { seekTo } = usePlayer() || {};
  
  const [hoverProgress, setHoverProgress] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setHoverProgress(x / rect.width);
  };

  const handleMouseLeave = () => setHoverProgress(null);

  const handleClick = (e: React.MouseEvent) => {
    if (!containerRef.current || duration === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newProgress = x / rect.width;
    const targetSeconds = newProgress * duration;
    seek(targetSeconds);
    if (seekTo) seekTo(targetSeconds);
  };

  // Generate some random heights for the waveform visual effect
  // In a real app we might fetch actual peaks for the track.
  const bars = Array.from({ length: 60 }).map((_, i) => {
    // pseudo random based on index
    const h = 20 + Math.sin(i * 0.5) * 10 + Math.cos(i * 0.2) * 5 + (i % 3) * 5;
    return Math.min(100, Math.max(20, h));
  });

  return (
    <div className="flex flex-col gap-1 w-full max-w-xl mx-auto group">
      <div 
        ref={containerRef}
        className="relative h-8 flex items-end gap-[1px] cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {bars.map((height, index) => {
          const barProgress = index / bars.length;
          const isPlayed = barProgress <= progress;
          const isHovered = hoverProgress !== null && barProgress <= hoverProgress;
          
          let bgColor = 'bg-[rgba(255,255,255,0.2)]';
          if (isPlayed) bgColor = 'bg-white';
          else if (isHovered) bgColor = 'bg-[rgba(255,255,255,0.5)]';

          return (
            <div 
              key={index}
              className={`flex-1 rounded-t-sm transition-all duration-75 ${bgColor}`}
              style={{ height: `${height}%`, opacity: hoverProgress !== null && !isPlayed && !isHovered ? 0.5 : 1 }}
            />
          );
        })}

        {/* Hover Time Tooltip */}
        {hoverProgress !== null && duration > 0 && (
          <div 
            className="absolute -top-6 text-[10px] bg-[#1c1c1c] text-white px-2 py-0.5 rounded shadow pointer-events-none transform -translate-x-1/2 transition-none z-10"
            style={{ left: `${hoverProgress * 100}%` }}
          >
            {formatTime(hoverProgress * duration)}
          </div>
        )}
      </div>
      <div className="flex justify-between text-xs text-[#a3a3a3] font-mono">
        <span>{formatTime(progress * duration)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
