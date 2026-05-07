'use client';
import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ElementType;
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
}

export function IconButton({ 
  icon: Icon, 
  size = 'md', 
  isActive = false,
  className = '', 
  ...props 
}: IconButtonProps) {
  const sizes = {
    sm: "p-1.5 w-8 h-8",
    md: "p-2 w-10 h-10",
    lg: "p-3 w-12 h-12",
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <button 
      className={`inline-flex items-center justify-center rounded-full transition-all focus:outline-none 
      ${isActive ? 'text-[var(--accent)]' : 'text-[#a3a3a3] hover:text-white'} 
      hover:bg-[rgba(255,255,255,0.05)] active:bg-[rgba(255,255,255,0.1)] disabled:opacity-50 disabled:pointer-events-none
      ${sizes[size]} ${className}`}
      {...props}
    >
      <Icon size={iconSizes[size]} className={isActive ? 'fill-current' : ''} />
    </button>
  );
}
