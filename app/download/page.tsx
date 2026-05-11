'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Monitor, Apple, Download, CheckCircle2, Zap, Music2, Radio, Shield } from 'lucide-react';

// ─── Download URLs — files live in the main branch root ────────────────────
const REPO_RAW  = 'https://github.com/Somesh-Thakur/Maina_Offical/raw/main';
const WINDOWS_EXE_URL = `${REPO_RAW}/Maina_1.0.0_x64-setup.exe`;
const WINDOWS_MSI_URL = `${REPO_RAW}/Maina_1.0.0_x64_en-US.msi`;
// macOS builds via GitHub Actions — update these after the CI workflow runs:
const MAC_ARM_URL   = `${REPO_RAW}/Maina_1.0.0_aarch64.dmg`;
const MAC_INTEL_URL = `${REPO_RAW}/Maina_1.0.0_x64.dmg`;

const features = [
  { icon: Music2,  title: 'All Songs, One Place',   desc: 'Millions of tracks streamed instantly — no buffering, no ads.' },
  { icon: Radio,   title: 'Discord Rich Presence',  desc: 'Show friends exactly what you\'re listening to, in real time.' },
  { icon: Zap,     title: 'Speed Play',              desc: 'One-tap access to your pinned tracks for instant vibes.' },
  { icon: Shield,  title: 'Always Free',             desc: 'Maina is and will always be completely free.' },
];

export default function DownloadPage() {
  const [os, setOs] = useState<'windows' | 'mac' | 'other'>('other');
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('win')) setOs('windows');
    else if (ua.includes('mac')) setOs('mac');
  }, []);

  function handleDownload(url: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    a.click();
    setDownloaded(true);
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-white">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[50%] translate-x-[-50%] w-[700px] h-[400px] bg-[var(--accent)] opacity-[0.08] rounded-full blur-[120px]" />
        </div>

        <Link href="/" className="mb-8 flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/maina-logo.png" alt="Maina" className="w-10 h-10 rounded-lg object-contain" />
          <span className="text-xl font-bold tracking-widest">MAINA</span>
        </Link>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 leading-none">
          Music for your<br />
          <span className="bg-gradient-to-r from-[var(--accent)] to-blue-400 bg-clip-text text-transparent">
            desktop.
          </span>
        </h1>
        <p className="text-lg text-[#a3a3a3] max-w-xl mb-10">
          Get the native Maina app — with Discord Rich Presence, media keys, system tray, and lightning-fast performance.
        </p>

        {/* ── Primary CTA ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {os === 'windows' ? (
            <DownloadButton
              icon={<Monitor size={20} />}
              label={downloaded ? '✓ Downloading…' : 'Download for Windows'}
              sublabel="Windows 10 / 11 · 64-bit · NSIS installer"
              onClick={() => handleDownload(WINDOWS_EXE_URL)}
              primary
            />
          ) : os === 'mac' ? (
            <>
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-3">
                  <DownloadButton
                    icon={<Apple size={20} />}
                    label="Mac (Apple Silicon)"
                    sublabel="M1 / M2 / M3 — coming soon"
                    onClick={() => {}}
                    disabled
                  />
                  <DownloadButton
                    icon={<Apple size={20} />}
                    label="Mac (Intel)"
                    sublabel="x64 — coming soon"
                    onClick={() => {}}
                    disabled
                  />
                </div>
                <p className="text-xs text-[#666]">macOS builds are in progress. <a href="https://github.com/Somesh-Thakur/Maina_Offical" target="_blank" rel="noreferrer" className="text-[var(--accent)] hover:underline">Watch the repo</a> for updates.</p>
              </div>
            </>
          ) : (
            <>
              <DownloadButton
                icon={<Monitor size={20} />}
                label="Download for Windows"
                sublabel="Windows 10 / 11 · 64-bit · .exe"
                onClick={() => handleDownload(WINDOWS_EXE_URL)}
                primary
              />
              <DownloadButton
                icon={<Apple size={20} />}
                label="Mac — Coming Soon"
                sublabel="macOS build in progress"
                onClick={() => {}}
                disabled
              />
            </>
          )}
        </div>

        {/* Other platforms / alternative formats */}
        <div className="flex flex-wrap justify-center gap-4 text-sm text-[#666]">
          {os !== 'windows' && (
            <button onClick={() => handleDownload(WINDOWS_EXE_URL)} className="hover:text-[#a3a3a3] transition-colors">
              Windows (.exe) ↓
            </button>
          )}
          {os === 'windows' && (
            <button onClick={() => handleDownload(WINDOWS_MSI_URL)} className="hover:text-[#a3a3a3] transition-colors">
              Windows (.msi alternative) ↓
            </button>
          )}
          <span className="text-[#444]">Mac — coming soon</span>
          <Link href="/" className="hover:text-[#a3a3a3] transition-colors">
            Use in browser →
          </Link>
        </div>

        {downloaded && (
          <div className="mt-6 flex items-center gap-2 text-green-400 text-sm animate-fade-in">
            <CheckCircle2 size={16} />
            <span>Download started! Run the installer and enjoy Maina.</span>
          </div>
        )}
      </section>

      {/* ── App preview mockup ───────────────────────────────────────── */}
      <section className="px-6 pb-16 flex justify-center">
        <div className="relative w-full max-w-4xl">
          {/* Fake window chrome */}
          <div className="rounded-t-xl bg-[#1a1a1a] border border-white/10 px-4 py-2.5 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            <span className="ml-2 text-xs text-[#555] font-mono">Maina v1.0</span>
          </div>
          <div className="rounded-b-xl overflow-hidden border border-t-0 border-white/10 shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/maina-logo.png"
              alt="Maina app screenshot"
              className="w-full object-cover bg-[#111]"
              style={{ minHeight: '300px', objectPosition: 'center top' }}
            />
          </div>
          {/* Discord RPC badge */}
          <div className="absolute bottom-6 right-6 bg-[#5865F2] rounded-xl px-4 py-3 shadow-2xl flex items-center gap-3 max-w-xs">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl shrink-0">🎵</div>
            <div>
              <div className="text-xs text-white/60 font-semibold uppercase tracking-wider mb-0.5">Listening to Maina</div>
              <div className="text-sm font-bold truncate">Tum Hi Ho</div>
              <div className="text-xs text-white/60">Arijit Singh</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 hover:border-[var(--accent)]/40 transition-colors">
              <Icon size={28} className="text-[var(--accent)] mb-3" />
              <h3 className="font-bold text-base mb-1">{title}</h3>
              <p className="text-sm text-[#a3a3a3]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Install steps ────────────────────────────────────────────── */}
      <section className="px-6 pb-24 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10">Up in 3 steps</h2>
        <div className="flex flex-col md:flex-row gap-6">
          {[
            { n: '1', title: 'Download',  body: 'Click the download button above for your platform.' },
            { n: '2', title: 'Install',   body: 'Run the installer. Choose desktop shortcut if you want.' },
            { n: '3', title: 'Enjoy',     body: 'Open Maina, play a song — Discord shows it automatically.' },
          ].map(step => (
            <div key={step.n} className="flex-1 text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/40 text-[var(--accent)] font-black text-xl flex items-center justify-center mx-auto mb-3">
                {step.n}
              </div>
              <h3 className="font-bold mb-1">{step.title}</h3>
              <p className="text-sm text-[#a3a3a3]">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-white/8 px-6 py-8 text-center text-[#555] text-sm">
        <p>Maina © 2025 · Free forever · <Link href="/" className="hover:text-white transition-colors">Open in browser</Link></p>
      </footer>
    </div>
  );
}

// ─── Reusable download button ──────────────────────────────────────────────

function DownloadButton({
  icon, label, sublabel, onClick, primary, disabled,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`flex items-center gap-3 px-6 py-3.5 rounded-xl font-semibold transition-all
        ${disabled
          ? 'bg-white/4 text-[#555] border border-white/5 cursor-not-allowed'
          : primary
          ? 'bg-[var(--accent)] text-white hover:brightness-110 active:scale-95 shadow-lg shadow-[var(--accent)]/20'
          : 'bg-white/8 text-white border border-white/10 hover:bg-white/12 active:scale-95'
        }`}
    >
      {icon}
      <div className="text-left">
        <div className="text-sm leading-tight">{label}</div>
        <div className="text-xs opacity-60 leading-tight">{sublabel}</div>
      </div>
      {!disabled && <Download size={16} className="ml-1 opacity-70 shrink-0" />}
    </button>
  );
}
