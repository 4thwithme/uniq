# CLAUDE.md

This file guides Claude Code (claude.ai/code) when it works in this repository.

## Project

**uniq** is a frontend-only app where customers design their own tennis racket paintjobs, stickers and themes in a 3D builder. No backend: data lives in the browser. Product overview: `README.md`. Roadmap: `PLAN.md`. Strategy: `PRODUCT.md`. Visual system: `DESIGN.md` (read it before any UI work).

## Tools & Requirements

- **Node.js**: >=v24.13.0 (see `.node-version`, `.nvmrc`)
- **npm**: >=11.0.0, npm workspaces (`apps/frontend`, `packages/shared`)
- **Frontend**: React, TypeScript (strict), Vite, three.js with `@react-three/fiber` + `@react-three/drei`
- **Testing**: Vitest + Testing Library + Playwright
- **Code quality**: ESLint v9 flat config, Prettier (`.prettierrc`, tabs, single quotes, width 90), Husky

## Monorepo Layout

```
apps/frontend/       React + three.js app and builder  → apps/frontend/CLAUDE.md
packages/shared/     Design schema + shared types       → packages/shared/CLAUDE.md
docs/features/       One doc per feature
docs/design/         Impeccable design-workflow reference
PRODUCT.md           Who, what, why (no visuals)
DESIGN.md            Tokens + visual rules (Google Stitch format)
.claude/rules/       frontend/*.md rules
```

## Key Commands

```bash
npm install          # install all workspaces
npm run dev          # Vite + React + three.js on :5173
npm run lint         # lint all workspaces
npm run type-check   # tsc --noEmit in all workspaces
npm run test         # full frontend suite
```

Full local setup: `docs/development.md`.

## Architecture

- **Design document** is the heart of the app. It is one JSON document (type in `packages/shared`) that describes a paintjob: racket model, zones, materials, layers, stickers, text. The builder edits it and autosaves it to local storage. Always change it through the shared schema, and give it a `schemaVersion` plus migrations for old documents.
- Pages: the builder at `/` and the design system at `/design-system`. Other paths redirect to `/`.

## Critical Rules

> Details in `.claude/rules/frontend/`.

- **Named parameters only**: every function takes one destructured object (`{ a, b }: { a: string; b: number }`).
- **No comments or explanations in code**, except ESLint disable directives.
- **No `console`** in committed code.
- **Always inspect existing files** before creating new ones, and match their patterns.
- **Design schema changes** go through `packages/shared` with a version bump and a migration for stored documents.
- No Tailwind, no MUI, no Redux Toolkit. SCSS modules + design tokens, named exports.
- **Design system first**: build UI from `src/components/*` and tokens in `src/styles/tokens.scss`. New tokens go in both themes, the catalog (`design-tokens.ts`), `DESIGN.md` and the `/design-system` page.
- **Three design languages** (UNIQ Studio, HEAD, Velocity) share token names; values live in `tokens.scss` and `src/styles/languages/`. A new themed token must be added to every language, dark and light. See `docs/design/languages/README.md`.

## Rules Index

| Rule file | Covers |
|---|---|
| `.claude/rules/frontend/react.md` | React structure, state, data fetching, styling |
| `.claude/rules/frontend/three-builder.md` | three.js / r3f builder rules and performance budget |

## Agents

Subagents in `.claude/agents/`: `code-quality`, `debug-specialist`.

## Documentation Policy

Every change that adds or changes behavior must update `docs/` in the same PR. Keep `PLAN.md` checkboxes current.

## Testing

Vitest for logic and components, Playwright for builder flows. Builder math (UV mapping, layer ops, undo/redo) must be unit tested.

## Git Workflow

- Branches: `<type>/<short-description>`, e.g. `feat/builder-decals`.
- Commits and PR titles: Conventional Commits `type(scope): description`. Types: `feat`, `fix`, `refactor`, `perf`, `style`, `test`, `docs`, `build`, `ops`, `chore`. Scopes: `builder`, `shared`, `frontend`, `docs`, `ci`.
- Squash merge only.
