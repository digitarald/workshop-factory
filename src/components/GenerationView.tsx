import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import type { Workshop, Module } from '../schema.js';
import type { ValidationResult } from '../validation.js';
import { WorkshopSchema, ModuleSchema } from '../schema.js';
import { getGlobalClient, createSession, streamResponse, shutdown } from '../client.js';
import { getSystemPrompt, buildAnalyzePrompt, buildOutlinePrompt, buildGeneratePrompt } from '../prompts.js';
import { loadContextFiles } from '../storage.js';
import { validateWorkshop } from '../validation.js';
import { extractJson } from '../extract-json.js';
import { saveWorkshopTool, loadWorkshopTool, validateStructureTool } from '../tools/index.js';


/**
 * Generation phase indicator
 */
type Phase = 'analyzing' | 'outlining' | 'generating' | 'validating' | 'complete' | 'error';

/**
 * Module status for display
 */
interface ModuleStatus {
  title: string;
  duration: number;
  status: 'pending' | 'generating' | 'complete';
  totalSections?: number;
}

/**
 * Props for the GenerationView component
 */
export interface GenerationViewProps {
  params: {
    topic: string;
    audience: { level: 'beginner' | 'intermediate' | 'advanced'; stack?: string };
    duration: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    contextFiles: string[];
  };
  onComplete: (workshop: Workshop, validation: ValidationResult) => void;
  onError: (error: Error) => void;
}

/**
 * Streaming progress display for workshop generation.
 * Shows phase, module tree with status icons, current section streaming, and elapsed time.
 */
export function GenerationView({ params, onComplete, onError }: GenerationViewProps) {
  const [phase, setPhase] = useState<Phase>('analyzing');
  const [modules, setModules] = useState<ModuleStatus[]>([]);
  const [streamContent, setStreamContent] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  // Elapsed time counter
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Main generation flow
  useEffect(() => {
    let cancelled = false;

    async function runGeneration() {
      try {
        // Load context files if provided
        let contextContent: string[] | undefined;
        if (params.contextFiles.length > 0) {
          contextContent = await loadContextFiles(params.contextFiles);
        }

        const workshopParams = {
          topic: params.topic,
          audience: params.audience,
          duration: params.duration,
          difficulty: params.difficulty,
          context: params.contextFiles.length > 0 ? params.contextFiles : undefined,
        };

        // Phase 1: Analyze topic
        setPhase('analyzing');
        const systemPrompt = await getSystemPrompt();
        const client = getGlobalClient();
        const session = await createSession(client, systemPrompt, {
          tools: [saveWorkshopTool, loadWorkshopTool, validateStructureTool],
        });

        const analyzePrompt = buildAnalyzePrompt(workshopParams, contextContent);
        let analysisJson = '';
        for await (const chunk of streamResponse(session, analyzePrompt)) {
          if (cancelled) return;
          if (chunk.type === 'complete') {
            analysisJson = chunk.content;
          } else {
            setStreamContent(chunk.accumulated);
          }
        }
        analysisJson = extractJson(analysisJson);
        if (cancelled) return;

        // Phase 2: Create outline
        setPhase('outlining');
        const outlinePrompt = buildOutlinePrompt(analysisJson, workshopParams);
        let outlineJson = '';
        for await (const chunk of streamResponse(session, outlinePrompt)) {
          if (cancelled) return;
          if (chunk.type === 'complete') {
            outlineJson = chunk.content;
          } else {
            setStreamContent(chunk.accumulated);
          }
        }
        outlineJson = extractJson(outlineJson);
        if (cancelled) return;

        // Parse outline to get module structure for progress display
        const outlineParsed = JSON.parse(outlineJson) as {
          title?: string;
          prerequisites?: string[];
          modules?: Array<{ title: string; duration: number; sections?: unknown[] }>;
        };
        const outlineModules = outlineParsed.modules ?? [];
        setModules(outlineModules.map(m => ({
          title: m.title,
          duration: m.duration,
          status: 'pending' as const,
          totalSections: Array.isArray(m.sections) ? m.sections.length : 0,
        })));

        // Phase 3: Generate modules section by section
        setPhase('generating');
        const generatedModules: Module[] = [];

        for (let i = 0; i < outlineModules.length; i++) {
          if (cancelled) return;

          setModules((prev) =>
            prev.map((m, idx) => ({
              ...m,
              status: idx === i ? 'generating' : idx < i ? 'complete' : 'pending',
            }))
          );

          const genPrompt = buildGeneratePrompt(outlineJson, i, workshopParams, contextContent);
          let moduleJson = '';
          for await (const chunk of streamResponse(session, genPrompt)) {
            if (cancelled) return;
            if (chunk.type === 'complete') {
              moduleJson = chunk.content;
            } else {
              setStreamContent(chunk.accumulated.slice(-500)); // Show tail of streaming content
            }
          }
          moduleJson = extractJson(moduleJson);

          const moduleParsed = ModuleSchema.parse(JSON.parse(moduleJson));
          generatedModules.push(moduleParsed);

          // Mark module complete
          setModules((prev) =>
            prev.map((m, idx) => (idx === i ? { ...m, status: 'complete' } : m))
          );
        }

        // Phase 4: Validate
        setPhase('validating');
        setStreamContent('Validating structure...');

        const workshop: Workshop = WorkshopSchema.parse({
          title: outlineParsed.title ?? `Workshop: ${params.topic}`,
          topic: params.topic,
          audience: workshopParams.audience,
          duration: params.duration,
          difficulty: workshopParams.difficulty,
          prerequisites: outlineParsed.prerequisites ?? [],
          context_sources: params.contextFiles,
          modules: generatedModules,
        });

        const validation = validateWorkshop(workshop);
        if (!validation.valid) {
          const failures = validation.checks.filter(c => !c.passed).map(c => c.message);
          setStreamContent(`Validation warnings:\n${failures.join('\n')}`);
        }

        // Phase 5: Complete
        setPhase('complete');
        if (cancelled) return;

        onComplete(workshop, validation);
      } catch (err) {
        if (cancelled) return;
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setPhase('error');
        onError(error);
      }
    }

    runGeneration();

    return () => {
      cancelled = true;
      void shutdown();
    };
  }, [params, onComplete, onError]);

  // Format elapsed time
  const formatElapsed = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // Get phase display text
  const getPhaseText = (): string => {
    switch (phase) {
      case 'analyzing':
        return 'Analyzing topic...';
      case 'outlining':
        return 'Creating outline...';
      case 'generating':
        return 'Generating modules...';
      case 'validating':
        return 'Validating structure...';
      case 'complete':
        return 'Complete!';
      case 'error':
        return 'Error occurred';
      default:
        return '';
    }
  };

  // Get current step
  const getStep = (): string => {
    const stepMap = {
      analyzing: '1/4',
      outlining: '2/4',
      generating: '3/4',
      validating: '4/4',
      complete: '4/4',
      error: '',
    };
    return stepMap[phase];
  };

  // Get status icon for module
  const getStatusIcon = (status: 'pending' | 'generating' | 'complete'): string => {
    switch (status) {
      case 'complete':
        return '✓';
      case 'generating':
        return '⟳';
      case 'pending':
        return '○';
      default:
        return '○';
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box borderStyle="single" borderColor="cyan" flexDirection="column" padding={1}>
        <Box flexDirection="column">
          <Text bold color="cyan">
            ┌─ Generating Workshop ──────────────────────────┐
          </Text>
          <Box paddingLeft={2} paddingY={1} flexDirection="column">
            <Box marginBottom={1}>
              <Text>
                Phase: <Text color="yellow">{getPhaseText()}</Text>
                {getStep() && (
                  <Text dimColor> [Step {getStep()}]</Text>
                )}
              </Text>
            </Box>

            {/* Module list */}
            {modules.length > 0 && (
              <Box flexDirection="column" marginTop={1}>
                <Text bold>Modules:</Text>
                {modules.map((module, idx) => (
                  <Box key={idx} flexDirection="column" marginLeft={1}>
                    <Box>
                      <Text color={module.status === 'complete' ? 'green' : module.status === 'generating' ? 'yellow' : 'gray'}>
                        {getStatusIcon(module.status)} Module {idx + 1}: {module.title}
                        <Text dimColor> ({module.duration}min)</Text>
                      </Text>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            {/* Current section streaming display */}
            {phase === 'generating' && streamContent && (
              <Box
                flexDirection="column"
                borderStyle="single"
                borderColor="gray"
                marginTop={1}
                padding={1}
              >
                <Text bold dimColor>
                  ─ Current Section ─────────────────────────
                </Text>
                <Box marginTop={1}>
                  <Text>{streamContent}</Text>
                </Box>
                <Box marginTop={1}>
                  <Text dimColor>████████████░░░░░░░░ streaming...</Text>
                </Box>
              </Box>
            )}

            {/* Validation display */}
            {phase === 'validating' && (
              <Box marginTop={1}>
                <Text color="blue">{streamContent}</Text>
              </Box>
            )}

            {/* Error display */}
            {phase === 'error' && error && (
              <Box marginTop={1} flexDirection="column">
                <Text color="red" bold>
                  Error: {error.message}
                </Text>
              </Box>
            )}

            {/* Elapsed time */}
            <Box marginTop={1}>
              <Text dimColor>
                Elapsed: <Text color="cyan">{formatElapsed(elapsed)}</Text>
              </Text>
            </Box>
          </Box>
          <Text bold color="cyan">
            └──────────────────────────────────────────────────┘
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
