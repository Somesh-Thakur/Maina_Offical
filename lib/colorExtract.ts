'use client';
import { Vibrant } from 'node-vibrant/browser';

export interface Palette {
  primary: string;
  secondary: string;
  muted: string;
  bgGlow: string;
  textSafe: string;
}

export async function extractPalette(imageUrl: string): Promise<Palette | null> {
  if (!imageUrl) return null;
  
  try {
    // We may need a cors proxy for youtube thumbnails if canvas taints.
    // However, vibrant uses an Image element with crossOrigin="anonymous". 
    // Sometimes YouTube thumbnails allow this. Let's try directly first.
    // If it fails, fallback to a public proxy.
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`;
    
    // We try original URL first.
    let vibrant;
    try {
      vibrant = await Vibrant.from(imageUrl).getPalette();
    } catch (e) {
      // Fallback to proxy
      vibrant = await Vibrant.from(proxyUrl).getPalette();
    }
    
    if (!vibrant) return null;
    
    return {
      primary: vibrant.Vibrant?.hex || '#6366f1',
      secondary: vibrant.LightVibrant?.hex || '#818cf8',
      muted: vibrant.DarkVibrant?.hex || 'rgba(99,102,241,0.2)',
      bgGlow: vibrant.DarkMuted?.hex || 'rgba(99,102,241,0.08)',
      textSafe: vibrant.LightMuted?.hex || '#ffffff',
    };
  } catch (error) {
    console.error("Failed to extract color palette:", error);
    return null;
  }
}
