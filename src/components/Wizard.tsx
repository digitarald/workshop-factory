import React, { useState } from 'react';
import { useKeyboard, useRenderer } from '@opentui/react';

interface WizardProps {
  contextFiles?: string[];
  onComplete: (params: {
    topic: string;
    audience: { level: 'beginner' | 'intermediate' | 'advanced'; stack?: string };
    duration: number;
    contextFiles: string[];
  }) => void;
}

type AudienceLevel = 'beginner' | 'intermediate' | 'advanced';

interface DurationOption {
  label: string;
  minutes: number;
}

const AUDIENCE_LEVELS: AudienceLevel[] = ['beginner', 'intermediate', 'advanced'];
const DURATION_OPTIONS: DurationOption[] = [
  { label: '30min', minutes: 30 },
  { label: '60min', minutes: 60 },
  { label: '90min', minutes: 90 },
  { label: '120min', minutes: 120 },
  { label: 'half-day (4h)', minutes: 240 },
  { label: 'full-day (8h)', minutes: 480 },
];

export function Wizard({ contextFiles = [], onComplete }: WizardProps) {
  const renderer = useRenderer();

  // State machine: 0=topic, 1=audience_level, 2=audience_stack, 3=duration, 4=confirm
  const [step, setStep] = useState(0);

  // Collected data
  const [topic, setTopic] = useState('');
  const [audienceLevel, setAudienceLevel] = useState<AudienceLevel>('beginner');
  const [audienceStack, setAudienceStack] = useState('');
  const [duration, setDuration] = useState(60);

  // UI state for current step
  const [topicInput, setTopicInput] = useState('');
  const [stackInput, setStackInput] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useKeyboard((key) => {
    if (key.name === 'escape') {
      renderer.destroy();
      return;
    }

    // Text input steps: advance on Enter
    if (key.name === 'return' || key.name === 'enter') {
      if (step === 0) {
        if (topicInput.trim()) {
          setTopic(topicInput.trim());
          setTopicInput('');
          setSelectedIndex(0);
          setStep(1);
        }
        return;
      }
      if (step === 2) {
        setAudienceStack(stackInput.trim());
        setStackInput('');
        setSelectedIndex(0);
        setStep(3);
        return;
      }
    }

    // Selection steps: arrow navigation + Enter
    if (step === 1) {
      if (key.name === 'up') {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : AUDIENCE_LEVELS.length - 1));
      } else if (key.name === 'down') {
        setSelectedIndex((prev) => (prev < AUDIENCE_LEVELS.length - 1 ? prev + 1 : 0));
      } else if (key.name === 'return' || key.name === 'enter') {
        setAudienceLevel(AUDIENCE_LEVELS[selectedIndex]!);
        setSelectedIndex(0);
        setStep(2);
      }
      return;
    }

    if (step === 3) {
      if (key.name === 'up') {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : DURATION_OPTIONS.length - 1));
      } else if (key.name === 'down') {
        setSelectedIndex((prev) => (prev < DURATION_OPTIONS.length - 1 ? prev + 1 : 0));
      } else if (key.name === 'return' || key.name === 'enter') {
        setDuration(DURATION_OPTIONS[selectedIndex]!.minutes);
        setSelectedIndex(0);
        setStep(4);
      }
      return;
    }

    // Confirm step
    if (step === 4) {
      if (key.name === 'y') {
        onComplete({
          topic,
          audience: {
            level: audienceLevel,
            stack: audienceStack || undefined,
          },
          duration,
          contextFiles,
        });
      } else if (key.name === 'n') {
        renderer.destroy();
      }
      return;
    }
  });

  return (
    <box flexDirection="column" padding={1}>
      {/* Header */}
      <box marginBottom={1}>
        <text fg="cyan"><strong>Workshop Factory - New Workshop</strong></text>
      </box>

      {/* Step indicator */}
      <box marginBottom={1}>
        <text fg="#888888">Step {step + 1} of 5</text>
      </box>

      {/* Step 0: Topic */}
      {step === 0 && (
        <box flexDirection="column">
          <text fg="yellow">What topic should this workshop cover?</text>
          <box marginTop={1} flexDirection="row">
            <text fg="green">&gt; </text>
            <input
              value={topicInput}
              onChange={(v) => setTopicInput(v)}
              placeholder="Enter topic..."
              focused
              width={60}
            />
          </box>
          <box marginTop={1}>
            <text fg="#888888">Press Enter to continue</text>
          </box>
        </box>
      )}

      {/* Step 1: Audience Level */}
      {step === 1 && (
        <box flexDirection="column">
          <text fg="yellow">Select audience level:</text>
          <box marginTop={1} flexDirection="column">
            {AUDIENCE_LEVELS.map((level, index) => (
              <box key={level}>
                <text fg={index === selectedIndex ? 'green' : 'white'}>
                  {index === selectedIndex ? '› ' : '  '}
                  {level}
                </text>
              </box>
            ))}
          </box>
          <box marginTop={1}>
            <text fg="#888888">Use ↑↓ to navigate, Enter to select</text>
          </box>
        </box>
      )}

      {/* Step 2: Audience Stack */}
      {step === 2 && (
        <box flexDirection="column">
          <text fg="yellow">What technology stack? (optional, press Enter to skip)</text>
          <box marginTop={1} flexDirection="row">
            <text fg="green">&gt; </text>
            <input
              value={stackInput}
              onChange={(v) => setStackInput(v)}
              placeholder="e.g. TypeScript, Python..."
              focused
              width={60}
            />
          </box>
          <box marginTop={1}>
            <text fg="#888888">Press Enter to continue</text>
          </box>
        </box>
      )}

      {/* Step 3: Duration */}
      {step === 3 && (
        <box flexDirection="column">
          <text fg="yellow">Select workshop duration:</text>
          <box marginTop={1} flexDirection="column">
            {DURATION_OPTIONS.map((option, index) => (
              <box key={option.label}>
                <text fg={index === selectedIndex ? 'green' : 'white'}>
                  {index === selectedIndex ? '› ' : '  '}
                  {option.label}
                </text>
              </box>
            ))}
          </box>
          <box marginTop={1}>
            <text fg="#888888">Use ↑↓ to navigate, Enter to select</text>
          </box>
        </box>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <box flexDirection="column">
          <text fg="cyan"><strong>Review your workshop configuration:</strong></text>

          <box marginY={1} />

          <box flexDirection="column" paddingLeft={2}>
            <box>
              <text><strong>Topic: </strong>{topic}</text>
            </box>
            <box>
              <text>
                <strong>Audience: </strong>{audienceLevel}
                {audienceStack ? ` (${audienceStack})` : ''}
              </text>
            </box>
            <box>
              <text><strong>Duration: </strong>{DURATION_OPTIONS.find(d => d.minutes === duration)?.label}</text>
            </box>
            {contextFiles.length > 0 && (
              <box flexDirection="column">
                <text><strong>Context files:</strong></text>
                {contextFiles.map((file) => (
                  <text key={file}>  • {file}</text>
                ))}
              </box>
            )}
          </box>

          <box>
            <text fg="yellow">Create this workshop? (y/n): </text>
          </box>
        </box>
      )}

      {/* Footer hint */}
      <box marginTop={1}>
        <text fg="#888888">Press ESC to cancel</text>
      </box>
    </box>
  );
}
