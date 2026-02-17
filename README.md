# Workshop Factory

**Generate pedagogically structured workshops from a topic + audience, powered by GitHub Copilot.**

Workshop Factory is an AI-powered CLI tool that creates complete, practice-focused workshop content with exercises, checkpoints, and exportable materials. Built on the GitHub Copilot SDK with Bloom's taxonomy alignment and practice-first pedagogy baked in.

---

## Features

- **AI-powered generation** — Uses GitHub Copilot SDK to generate complete workshop content from topic + audience + duration
- **Bloom's taxonomy alignment** — Learning objectives use appropriate cognitive action verbs (remember → create) based on difficulty level
- **Practice-first pedagogy** — Enforces ≥60% hands-on time (exercises + discussions), ≤25% lectures, ≥15% checkpoints
- **Context injection** — Reference feature briefs, API docs, or release notes via `--context` flag for up-to-date, grounded examples
- **Section-level regeneration** — Update specific sections with new context without regenerating the entire workshop
- **Multi-format export** — Export to Markdown or HTML for distribution alongside repositories
- **Pedagogical validation** — Structural and quality checks ensure practice ratios, checkpoint spacing, and exercise completeness
- **Interactive TUI wizard** — Guided workshop creation with streaming progress display
- **Stack adaptation** — Code examples automatically match your audience's technology stack (Python/FastAPI, Node.js/Express, etc.)

---

## Quick Start

```bash
# Install dependencies
npm install

# Build the CLI
npm run build

# Create your first workshop
node dist/workshop.js new
```

---

## Usage

### Create a New Workshop

Start the interactive wizard to generate a complete workshop:

```bash
# Interactive creation
workshop new

# With context documents for grounded examples
workshop new --context docs/feature-brief.md docs/release-notes.md
```

The wizard will prompt for:
- Topic (e.g., "Introduction to Docker")
- Audience level (beginner/intermediate/advanced)
- Technology stack (e.g., "Python/FastAPI")
- Duration (minutes)
- Difficulty preset

Workshops are saved as YAML files — human-readable, git-friendly, and hand-editable.

### Regenerate Sections

Update specific sections with fresh context or refinements:

```bash
# Regenerate sections 3 and 5 with updated docs
workshop regen my-workshop.yaml 3,5 --context updated-docs.md

# Regenerate all sections (omit section numbers)
workshop regen my-workshop.yaml --context new-context.md
```

Unchanged sections are preserved. Regeneration re-validates pedagogical rules.

### Export Workshop

Convert YAML workshops to distributable formats:

```bash
# Export to Markdown
workshop export my-workshop.yaml --format md

# Export to HTML (dark theme, print-friendly)
workshop export my-workshop.yaml --format html
```

Exports include full content, code blocks, exercises, and checkpoints.

### Validate Workshop

Check structural and pedagogical quality:

```bash
workshop validate my-workshop.yaml
```

Validation checks:
- Practice ratio (≥60% hands-on time)
- Checkpoint spacing (every ~20-25 minutes)
- Exercise completeness (starter code + solution)
- Duration consistency (sections sum to module/workshop duration)
- Bloom's taxonomy alignment

---

## Workshop Format

Workshops are stored as YAML with the following structure:

```yaml
title: "Introduction to Docker"
topic: "Docker containerization"
audience:
  level: intermediate
  stack: "Python/FastAPI"
  size: 15
duration: 120  # minutes
difficulty: intermediate
prerequisites:
  - "Basic command-line experience"
  - "Familiarity with Python"
context_sources:
  - "docs/docker-compose-v2.md"
modules:
  - title: "Container Fundamentals"
    duration: 60
    learning_objectives:
      - text: "Explain the difference between containers and VMs"
        blooms_level: understand
      - text: "Build and run a containerized Python application"
        blooms_level: apply
    sections:
      - type: lecture
        title: "What Are Containers?"
        duration: 10
        talking_points:
          - "Isolation vs virtualization"
          - "Container lifecycle and images"
      
      - type: exercise
        title: "Create Your First Dockerfile"
        duration: 20
        instructions: |
          Create a Dockerfile for a FastAPI application...
        starter_code: |
          FROM python:3.11-slim
          # TODO: Add build steps
        solution: |
          FROM python:3.11-slim
          WORKDIR /app
          COPY requirements.txt .
          RUN pip install -r requirements.txt
          COPY . .
          CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]
        hints:
          - "Start with a Python base image"
          - "Install dependencies before copying source"
      
      - type: checkpoint
        title: "Container Basics Quiz"
        duration: 5
        questions:
          - "What command builds a Docker image from a Dockerfile?"
        expected_answers:
          - "docker build -t <name> ."
        explanations:
          - "The -t flag tags the image with a name for easy reference"
```

---

## Pedagogy Rules

Workshop Factory enforces evidence-based learning principles (see `docs/SKILL.md` for full details):

- **Bloom's Taxonomy** — Learning objectives use cognitive action verbs matched to difficulty:
  - Beginner: remember, understand, apply
  - Intermediate: apply, analyze
  - Advanced: analyze, evaluate, create

- **Practice-First Ratio**:
  - ≥60% exercises + discussions (hands-on)
  - ≤25% lectures (conceptual)
  - ≥15% checkpoints (assessments)

- **Checkpoint Spacing** — Knowledge checks every 20-25 minutes to catch misconceptions early

- **Scaffolding Progression** — Each module follows: worked example → guided practice → independent problem

- **Exercise Timing** — Allocate 2-3× expert completion time to account for learning, errors, and exploration

- **Stack Adaptation** — All code examples match the audience's declared technology stack

- **Context Grounding** — When context documents are provided, exercises reference real features/APIs from those docs

---

## Architecture

Key source files:

- **`src/index.tsx`** — CLI entry point, command routing (new, regen, export, validate)
- **`src/schema.ts`** — Zod schemas for Workshop, Module, Section types (lecture, exercise, discussion, checkpoint)
- **`src/client.ts`** — Copilot SDK wrapper (lifecycle management, session factory, streaming)
- **`src/storage.ts`** — YAML serialization, context file loading
- **`src/prompts.ts`** — System prompts and generation chain (analyze → outline → generate)
- **`src/regen.ts`** — Section-level regeneration logic with context injection
- **`src/validation.ts`** — Core pedagogical and structural validation rules
- **`src/tools/`** — Custom Copilot SDK tools:
  - `save.ts` — Persist workshop as YAML
  - `load.ts` — Load existing workshop
  - `validate.ts` — SDK tool wrapper for workshop validation
- **`src/components/`** — Ink TUI components (Wizard, GenerationView, Summary)
- **`src/exporters/`** — Output formatters:
  - `markdown.ts` — Single-file Markdown export
  - `html.ts` — Single-page HTML export (dark theme, print-friendly)

**Pedagogy rules**: `docs/SKILL.md` encodes learning science principles for the Copilot SDK to follow during generation.

---

## Development

```bash
# Watch mode (rebuilds on file changes)
npm run dev

# Production build
npm run build

# Run locally
./dist/workshop.js new
```

**Requirements**: Node.js ≥20.0.0

---

## How It Works

1. **Wizard** — Captures topic, audience (level + stack), duration, and difficulty
2. **Context Loading** — Reads provided `--context` files and injects them into generation prompts
3. **Generation Chain**:
   - **Analyze**: Topic + audience + context → subtopics, scope, prerequisites
   - **Outline**: Structured module/section plan with timing, types, objectives
   - **Generate**: Section-by-section streaming (enables targeted regeneration)
   - **Validate**: Enforce practice ratios, checkpoint spacing, Bloom's alignment
4. **Storage** — Save as YAML (human-editable, git-friendly)
5. **Export** — Convert to Markdown or HTML for distribution

---

## Examples

**Create a technical workshop with fresh context:**
```bash
workshop new --context github-actions-cache-v2-spec.md
# Topic: "GitHub Actions Caching"
# Audience: intermediate, Node.js/TypeScript
# Duration: 90 minutes
# → Generates exercises using real Cache API v2 features
```

**Update sections after a product release:**
```bash
workshop regen actions-workshop.yaml 5,6,7 --context release-notes-v3.md
# Regenerates sections 5-7 with updated API examples
```

**Export for distribution:**
```bash
workshop export docker-workshop.yaml --format md
# → docker-workshop.md (include in repo README)

workshop export docker-workshop.yaml --format html
# → docker-workshop.html (standalone page for workshops)
```

---

## Pain Points Addressed

- **Stale content** — `--context` injection + targeted `regen` keep workshops up-to-date
- **Audience adaptation** — Stack-specific code examples, difficulty-tuned exercises
- **Weak pedagogy** — Enforced practice ratios, Bloom's alignment, checkpoint spacing
- **Not self-contained** — YAML bundles content + code + solutions; exports to portable formats

---

## License

MIT
