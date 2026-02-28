# Copilot Instructions for Lister

## Overview

**Lister** is a React + TypeScript + Vite playground for prototyping one-page apps. It is hosted on GitHub Pages at [https://theinsomnolent.github.io/lister/](https://theinsomnolent.github.io/lister/). The repository is small (~10 source files) and grows by adding self-contained mini-apps inside `src/apps/`.

---

## Tech Stack

| Layer | Tool / Version |
|---|---|
| UI framework | React 19 |
| Language | TypeScript ~5.9 |
| Build tool | Vite 7 |
| Routing | React Router DOM 7 (HashRouter) |
| Icons | lucide-react |
| Linter | ESLint 9 with `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` |
| Node | 20 (used in CI) |
| Package manager | npm (use `npm ci` in CI; `npm install` locally) |

---

## Build & Validation

Always run these commands from the repository root in this order:

```bash
# 1. Install dependencies (required before any other step)
npm install

# 2. Lint – must pass with zero errors before a PR can merge
npm run lint

# 3. Build – produces ./dist; must succeed
npm run build

# 4. (Optional) Preview the production build locally
npm run preview

# 5. (Optional) Start the dev server
npm run dev
```

**There are no automated tests** (no test runner is configured). Validation is: lint passes + build succeeds.

The CI pipeline (`.github/workflows/deploy.yml`) runs `npm ci → npm run lint → npm run build` on every push to `main` and on manual dispatch. A failed lint or build will block deployment to GitHub Pages.

---

## Project Layout

```
.github/
  copilot-instructions.md   ← this file
  workflows/
    deploy.yml              ← CI/CD: lint + build + deploy to GitHub Pages
    auto-assign-issues.yml  ← auto-assigns new issues to @copilot
    auto-merge-copilot.yml  ← auto-approves + squash-merges copilot/* PRs (unless title starts with [WIP])
src/
  main.tsx                  ← entry point, mounts <App />
  App.tsx                   ← HashRouter + route definitions
  App.css                   ← global/app-level styles
  index.css                 ← base CSS reset / variables
  apps/                     ← one subdirectory per mini-app
    business-idea-generator/
    cross-stitch/
    fast-food-tracker/
  components/
    Layout.tsx              ← shared shell with top nav <Link> list
    Layout.css
    Home.tsx                ← landing page with app cards
    Home.css
public/                     ← static assets
eslint.config.js            ← ESLint flat config (targets **/*.{ts,tsx}, ignores dist/)
tsconfig.json               ← TypeScript project references root
tsconfig.app.json           ← app compiler options (strict, ES2020, bundler moduleResolution)
tsconfig.node.json          ← vite.config.ts compiler options
vite.config.ts              ← Vite config (React plugin, base: '/lister/')
package.json
```

---

## Adding a New App

Each new app follows the same four-step pattern:

1. **Create** `src/apps/<app-name>/<AppName>.tsx` (and any supporting files / CSS).
2. **Import and add a route** in `src/App.tsx`:
   ```tsx
   import { MyApp } from './apps/my-app/MyApp'
   // inside <Routes>:
   <Route path="apps/my-app" element={<MyApp />} />
   ```
3. **Add a nav link** in `src/components/Layout.tsx`:
   ```tsx
   <li><Link to="/apps/my-app">My App</Link></li>
   ```
4. **Add a card** on the home page in `src/components/Home.tsx`:
   ```tsx
   <Link to="/apps/my-app" className="app-card">
     <h2>🎯 My App</h2>
     <p>Short description.</p>
   </Link>
   ```

Do **not** use `BrowserRouter` — the project uses `HashRouter` because GitHub Pages does not support server-side routing.

---

## Code Style

- All source files use `.tsx` (even non-JSX files follow the pattern).
- Named exports are preferred for components (e.g., `export function MyApp() {}`).
- CSS lives in sibling `.css` files imported directly into the component file.
- No test files exist; do not add a test framework unless explicitly asked.
- Linting is strict: fix all ESLint errors before considering a task complete.

---

## PR & Automation Notes

- Copilot PRs on branches starting with `copilot/` are **automatically approved and squash-merged** by the `auto-merge-copilot.yml` workflow, provided the PR title does **not** start with `[WIP]`.
- Prefix the PR title with `[WIP]` to prevent auto-merge while work is in progress.
- The `auto-assign-issues.yml` workflow automatically assigns new issues to `@copilot`.

---

## Key Commands Cheat-Sheet

| Purpose | Command |
|---|---|
| Install deps | `npm install` |
| Lint (must pass) | `npm run lint` |
| Build (must pass) | `npm run build` |
| Dev server | `npm run dev` |
| Preview prod build | `npm run preview` |

Trust these instructions; only search the codebase if something appears incomplete or incorrect.
