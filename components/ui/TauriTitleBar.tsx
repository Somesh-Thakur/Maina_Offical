'use client';
import { useEffect, useState } from 'react';
import { Minus, Maximize2, X, Square } from 'lucide-react';

/**
 * TauriTitleBar — only renders inside the Tauri desktop app.
 * Provides: draggable region + Close / Minimize / Maximize buttons.
 * Uses window.__TAURI__ globals (set by withGlobalTauri: true in tauri.conf.json).
 */
export function TauriTitleBar() {
  const [isTauri, setIsTauri] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const tauri = !!(typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window);
    setIsTauri(tauri);

    if (tauri) {
      // Track maximize state
      const win = getWin();
      win?.isMaximized?.().then((max: boolean) => setIsMaximized(max));
    }
  }, []);

  if (!isTauri) return null;

  const getWin = () => (window as any).__TAURI__?.window?.getCurrentWindow?.();

  const handleMinimize = () => getWin()?.minimize();
  const handleMaximize = () => {
    const win = getWin();
    win?.isMaximized().then((max: boolean) => {
      if (max) { win.unmaximize(); setIsMaximized(false); }
      else { win.maximize(); setIsMaximized(true); }
    });
  };
  const handleClose = () => getWin()?.close();

  return (
    <div
      // data-tauri-drag-region makes the whole bar drag the window
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
        // Subtle dark glassmorphism strip
        background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)',
        backdropFilter: 'blur(0px)',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        pointerEvents: 'auto',
      }}
    >
      {/* App name / logo (drag region) */}
      <div
        data-tauri-drag-region
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          opacity: 0.6,
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          color: '#fff',
          pointerEvents: 'none', // let drag pass through
        }}
      >
        <span style={{ fontSize: '14px' }}>🎵</span>
        MAINA
      </div>

      {/* Window Controls — Windows style (right side) */}
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

        {/* Close */}
        <button
          onClick={handleClose}
          title="Close"
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
  color: 'rgba(255,255,255,0.8)',
  cursor: 'pointer',
  transition: 'background 0.15s',
  outline: 'none',
  padding: 0,
};
