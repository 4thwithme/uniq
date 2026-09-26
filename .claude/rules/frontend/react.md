# React (frontend)

Use the `react-best-practices` skill when you write or review React code.

## Hard Rules

> Styling / UI-kit rules below are **proposed** until confirmed (see `PLAN.md` open decisions).

- TypeScript strict, extra flags (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, ...).
- **Named exports only.** Default exports only where a tool needs them (e.g. `React.lazy` route chunks).
- **Named props / params**: components take one props object; helpers take one destructured object.
- **No Tailwind, no MUI, no Redux Toolkit.**
- **Styling**: SCSS modules (`Component.module.scss`) + design tokens from `src/styles/tokens.scss`. No hard-coded colors, spacing or font sizes.
- **Themes**: every color is a CSS variable defined for both `[data-theme='dark']` and `[data-theme='light']`. Add new colors to both. Colors are OKLCH, except `--scene-*` (hex, read by three.js).
- **Design languages**: `data-language` (`uniq` / `head` / `velocity`) on `<html>` swaps token values. Never branch on language in components; add a role token instead (e.g. `--font-weight-control`).
- **Design system**: `DESIGN.md` is the visual contract. Reuse `src/components/*` (Button, IconButton, SegmentedControl, Select, StepNav, SwatchGrid, FileDrop, Slider, ColorField, TextField, Switch, Panel, Badge, Kbd) before writing new UI. Shared SCSS mixins: `src/styles/_mixins.scss` (`@use '../../styles/mixins' as *;`). A new component or token also goes on the `/design-system` page.
- **No comments** in code (except ESLint disables).
- No `console` in committed code.
- Use the View Transition API for page transitions where the browser supports it.

## Structure

```
src/pages/<page>/
├── <Page>.tsx
├── <Page>.module.scss
├── components/        # page-only components
└── <Page>.test.tsx

src/components/<Component>/
├── <Component>.tsx
├── <Component>.module.scss
└── <Component>.test.tsx
```

## Data

- Client state: small Zustand stores in `src/store/` (theme) and `src/builder/store/` (design + history). Read with selectors (`useDesignStore((s) => s.x)`), never the whole store. Tests reset stores in `tests/setup-tests.ts`.

## Routing

- Routes live in `src/app/routes.tsx` (`RouteObject[]`, `lazy` per page returning `{ Component }`). Test with `renderRoute({ path })` from `@tests/render-route`.
- Links use `viewTransition`.

- One route today: the builder at `/`. Unknown paths redirect to `/`.
- Routes lazy loaded per page. The three.js chunk loads lazily inside the builder.

## Performance

- Split big deps (three, postprocessing) into their own chunks.
- Images: modern formats, explicit sizes.

## Accessibility

- Every builder control is reachable by keyboard and has a label.
- Color pickers show hex input as well.
- Respect `prefers-reduced-motion` for camera animations.

## Testing

- 3D components: `create()` from `@react-three/test-renderer` (no WebGL needed). Assert meshes, names, materials, positions.
- `<Canvas>` wrappers (`src/builder/scene/BuilderCanvas.tsx`) need real WebGL: excluded from unit coverage, covered by Playwright later. Keep them thin — logic goes in components or pure functions.
- Mock the lazy canvas in page tests: `vi.mock('@builder/scene/BuilderCanvas', ...)`.
- Vitest + Testing Library for components and hooks.
- Playwright for flows: build a design, undo/redo, autosave restore.
