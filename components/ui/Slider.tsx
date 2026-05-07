'use client';
import React from 'react';

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number;
  max?: number;
  onChange: (value: number) => void;
}

export function Slider({ 
  value, 
  max = 100, 
  onChange, 
  className = '', 
  ...props 
}: SliderProps) {
  const fillPercentage = (value / max) * 100;

  return (
    <div className={`relative flex items-center group h-4 cursor-pointer ${className}`}>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute w-full h-full opacity-0 cursor-pointer z-10"
        {...props}
      />
      {/* Track Background */}
      <div className="absolute left-0 right-0 h-1 rounded-full bg-[rgba(255,255,255,0.1)] overflow-hidden">
        {/* Fill */}
        <div 
          className="h-full bg-white group-hover:bg-[var(--accent)] transition-colors duration-200"
          style={{ width: `${fillPercentage}%` }}
        />
      </div>
      {/* Thumb */}
      <div 
        className="absolute h-3 w-3 rounded-full bg-white opacity-0 group-hover:opacity-100 shadow-sm transition-opacity duration-200 pointer-events-none"
        style={{ left: `calc(${fillPercentage}% - 6px)` }}
      />
    </div>
  );
}
