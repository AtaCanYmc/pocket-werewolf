# Changelog

All notable changes to **Pocket Werewolf** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-08-28

### 🚀 Major Architectural Rewrite
- **Serverless BaaS Migration**: Replaced legacy Node.js, Express, and Socket.io server infrastructure with **Supabase (PostgreSQL + Realtime Channels & Presence)**, achieving zero hosting costs and instantaneous real-time state synchronization.
- **Frontend Modernization**: Rewrote frontend from legacy vanilla JS/jQuery to **React 18 (Vite 5)** and **Tailwind CSS 3**.
- **100% Strict TypeScript**: Migrated entire codebase to TypeScript with strict type definitions for rooms, players, actions, votes, and game logs.

### ✨ Features
- **PWA Capabilities**: Full Progressive Web App support with offline caching, mobile safe-area paddings, and installable home screen experience on iOS/Android.
- **Dark & Light Mode Engine**: Atmosphere-aware theme engine with one-tap toggle in navigation header and settings modal.
- **4-Language i18n**: Multi-language runtime localization for English (🇬🇧), Turkish (🇹🇷), French (🇫🇷), and German (🇩🇪).
- **Procedural Audio Engine**: Web Audio API sound synthesizer producing atmospheric wolf howls, church bells, death gongs, and victory fanfares without MP3 bandwidth overhead.
- **3D Card Flip**: Interactive CSS 3D role reveal cards preventing screen peeking.
- **Automated CI/CD**: GitHub Actions pipeline for automated builds, linting, and continuous deployment to GitHub Pages.
- **Release Please & Dependabot**: Automated semantic versioning, changelog generation, and dependency security updates.

### 🎭 Supported Roles
- **Good Team**: Villager, Seer, Doctor, Witch, Hunter, Mason.
- **Evil Team**: Werewolf, Dream Wolf, Sorceress, Blind Minion, Knowing Minion.
