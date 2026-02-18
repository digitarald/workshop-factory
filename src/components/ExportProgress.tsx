import React, { useState, useEffect, useRef } from 'react';
import { Box, Text } from 'ink';
import { generateRepo, type GenerateRepoEvent, type RepoPhase } from '../exporters/repo-generate.js';
import type { Workshop } from '../schema.js';

export interface ExportProgressProps {
  workshop: Workshop;
  outputDir: string;
  onComplete: (outputDir: string) => void;
  onError: (error: Error) => void;
}

interface WrittenFile {
  path: string;
  bytes: number;
}

const PHASE_LABELS: Record<RepoPhase, string> = {
  slides: 'Generating slides',
  scaffold: 'Generating code scaffold',
  readme: 'Generating README',
};

/**
 * ExportProgress — shows streaming progress during template repo generation.
 * Displays current phase, files written, and byte counts.
 */
export function ExportProgress({ workshop, outputDir, onComplete, onError }: ExportProgressProps) {
  const [currentPhase, setCurrentPhase] = useState<RepoPhase | null>(null);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseTotal, setPhaseTotal] = useState(0);
  const [streamingChars, setStreamingChars] = useState(0);
  const [streamingPreview, setStreamingPreview] = useState('');
  const [files, setFiles] = useState<WrittenFile[]>([]);
  const [done, setDone] = useState(false);
  const started = useRef(false);
  const cancelled = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    function handleEvent(event: GenerateRepoEvent) {
      if (cancelled.current) return;
      switch (event.type) {
        case 'phase-start':
          setCurrentPhase(event.phase);
          setPhaseIndex(event.index);
          setPhaseTotal(event.total);
          setStreamingChars(0);
          setStreamingPreview('');
          break;
        case 'text-delta':
          setStreamingChars(event.chars);
          if (event.preview) setStreamingPreview(event.preview);
          break;
        case 'file-written':
          setFiles((prev) => [...prev, { path: event.path, bytes: event.bytes }]);
          break;
        case 'static-written':
          setFiles((prev) => [...prev, { path: event.path, bytes: 0 }]);
          break;
        case 'complete':
          setDone(true);
          onComplete(event.outputDir);
          break;
      }
    }

    generateRepo(workshop, outputDir, handleEvent).catch((err) => {
      if (cancelled.current) return;
      onError(err instanceof Error ? err : new Error(String(err)));
    });

    return () => { cancelled.current = true; };
  }, []);

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={done ? 'green' : 'blue'}
        paddingX={2}
        paddingY={1}
      >
        {/* Header */}
        <Box justifyContent="center" marginBottom={1}>
          <Text bold color={done ? 'green' : 'blue'}>
            {done ? 'Workshop Repo Generated' : 'Generating Workshop Repo'}
          </Text>
        </Box>

        {/* Phase indicator */}
        {currentPhase && !done && (
          <Box flexDirection="column" marginBottom={1}>
            <Box>
              <Text>
                {PHASE_LABELS[currentPhase]} ({phaseIndex + 1}/{phaseTotal})...
              </Text>
              {streamingChars > 0 && (
                <Text dimColor> {formatChars(streamingChars)} received</Text>
              )}
            </Box>
            {streamingPreview && (
              <Box>
                <Text dimColor>  &ldquo;{streamingPreview.slice(-70).trimStart()}&hellip;&rdquo;</Text>
              </Box>
            )}
          </Box>
        )}

        {/* Files written */}
        {files.length > 0 && (
          <Box flexDirection="column" marginBottom={1}>
            <Text bold>Files written ({files.length}):</Text>
            {files.map((file, idx) => (
              <Box key={idx}>
                <Text color="green">  + </Text>
                <Text>{file.path}</Text>
                {file.bytes > 0 && (
                  <Text dimColor> ({formatBytes(file.bytes)})</Text>
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* Output directory */}
        {done && (
          <Box>
            <Text>Output: </Text>
            <Text color="cyan">{outputDir}</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  return `${kb.toFixed(1)} KB`;
}

function formatChars(chars: number): string {
  if (chars < 1000) return `${chars} chars`;
  return `${(chars / 1000).toFixed(1)}k chars`;
}
