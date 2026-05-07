'use client';
import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
  const baseClass = "animate-shimmer";
  
  const variants = {
    rectangular: "rounded-md",
    circular: "rounded-full",
    text: "rounded-md h-4 w-3/4",
  };

  return (
    <div className={`${baseClass} ${variants[variant]} ${className}`} />
  );
}
