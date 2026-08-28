# Changelog

All notable changes to **Pocket Werewolf** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.3.0](https://github.com/AtaCanYmc/pocket-werewolf/compare/pocket-werewolf-v2.2.0...pocket-werewolf-v2.3.0) (2026-08-28)


### ✨ Features

* **chat:** implement real-time town square chat and reactions for day discussion and trial phases ([0eff388](https://github.com/AtaCanYmc/pocket-werewolf/commit/0eff3880f5f4bad3557e3712b0b595003f456dc1))
* **database:** add automated 02:00 AM daily game logs and stale rooms cleanup procedure ([9f30b07](https://github.com/AtaCanYmc/pocket-werewolf/commit/9f30b07bbacf64d343ad81e93966dd6a39bfbebb))
* **gameplay:** enable night action roles to pass/skip their action during the night ([fba295d](https://github.com/AtaCanYmc/pocket-werewolf/commit/fba295d4c05890db8e60ebc1be6a518db9e896a5))
* **voting:** lock lynch execution until every living player has cast their vote ([80de918](https://github.com/AtaCanYmc/pocket-werewolf/commit/80de918a3a8fd5c812cc13d7b3867ed5aceddc00))


### 🐛 Bug Fixes

* **chat:** prevent TownChat from scrolling the entire browser window down on mobile ([47a0077](https://github.com/AtaCanYmc/pocket-werewolf/commit/47a00771eed9f0b985c7b9b9bf2de07ae4f54051))
* **errors:** gracefully detect and handle Supabase HTTP 410 Gone / paused project status ([0972214](https://github.com/AtaCanYmc/pocket-werewolf/commit/09722144ecff98f51f9240c96a264fe9c3f2a3e0))
* **gameplay:** count werewolf pass action (target_id null) as completed in checkNightActionsStatus ([7393583](https://github.com/AtaCanYmc/pocket-werewolf/commit/7393583adebb04db63e8db463305b998d15971b1))
* **i18n:** complete all missing translation keys across EN, TR, FR, and DE dictionaries ([e1ac87b](https://github.com/AtaCanYmc/pocket-werewolf/commit/e1ac87ba707ab221096ffc4b2dd0ac99c856c71c))
* **layout:** compact mobile top bar header to prevent horizontal overflow on small screens ([c6384bd](https://github.com/AtaCanYmc/pocket-werewolf/commit/c6384bd95291fc53e013ef9890c4a9116455174e))
* **responsive:** enhance mobile and desktop viewport layouts, dynamic heights, and safe area fitting ([3a8763c](https://github.com/AtaCanYmc/pocket-werewolf/commit/3a8763cf751eddd87b784377c52f0e829ce99613))
* **security:** mask SUPABASE PROJECT URL field with visibility toggle in settings modal ([bff8edd](https://github.com/AtaCanYmc/pocket-werewolf/commit/bff8eddfb045905c612ba7ab9c30c986aa506e13))
* **sync:** implement instant optimistic UI updates and background heartbeat sync for zero-latency player state ([23c8567](https://github.com/AtaCanYmc/pocket-werewolf/commit/23c8567ef07ab7c0002f8a25791db392456f4dc9))
* **ui:** eliminate text concatenation collisions, fix mobile header layouts, and enhance responsive spacing ([36f44cc](https://github.com/AtaCanYmc/pocket-werewolf/commit/36f44cce49ea9ab0d683dc97e5a925195f21daf0))

## [2.2.0](https://github.com/AtaCanYmc/pocket-werewolf/compare/pocket-werewolf-v2.1.0...pocket-werewolf-v2.2.0) (2026-08-28)


### ✨ Features

* **deploy:** configure Vercel SPA routing, PWA caching, and add 1-click self-hosting guide ([508179f](https://github.com/AtaCanYmc/pocket-werewolf/commit/508179f069fbfecbb5800f620cfb4791168ae60b))
* **gameplay:** add Dream Math Minigame for sleeping villagers during night phase ([d68586e](https://github.com/AtaCanYmc/pocket-werewolf/commit/d68586e883c5f967ce1a29ed9ba37232c9ff14f4))
* **gameplay:** prevent host from advancing to dawn until all active night roles submit actions ([23af8ce](https://github.com/AtaCanYmc/pocket-werewolf/commit/23af8ce51dd4afd0efcac554e8d1d4216fa37089))
* **lifecycle:** implement 3-tier automated stale rooms cleanup and host disband purge ([2e00a76](https://github.com/AtaCanYmc/pocket-werewolf/commit/2e00a76633724d6ae89f27e34b2fde6fc7588016))
* **security:** add VITE_ADMIN_PASSWORD configuration to restrict room creation ([654ade9](https://github.com/AtaCanYmc/pocket-werewolf/commit/654ade942999242977bdab1f06a24a63e1df0564))
* **security:** control and verify admin room creation password dynamically in Supabase ([4613221](https://github.com/AtaCanYmc/pocket-werewolf/commit/461322113be4cf70f49d3208b30f2313dac05653))
* **share:** add instant QR code generator for room invitation ([a2ceaa3](https://github.com/AtaCanYmc/pocket-werewolf/commit/a2ceaa31a9ac090be9b4f2e3a7db0675c8ece63c))
* **voting:** allow casting blank/skip vote during town execution trial ([7c1c45c](https://github.com/AtaCanYmc/pocket-werewolf/commit/7c1c45c842eec6587c1925fd81e1cdd796518814))


### 📚 Documentation

* **readme:** add comprehensive Frequently Asked Questions (FAQ) section ([262e3ed](https://github.com/AtaCanYmc/pocket-werewolf/commit/262e3ed7769e9d1e30b834f8125fd3dd5dc3aadc))


### ♻️ Code Refactoring

* **security:** remove redundant VITE_ADMIN_PASSWORD env var in favor of pure Supabase RPC ([1f00110](https://github.com/AtaCanYmc/pocket-werewolf/commit/1f001101923c86c1e0015c13adcb807983927505))


### 👷 Continuous Integration

* **github-pages:** pass repository secrets and variables into Vite production build ([811ce7e](https://github.com/AtaCanYmc/pocket-werewolf/commit/811ce7e18f0c12a9c71cf76a1ef7a328dd5478af))

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
