'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import PlayerBar from "@/components/player/PlayerBar";
import { FullscreenPlayer } from "@/components/player/FullscreenPlayer";
import { LyricsPanel } from "@/components/player/LyricsPanel";
import { QueuePanel } from "@/components/player/QueuePanel";
import { GlobalModals } from "@/components/ui/GlobalModals";
import { DisclaimerModal } from "@/components/ui/DisclaimerModal";
import { AppInitializer } from "@/components/layout/AppInitializer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide the music player and sidebar on auth, share, and invite pages
  const isStandalonePage = 
    pathname === '/login' || 
    pathname.startsWith('/share/') || 
    pathname.startsWith('/invite/');

  if (isStandalonePage) {
    return (
      <main className="h-full w-full flex flex-col flex-1 relative overflow-auto">
        {children}
      </main>
    );
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-[152px] md:pb-[80px] relative no-scrollbar md:ml-[240px]">
        {children}
      </main>
      
      {/* Global Player Components */}
      <PlayerBar />
      <FullscreenPlayer />
      <LyricsPanel />
      <QueuePanel />
      
      <MobileNav />
      <GlobalModals />
      <DisclaimerModal />
      <AppInitializer />
    </>
  );
}
