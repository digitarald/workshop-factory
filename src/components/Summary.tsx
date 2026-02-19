import React, { useRef } from 'react';
import { useKeyboard } from '@opentui/react';
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
  useKeyboard((key) => {
    if (actionInFlight.current) return;

    const actionMap: Record<string, 'export-md' | 'generate-repo' | 'validate' | 'exit'> = {
      e: 'export-md',
      g: 'generate-repo',
      v: 'validate',
      q: 'exit',
    };
    const action = actionMap[key.name];
    if (!action) return;

    actionInFlight.current = true;
    Promise.resolve(onAction(action)).finally(() => {
      actionInFlight.current = false;
    });
  });

  return (
    <box flexDirection="column" paddingX={2} paddingY={1}>
      <box
        flexDirection="column"
        border
        borderStyle="rounded"
        borderColor={saveError ? 'yellow' : 'green'}
        paddingX={2}
        paddingY={1}
      >
        {/* Header */}
        <box justifyContent="center" marginBottom={1}>
          <text fg={saveError ? 'yellow' : 'green'}>
            <strong>{saveError ? 'Workshop Generated (not saved)' : 'Workshop Created'}</strong>
          </text>
        </box>

        {/* Title */}
        <box justifyContent="center" marginBottom={1}>
          <text><strong>📚  {workshop.title}</strong></text>
        </box>

        {/* Basic Stats */}
        <box flexDirection="column" marginBottom={1}>
          <box>
            <text>Duration:    <strong>{stats.totalDuration} min</strong></text>
          </box>
          <box>
            <text>Modules:     <strong>{stats.moduleCount}</strong></text>
          </box>
          <box>
            <text>Sections:    <strong>{stats.sectionCount}</strong></text>
          </box>
        </box>

        {/* Duration Breakdown */}
        <box
          flexDirection="column"
          border
          borderStyle="rounded"
          borderColor="gray"
          paddingX={1}
          paddingY={0}
          marginBottom={1}
        >
          <box>
            <text><strong>Duration Breakdown</strong></text>
          </box>

          {/* Exercises */}
          <box>
            <text>
              Exercises:    {String(stats.exerciseDuration).padStart(2, ' ')} min ({stats.exercisePercent}%)  {renderBar(stats.exercisePercent)}
            </text>
          </box>

          {/* Lectures */}
          <box>
            <text>
              Lectures:     {String(stats.lectureDuration).padStart(2, ' ')} min ({stats.lecturePercent}%)  {renderBar(stats.lecturePercent)}
            </text>
          </box>

          {/* Discussions */}
          <box>
            <text>
              Discussions:  {String(stats.discussionDuration).padStart(2, ' ')} min ({stats.discussionPercent}%)  {renderBar(stats.discussionPercent)}
            </text>
          </box>

          {/* Checkpoints */}
          <box>
            <text>
              Checkpoints:  {String(stats.checkpointDuration).padStart(2, ' ')} min ({stats.checkpointPercent}%)  {renderBar(stats.checkpointPercent)}
            </text>
          </box>
        </box>

        {/* Additional Stats */}
        <box flexDirection="column" marginBottom={1}>
          <box>
            <text>Checkpoints:  <strong>{stats.checkpointCount}</strong> (every ~{stats.avgCheckpointSpacing} min)</text>
          </box>
          <box>
            <text>Exercises:    <strong>{stats.exerciseCount}</strong> (with starter code + solutions)</text>
          </box>
        </box>

        {/* Save Path */}
        {saveError ? (
          <box flexDirection="column" marginBottom={1}>
            <text fg="red">Save failed: {saveError}</text>
            <text fg="#888888">  Target: {savePath}</text>
            <text fg="#888888">  Use [e] or [g] to export from memory</text>
          </box>
        ) : (
          <box marginBottom={1}>
            <text>Saved to: <span fg="cyan">{savePath}</span></text>
          </box>
        )}

        {/* Validation Warnings */}
        {validationWarnings.length > 0 && (
          <box flexDirection="column" marginBottom={1}>
            <text fg="yellow"><strong>Validation warnings ({validationWarnings.length}):</strong></text>
            {validationWarnings.map((warning, idx) => (
              <text key={idx} fg="yellow">  ✗ {warning}</text>
            ))}
          </box>
        )}

        {/* Next Steps */}
        <box flexDirection="column">
          <text><strong>Next steps:</strong></text>
          <text>[e] Export to Markdown</text>
          <text>[g] Generate workshop repo</text>
          <text>[v] Validate structure</text>
          <text>[q] Exit</text>
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
