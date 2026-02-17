## Plan: Workshop Factory CLI

**TL;DR**: A CLI tool that turns a topic + audience + optional context docs into a pedagogically structured, self-contained workshop — with exercises, checkpoints, and exportable materials. Powered by the Copilot SDK. Slim TUI (wizard → generation → done), strong generation quality, context injection for freshness. TypeScript + Ink 6 + `@github/copilot-sdk`.

---

### How the MVP maps to the Product Brief

| Pain Point | How MVP addresses it |
|---|---|
| **Stale content** | `--context` flag injects feature briefs, docs, release notes into generation. Targeted `workshop regen` updates specific sections with new context. |
| **Audience adaptation** | Wizard captures audience level + stack. Generation adapts practice/lecture ratio, exercise complexity, and code examples to match. |
| **Weak pedagogy** | SKILL.md encodes Bloom's taxonomy, 60/25/15 practice-first ratio, checkpoint spacing. `validate_structure` tool enforces these rules. |
| **Not self-contained** | YAML bundles content, starter code, solutions, checkpoints. Export to Markdown or HTML produces a single portable artifact. |

| Scenario | How MVP enables it |
|---|---|
| **Product team → feature adoption** | `workshop new --context feature-brief.md release-notes.md` → generate → `workshop export --format md` alongside repo. Later: `workshop regen sections 3,5 --context updated-docs.md` |
| **Team lead → upskilling** | `workshop new` → wizard (topic: Docker, audience: Python/FastAPI backend team, 2hr) → exercises use their stack. |
| **Educator → multi-level** | Run `workshop new` three times with different difficulty presets (beginner/intermediate/advanced) on same topic → `workshop export --format html` for each. |

---

### Data Model

```
Workshop
  title, topic, audience: { level, stack?, size? }
  duration, difficulty: beginner | intermediate | advanced
  prerequisites[]
  context_sources: string[]       ← paths to injected docs
  └─ Module[]
       title, duration, learning_objectives[] (Bloom's-tagged)
       └─ Section[]
            type: lecture | exercise | discussion | checkpoint
            duration
            ├─ talking_points[] (lecture)
            ├─ instructions, starter_code, solution, hints[] (exercise)
            ├─ prompts[] (discussion)
            └─ questions[], expected_answers[], explanation[] (checkpoint)
```

Key model features:
- `context_sources` — tracks what docs were injected so regeneration can reference updated versions
- `learning_objectives` tagged with Bloom's level (remember → create)
- `hints[]` on exercises — scaffolded help
- `explanation[]` on checkpoint answers — the testing effect requires feedback
- `prompts[]` on discussions — structured, not freeform

Stored as **YAML** (human-readable, git-diffable, hand-editable).

---

### CLI Commands (MVP)

```
workshop new [--context <files...>]       Interactive wizard → generate → save YAML
workshop regen <file> [sections] [--context <files...>]   Regenerate specific sections with optional new context
workshop export <file> --format md|html   Export to Markdown or HTML
workshop validate <file>                  Check pedagogical + structural validity
```

No TUI browser/editor in MVP — users edit YAML directly or re-run regen.

---

### TUI Screens (MVP — 3 screens only)

| Screen | Purpose |
|---|---|
| **Wizard** | Topic → Audience (level + stack) → Duration → Difficulty → Context files → Confirm |
| **Generation** | Streaming progress: module tree (left) builds out as sections stream in (right) |
| **Summary** | Workshop stats (duration breakdown, practice%, checkpoint count), save path, export prompt |

Deferred: Home (workshop list), Browser (two-panel view), Section Actions (inline editing).

---

### Tech Stack

- **TypeScript** + **Ink 6** (React for CLI)
- **`@github/copilot-sdk`** — CopilotClient, streaming sessions, custom tools
- **Zod** — schema validation
- **YAML** (`js-yaml`) — storage
- **marked** — HTML export

---

### Copilot SDK Integration

**SKILL.md** — encodes workshop pedagogy rules the model must follow:
- Bloom's taxonomy: objectives must use action verbs at appropriate cognitive levels per difficulty
- Practice-first ratio: ≥60% exercises/discussion, ≤25% lecture, ≥15% checkpoints
- Exercise timing: allocate 2-3x the "just do it" time
- Checkpoint spacing: every ~20-25 minutes of content
- Scaffolding: worked examples → guided practice → independent problems
- Stack adaptation: code examples must match audience's declared stack
- Context grounding: when context docs are provided, exercises and examples must reference them

**Custom Tools:**
1. `save_workshop` — persist generated workshop as YAML
2. `load_workshop` — read existing workshop for regeneration
3. `validate_structure` — enforce:
   - Total section durations sum to workshop duration (±5min tolerance)
   - Every exercise has starter_code + solution
   - Checkpoints appear every ≤25min of content
   - Practice ratio ≥60% of total duration
   - All learning objectives use Bloom's action verbs
   - Context sources exist on disk (warning if missing)

**Generation chain:**
1. **Analyze** — topic + audience + context docs → subtopics, scope, prerequisite check
2. **Outline** — structured module/section plan with timing, types, objectives
3. **Generate** — section-by-section streaming (allows targeted regen later)
4. **Validate** — run validate_structure, flag issues, auto-fix timing if needed

---

### Steps

**Phase 1: Scaffold** (parallel)
1. Init TypeScript + Ink 6 project with `bin` entry, tsconfig, package.json
2. Zod schemas for Workshop data model + YAML serialization/deserialization
3. Copilot SDK client wrapper — lifecycle management, session factory, streaming helpers

**Phase 2: Generation Engine** (sequential, depends on Phase 1)
4. Context loader — read `--context` files, chunk/summarize if needed, inject into prompts
5. SKILL.md — workshop pedagogy rules (Bloom's, ratios, scaffolding, checkpoint frequency)
6. Prompt chain: analyze → outline → section-by-section streaming generation (*parallel with 5*)
7. Custom tools: save_workshop, load_workshop, validate_structure (with pedagogical checks)

**Phase 3: CLI + TUI** (depends on Phase 2)
8. CLI command routing: `new`, `regen`, `export`, `validate`
9. Wizard screen — multi-step form (topic, audience level + stack, duration, difficulty, context files)
10. Generation screen — streaming progress with module tree + live section content
11. Summary screen — stats (practice%, checkpoint count, duration breakdown), save confirmation

**Phase 4: Regeneration** (depends on Phase 2 + 3)
12. Section-level regeneration: `workshop regen <file> [sections]` with optional updated `--context`
13. Preserve unchanged sections, re-validate after regen

**Phase 5: Export** (parallel with Phase 3, depends on Phase 1-2)
14. Markdown exporter — single file with full heading structure, code blocks for exercises
15. HTML exporter — single-page dark-themed site, print-friendly, self-contained

**Phase 6: Polish**
16. Error handling, graceful SDK disconnection, loading states, helpful error messages
17. README with usage examples, sample generated workshop

---

### Relevant Files

- `src/index.tsx` — CLI entry, command routing (`new`, `regen`, `export`, `validate`)
- `src/client.ts` — Copilot SDK wrapper (lifecycle, sessions, streaming)
- `src/schema.ts` — Zod schemas (Workshop, Module, Section variants)
- `src/storage.ts` — YAML read/write, context file loader
- `src/prompts.ts` — System prompts, generation chain (analyze → outline → generate)
- `src/tools/save.ts`, `load.ts`, `validate.ts` — Custom SDK tools
- `src/components/Wizard.tsx` — Multi-step creation form
- `src/components/GenerationView.tsx` — Streaming progress display
- `src/components/Summary.tsx` — Post-generation stats + next steps
- `src/exporters/markdown.ts`, `html.ts` — Export formatters
- `SKILL.md` — Workshop pedagogy rules for Copilot

---

### Verification

**Functional:**
1. `workshop new` → complete wizard → YAML output validates against Zod schema
2. `workshop new --context feature-brief.md` → generated exercises reference content from the brief
3. `workshop regen workshop.yaml 3,5 --context updated-docs.md` → only sections 3 and 5 change, rest preserved, references updated context
4. `workshop validate workshop.yaml` → reports practice ratio, checkpoint spacing, missing solutions
5. `workshop export workshop.yaml --format md` → valid Markdown, correct heading hierarchy, code blocks
6. `workshop export workshop.yaml --format html` → renders in browser, dark theme, print-friendly

**Quality:**
7. **Pedagogy check**: generated workshop has ≥60% practice time, checkpoints every ≤25min, Bloom's-aligned objectives
8. **Stack adaptation**: "Intro to Docker" for Python/FastAPI team → exercises use Python examples, not Java
9. **Cross-domain**: "Intro to Docker" (technical), "Effective 1:1s" (soft skills) — both produce valid, useful workshops
10. **Duration scaling**: 30min vs full-day → appropriate depth/breadth, section count scales correctly

---

### Decisions

- **Slim TUI for MVP** — Wizard + Generation + Summary only; defer browser/editor (users edit YAML or use regen)
- **`--context` flag over wizard step** — context injection via CLI for scriptability; wizard step deferred
- **Ink over Blessed** — actively maintained, React model, used by Claude Code/Gemini CLI
- **YAML over JSON** — human-editable, git-friendly, hand-tweakable
- **Section-by-section generation** — enables streaming UX, targeted regeneration, better quality
- **File-based, no database** — portable, version-controllable, works alongside repos
- **In scope**: Generation with context injection, audience adaptation, pedagogical validation, section regen, MD + HTML export
- **Out of scope (MVP)**: TUI browser/editor, multi-workshop variants from single run, collaborative editing, slide decks, LMS integration, participant tracking, web research during generation

---

### Further Considerations

1. **Web research for freshness**: Use MCP web_search to pull latest docs/versions during generation — would make "latest features" pain point even stronger but adds complexity + latency
2. **Multi-variant generation**: `workshop new --variants beginner,advanced` to generate difficulty variants in one run (educator scenario currently requires 3 separate runs)
3. **Expansion path**: HTML export with progress tracking → VS Code extension for authoring → GitHub Action to generate workshops from repo READMEs
