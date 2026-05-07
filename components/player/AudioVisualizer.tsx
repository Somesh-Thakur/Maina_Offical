'use client';
import React, { useEffect, useRef } from 'react';
import { useAudioAnalyser } from '@/hooks/useAudioAnalyser';
import { usePlayerStore } from '@/store/playerStore';

export function AudioVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataArray = useAudioAnalyser();
  const isPlaying = usePlayerStore(state => state.isPlaying);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    // Base radius of the circular visualizer
    const baseRadius = Math.min(width, height) / 3;

    ctx.clearRect(0, 0, width, height);

    // Draw circular rings
    ctx.beginPath();
    for (let i = 0; i < dataArray.length; i++) {
      const value = dataArray[i];
      const percent = value / 255;
      const radius = baseRadius + (percent * 50); // react to bass

      const angle = (i / dataArray.length) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'var(--accent-muted)';
    ctx.stroke();
    
    // Fill with slight glow
    ctx.fillStyle = 'var(--bg-glow)';
    ctx.fill();

  }, [dataArray]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
    />
  );
}
