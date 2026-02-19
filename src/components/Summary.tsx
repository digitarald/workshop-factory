import React, { useRef } from 'react';
import { useKeyboard, KeyEvent } from '@opentui/react';
import type { Workshop } from '../schema.js';

export interface SummaryProps {
  workshop: Workshop;
  savePath: string;
  saveError?: string;
  validationWarnings?: string[];
  onAction: (action: 'export-md' | 'generate-repo' | 'validate' | 'exit') => void | Promise<void>;
}

/**
 * Summary screen — Post-generation stats and next steps
 * Shows workshop statistics, duration breakdown with visual bars, and action shortcuts
 */
export function Summary({ workshop, savePath, saveError, validationWarnings = [], onAction }: SummaryProps) {
  // Calculate statistics
  const stats = calculateStats(workshop);

  // In-flight guard to prevent re-entrant async actions
  const actionInFlight = useRef(false);

  // Handle keyboard input
  useKeyboard((event: KeyEvent) => {
    if (actionInFlight.current) return;

    const actionMap: Record<string, 'export-md' | 'generate-repo' | 'validate' | 'exit'> = {
      e: 'export-md',
      g: 'generate-repo',
      v: 'validate',
      q: 'exit',
    };
    const action = event.name ? actionMap[event.name.toLowerCase()] : undefined;
    if (!action) return;

    actionInFlight.current = true;
    Promise.resolve(onAction(action)).finally(() => {
      actionInFlight.current = false;
    });
  });

  return (
    <box flexDirection="column" paddingX={2} paddingY={1}>
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={saveError ? 'yellow' : 'green'}
        paddingX={2}
        paddingY={1}
      >
        {/* Header */}
        <box justifyContent="center" marginBottom={1}>
          <text attributes="bold" fg={saveError ? 'yellow' : 'green'}>
            {saveError ? 'Workshop Generated (not saved)' : 'Workshop Created'}
          </text>
        </box>

        {/* Title */}
        <box justifyContent="center" marginBottom={1}>
          <text attributes="bold">📚  {workshop.title}</text>
        </box>

        {/* Basic Stats */}
        <box flexDirection="column" marginBottom={1}>
          <Box>
            <Text>Duration:    </text>
            <text attributes="bold">{stats.totalDuration} min</text>
          </box>
          <Box>
            <Text>Modules:     </text>
            <text attributes="bold">{stats.moduleCount}</text>
          </box>
          <Box>
            <Text>Sections:    </text>
            <text attributes="bold">{stats.sectionCount}</text>
          </box>
        </box>

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
            <text attributes="bold">Duration Breakdown</text>
          </box>
          
          {/* Exercises */}
          <Box>
            <Text>Exercises:    </text>
            <Text>{String(stats.exerciseDuration).padStart(2, ' ')} min ({stats.exercisePercent}%)  </text>
            <Text>{renderBar(stats.exercisePercent)}</text>
          </box>

          {/* Lectures */}
          <Box>
            <Text>Lectures:     </text>
            <Text>{String(stats.lectureDuration).padStart(2, ' ')} min ({stats.lecturePercent}%)  </text>
            <Text>{renderBar(stats.lecturePercent)}</text>
          </box>

          {/* Discussions */}
          <Box>
            <Text>Discussions:  </text>
            <Text>{String(stats.discussionDuration).padStart(2, ' ')} min ({stats.discussionPercent}%)  </text>
            <Text>{renderBar(stats.discussionPercent)}</text>
          </box>

          {/* Checkpoints */}
          <Box>
            <Text>Checkpoints:  </text>
            <Text>{String(stats.checkpointDuration).padStart(2, ' ')} min ({stats.checkpointPercent}%)  </text>
            <Text>{renderBar(stats.checkpointPercent)}</text>
          </box>
        </box>

        {/* Additional Stats */}
        <box flexDirection="column" marginBottom={1}>
          <Box>
            <Text>Checkpoints:  </text>
            <text attributes="bold">{stats.checkpointCount}</text>
            <Text> (every ~{stats.avgCheckpointSpacing} min)</text>
          </box>
          <Box>
            <Text>Exercises:    </text>
            <text attributes="bold">{stats.exerciseCount}</text>
            <Text> (with starter code + solutions)</text>
          </box>
        </box>

        {/* Save Path */}
        {saveError ? (
          <box flexDirection="column" marginBottom={1}>
            <text fg="red">Save failed: {saveError}</text>
            <text opacity={0.5}>  Target: {savePath}</text>
            <text opacity={0.5}>  Use [e] or [g] to export from memory</text>
          </box>
        ) : (
          <box marginBottom={1}>
            <Text>Saved to: </text>
            <text fg="cyan">{savePath}</text>
          </box>
        )}

        {/* Validation Warnings */}
        {validationWarnings.length > 0 && (
          <box flexDirection="column" marginBottom={1}>
            <text fg="yellow" attributes="bold">Validation warnings ({validationWarnings.length}):</text>
            {validationWarnings.map((warning, idx) => (
              <text key={idx} fg="yellow">  ✗ {warning}</text>
            ))}
          </box>
        )}

        {/* Next Steps */}
        <box flexDirection="column">
          <text attributes="bold">Next steps:</text>
          <Text>[e] Export to Markdown</text>
          <Text>[g] Generate workshop repo</text>
          <Text>[v] Validate structure</text>
          <Text>[q] Exit</text>
        </box>
      </box>
    </box>
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
