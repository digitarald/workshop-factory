import React, { useRef } from 'react';
import { useKeyboard } from '@opentui/react';
import { TextAttributes } from '@opentui/core';
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
  useKeyboard((event) => {
    if (actionInFlight.current) return;

    const actionMap: Record<string, 'export-md' | 'generate-repo' | 'validate' | 'exit'> = {
      e: 'export-md',
      g: 'generate-repo',
      v: 'validate',
      q: 'exit',
    };
    const action = actionMap[event.name.toLowerCase()];
    if (!action) return;

    actionInFlight.current = true;
    Promise.resolve(onAction(action)).finally(() => {
      actionInFlight.current = false;
    });
  });

  return (
    <box style={{ flexDirection: 'column', paddingLeft: 2, paddingRight: 2, paddingTop: 1, paddingBottom: 1 }}>
      <box
        style={{
          flexDirection: 'column',
          borderStyle: 'rounded',
          borderColor: saveError ? 'yellow' : 'green',
          paddingLeft: 2,
          paddingRight: 2,
          paddingTop: 1,
          paddingBottom: 1,
        }}
      >
        {/* Header */}
        <box style={{ justifyContent: 'center', marginBottom: 1 }}>
          <text attributes={TextAttributes.BOLD} fg={saveError ? 'yellow' : 'green'}>
            {saveError ? 'Workshop Generated (not saved)' : 'Workshop Created'}
          </text>
        </box>

        {/* Title */}
        <box style={{ justifyContent: 'center', marginBottom: 1 }}>
          <text attributes={TextAttributes.BOLD}>📚  {workshop.title}</text>
        </box>

        {/* Basic Stats */}
        <box style={{ flexDirection: 'column', marginBottom: 1 }}>
          <box>
            <text>Duration:    </text>
            <text attributes={TextAttributes.BOLD}>{stats.totalDuration} min</text>
          </box>
          <box>
            <text>Modules:     </text>
            <text attributes={TextAttributes.BOLD}>{stats.moduleCount}</text>
          </box>
          <box>
            <text>Sections:    </text>
            <text attributes={TextAttributes.BOLD}>{stats.sectionCount}</text>
          </box>
        </box>

        {/* Duration Breakdown */}
        <box
          style={{
            flexDirection: 'column',
            borderStyle: 'rounded',
            borderColor: 'gray',
            paddingLeft: 1,
            paddingRight: 1,
            paddingTop: 0,
            paddingBottom: 0,
            marginBottom: 1,
          }}
        >
          <box>
            <text attributes={TextAttributes.BOLD}>Duration Breakdown</text>
          </box>
          
          {/* Exercises */}
          <box>
            <text>Exercises:    </text>
            <text>{String(stats.exerciseDuration).padStart(2, ' ')} min ({stats.exercisePercent}%)  </text>
            <text>{renderBar(stats.exercisePercent)}</text>
          </box>

          {/* Lectures */}
          <box>
            <text>Lectures:     </text>
            <text>{String(stats.lectureDuration).padStart(2, ' ')} min ({stats.lecturePercent}%)  </text>
            <text>{renderBar(stats.lecturePercent)}</text>
          </box>

          {/* Discussions */}
          <box>
            <text>Discussions:  </text>
            <text>{String(stats.discussionDuration).padStart(2, ' ')} min ({stats.discussionPercent}%)  </text>
            <text>{renderBar(stats.discussionPercent)}</text>
          </box>

          {/* Checkpoints */}
          <box>
            <text>Checkpoints:  </text>
            <text>{String(stats.checkpointDuration).padStart(2, ' ')} min ({stats.checkpointPercent}%)  </text>
            <text>{renderBar(stats.checkpointPercent)}</text>
          </box>
        </box>

        {/* Additional Stats */}
        <box style={{ flexDirection: 'column', marginBottom: 1 }}>
          <box>
            <text>Checkpoints:  </text>
            <text attributes={TextAttributes.BOLD}>{stats.checkpointCount}</text>
            <text> (every ~{stats.avgCheckpointSpacing} min)</text>
          </box>
          <box>
            <text>Exercises:    </text>
            <text attributes={TextAttributes.BOLD}>{stats.exerciseCount}</text>
            <text> (with starter code + solutions)</text>
          </box>
        </box>

        {/* Save Path */}
        {saveError ? (
          <box style={{ flexDirection: 'column', marginBottom: 1 }}>
            <text fg="red">Save failed: {saveError}</text>
            <text attributes={TextAttributes.DIM}>  Target: {savePath}</text>
            <text attributes={TextAttributes.DIM}>  Use [e] or [g] to export from memory</text>
          </box>
        ) : (
          <box style={{ marginBottom: 1 }}>
            <text>Saved to: </text>
            <text fg="cyan">{savePath}</text>
          </box>
        )}

        {/* Validation Warnings */}
        {validationWarnings.length > 0 && (
          <box style={{ flexDirection: 'column', marginBottom: 1 }}>
            <text fg="yellow" attributes={TextAttributes.BOLD}>Validation warnings ({validationWarnings.length}):</text>
            {validationWarnings.map((warning, idx) => (
              <text key={idx} fg="yellow">  ✗ {warning}</text>
            ))}
          </box>
        )}

        {/* Next Steps */}
        <box style={{ flexDirection: 'column' }}>
          <text attributes={TextAttributes.BOLD}>Next steps:</text>
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
