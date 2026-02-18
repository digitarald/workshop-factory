# Contributing to Workshop Factory

Thank you for your interest in contributing!

## Development Setup

```bash
git clone https://github.com/digitarald/workshop-factory.git
cd workshop-factory
npm install
npm run dev  # Type-check watch mode
```

## Build & Lint

```bash
npm run build        # Type-check + bundle
npm run build:bundle # Bundle only (skip type-check)
npm run check        # Type-check only
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
```

## Pull Requests

1. Fork the repo and create a branch from `main`
2. Make your changes — keep PRs focused on a single concern
3. Ensure `npm run build` and `npm run lint` pass
4. Open a PR with a clear description of the change

## Key Conventions

- **ESM with `.js` extensions** — All relative imports use `.js` extensions (required by `"module": "nodenext"`)
- **Ink 6 built-ins only** — Components use `Box`, `Text`, `useInput`, `useApp` from `ink`
- **Resolve paths via `import.meta.url`** — Never use `process.cwd()` or `__dirname` for package files
- **Zod schemas first** — Update `src/schema.ts` before adding new data fields
- **Strict TypeScript** — `noUncheckedIndexedAccess` is enabled; check all indexed access

## Reporting Issues

Open an issue with:
- Steps to reproduce
- Expected vs actual behavior
- Node.js version and OS
