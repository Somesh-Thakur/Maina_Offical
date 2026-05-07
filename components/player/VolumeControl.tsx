'use client';
import React from 'react';
import { VolumeX, Volume1, Volume2 } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { Slider } from '@/components/ui/Slider';
import { IconButton } from '@/components/ui/IconButton';

export function VolumeControl() {
  const volume = usePlayerStore(state => state.volume);
  const isMuted = usePlayerStore(state => state.isMuted);
  const setVolume = usePlayerStore(state => state.setVolume);
  const toggleMute = usePlayerStore(state => state.toggleMute);

  const VolumeIcon = isMuted || volume === 0 
    ? VolumeX 
    : volume < 0.5 
      ? Volume1 
      : Volume2;

  return (
    <div className="flex items-center gap-2 w-32 group">
      <IconButton 
        icon={VolumeIcon} 
        size="sm" 
        onClick={toggleMute} 
        aria-label="Toggle Mute" 
        className="shrink-0"
      />
      <Slider 
        value={isMuted ? 0 : volume * 100} 
        max={100} 
        onChange={(val) => setVolume(val / 100)} 
        className="w-full flex-1"
      />
    </div>
  );
}
