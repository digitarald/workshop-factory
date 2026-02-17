#!/usr/bin/env node
import React, { useState, useCallback } from 'react';
import { render, Box, Text } from 'ink';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadWorkshop, saveWorkshop } from './storage.js';
import { validateWorkshop } from './validation.js';
import { exportToMarkdownFile } from './exporters/markdown.js';
import { exportToHtmlFile } from './exporters/html.js';
import { regenerateWorkshop } from './regen.js';
import { shutdown } from './client.js';
import { Wizard } from './components/Wizard.js';
import { GenerationView } from './components/GenerationView.js';
import { Summary } from './components/Summary.js';
import type { Workshop } from './schema.js';
import type { ValidationResult } from './validation.js';

/**
 * Workshop Factory CLI
 * 
 * Commands:
 * - workshop new [--context <files...>]
 * - workshop regen <file> [sections] [--context <files...>]
 * - workshop export <file> --format md|html
 * - workshop validate <file>
 */

interface ParsedArgs {
  command: string;
  positional: string[];
  context?: string[];
  format?: 'md' | 'html';
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
  let format: 'md' | 'html' | undefined;

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
    } else if (arg === '--format') {
      // Next arg should be the format
      i++;
      if (i < args.length) {
        const formatValue = args[i];
        if (formatValue === 'md' || formatValue === 'html') {
          format = formatValue;
        } else {
          throw new Error(`Invalid format "${formatValue}". Use "md" or "html".`);
        }
        i++;
      } else {
        throw new Error('--format requires a value (md or html)');
      }
    } else if (!arg.startsWith('--')) {
      positional.push(arg);
      i++;
    } else {
      throw new Error(`Unknown flag "${arg}"`);
    }
  }

  return { command, positional, context, format };
}

type AppScreen = 'wizard' | 'generating' | 'summary';

function App({ contextFiles }: { contextFiles?: string[] }) {
  const [screen, setScreen] = useState<AppScreen>('wizard');
  const [wizardParams, setWizardParams] = useState<{
    topic: string;
    audience: { level: 'beginner' | 'intermediate' | 'advanced'; stack?: string };
    duration: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    contextFiles: string[];
  } | null>(null);
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [savePath, setSavePath] = useState('');
  const [saveError, setSaveError] = useState<string | undefined>();
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerationComplete = useCallback(async (w: Workshop, validation: ValidationResult) => {
    if (!wizardParams) return;
    const slug = wizardParams.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'workshop';
    const path = `${slug}-workshop.yaml`;
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

  if (error) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red" bold>Error: {error}</Text>
      </Box>
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
              const outPath = savePath.replace(/\.ya?ml$/i, '.md');
              await exportToMarkdownFile(workshop, outPath);
              console.log(`✓ Exported to ${outPath}`);
            } else if (action === 'export-html') {
              const outPath = savePath.replace(/\.ya?ml$/i, '.html');
              await exportToHtmlFile(workshop, outPath);
              console.log(`✓ Exported to ${outPath}`);
            } else if (action === 'validate') {
              const result = validateWorkshop(workshop);
              const warnings = result.checks.filter(c => !c.passed).map(c => c.message);
              setValidationWarnings(warnings);
              for (const check of result.checks) {
                console.log(`${check.passed ? '✓' : '✗'} ${check.message}`);
              }
            } else if (action === 'exit') {
              await shutdown();
              process.exit(0);
            }
          } catch (e) {
            console.error(e instanceof Error ? e.message : String(e));
          }
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
  return new Promise<void>((resolve) => {
    const { unmount } = render(<App contextFiles={contextFiles} />);
    // Ink handles the lifecycle — process.exit() in App will terminate
    process.on('exit', () => {
      unmount();
      resolve();
    });
  });
}

/**
 * Handler for 'workshop regen' command
 */
async function handleRegen(
  file: string,
  sections?: number[],
  contextFiles?: string[]
): Promise<void> {
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
}

/**
 * Handler for 'workshop export' command
 */
async function handleExport(
  file: string,
  format: 'md' | 'html'
): Promise<void> {
  console.log(`Loading workshop from ${file}...`);
  const workshop = await loadWorkshop(file);
  
  // Generate output filename
  const baseName = file.replace(/\.ya?ml$/i, '');
  const outputPath = `${baseName}.${format === 'md' ? 'md' : 'html'}`;
  
  console.log(`Exporting to ${format.toUpperCase()}...`);
  
  if (format === 'md') {
    await exportToMarkdownFile(workshop, outputPath);
  } else {
    await exportToHtmlFile(workshop, outputPath);
  }
  
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
    Create a new workshop through an interactive wizard.
    Optional: --context <files...> to inject context documents

  workshop regen <file> [sections] [--context <files...>]
    Regenerate specific sections of an existing workshop.
    - <file>: Path to workshop YAML file
    - [sections]: Optional comma-separated section numbers (e.g., 1,3,5)
    - --context <files...>: Optional new context files to incorporate

  workshop export <file> --format <md|html>
    Export a workshop to Markdown or HTML.
    - <file>: Path to workshop YAML file
    - --format: Output format (md or html)

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
  workshop regen workshop.yaml 1,3 --context updated-docs.md
  workshop export workshop.yaml --format md
  workshop validate workshop.yaml
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

      if (!parsed.format) {
        throw new Error('"export" command requires --format <md|html>');
      }

      const file = parsed.positional[0]!;
      await handleExport(file, parsed.format);
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
  process.exit(1);
});

// Run the CLI with comprehensive error handling
main().catch((error) => {
  console.error('Error:', error instanceof Error ? error.message : String(error));
  
  // Clean up before exit
  shutdown().finally(() => {
    process.exit(1);
  });
});
