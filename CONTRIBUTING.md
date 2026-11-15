# Contributing to Pocket Werewolf

Thank you for contributing to Pocket Werewolf. This document outlines development workflows, code standards, and verification requirements for pull requests.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Development Setup](#development-setup)
- [Architecture Overview](#architecture-overview)
- [Branching and Workflow](#branching-and-workflow)
- [Commit Message Conventions](#commit-message-conventions)
- [Verification Requirements](#verification-requirements)
- [Adding Roles or Translations](#adding-roles-or-translations)
- [License Terms](#license-terms)

## Code of Conduct

All contributors are expected to adhere to our [Code of Conduct](./CODE_OF_CONDUCT.md). Please maintain professional and constructive communication across issues, discussions, and pull requests.

## Development Setup

### Prerequisites

- Node.js `^20.19.0 || >=22.12.0`
- npm `10.x` or higher
- A free Supabase account for backend database and Realtime channel verification

### 1. Clone and Install

```bash
git clone https://github.com/AtaCanYmc/pocket-werewolf.git
cd pocket-werewolf
npm install
```

### 2. Configure Environment

Copy the example configuration:

```bash
cp .env.example .env
```

Populate `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Credentials can also be configured dynamically at runtime inside the in-app Settings dialog.

### 3. Initialize Database Schema

1. Open your Supabase Dashboard and navigate to the **SQL Editor**.
2. Run the SQL statements provided in [`supabase/schema.sql`](./supabase/schema.sql).

### 4. Run Development Server

```bash
npm run dev
```

The application starts locally at `http://localhost:5173`.

## Architecture Overview

Pocket Werewolf is a serverless Progressive Web Application (PWA).

- **Frontend:** React 19 and Vite 8
- **Language:** TypeScript 7 with strict type checking
- **Styling:** Tailwind CSS 3 with CSS custom properties for theme resolution
- **Backend and Realtime:** Supabase (PostgreSQL with Row Level Security and Realtime Channels)
- **Audio:** Web Audio API procedural synthesis with zero external MP3 assets

Refer to [`ARCHITECTURE.md`](./ARCHITECTURE.md) for detailed sequence diagrams and database specifications.

## Branching and Workflow

1. Fork the repository on GitHub.
2. Create a focused branch from `main`:
   ```bash
   git checkout -b feat/role-cupid
   # or
   git checkout -b fix/vote-tally-stalemate
   ```
3. Implement changes with corresponding test updates.
4. Execute verification commands locally before opening a pull request.
5. Push the branch to your fork and open a pull request against `main`.

## Commit Message Conventions

This project enforces [Conventional Commits](https://www.conventionalcommits.org/) to automate semantic versioning and changelog generation via Release Please.

Format: `<type>(<scope>): <subject>`

### Accepted Types

- `feat`: A new role, capability, or user-facing mechanic
- `fix`: A defect fix or state desynchronization resolution
- `docs`: Documentation, governance, or README updates
- `style`: Formatting or visual polish with no logic changes
- `refactor`: Structural reorganization without behavioral modification
- `perf`: Performance improvement or bundle size reduction
- `test`: Addition or refactoring of test suites
- `chore`: Tooling, dependency, or configuration updates
- `ci`: GitHub Actions workflow maintenance

## Verification Requirements

Every pull request must pass the local test suite and production build pipeline with zero TypeScript errors:

```bash
# Run unit tests
npm test

# Run strict TypeScript check and production packaging
npm run build
```

## Adding Roles or Translations

### Adding a New Translation (i18n)

1. Add the language code to `LanguageCode` in [`src/types/game.ts`](./src/types/game.ts).
2. Register the language entry in `SUPPORTED_LANGUAGES` inside [`src/i18n/translations.ts`](./src/i18n/translations.ts).
3. Provide dictionary translations matching the English reference schema.

### Adding a New Game Role

1. Add the role identifier to `RoleId` in [`src/types/game.ts`](./src/types/game.ts).
2. Register role configuration and team alignment in [`src/config/roles.ts`](./src/config/roles.ts).
3. Place vector illustration assets in `public/assets/roles/`.
4. Implement night action logic in [`src/services/nightService.ts`](./src/services/nightService.ts) and win conditions in [`src/services/winCondition.ts`](./src/services/winCondition.ts).
5. Add corresponding phase UI components in [`src/components/game/`](./src/components/game/).
6. Add unit tests under [`tests/services/`](./tests/services/).

## License Terms

By submitting contributions to Pocket Werewolf, you agree that your work will be licensed under the terms of the project's [GNU General Public License v3.0](./LICENSE).
