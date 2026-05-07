'use client';
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollRowProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function ScrollRow({ children, title, className = '' }: ScrollRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75; 
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={`relative ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold">{title}</h2>
          <div className="hidden md:flex gap-2">
            <button 
              onClick={() => scroll('left')}
              className="p-1.5 rounded-full bg-[#141414] border border-[rgba(255,255,255,0.06)] hover:bg-[#1c1c1c] hover:border-[rgba(255,255,255,0.12)] transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-1.5 rounded-full bg-[#141414] border border-[rgba(255,255,255,0.06)] hover:bg-[#1c1c1c] hover:border-[rgba(255,255,255,0.12)] transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
      
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-4"
      >
        {React.Children.map(children, child => (
          <div className="snap-start shrink-0">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
