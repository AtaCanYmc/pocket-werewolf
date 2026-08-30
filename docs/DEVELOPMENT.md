# Pocket Werewolf - Developer Guide & Local Environment 🛠️

Welcome to the Pocket Werewolf development guide. This document covers setting up the local environment, test suites, database seeding, and component architecture.

---

## 1. Quick Start

### Prerequisites
- Node.js >= 20
- npm >= 10

### Installation
```bash
git clone https://github.com/AtaCanYmc/pocket-werewolf.git
cd pocket-werewolf
npm install
```

### Start Development Server
```bash
npm run dev
```

---

## 2. Automated Testing Suite

We use **Vitest** and **React Testing Library** for fast, reliable unit & integration tests.

### Run All Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

---

## 3. Database Seeding & Mock Environments

To test complex game mechanics (e.g. 6-player matches with Wolves, Seer, Doctor, Witch, Voting, and Night abilities) without connecting multiple physical devices, you can seed a mock room directly.

### Method 1: SQL Seeding in Supabase Dashboard
1. Open your Supabase project dashboard -> **SQL Editor**.
2. Run the SQL script from [`supabase/seed.sql`](../supabase/seed.sql).
3. Open the web app and join using room code **`TEST`**.
4. You will immediately enter a pre-configured, live Round 1 Day Discussion phase with 6 players and active night logs.

### Method 2: Local Mock Fixtures (`src/utils/mockData.ts`)
The project provides ready-to-use mock models for all game entities:
- `MOCK_ROOM` (Configurable phase state, round, deck, timers)
- `MOCK_PLAYERS` (6 players with complete roles, team assignments, alive/dead state)
- `MOCK_NIGHT_ACTIONS` (Night attack, inspection, doctor heal)
- `MOCK_VOTES` (Ballots and skip votes)
- `MOCK_GAME_LOGS` (Narrative results and chat events)

---

## 4. Architecture & Service Boundaries

The codebase follows a modular clean service architecture:

```
src/
├── services/
│   ├── winCondition.ts     # Pure victory rule evaluator
│   ├── nightService.ts     # Night abilities, action checker, casualty calculator
│   ├── voteService.ts      # Voting submission, vote tally calculator, lynch resolution
│   ├── roomService.ts      # Room lifecycle, code generation, deck shuffling
│   ├── adminService.ts     # Supabase RPC admin verification
│   ├── chatService.ts      # Town square messaging
│   └── gameEngine.ts       # Unified facade re-export
├── hooks/
│   ├── useRealtimeRoom.ts  # Realtime WebSocket subscriptions & presence
│   ├── useRoomActions.ts   # Room creation, joining, ready toggle, kick, deck
│   └── usePhaseActions.ts  # Phase transitions, voting, night actions, resets
├── context/
│   ├── GameContext.tsx     # Lean coordinator provider
│   ├── LanguageContext.tsx # Multi-language i18n
│   ├── ThemeContext.tsx    # Dark/Light theme provider
│   └── ToastContext.tsx    # Global alert/toast notification engine
└── utils/
    ├── errors.ts           # Type guards and standardized error formatting
    ├── haptics.ts          # Mobile vibration engine
    ├── audio.ts            # Web Audio API procedural sound engine
    └── logger.ts           # Configurable log-level structured logger
```

---

## 5. Code Guidelines
- **Strict Typing:** Avoid `any` types; prefer strict interfaces and type guards (`isPostgrestError`, `NightActionResult`).
- **Mobile First:** Ensure all touch targets are at least 44px (`.touch-target`) and responsive cards wrap or single-column on mobile.
- **Haptic & Audio:** Use `haptics.selection()` / `haptics.impact()` for interactive player actions.
