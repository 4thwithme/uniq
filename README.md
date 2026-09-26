# uniq

A platform where customers design their own tennis racket paintjobs, stickers and themes.

Customers pick a racket, see it in 3D, start from a ready-made design or build their own, and order it. From each finished paintjob we make mockup files that open in Lightroom, Photoshop and Figma.

## What it does

- **Pick a racket.** Choose a racket model.
- **See it in 3D.** The racket renders live in the browser with three.js. You can spin it, zoom in and change the light.
- **Design it.** Start from a ready theme or a blank racket. Add paint zones, colors, finishes, gradients, patterns, stickers and text.
- **Save.** Designs autosave in the browser. Undo/redo is built in.
- **Export mockups.** Get your design as a PNG/TIFF (Lightroom), a layered PSD (Photoshop) or SVG/PDF (Figma).

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React, TypeScript, Vite, three.js (react-three-fiber + drei) |
| Shared | `packages/shared`: design schema and types used by the frontend |

## Repository layout

```
uniq/
├── apps/
│   └── frontend/        # React + three.js app and the 3D design builder
├── packages/
│   └── shared/          # Design (paintjob) schema, shared types and constants
├── docs/                # Feature docs (docs/features/*)
├── .claude/rules/       # Coding rules for Claude Code (frontend/)
├── PRODUCT.md           # Strategy: who, what, why
├── DESIGN.md            # Visual system (tokens + rules)
├── CLAUDE.md            # Main guide for Claude Code
└── PLAN.md              # Roadmap, features and priorities
```

## Features and priority

Higher number = more important.

| Feature | Priority | Doc |
|---|---|---|
| 3D design builder (three.js) | **10** | [docs/features/builder.md](docs/features/builder.md) |

Mockup export is part of the builder: [docs/features/mockup-export.md](docs/features/mockup-export.md).

See [PLAN.md](PLAN.md) for phases and open decisions.

## Getting started

Requirements: Node.js `>=24.13.0` (see `.nvmrc`), npm `>=11`.

```bash
nvm use
npm install
npm run dev        # http://localhost:5173
```

Design system: http://localhost:5173/design-system ([docs/features/design-system.md](docs/features/design-system.md)).

More: [docs/development.md](docs/development.md).
