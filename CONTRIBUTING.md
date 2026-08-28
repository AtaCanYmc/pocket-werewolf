# Contributing to Pocket Werewolf 🐺

Thank you for your interest in contributing to **Pocket Werewolf**! We welcome contributions from developers of all skill levels. Whether you are fixing a bug, adding new roles, improving translations, or optimizing animations, your help is appreciated.

---

## 📜 Table of Contents
- [Code of Conduct](#-code-of-conduct)
- [Development Setup](#-development-setup)
- [Project Architecture](#-project-architecture)
- [Branching & Workflow](#-branching--workflow)
- [Commit Message Conventions](#-commit-message-conventions)
- [Pull Request Process](#-pull-request-process)
- [Adding New Roles or Languages](#-adding-new-roles-or-languages)

---

## 🤝 Code of Conduct
All contributors and participants are expected to adhere to our [Code of Conduct](./CODE_OF_CONDUCT.md). Please be respectful, constructive, and collaborative.

---

## 💻 Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) `>= 20.0.0` (v22 LTS recommended)
- [npm](https://www.npmjs.com/) `>= 10.0.0`
- A free [Supabase](https://supabase.com) account (for real-time multiplayer testing)

### 1. Clone & Install
```bash
git clone https://github.com/AtaCanYmc/pocket-werewolf.git
cd pocket-werewolf
npm install
```

### 2. Configure Environment
Copy the example environment file:
```bash
cp .env.example .env
```
Fill in your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. *(Alternatively, configure them dynamically in the in-app Settings modal)*.

### 3. Initialize Database Schema
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Run the SQL script from [`supabase/schema.sql`](./supabase/schema.sql).

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🏗️ Project Architecture

Pocket Werewolf is a 100% serverless Progressive Web Application (PWA):
- **Frontend:** React 18 + Vite 5
- **Language:** TypeScript 7 (Strict mode)
- **Styling:** Tailwind CSS 3 with custom CSS Variables for Dark/Light mode
- **BaaS & Realtime:** Supabase (PostgreSQL + Realtime Channels & Presence)
- **Audio:** Procedural Web Audio API (No heavy MP3/WAV files)

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for full architectural specifications.

---

## 🌿 Branching & Workflow

1. Fork the repository on GitHub.
2. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/my-new-feature
   # or
   git checkout -b fix/issue-description
   ```
3. Make your changes and verify with strict type checking and production build:
   ```bash
   npm run build
   ```
4. Push to your fork and submit a Pull Request to `main`.

---

## 📝 Commit Message Conventions

This project uses **[Conventional Commits](https://www.conventionalcommits.org/)** to automate changelogs and semantic versioning via **Release Please**.

Format: `<type>(<scope>): <short description>`

### Common Types:
- `feat:` A new feature (e.g., `feat(roles): add Cupid role`)
- `fix:` A bug fix (e.g., `fix(voting): resolve tie breaker edge case`)
- `docs:` Documentation updates (e.g., `docs(readme): add deployment diagram`)
- `style:` Formatting, missing semi colons, CSS styling tweaks
- `refactor:` Code refactoring without changing functionality
- `perf:` Performance improvements
- `test:` Adding or refactoring tests
- `chore:` Maintenance tasks, dependency updates (`chore(deps): ...`)
- `ci:` CI/CD pipeline changes (`ci: update github actions`)

---

## 🔄 Pull Request Process

1. Ensure `npm run build` runs cleanly with **0 TypeScript and Vite errors**.
2. Keep PRs focused on a single topic, bug, or feature.
3. Update relevant documentation if applicable.
4. Fill out the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).
5. Ensure CI pipeline checks pass.

---

## 🌐 Adding New Roles or Languages

### Adding a New Language (i18n):
1. Open [`src/types/game.ts`](./src/types/game.ts) and add the new `LanguageCode` (e.g. `'es' | 'it'`).
2. Open [`src/i18n/translations.ts`](./src/i18n/translations.ts):
   - Add the language metadata to `SUPPORTED_LANGUAGES`.
   - Add dictionary translations matching the `en` translation schema.

### Adding a New Role:
1. Add the role identifier to `RoleId` in [`src/types/game.ts`](./src/types/game.ts).
2. Define role attributes in [`src/config/roles.ts`](./src/config/roles.ts).
3. Add role illustrations to `public/assets/roles/`.
4. Implement action resolution handlers in [`src/services/gameEngine.ts`](./src/services/gameEngine.ts).
5. Add UI phase components in [`src/components/game/`](./src/components/game/).

---

## 📜 License
By contributing to Pocket Werewolf, you agree that your contributions will be licensed under the project's [MIT License](./LICENSE).
