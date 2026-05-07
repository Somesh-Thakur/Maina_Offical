'use client';
import React from 'react';

export default function SettingsPage() {
  return (
    <div className="p-6 md:p-10 pt-20 md:pt-10 max-w-4xl mx-auto flex flex-col gap-12">
      <header>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight">
          Settings
        </h1>
      </header>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-display font-bold">Data & Storage</h2>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Clear Local Data</h3>
              <p className="text-sm text-[#a3a3a3]">Remove all playlists, history, and settings.</p>
            </div>
            <button className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-md transition-colors font-medium text-sm">
              Clear Data
            </button>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-display font-bold">About Maina</h2>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 text-sm text-[#a3a3a3] leading-relaxed">
          <p className="mb-4">Maina is a premium, personal-use music player powered by YouTube and the Web Audio API.</p>
          <p>Version: 1.0.0</p>
        </div>
      </section>
    </div>
  );
}
