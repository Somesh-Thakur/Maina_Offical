'use client';
import { useEffect, useState } from 'react';
import { Minus, Maximize2, X, Square } from 'lucide-react';

/**
 * TauriTitleBar — only renders inside the Tauri desktop app.
 * Provides: draggable region + Close / Minimize / Maximize buttons.
 *
 * Uses @tauri-apps/api/window via dynamic import so it doesn't
 * break when loaded in a browser (Vercel / dev server).
 */

function isTauriEnv() {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

async function getWin() {
  if (!isTauriEnv()) return null;
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    return getCurrentWindow();
  } catch {
    return null;
  }
}

export function TauriTitleBar() {
  const [isTauri, setIsTauri] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (!isTauriEnv()) return;
    setIsTauri(true);

    // Check initial maximized state
    getWin().then(win => {
      win?.isMaximized().then((max: boolean) => setIsMaximized(max));
    });

    // Listen for resize to track maximize state
    let unlisten: (() => void) | null = null;
    getWin().then(async win => {
      if (!win) return;
      unlisten = await win.onResized(() => {
        win.isMaximized().then((max: boolean) => setIsMaximized(max));
      });
    });

    return () => { unlisten?.(); };
  }, []);

  if (!isTauri) return null;

  const handleMinimize = async () => {
    const win = await getWin();
    await win?.minimize();
  };

  const handleMaximize = async () => {
    const win = await getWin();
    if (!win) return;
    const max = await win.isMaximized();
    if (max) {
      await win.unmaximize();
      setIsMaximized(false);
    } else {
      await win.maximize();
      setIsMaximized(true);
    }
  };

  const handleClose = async () => {
    const win = await getWin();
    await win?.hide(); // Hides to tray (main.rs intercepts CloseRequested)
  };

  return (
    <div
      data-tauri-drag-region
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '36px',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '14px',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 100%)',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        pointerEvents: 'auto',
      }}
    >
      {/* App name / logo (drag region — pointer-events: none so drag works) */}
      <div
        data-tauri-drag-region
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          opacity: 0.7,
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          color: '#fff',
          pointerEvents: 'none',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/maina-logo.png"
          alt="Maina"
          style={{ width: '18px', height: '18px', objectFit: 'contain', borderRadius: '3px' }}
        />
        MAINA
      </div>

      {/* Window Controls — Windows-style, right side */}
      <div style={{ display: 'flex', height: '36px' }}>
        {/* Minimize */}
        <button
          onClick={handleMinimize}
          title="Minimize"
          style={btnStyle}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Minus size={13} />
        </button>

        {/* Maximize / Restore */}
        <button
          onClick={handleMaximize}
          title={isMaximized ? 'Restore' : 'Maximize'}
          style={btnStyle}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {isMaximized ? <Square size={11} /> : <Maximize2 size={12} />}
        </button>

        {/* Close → hides to tray */}
        <button
          onClick={handleClose}
          title="Minimize to Tray"
          style={btnStyle}
          onMouseEnter={e => { e.currentTarget.style.background = '#e81123'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '46px',
  height: '36px',
  background: 'transparent',
  border: 'none',
  color: 'rgba(255,255,255,0.85)',
  cursor: 'pointer',
  transition: 'background 0.12s',
  outline: 'none',
  padding: 0,
};
