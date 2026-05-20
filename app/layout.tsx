import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import PlayerBar from "@/components/player/PlayerBar";
import { FullscreenPlayer } from "@/components/player/FullscreenPlayer";
import { LyricsPanel } from "@/components/player/LyricsPanel";
import { QueuePanel } from "@/components/player/QueuePanel";
import { GlobalModals } from "@/components/ui/GlobalModals";
import { DisclaimerModal } from "@/components/ui/DisclaimerModal";
import { AppInitializer } from "@/components/layout/AppInitializer";
import { TauriTitleBar } from "@/components/ui/TauriTitleBar";
import { GlobalContextMenuProvider } from "@/components/ui/GlobalContextMenu";
import { AuthProvider } from "@/components/auth/AuthProvider";

export const metadata: Metadata = {
  title: "Maina",
  description: "Premium personal music web application — listen free, no ads.",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a0a" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        {/* PWA / Mobile */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Maina" />
      </head>
      <body className={`antialiased h-screen overflow-hidden flex flex-col md:flex-row text-[var(--text-primary)]`}>
        <AuthProvider>
        <TauriTitleBar />
        <GlobalContextMenuProvider>
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
        </GlobalContextMenuProvider>
        </AuthProvider>
        
        {/* YouTube IFrame API */}
        <Script src="https://www.youtube.com/iframe_api" strategy="afterInteractive" />
        
        {/* Service Worker Registration */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) { console.log('SW registered: ', registration.scope); },
                  function(err) { console.log('SW registration failed: ', err); }
                );
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
