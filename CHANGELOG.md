# Changelog

All notable changes to **Pocket Werewolf** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.1.0](https://github.com/AtaCanYmc/pocket-werewolf/compare/pocket-werewolf-v2.0.0...pocket-werewolf-v2.1.0) (2026-08-28)


### ✨ Features

* initialize Pocket Werewolf 2.0 with React, TypeScript, Tailwind CSS, and Supabase ([21bfeca](https://github.com/AtaCanYmc/pocket-werewolf/commit/21bfeca594e839dc4951ddcf87184afcd4e6f1d4))
* **pwa:** enable instant automatic service worker update and refresh ([2b59565](https://github.com/AtaCanYmc/pocket-werewolf/commit/2b59565b0d7d1492c88e934d073978d2343c9c48))
* **settings:** add in-app full SQL schema viewer, one-click copy, and Supabase dashboard integration ([810c2bd](https://github.com/AtaCanYmc/pocket-werewolf/commit/810c2bdc0591e08ab7b725ca793996f34ad5783d))
* **settings:** direct link to supabase/schema.sql on GitHub ([cc2ba33](https://github.com/AtaCanYmc/pocket-werewolf/commit/cc2ba33c064a7a75fb6d672010be02916b9b8484))


### 🐛 Bug Fixes

* **ui:** enhance modal header and content typography contrast for light mode ([1657137](https://github.com/AtaCanYmc/pocket-werewolf/commit/16571379df60e715982f4bb09afb439d8292c03b))


### 📚 Documentation

* create comprehensive open-source documentation suite ([21af4ef](https://github.com/AtaCanYmc/pocket-werewolf/commit/21af4eff4473abca395c738a1e22bdd059eb9761))


### 👷 Continuous Integration

* update to Node 22 LTS and configure deployment concurrency ([d249a61](https://github.com/AtaCanYmc/pocket-werewolf/commit/d249a6182396689e54bae356680f2338ab8968dd))

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
