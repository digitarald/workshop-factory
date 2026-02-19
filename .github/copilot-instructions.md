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

## Agent Guidance

1. If I don't specifically start in plan mode, don't switch for to planning but assume I want to start implementing.

## Architecture

**Workshop Factory** is a CLI tool that generates pedagogically structured workshops. It uses **OpenTUI** (React for terminals) for TUI and the **GitHub Copilot SDK** for AI generation.

### Screen Flow

The `workshop new` command renders a React app with screens chained via state machine in `src/index.tsx`:

```
Picker → Wizard → GenerationView → Summary ↔ ExportProgress
```

Each screen is an OpenTUI component that calls an `onComplete`/`onAction` callback to trigger the next screen. The parent `App` component holds `screen` state and the accumulated data (`wizardParams` → `workshop`). From Summary, users can export to Markdown (`[e]`) or generate a template repo (`[g]` → ExportProgress). ExportProgress errors route back to Summary with an inline error message.

### CLI Commands

- `workshop new [--context <files...>]` — Interactive wizard → AI generation
- `workshop regen <file> [sections] [--context <files...>]` — Regenerate specific sections
- `workshop export <file>` — Export to Markdown (instructor guide)
- `workshop generate <file>` — Generate a forkable template repo (slides + code scaffold + README)
- `workshop validate <file>` — Validate structure and pedagogy rules

### Generation Chain

The Copilot SDK drives a multi-step prompt chain defined in `src/prompts.ts`:

```
analyze (topic → subtopics, scope)
  → outline (structured module/section plan)
    → generate (per-module content streaming)
      → validate (pedagogical rule checks)
```

Pedagogy rules live in `prompts/WORKSHOP-PEDAGOGY.md` and are injected as system prompt context. The file is resolved relative to the package root via `import.meta.url`, not `process.cwd()`.

### Repo Generation Pipeline

The `generate` command (and `[g]` from Summary) runs 3 sequential SDK sessions in `src/exporters/repo-generate.ts`, each with a registered `write_file` tool:

```
slides (WORKSHOP-DESIGN.md) → scaffold (WORKSHOP-SCAFFOLD.md) → readme (WORKSHOP-README.md)
```

Design docs in `prompts/` are injected as system prompts. The `write_file` tool (`src/tools/writeFile.ts`) validates paths, prevents traversal/symlink escapes, and writes files into a sandboxed output directory. Static files (INSTRUCTOR.md, GitHub Actions workflow, .gitignore, LICENSE) are written directly after the SDK phases.

### Data Model

`src/schema.ts` defines Zod schemas as the **single source of truth** — TypeScript types are inferred via `z.infer`. The core type is `Workshop` containing `Module[]`, where each module has `Section[]` as a discriminated union on `type`:

- `lecture` — talking points
- `exercise` — instructions, starter_code, solution, hints
- `discussion` — prompts
- `checkpoint` — questions, expected_answers, explanations

Workshops are serialized as YAML via `src/storage.ts`.

### SDK Tool Registration

Custom tools in `src/tools/` use a `zodToSDKSchema()` wrapper (`src/tools/zodToSDKSchema.ts`) to convert Zod schemas to the JSON Schema format the Copilot SDK expects. Tool handlers validate incoming params with `.safeParse()` before processing.

The `writeFile` tool (`src/tools/writeFile.ts`) is special — it's instantiated per-generation with a bound output directory and progress callback via `createWriteFileTool()`. It includes multi-layer path validation: rejects absolute paths, traversal, null bytes, and resolves symlinks on the parent directory before writing.

### Build Pipeline

esbuild bundles `src/index.tsx` into a single `dist/workshop.js` file. External deps (`@opentui/core`, `@opentui/react`, `react`, `@github/copilot-sdk`) are not bundled — they resolve from `node_modules` at runtime. TypeScript compilation (`tsc --noEmit`) is used only for type checking, not code generation.

Prompt templates in `prompts/` (WORKSHOP-PEDAGOGY.md, WORKSHOP-DESIGN.md, WORKSHOP-SCAFFOLD.md, WORKSHOP-README.md) are **not bundled** — they ship as-is via `"files": ["dist", "prompts"]` in package.json and are read at runtime.

## Key Conventions

- **ESM with `.js` extensions** — All relative imports must use `.js` extensions (e.g., `import { foo } from './bar.js'`). Required by `"module": "nodenext"` in tsconfig.
- **OpenTUI components** — Components use lowercase `<box>` and `<text>` tags. Text colors via `fg` prop, bold via `attributes="bold"`, dim text via `opacity={0.5}`. Keyboard events via `useKeyboard` with `KeyEvent.name` checks.
- **Resolve paths via `import.meta.url`** — Never use `process.cwd()` or `__dirname` to find package files. Use `fileURLToPath(import.meta.url)` + `dirname()` + `join()`.
- **Zod schemas are runtime validators** — Used for type inference, YAML validation, and SDK tool parameter validation. When adding new data fields, update the Zod schema in `schema.ts` first.
- **Strict TypeScript** — `noUncheckedIndexedAccess` is enabled; array/object index access returns `T | undefined` and must be checked.
