import React from 'react';
import { Box, Text, useInput } from 'ink';
import type { Workshop } from '../schema.js';

export interface SummaryProps {
  workshop: Workshop;
  savePath: string;
  saveError?: string;
  validationWarnings?: string[];
  onAction: (action: 'export-md' | 'export-html' | 'validate' | 'exit') => void;
}

/**
 * Summary screen — Post-generation stats and next steps
 * Shows workshop statistics, duration breakdown with visual bars, and action shortcuts
 */
export function Summary({ workshop, savePath, saveError, validationWarnings = [], onAction }: SummaryProps) {
  // Calculate statistics
  const stats = calculateStats(workshop);

  // Handle keyboard input
  useInput((input) => {
    switch (input.toLowerCase()) {
      case 'e':
        onAction('export-md');
        break;
      case 'h':
        onAction('export-html');
        break;
      case 'v':
        onAction('validate');
        break;
      case 'q':
        onAction('exit');
        break;
    }
  });

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={saveError ? 'yellow' : 'green'}
        paddingX={2}
        paddingY={1}
      >
        {/* Header */}
        <Box justifyContent="center" marginBottom={1}>
          <Text bold color={saveError ? 'yellow' : 'green'}>
            {saveError ? 'Workshop Generated (not saved)' : 'Workshop Created'}
          </Text>
        </Box>

        {/* Title */}
        <Box justifyContent="center" marginBottom={1}>
          <Text bold>📚  {workshop.title}</Text>
        </Box>

        {/* Basic Stats */}
        <Box flexDirection="column" marginBottom={1}>
          <Box>
            <Text>Duration:    </Text>
            <Text bold>{stats.totalDuration} min</Text>
          </Box>
          <Box>
            <Text>Modules:     </Text>
            <Text bold>{stats.moduleCount}</Text>
          </Box>
          <Box>
            <Text>Sections:    </Text>
            <Text bold>{stats.sectionCount}</Text>
          </Box>
        </Box>

        {/* Duration Breakdown */}
        <Box
          flexDirection="column"
          borderStyle="round"
          borderColor="gray"
          paddingX={1}
          paddingY={0}
          marginBottom={1}
        >
          <Box>
            <Text bold>Duration Breakdown</Text>
          </Box>
          
          {/* Exercises */}
          <Box>
            <Text>Exercises:    </Text>
            <Text>{String(stats.exerciseDuration).padStart(2, ' ')} min ({stats.exercisePercent}%)  </Text>
            <Text>{renderBar(stats.exercisePercent)}</Text>
          </Box>

          {/* Lectures */}
          <Box>
            <Text>Lectures:     </Text>
            <Text>{String(stats.lectureDuration).padStart(2, ' ')} min ({stats.lecturePercent}%)  </Text>
            <Text>{renderBar(stats.lecturePercent)}</Text>
          </Box>

          {/* Discussions */}
          <Box>
            <Text>Discussions:  </Text>
            <Text>{String(stats.discussionDuration).padStart(2, ' ')} min ({stats.discussionPercent}%)  </Text>
            <Text>{renderBar(stats.discussionPercent)}</Text>
          </Box>

          {/* Checkpoints */}
          <Box>
            <Text>Checkpoints:  </Text>
            <Text>{String(stats.checkpointDuration).padStart(2, ' ')} min ({stats.checkpointPercent}%)  </Text>
            <Text>{renderBar(stats.checkpointPercent)}</Text>
          </Box>
        </Box>

        {/* Additional Stats */}
        <Box flexDirection="column" marginBottom={1}>
          <Box>
            <Text>Checkpoints:  </Text>
            <Text bold>{stats.checkpointCount}</Text>
            <Text> (every ~{stats.avgCheckpointSpacing} min)</Text>
          </Box>
          <Box>
            <Text>Exercises:    </Text>
            <Text bold>{stats.exerciseCount}</Text>
            <Text> (with starter code + solutions)</Text>
          </Box>
        </Box>

        {/* Save Path */}
        {saveError ? (
          <Box flexDirection="column" marginBottom={1}>
            <Text color="red">Save failed: {saveError}</Text>
            <Text dimColor>  Target: {savePath}</Text>
            <Text dimColor>  Use [e] or [h] to export from memory</Text>
          </Box>
        ) : (
          <Box marginBottom={1}>
            <Text>Saved to: </Text>
            <Text color="cyan">{savePath}</Text>
          </Box>
        )}

        {/* Validation Warnings */}
        {validationWarnings.length > 0 && (
          <Box flexDirection="column" marginBottom={1}>
            <Text color="yellow" bold>Validation warnings ({validationWarnings.length}):</Text>
            {validationWarnings.map((warning, idx) => (
              <Text key={idx} color="yellow">  ✗ {warning}</Text>
            ))}
          </Box>
        )}

        {/* Next Steps */}
        <Box flexDirection="column">
          <Text bold>Next steps:</Text>
          <Text>[e] Export to Markdown</Text>
          <Text>[h] Export to HTML</Text>
          <Text>[v] Validate structure</Text>
          <Text>[q] Exit</Text>
        </Box>
      </Box>
    </Box>
  );
}

/**
 * Calculate workshop statistics
 */
function calculateStats(workshop: Workshop) {
  let exerciseDuration = 0;
  let lectureDuration = 0;
  let discussionDuration = 0;
  let checkpointDuration = 0;
  let exerciseCount = 0;
  let checkpointCount = 0;
  let sectionCount = 0;

  for (const module of workshop.modules) {
    for (const section of module.sections) {
      sectionCount++;
      switch (section.type) {
        case 'exercise':
          exerciseDuration += section.duration;
          exerciseCount++;
          break;
        case 'lecture':
          lectureDuration += section.duration;
          break;
        case 'discussion':
          discussionDuration += section.duration;
          break;
        case 'checkpoint':
          checkpointDuration += section.duration;
          checkpointCount++;
          break;
      }
    }
  }

  const totalDuration = workshop.duration;
  
  // Calculate percentages
  const exercisePercent = Math.round((exerciseDuration / totalDuration) * 100);
  const lecturePercent = Math.round((lectureDuration / totalDuration) * 100);
  const discussionPercent = Math.round((discussionDuration / totalDuration) * 100);
  const checkpointPercent = Math.round((checkpointDuration / totalDuration) * 100);

  // Calculate average checkpoint spacing
  const avgCheckpointSpacing =
    checkpointCount > 0 ? Math.round(totalDuration / checkpointCount) : 0;

  return {
    totalDuration,
    moduleCount: workshop.modules.length,
    sectionCount,
    exerciseDuration,
    lectureDuration,
    discussionDuration,
    checkpointDuration,
    exercisePercent,
    lecturePercent,
    discussionPercent,
    checkpointPercent,
    exerciseCount,
    checkpointCount,
    avgCheckpointSpacing,
  };
}

/**
 * Render a visual bar chart for percentage
 * Uses █ for filled blocks and ░ for empty blocks
 */
function renderBar(percent: number): string {
  const totalBlocks = 14; // Width of the bar
  const filledBlocks = Math.round((percent / 100) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;
  
  return '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
}
