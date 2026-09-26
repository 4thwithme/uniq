# Frontend — CLAUDE.md

React app and the 3D design builder for uniq. Read the root `CLAUDE.md` first. Rules: `.claude/rules/frontend/react.md`, `.claude/rules/frontend/three-builder.md`. Use the `react-best-practices` skill when you write or review React code.

## What Runs Today

- Vite 8 + React 19 + three.js 0.186 + `@react-three/fiber` 9 + `@react-three/drei` 10
- React Router 8 data router (`src/app/routes.tsx`): lazy routes: the builder at `/` and the design system at `/design-system`; every other path redirects to `/`. `AppLayout` full-screen shell, `RouteError` boundary
- Theme: `useThemeStore` (`src/store/theme-store.ts`) sets `data-theme` on `<html>`; colors are CSS variables in `src/styles/tokens.scss` for dark and light
- Builder: `BuilderPage` = header bar (brand, `HistoryToolbar`, `LanguageSelect`, `ThemeToggle`) + three-column workspace: tools `Panel` (`ToolsContent`: paint, lines, print, shapes, grip, overgrip, butt cap editors), viewport card (lazy `BuilderCanvas`, fold buttons, hints, Light switch), steps `Panel` (`StepsNav` + `CheckoutFooter`). All builder UI uses `src/components/*`; builder-only styles live in `BuilderPanel.module.scss`
- Builder state: `useDesignStore` (Zustand) holds the `DesignDocument`, selected zone, undo/redo stacks. Every edit is a `DesignCommand` from `src/builder/design/design-commands.ts`; commands with the same `mergeKey` inside 800 ms merge into one history step (color/slider scrubbing)
- Autosave: `useDesignAutosave` restores the draft on mount and saves to `localStorage` (`uniq:builder:draft:v1`) 500 ms after changes; drafts are validated with `isDesignDocument`
- `src/builder/models/Racket.tsx`: loads `public/models/racket.glb` with `useGLTF` (built from `data/Racket1.glb` by `npm run build:model`, see `docs/features/builder.md`). Meshes `zone_frame` (`FrameSurfaceMaterial`), `zone_throat` (`FrameSurfaceMaterial`, shaft canvas; shows frame paint/overlays while `shaftExtendsHead`), `zone_handle` (`GripMaterial`), `zone_strings`, `grommets`, and the butt cap. Gradient angle 0° runs along each zone's long axis: frame UV `u` follows the loop, handle UV `v` follows the height, so the handle texture is rotated 90° (`zone-texture-rotation.ts`); the shaft's UV `u` runs up the shaft. A 0° frame gradient has a visible seam where the loop closes unless first and last stop match. `racket-geometry.ts` dimensions still drive camera views and frame texture size.
- Dev server `:5173`

## Commands (`-w apps/frontend`)

| Command | What it does |
|---|---|
| `dev` | Vite dev server |
| `build:model` | Rebuild `public/models/racket.glb` from `data/Racket1.glb` |
| `build` | `tsc -b` then `vite build` |
| `type-check` | `tsc -b` (app + node configs) |
| `lint`, `lint:fix`, `format`, `code-quality-check` | Code quality |
| `test:unit`, `test:unit:coverage` | Vitest (jsdom), 95% coverage gate |
| `test` | quality checks + unit tests |

## Strictness

- **TypeScript** (`tsconfig.base.json`): `strict` + `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noUnusedLocals/Parameters`, `noUncheckedSideEffectImports`, `erasableSyntaxOnly` (no enums/namespaces/parameter properties), `verbatimModuleSyntax`, `strictBuiltinIteratorReturn`, `allowUnreachableCode: false`.
- **ESLint** (`eslint.config.mjs`): `strictTypeChecked` + `stylisticTypeChecked`, `react` recommended + jsx-runtime, `react-hooks` recommended-latest (incl. React Compiler rules), `jsx-a11y` **strict**, `react-refresh`, `@react-three` rules, `import` rules, Prettier. Extra: `strict-boolean-expressions`, `switch-exhaustiveness-check`, `explicit-function-return-type`, `consistent-type-imports`, `no-default-export`, no relative imports (aliases only), banned libs (MUI, Tailwind, Redux Toolkit — proposed), `custom-rules/require-object-params`, function-declaration components.
- **Path aliases**: `@app`, `@pages`, `@builder`, `@components`, `@hooks`, `@store`, `@styles`, `@assets`, `@app-types` (kept in sync in `tsconfig.app.json`, `vite.config.ts`, `eslint.config.mjs`).
- **CSS modules are typed**: `npm run css-types` (run automatically by `dev`, `build`, `type-check`) generates `*.module.scss.d.ts` with `typed-scss-modules` (also run by `lint`), so `styles.page` is type-checked and typos fail. Generated files are git-ignored; run `css-types:watch` while editing SCSS.
- **Named params in JSX**: the custom rule exempts inline JSX attribute callbacks (`onClick={(event) => …}`) — React owns their signature. Other DOM listeners need an `eslint-disable-next-line custom-rules/require-object-params`.
- **r3f intrinsic props**: `react/no-unknown-property` is off only under `src/builder/{scene,models,materials}` — TypeScript already checks r3f JSX props.

## Stack

| Category | Tech |
|---|---|
| Build | Vite, TypeScript strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, ...) |
| UI | React, React Router, SCSS modules + design tokens |
| 3D | `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing` |
| Assets | glTF/GLB racket models, Draco / Meshopt compression, KTX2 textures, HDR environment maps |
| State | Zustand (`src/builder/store`, `src/store`) |
| Server data | TanStack Query over a typed API client (`src/api/`) |
| Forms | React Hook Form + schema validation |
| Tests | Vitest + jsdom + Testing Library, `@react-three/test-renderer` for 3D components, Playwright (not set up yet) |

Banned (proposed styling decision, enforced by `no-restricted-imports`; remove there if the decision changes): Tailwind, MUI, Redux Toolkit. Also banned: default exports (except where a tool needs them, like route lazy loading).

## Source Layout

```
src/
├── app/              # App shell, router, providers, error boundaries
├── pages/            # builder
├── builder/          # the 3D design builder
│   ├── scene/        # Canvas, camera, lights, environment, controls
│   ├── models/       # Racket model loading, zone meshes
│   ├── materials/    # Paint materials: color, finish, gradient, pattern
│   ├── decals/       # Stickers and text projected onto the frame
│   ├── layers/       # Layer stack ops (add, move, lock, hide, blend)
│   ├── history/      # Undo/redo (command pattern over the design document)
│   ├── export/       # Screenshot / PNG export
│   └── ui/           # Panels, toolbars, color pickers, layer list
├── components/       # Design-system components (Button, Panel, Slider, ...)
├── hooks/            # Shared hooks
├── store/            # Global stores (theme)
├── styles/           # Design tokens, global SCSS
├── assets/           # Models, textures (source files)
├── types/
public/models/        # Built GLB files served as static assets
tests/                # Playwright e2e
```

## Pages

| Route | Page |
|---|---|
| `/` | Builder |
| `/design-system` | Tokens and components reference |
| `*` | Redirect to `/` |

## Builder Principles

- The **design document** (`@uniq/shared`) is the single source of truth. The 3D scene is a pure view of it.
- Every edit is a **command** (`apply` / `revert`) on the document. That gives undo/redo, autosave and sync for free.
- Keep high-frequency changes (dragging, color picking) out of React re-renders. Use refs + `useFrame`, and commit to the store on pointer up.
- Keep scene code free of DOM and UI imports.
