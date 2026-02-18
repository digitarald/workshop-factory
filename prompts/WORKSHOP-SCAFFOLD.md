# Workshop Code Scaffold Guide

You are generating a **runnable starter project** that workshop attendees will code against during a live workshop. The output must work out-of-the-box and map clearly to the workshop exercises.

## Audience

**Workshop attendees** who will fork this repo, clone it, and follow along with exercises.

## Project Structure

Generate a cohesive project that matches the workshop's `audience.stack` (e.g., React + TypeScript, Python Flask, Node.js, etc.).

### Required Files

- **`code/README.md`** — setup instructions: prerequisites, install steps, how to run, and a mapping of exercises to file locations.
- **`code/package.json`** (or equivalent for the stack) — with correct dependencies, scripts (`start`, `dev`, `test` if applicable).
- **`code/src/`** — exercise starter files with clear TODO markers at the points where attendees write code.
- **`code/solutions/`** — complete solution files mirroring the `src/` structure, one per exercise.

### Exercise Mapping

For each `exercise` section in the workshop:
1. Extract the `starter_code` and place it in an appropriately named file under `code/src/`.
2. Extract the `solution` and place it in the matching file under `code/solutions/`.
3. Add clear `// TODO: Exercise N - <title>` markers in the starter files.
4. If exercises build on each other, structure files so earlier exercises feed into later ones naturally.

### Project Requirements

- **Working out-of-the-box**: After `npm install && npm start` (or the stack equivalent), the project should run without errors — even with the TODOs incomplete. Use placeholder implementations or no-ops where needed.
- **Minimal dependencies**: Only include what the exercises actually need. Don't over-engineer the scaffold.
- **Clear file naming**: Files should be named after exercise topics (e.g., `data-fetching.ts`, `auth-middleware.py`), not generic names.
- **Test stubs**: If the workshop has checkpoint sections with questions, include corresponding test files that validate exercise completion.

### code/README.md Content

- Workshop name and description (one line)
- Prerequisites (from workshop.prerequisites)
- Setup: step-by-step install and run commands
- Exercise guide: table mapping exercise names to file paths
- How to check solutions: instructions for comparing with `solutions/` folder

## Output

Generate files by calling the `write_file` tool for each file in the project. Use paths relative to the output root — all files should be under `code/` (e.g., `code/package.json`, `code/src/app.ts`).

Adapt the project structure to the workshop's `audience.stack`. For example:
- **Node.js/TypeScript**: `package.json`, `tsconfig.json`, `src/*.ts`, `solutions/*.ts`
- **Python**: `requirements.txt`, `src/*.py`, `solutions/*.py`, `setup.py` or `pyproject.toml`
- **React**: `package.json`, `vite.config.ts`, `src/components/*.tsx`, `solutions/components/*.tsx`

If no stack is specified, default to Node.js with TypeScript.
