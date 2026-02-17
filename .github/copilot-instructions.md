# Copilot Instructions for Workshop Factory

## Build, Lint, and Check Commands

```bash
npm run build        # Type-check (tsc --noEmit) then bundle (esbuild → dist/workshop.js)
npm run build:bundle # esbuild only (skip type-check, fast iteration)
npm run check        # Type-check only (tsc --noEmit)
npm run dev          # Type-check watch mode (tsc --watch --noEmit)
npm run lint         # ESLint on src/
npm run lint:fix     # ESLint with auto-fix
```

No test suite is configured yet.

## Architecture

**Workshop Factory** is a CLI tool that generates pedagogically structured workshops. It uses **Ink 6** (React for terminals) for TUI and the **GitHub Copilot SDK** for AI generation.

### Screen Flow

The `workshop new` command renders a React app with three screens chained via state machine in `src/index.tsx`:

```
Wizard → GenerationView → Summary
```

Each screen is an Ink component that calls an `onComplete`/`onAction` callback to trigger the next screen. The parent `App` component holds `screen` state and the accumulated data (`wizardParams` → `workshop`).

### Generation Chain

The Copilot SDK drives a multi-step prompt chain defined in `src/prompts.ts`:

```
analyze (topic → subtopics, scope)
  → outline (structured module/section plan)
    → generate (per-module content streaming)
      → validate (pedagogical rule checks)
```

Pedagogy rules live in `docs/SKILL.md` and are injected as system prompt context. The file is resolved relative to the package root via `import.meta.url`, not `process.cwd()`.

### Data Model

`src/schema.ts` defines Zod schemas as the **single source of truth** — TypeScript types are inferred via `z.infer`. The core type is `Workshop` containing `Module[]`, where each module has `Section[]` as a discriminated union on `type`:

- `lecture` — talking points
- `exercise` — instructions, starter_code, solution, hints
- `discussion` — prompts
- `checkpoint` — questions, expected_answers, explanations

Workshops are serialized as YAML via `src/storage.ts`.

### SDK Tool Registration

Custom tools in `src/tools/` use a `zodToSDKSchema()` wrapper (`src/tools/zodToSDKSchema.ts`) to convert Zod schemas to the JSON Schema format the Copilot SDK expects. Tool handlers validate incoming params with `.safeParse()` before processing.

### Build Pipeline

esbuild bundles `src/index.tsx` into a single `dist/workshop.js` file. External deps (`ink`, `react`, `@github/copilot-sdk`) are not bundled — they resolve from `node_modules` at runtime. TypeScript compilation (`tsc --noEmit`) is used only for type checking, not code generation.

## Key Conventions

- **ESM with `.js` extensions** — All relative imports must use `.js` extensions (e.g., `import { foo } from './bar.js'`). Required by `"module": "nodenext"` in tsconfig.
- **Ink 6 built-ins only** — Components use only `Box`, `Text`, `useInput`, `useApp` from `ink`. No third-party Ink component libraries.
- **Resolve paths via `import.meta.url`** — Never use `process.cwd()` or `__dirname` to find package files. Use `fileURLToPath(import.meta.url)` + `dirname()` + `join()`.
- **Zod schemas are runtime validators** — Used for type inference, YAML validation, and SDK tool parameter validation. When adding new data fields, update the Zod schema in `schema.ts` first.
- **Strict TypeScript** — `noUncheckedIndexedAccess` is enabled; array/object index access returns `T | undefined` and must be checked.
