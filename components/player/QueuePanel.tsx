'use client';
import React from 'react';
import { useQueue } from '@/hooks/useQueue';
import { usePlayerStore } from '@/store/playerStore';
import { X, ListMusic, GripVertical, Play } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Track } from '@/lib/db';

function SortableTrackItem({ track, index }: { track: Track; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: track.id + '-' + index });
  const play = usePlayerStore(state => state.play);
  const removeFromQueue = usePlayerStore(state => state.removeFromQueue);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`flex items-center gap-3 p-2 rounded-md group transition-colors ${isDragging ? 'bg-white/10 shadow-lg' : 'hover:bg-white/5'}`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-[#a3a3a3] hover:text-white"
      >
        <GripVertical size={16} />
      </div>
      
      <div className="relative w-10 h-10 rounded overflow-hidden shrink-0">
        <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
        <div 
          onClick={() => play(track)}
          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
        >
          <Play size={16} className="text-white fill-current" />
        </div>
      </div>
      
      <div className="flex flex-col min-w-0 flex-1">
        <span className="font-medium text-sm truncate text-white">{track.title}</span>
        <span className="text-xs text-[#a3a3a3] truncate">{track.artist}</span>
      </div>
      
      <button 
        onClick={() => removeFromQueue(index)}
        className="opacity-0 group-hover:opacity-100 p-2 text-[#a3a3a3] hover:text-white transition-opacity"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function QueuePanel() {
  const showQueue = usePlayerStore(state => state.showQueue);
  const toggleQueue = usePlayerStore(state => state.toggleQueue);
  const { queue, currentTrack, reorderQueue, clearQueue } = useQueue();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const activeIndex = queue.findIndex((t, i) => t.id + '-' + i === active.id);
      const overIndex = queue.findIndex((t, i) => t.id + '-' + i === over.id);
      reorderQueue(activeIndex, overIndex);
    }
  };

  return (
    <AnimatePresence>
      {showQueue && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 w-full md:w-[400px] h-[calc(100vh-80px)] bg-[#141414] border-l border-[rgba(255,255,255,0.06)] z-[70] flex flex-col shadow-2xl"
        >
          <div className="flex items-center justify-between p-6 border-b border-[rgba(255,255,255,0.06)] shrink-0">
            <h2 className="text-xl font-display font-bold flex items-center gap-2">
              <ListMusic size={24} className="text-[var(--accent)]" />
              Queue
            </h2>
            <div className="flex items-center gap-2">
              {queue.length > 0 && (
                <button onClick={clearQueue} className="text-xs text-[#a3a3a3] hover:text-white px-2 py-1 rounded border border-[rgba(255,255,255,0.1)]">
                  Clear
                </button>
              )}
              <IconButton icon={X} onClick={toggleQueue} />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col gap-6">
            {/* Now Playing */}
            {currentTrack && (
              <div>
                <h3 className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider mb-3 px-2">Now Playing</h3>
                <div className="flex items-center gap-3 p-2 rounded-md bg-[var(--bg-glow)] border border-[var(--accent-muted)]">
                  <div className="relative w-10 h-10 rounded overflow-hidden shrink-0">
                    <img src={currentTrack.thumbnail} alt={currentTrack.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-medium text-sm truncate text-[var(--accent)]">{currentTrack.title}</span>
                    <span className="text-xs text-[var(--accent)] opacity-80 truncate">{currentTrack.artist}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Next Up */}
            <div>
              <h3 className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider mb-3 px-2">Next Up</h3>
              {queue.length === 0 ? (
                <p className="text-sm text-[#a3a3a3] px-2">No tracks in queue.</p>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={queue.map((t, i) => t.id + '-' + i)} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-1">
                      {queue.map((track, index) => (
                        <SortableTrackItem key={track.id + '-' + index} track={track} index={index} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
