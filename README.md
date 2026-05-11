<div align="center">

<img src="https://raw.githubusercontent.com/Somesh-Thakur/Maina_Offical/main/image.png" alt="Maina Logo" width="180" />

# MAINA

### The Best Voice. All Songs. One Place.

**A free, open-source music streaming app with Discord Rich Presence, synced lyrics, and a beautiful dark UI.**

<br/>

[![Live App](https://img.shields.io/badge/▶%20Open%20Live%20App-1a1a2e?style=for-the-badge&logo=vercel&logoColor=white)](https://maina-offical.vercel.app)
[![Download](https://img.shields.io/badge/⬇%20Download%20Desktop-5865F2?style=for-the-badge&logo=windows&logoColor=white)](https://maina-offical.vercel.app/download)
[![GitHub Stars](https://img.shields.io/github/stars/Somesh-Thakur/Maina_Offical?style=for-the-badge&color=FFD700&logo=github)](https://github.com/Somesh-Thakur/Maina_Offical/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br/>

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎵 **Millions of Songs** | Stream any track instantly — no buffering, no sign-up required |
| 🟣 **Discord Rich Presence** | Show friends exactly what you're listening to, like Spotify |
| 📝 **Synced Lyrics** | Word-by-word karaoke-style lyrics powered by LRCLib |
| ⚡ **Speed Play** | Pin your favourite tracks for one-tap instant access |
| 🎨 **Beautiful Dark UI** | Glassmorphism design with smooth micro-animations |
| 📱 **Playlists & Library** | Create playlists, like songs, build your personal library |
| 💻 **Desktop App** | Native Windows & macOS app via Tauri — runs in your system tray |
| ⌨️ **Keyboard Shortcuts** | Full keyboard navigation + global media keys in the desktop app |
| 🌐 **Works in Browser too** | No install needed — just open the web app and play |

---

## 🖥️ Desktop App

The Maina desktop app wraps the web experience in a **native frameless window** with deep system integration:

- 🟣 **Discord Rich Presence** — "Listening to Maina" with album art thumbnail and a "Listen on Maina" button
- 🔔 **System Tray** — minimize to tray, Play/Pause/Next from the tray menu
- ⌨️ **Global Media Keys** — Play/Pause, Next, Previous work from anywhere
- 🪟 **Custom Title Bar** — frameless, drag-anywhere design that matches the UI

### Download

| Platform | Download | Notes |
|---|---|---|
| **Windows 10/11** (Recommended) | [Maina_1.0.0_x64-setup.exe](https://github.com/Somesh-Thakur/Maina_Offical/raw/main/Maina_1.0.0_x64-setup.exe) | NSIS installer, 1.9 MB |
| **Windows 10/11** (Alternative) | [Maina_1.0.0_x64_en-US.msi](https://github.com/Somesh-Thakur/Maina_Offical/raw/main/Maina_1.0.0_x64_en-US.msi) | MSI installer, 2.7 MB |
| **macOS** (Apple Silicon) | 🔜 Coming Soon | GitHub Actions CI in progress |
| **macOS** (Intel) | 🔜 Coming Soon | GitHub Actions CI in progress |

> 💡 Visit **[maina-offical.vercel.app/download](https://maina-offical.vercel.app/download)** for the interactive download page.

---

## 🚀 Quick Start (Web)

Just open **[maina-offical.vercel.app](https://maina-offical.vercel.app)** — no sign-up, no install, no ads.

---

## 🛠️ Running Locally

### Prerequisites

```
Node.js >= 18
npm >= 9
```

### 1. Clone & install

```bash
git clone https://github.com/Somesh-Thakur/Maina_Offical.git
cd Maina_Offical
npm install
```

### 2. Start the dev server

```bash
npm run dev
# Open http://localhost:3000
```

---

## 🖥️ Desktop App — Dev Setup

The desktop app uses [Tauri v2](https://tauri.app) (Rust) wrapping the Next.js frontend.

### Additional prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Windows only: Install Microsoft C++ Build Tools
# https://visualstudio.microsoft.com/visual-cpp-build-tools/
```

### Run in dev mode

```bash
cd maina-desktop
npm install
npm run dev
# Starts Next.js on :3000 + Tauri window automatically
```

### Build production installer

```bash
cd maina-desktop
npm run build
# → src-tauri/target/release/bundle/
#     nsis/Maina_*_x64-setup.exe    (Windows)
#     msi/Maina_*_x64_en-US.msi     (Windows MSI)
#     dmg/Maina_*.dmg               (macOS — requires Mac)
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Space` | Play / Pause |
| `N` | Next track |
| `P` | Previous track |
| `M` | Toggle mute |
| `L` | Toggle lyrics panel |
| `Q` | Toggle queue |
| `F` | Toggle fullscreen player |
| `H` | Show all shortcuts |
| `↑` / `↓` | Volume up / down |
| `←` / `→` | Seek backward / forward |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 + TypeScript |
| **Styling** | Vanilla CSS (custom design system) |
| **State** | Zustand |
| **Music API** | JioSaavn |
| **Lyrics** | LRCLib (proxied server-side) |
| **Desktop** | Tauri v2 (Rust) |
| **Discord RPC** | discord-rich-presence (Rust) |
| **Deployment** | Vercel (web) + GitHub Actions (desktop builds) |

---

## 📋 Project Structure

```
Maina_Offical/
├── app/
│   ├── api/lyrics/         # Server-side lyrics proxy (fixes CORS)
│   ├── download/           # Desktop app download page
│   └── search/ playlist/   # Other pages
├── components/
│   ├── layout/             # Sidebar, MobileNav
│   ├── player/             # PlayerBar, FullscreenPlayer, LyricsPanel
│   ├── tracks/             # TrackCard, TrackRow
│   └── ui/                 # GlobalContextMenu, TauriTitleBar, modals
├── hooks/                  # useDiscordRPC, useLyrics, useLibrary
├── lib/                    # DB helpers, lrclib, YouTube API
├── store/                  # Zustand stores (player, library, modal)
├── public/                 # Static assets (logo, icons)
└── .github/workflows/      # CI: auto-build desktop installers
```

---

## 🤝 Contributing

Contributions are welcome! This is fully open-source.

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m 'feat: your feature'`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

### Ideas
- 🎨 UI theme picker
- 🌍 Internationalization
- 📱 Better mobile UX
- 🎤 Artist profile pages

---

## 📄 License

**MIT** — do whatever you want. A ⭐ is appreciated!

---

<div align="center">

Made with ❤️ by [Somesh Thakur](https://github.com/Somesh-Thakur)

**[Website](https://maina-offical.vercel.app) · [Download](https://maina-offical.vercel.app/download) · [Issues](https://github.com/Somesh-Thakur/Maina_Offical/issues)**

</div>
