# Local Development

## Requirements

- Node.js `>=24.13.0` (`nvm use`), npm `>=11`

## First Run

```bash
nvm use
npm install
npm run dev        # Vite on http://localhost:5173
```

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Build shared + frontend |
| `npm run lint` | Lint all workspaces |
| `npm run type-check` | `tsc --noEmit` in all workspaces |
| `npm run test` | Frontend test suite |

The app has one page: the builder at `/`.
