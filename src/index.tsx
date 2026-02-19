#!/usr/bin/env bun
import React, { useState, useCallback, useEffect } from 'react';
import { createCliRenderer } from '@opentui/core';
import { createRoot, useKeyboard, useRenderer } from '@opentui/react';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadWorkshop, saveWorkshop } from './storage.js';
import { validateWorkshop } from './validation.js';
import { exportToMarkdownFile } from './exporters/markdown.js';
import { regenerateWorkshop } from './regen.js';
import { shutdown } from './client.js';
import { Wizard } from './components/Wizard.js';
import { GenerationView } from './components/GenerationView.js';
import { Summary } from './components/Summary.js';
import { ExportProgress } from './components/ExportProgress.js';
import { WorkshopPicker } from './components/WorkshopPicker.js';
import type { Workshop } from './schema.js';
import type { ValidationResult } from './validation.js';
import { discoverExistingWorkshops, getExportPath, getNewWorkshopConfigPath, slugifyTopic } from './workshops.js';
import type { ExistingWorkshop } from './workshops.js';

/**
 * Workshop Factory CLI
 * 
 * Commands:
 * - workshop new [--context <files...>]
 * - workshop regen <file> [sections] [--context <files...>]
 * - workshop export <file>
 * - workshop generate <file>
 * - workshop validate <file>
 */

interface ParsedArgs {
  command: string;
  positional: string[];
  context?: string[];
}

/**
 * Parse command-line arguments manually
 */
function parseArgs(argv: string[]): ParsedArgs {
  const args = argv.slice(2); // Remove node and script path
  
  if (args.length === 0) {
    return { command: '', positional: [] };
  }

  const command = args[0]!;
  const positional: string[] = [];
  let context: string[] | undefined;

  let i = 1;
  while (i < args.length) {
    const arg = args[i]!;

    if (arg === '--context') {
      // Collect all following args until next flag or end
      context = [];
      i++;
      while (i < args.length && !args[i]!.startsWith('--')) {
        context.push(args[i]!);
        i++;
      }
      if (context.length === 0) {
        throw new Error('--context requires at least one file path');
      }
    } else if (!arg.startsWith('--')) {
      positional.push(arg);
      i++;
    } else {
      throw new Error(`Unknown flag "${arg}"`);
    }
  }

  return { command, positional, context };
}

type AppScreen = 'picker' | 'wizard' | 'generating' | 'summary' | 'exporting';

function App({ contextFiles }: { contextFiles?: string[] }) {
  const [screen, setScreen] = useState<AppScreen>('picker');
  const [existingWorkshops, setExistingWorkshops] = useState<ExistingWorkshop[]>([]);
  const [isLoadingWorkshops, setIsLoadingWorkshops] = useState(true);
  const [isOpeningWorkshop, setIsOpeningWorkshop] = useState(false);
  const [pickerError, setPickerError] = useState<string | undefined>();
  const [wizardParams, setWizardParams] = useState<{
    topic: string;
    audience: { level: 'beginner' | 'intermediate' | 'advanced'; stack?: string };
    duration: number;
    contextFiles: string[];
  } | null>(null);
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [savePath, setSavePath] = useState('');
  const [saveError, setSaveError] = useState<string | undefined>();
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkshops() {
      setIsLoadingWorkshops(true);
      setPickerError(undefined);

      try {
        const workshops = await discoverExistingWorkshops();
        if (cancelled) {
          return;
        }

        setExistingWorkshops(workshops);
      } catch (e) {
        if (cancelled) {
          return;
        }

        setPickerError(`Failed to discover workshops: ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        if (!cancelled) {
          setIsLoadingWorkshops(false);
        }
      }
    }

    void loadWorkshops();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleGenerationComplete = useCallback(async (w: Workshop, validation: ValidationResult) => {
    if (!wizardParams) return;
    const path = getNewWorkshopConfigPath(wizardParams.topic);
    try {
      await saveWorkshop(w, path);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e));
    }
    const warnings = validation.checks.filter(c => !c.passed).map(c => c.message);
    setValidationWarnings(warnings);
    setWorkshop(w);
    setSavePath(path);
    setScreen('summary');
  }, [wizardParams]);

  const handleGenerationError = useCallback((err: Error) => {
    setError(err.message);
  }, []);

  // Handle error state: allow retry or exit
  const renderer = useRenderer();
  useKeyboard((key) => {
    if (!error) return;
    if (key.name === 'r') {
      setError(null);
      setScreen('wizard');
    } else if (key.name === 'q' || key.name === 'escape') {
      void shutdown().then(() => renderer.destroy());
    }
  });

  if (error) {
    return (
      <box flexDirection="column" padding={1}>
        <text fg="red"><strong>Error: {error}</strong></text>
        <box marginTop={1} flexDirection="column">
          <text>[r] Back to wizard</text>
          <text>[q] Exit</text>
        </box>
      </box>
    );
  }

  if (screen === 'picker') {
    return (
      <WorkshopPicker
        workshops={existingWorkshops}
        isLoading={isLoadingWorkshops}
        isOpening={isOpeningWorkshop}
        error={pickerError}
        onCreateNew={() => {
          setPickerError(undefined);
          setScreen('wizard');
        }}
        onSelect={(selectedWorkshop) => {
          setIsOpeningWorkshop(true);
          setPickerError(undefined);

          void (async () => {
            try {
              const loadedWorkshop = await loadWorkshop(selectedWorkshop.path);
              setWorkshop(loadedWorkshop);
              setSavePath(selectedWorkshop.path);
              setSaveError(undefined);
              setValidationWarnings([]);
              setScreen('summary');
            } catch (e) {
              setPickerError(`Failed to open ${selectedWorkshop.path}: ${e instanceof Error ? e.message : String(e)}`);
            } finally {
              setIsOpeningWorkshop(false);
            }
          })();
        }}
      />
    );
  }

  if (screen === 'wizard') {
    return (
      <Wizard
        contextFiles={contextFiles}
        onComplete={(params) => {
          setWizardParams(params);
          setScreen('generating');
        }}
      />
    );
  }

  if (screen === 'generating' && wizardParams) {
    return (
      <GenerationView
        params={wizardParams}
        onComplete={handleGenerationComplete}
        onError={handleGenerationError}
      />
    );
  }

  if (screen === 'summary' && workshop) {
    return (
      <Summary
        workshop={workshop}
        savePath={savePath}
        saveError={saveError}
        validationWarnings={validationWarnings}
        onAction={async (action) => {
          try {
            if (action === 'export-md') {
              const outPath = getExportPath(savePath);
              await exportToMarkdownFile(workshop, outPath);
              console.log(`✓ Exported to ${outPath}`);
            } else if (action === 'generate-repo') {
              setScreen('exporting');
            } else if (action === 'validate') {
              const result = validateWorkshop(workshop);
              const warnings = result.checks.filter(c => !c.passed).map(c => c.message);
              setValidationWarnings(warnings);
              for (const check of result.checks) {
                console.log(`${check.passed ? '✓' : '✗'} ${check.message}`);
              }
            } else if (action === 'exit') {
              await shutdown();
              renderer.destroy();
            }
          } catch (e) {
            console.error(e instanceof Error ? e.message : String(e));
          }
        }}
      />
    );
  }

  if (screen === 'exporting' && workshop) {
    const repoDir = `workshop-${slugifyTopic(workshop.topic)}`;
    return (
      <ExportProgress
        workshop={workshop}
        outputDir={repoDir}
        onComplete={(dir) => {
          console.log(`\n✓ Workshop repo generated at ${dir}/`);
          void shutdown().then(() => renderer.destroy());
        }}
        onError={(err) => {
          setSaveError(`Repo generation failed: ${err.message}`);
          setScreen('summary');
        }}
      />
    );
  }

  return null;
}

/**
 * Handler for 'workshop new' command
 */
async function handleNew(contextFiles?: string[]): Promise<void> {
  const { promise, resolve } = Promise.withResolvers<void>();
  const renderer = await createCliRenderer({
    exitOnCtrlC: false,
    onDestroy: resolve,
  });
  createRoot(renderer).render(<App contextFiles={contextFiles} />);
  await promise;
}

/**
 * Handler for 'workshop regen' command
 */
async function handleRegen(
  file: string,
  sections?: number[],
  contextFiles?: string[]
): Promise<void> {
  try {
    // Call the regeneration logic
    const workshop = await regenerateWorkshop({
      workshopPath: file,
      sectionIndices: sections,
      contextFiles: contextFiles,
    });
    
    // Print validation results after regeneration
    console.log('\n--- Validation Summary ---');
    const result = validateWorkshop(workshop);
    
    for (const check of result.checks) {
      const icon = check.passed ? '✓' : '✗';
      console.log(`${icon} ${check.message}`);
    }
    
    console.log('');
    if (result.valid) {
      console.log('✓ Regeneration complete. Workshop passed all validation checks.');
    } else {
      const failedCount = result.checks.filter(c => !c.passed).length;
      console.log(`⚠ Regeneration complete, but workshop has ${failedCount} validation issue(s).`);
    }
  } finally {
    await shutdown();
  }
}

/**
 * Handler for 'workshop export' command
 */
async function handleExport(
  file: string,
): Promise<void> {
  console.log(`Loading workshop from ${file}...`);
  const workshop = await loadWorkshop(file);
  
  const outputPath = getExportPath(file);
  
  console.log(`Exporting to Markdown...`);
  await exportToMarkdownFile(workshop, outputPath);
  
  console.log(`✓ Exported to ${outputPath}`);
}

/**
 * Handler for 'workshop validate' command
 */
async function handleValidate(file: string): Promise<void> {
  console.log(`Loading workshop from ${file}...`);
  const workshop = await loadWorkshop(file);
  
  console.log('Validating workshop structure...\n');
  const result = validateWorkshop(workshop);
  
  // Print results
  for (const check of result.checks) {
    const icon = check.passed ? '✓' : '✗';
    console.log(`${icon} ${check.message}`);
  }
  
  console.log('');
  if (result.valid) {
    console.log('✓ Workshop passed all validation checks');
    process.exit(0);
  } else {
    const failedCount = result.checks.filter(c => !c.passed).length;
    console.log(`✗ Workshop failed ${failedCount} validation check(s)`);
    process.exit(1);
  }
}

/**
 * Handler for 'workshop generate' command — generates a forkable template repo.
 */
async function handleGenerate(file: string): Promise<void> {
  const { generateRepo } = await import('./exporters/repo-generate.js');

  console.log(`Loading workshop from ${file}...`);
  const workshop = await loadWorkshop(file);

  const repoDir = `workshop-${slugifyTopic(workshop.topic)}`;
  console.log(`Generating template repo in ${repoDir}/...`);

  try {
    await generateRepo(workshop, repoDir, (event) => {
      switch (event.type) {
        case 'phase-start':
          console.log(`\n→ Phase ${event.index + 1}/${event.total}: ${event.phase}`);
          break;
        case 'file-written':
          console.log(`  + ${event.path} (${event.bytes} bytes)`);
          break;
        case 'static-written':
          console.log(`  + ${event.path}`);
          break;
        case 'complete':
          console.log(`\n✓ Workshop repo generated at ${event.outputDir}/`);
          break;
      }
    });
  } finally {
    await shutdown();
  }
}

/**
 * Show version information
 */
async function showVersion(): Promise<void> {
  try {
    // Get the package.json path relative to this file
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const packageJsonPath = join(__dirname, '..', 'package.json');
    
    const packageJson = await readFile(packageJsonPath, 'utf-8');
    const pkg = JSON.parse(packageJson);
    console.log(`Workshop Factory CLI v${pkg.version}`);
  } catch {
    console.log('Workshop Factory CLI (version unknown)');
  }
}

/**
 * Show usage information
 */
function showUsage(): void {
  console.log(`
Workshop Factory CLI

Usage:
  workshop new [--context <files...>]
    Show existing workshops or create a new one through an interactive wizard.
    Optional: --context <files...> to inject context documents

  workshop regen <file> [sections] [--context <files...>]
    Regenerate specific sections of an existing workshop.
    - <file>: Path to workshop YAML file
    - [sections]: Optional comma-separated section numbers (e.g., 1,3,5)
    - --context <files...>: Optional new context files to incorporate

  workshop export <file>
    Export a workshop to Markdown (instructor guide).
    - <file>: Path to workshop YAML file

  workshop generate <file>
    Generate a forkable template repo with slides, code scaffold, and README.
    - <file>: Path to workshop YAML file

  workshop validate <file>
    Validate workshop structure and pedagogical rules.
    - <file>: Path to workshop YAML file

  workshop --version
    Show version information

  workshop --help
    Show this help message

Examples:
  workshop new
  workshop new --context docs/feature-brief.md docs/api-spec.md
  workshop regen docker-basics/workshop.yaml 1,3 --context updated-docs.md
  workshop export docker-basics/workshop.yaml
  workshop generate docker-basics/workshop.yaml
  workshop validate docker-basics/workshop.yaml
`);
}

/**
 * Main CLI entry point
 */
async function main(): Promise<void> {
  const parsed = parseArgs(process.argv);

  switch (parsed.command) {
    case 'new':
      await handleNew(parsed.context);
      break;

    case 'regen': {
      if (parsed.positional.length === 0) {
        throw new Error('"regen" command requires a file path');
      }

      const file = parsed.positional[0]!;
      
      // Parse section numbers if provided
      let sections: number[] | undefined;
      if (parsed.positional.length > 1) {
        const sectionArg = parsed.positional[1]!;
        sections = sectionArg.split(',').map(s => {
          const num = parseInt(s.trim(), 10);
          if (isNaN(num)) {
            throw new Error(`Invalid section number "${s}"`);
          }
          return num;
        });
      }

      await handleRegen(file, sections, parsed.context);
      break;
    }

    case 'export': {
      if (parsed.positional.length === 0) {
        throw new Error('"export" command requires a file path');
      }

      const file = parsed.positional[0]!;
      await handleExport(file);
      break;
    }

    case 'validate': {
      if (parsed.positional.length === 0) {
        throw new Error('"validate" command requires a file path');
      }

      const file = parsed.positional[0]!;
      await handleValidate(file);
      break;
    }

    case 'generate': {
      if (parsed.positional.length === 0) {
        throw new Error('"generate" command requires a file path');
      }

      const file = parsed.positional[0]!;
      await handleGenerate(file);
      break;
    }

    case '--version':
    case '-v':
      await showVersion();
      break;

    case '':
    case 'help':
    case '--help':
    case '-h':
      showUsage();
      break;

    default:
      throw new Error(`Unknown command "${parsed.command}"`);
  }
}

/**
 * Graceful shutdown handler
 */
async function handleShutdown(signal: string): Promise<void> {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  const errors = await shutdown();
  if (errors.length > 0) {
    console.error('Errors during shutdown:', errors.map(e => e.message).join(', '));
    process.exit(1);
  }
  
  process.exit(0);
}

// Register signal handlers for graceful shutdown
process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
  shutdown().finally(() => {
    process.exit(1);
  });
});

// Run the CLI with comprehensive error handling
main().catch((error) => {
  console.error('Error:', error instanceof Error ? error.message : String(error));
  
  // Clean up before exit
  shutdown().finally(() => {
    process.exit(1);
  });
});
