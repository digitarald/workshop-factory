/**
 * Template repo generation orchestrator.
 *
 * Runs 3 sequential SDK sessions (slides, code scaffold, README) each
 * with a registered write_file tool, then writes static files
 * (INSTRUCTOR.md, deploy-slides.yml, .gitignore, LICENSE).
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  getGlobalClient,
  createSession,
  streamResponse,
} from '../client.js';
import { createWriteFileTool } from '../tools/writeFile.js';
import { buildSlidesPrompt, buildScaffoldPrompt, buildReadmePrompt } from '../prompts.js';
import { exportToMarkdown } from './markdown.js';
import type { Workshop } from '../schema.js';

/** Progress events emitted during generation. */
export type GenerateRepoEvent =
  | { type: 'phase-start'; phase: RepoPhase; index: number; total: number }
  | { type: 'text-delta'; phase: RepoPhase; chars: number; preview: string }
  | { type: 'file-written'; phase: RepoPhase; path: string; bytes: number }
  | { type: 'phase-complete'; phase: RepoPhase }
  | { type: 'static-written'; path: string }
  | { type: 'complete'; outputDir: string };

export type RepoPhase = 'slides' | 'scaffold' | 'readme';

const PHASES: { phase: RepoPhase; buildPrompt: typeof buildSlidesPrompt }[] = [
  { phase: 'slides', buildPrompt: buildSlidesPrompt },
  { phase: 'scaffold', buildPrompt: buildScaffoldPrompt },
  { phase: 'readme', buildPrompt: buildReadmePrompt },
];

/**
 * Generate a complete template repo from a Workshop object.
 *
 * @param workshop  - Fully generated Workshop
 * @param outputDir - Target directory (will be created if needed)
 * @param onEvent   - Optional progress callback
 */
export async function generateRepo(
  workshop: Workshop,
  outputDir: string,
  onEvent?: (event: GenerateRepoEvent) => void,
): Promise<void> {
  await mkdir(outputDir, { recursive: true });

  const client = getGlobalClient();

  // --- SDK-driven phases ---
  for (let i = 0; i < PHASES.length; i++) {
    const entry = PHASES[i]!;
    const { phase, buildPrompt } = entry;

    onEvent?.({ type: 'phase-start', phase, index: i, total: PHASES.length });

    const { system, user } = await buildPrompt(workshop);

    let filesWritten = 0;
    const writeFileTool = createWriteFileTool(outputDir, {
      onFileWritten(path, bytes) {
        filesWritten++;
        onEvent?.({ type: 'file-written', phase, path, bytes });
      },
    });

    const session = await createSession(client, system, {
      tools: [writeFileTool],
    });

    // Drive the session to completion — emit text-delta events so the UI can show streaming progress.
    let charsStreamed = 0;
    let lastEmitChars = 0;
    for await (const chunk of streamResponse(session, user)) {
      if (chunk.type === 'delta') {
        charsStreamed += chunk.content.length;
        if (charsStreamed - lastEmitChars >= 100) {
          lastEmitChars = charsStreamed;
          const preview = chunk.accumulated.slice(-80).replace(/\n/g, ' ').trim();
          onEvent?.({ type: 'text-delta', phase, chars: charsStreamed, preview });
        }
      }
    }
    if (charsStreamed > lastEmitChars) {
      onEvent?.({ type: 'text-delta', phase, chars: charsStreamed, preview: '' });
    }

    if (filesWritten === 0) {
      console.warn(`Warning: phase "${phase}" produced no files — the model may not have used the write_file tool.`);
    }

    onEvent?.({ type: 'phase-complete', phase });
  }

  // --- Static files ---
  await writeStaticFiles(workshop, outputDir, onEvent);

  onEvent?.({ type: 'complete', outputDir });
}

// ---------------------------------------------------------------------------
// Static file helpers
// ---------------------------------------------------------------------------

async function writeStaticFiles(
  workshop: Workshop,
  outputDir: string,
  onEvent?: (event: GenerateRepoEvent) => void,
): Promise<void> {
  // INSTRUCTOR.md — full markdown export (for the instructor, not attendees)
  const instructorMd = exportToMarkdown(workshop);
  const instructorPath = join(outputDir, 'INSTRUCTOR.md');
  await writeFile(instructorPath, instructorMd, 'utf-8');
  onEvent?.({ type: 'static-written', path: 'INSTRUCTOR.md' });

  // GitHub Actions workflow for deploying slides to GitHub Pages
  const workflowDir = join(outputDir, '.github', 'workflows');
  await mkdir(workflowDir, { recursive: true });
  const workflowPath = join(workflowDir, 'deploy-slides.yml');
  await writeFile(workflowPath, DEPLOY_SLIDES_WORKFLOW, 'utf-8');
  onEvent?.({ type: 'static-written', path: '.github/workflows/deploy-slides.yml' });

  // .gitignore
  const gitignorePath = join(outputDir, '.gitignore');
  await writeFile(gitignorePath, GITIGNORE_CONTENT, 'utf-8');
  onEvent?.({ type: 'static-written', path: '.gitignore' });

  // LICENSE (MIT)
  const licensePath = join(outputDir, 'LICENSE');
  await writeFile(licensePath, generateMitLicense(), 'utf-8');
  onEvent?.({ type: 'static-written', path: 'LICENSE' });
}

// ---------------------------------------------------------------------------
// Static content templates
// ---------------------------------------------------------------------------

const DEPLOY_SLIDES_WORKFLOW = `name: Deploy Slides to GitHub Pages

on:
  push:
    branches: [main]
    paths:
      - "slides/**"
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./slides
`;

const GITIGNORE_CONTENT = `node_modules/
dist/
.env
.DS_Store
*.log
`;

function generateMitLicense(): string {
  const year = new Date().getFullYear();
  return `MIT License

Copyright (c) ${year}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
}
