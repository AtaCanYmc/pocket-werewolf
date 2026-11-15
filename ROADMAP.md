# Roadmap

This document outlines completed milestones and active technical goals for Pocket Werewolf. Milestones track stable releases managed through Conventional Commits and automated Release Please workflows.

## Current Release: v2.6.x

- [x] Modernize web platform compliance: standard CSS scrollbar styling (`scrollbar-color`, `scrollbar-width`) and root `<meta name="color-scheme">` state synchronization.
- [x] Update frontend toolchain: Vite 8, React 19, Vitest 5, and Tailwind CSS 3.
- [x] Add PWA installation guide modal with platform-specific instructions for iOS Safari and Android Chrome.
- [x] Implement procedural Web Audio synthesizer eliminating external audio asset requests.
- [x] Add localized search terms and 4-language i18n support (English, Turkish, French, German).

## v2.7.0: Gameplay & Moderation Refinements

- [ ] Add reconnect persistence token handling for momentary WebSocket drops during mobile network switches.
- [ ] Add configurable turn timers for individual night roles (customizable per room by host).
- [ ] Support custom role deck presets exported and imported via base64 JSON payload.
- [ ] Add room spectator mode for players eliminated in early rounds.

## v3.0.0: Extended Roles & Realtime Infrastructure

- [ ] Implement Cupid and Lovers dual-alignment mechanic in night resolution phase.
- [ ] Add Mayor / Sheriff election phase before initial town discussion.
- [ ] Optimize Supabase Realtime channel payloads with packed binary state diffs.
- [ ] Add end-to-end game state replay visualizer for post-match debriefing.
