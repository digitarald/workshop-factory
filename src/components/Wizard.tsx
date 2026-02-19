import React, { useState } from 'react';
import { useKeyboard } from '@opentui/react';
import { TextAttributes } from '@opentui/core';

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
  // State machine: 0=topic, 1=audience_level, 2=audience_stack, 3=duration, 4=confirm
  const [step, setStep] = useState(0);
  
  // Collected data
  const [topic, setTopic] = useState('');
  const [audienceLevel, setAudienceLevel] = useState<AudienceLevel>('beginner');
  const [audienceStack, setAudienceStack] = useState('');
  const [duration, setDuration] = useState(60);
  
  // UI state for current step
  const [inputValue, setInputValue] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Handle keyboard input for all steps
  useKeyboard((event) => {
    // Step 0: Topic (text input)
    if (step === 0) {
      if (event.name === 'return') {
        if (inputValue.trim()) {
          setTopic(inputValue.trim());
          setInputValue('');
          setStep(1);
        }
      } else if (event.name === 'backspace') {
        setInputValue([...inputValue].slice(0, -1).join(''));
      } else if (event.name === 'escape') {
        process.exit(0);
      } else if (event.name.length === 1) {
        setInputValue(inputValue + event.name);
      }
    }
    // Step 1: Audience Level (select)
    else if (step === 1) {
      if (event.name === 'up') {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : AUDIENCE_LEVELS.length - 1));
      } else if (event.name === 'down') {
        setSelectedIndex((prev) => (prev < AUDIENCE_LEVELS.length - 1 ? prev + 1 : 0));
      } else if (event.name === 'return') {
        setAudienceLevel(AUDIENCE_LEVELS[selectedIndex]!);
        setSelectedIndex(0);
        setStep(2);
      } else if (event.name === 'escape') {
        process.exit(0);
      }
    }
    // Step 2: Audience Stack (text input, optional)
    else if (step === 2) {
      if (event.name === 'return') {
        setAudienceStack(inputValue.trim());
        setInputValue('');
        setSelectedIndex(0);
        setStep(3);
      } else if (event.name === 'backspace') {
        setInputValue([...inputValue].slice(0, -1).join(''));
      } else if (event.name === 'escape') {
        process.exit(0);
      } else if (event.name.length === 1) {
        setInputValue(inputValue + event.name);
      }
    }
    // Step 3: Duration (select)
    else if (step === 3) {
      if (event.name === 'up') {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : DURATION_OPTIONS.length - 1));
      } else if (event.name === 'down') {
        setSelectedIndex((prev) => (prev < DURATION_OPTIONS.length - 1 ? prev + 1 : 0));
      } else if (event.name === 'return') {
        setDuration(DURATION_OPTIONS[selectedIndex]!.minutes);
        setSelectedIndex(0);
        setStep(4);
      } else if (event.name === 'escape') {
        process.exit(0);
      }
    }
    // Step 4: Confirm (y/n)
    else if (step === 4) {
      if (event.name === 'y' || event.name === 'Y') {
        onComplete({
          topic,
          audience: {
            level: audienceLevel,
            stack: audienceStack || undefined,
          },
          duration,
          contextFiles,
        });
      } else if (event.name === 'n' || event.name === 'N') {
        process.exit(0);
      } else if (event.name === 'escape') {
        process.exit(0);
      }
    }
  });

  return (
    <box style={{ flexDirection: 'column', padding: 1 }}>
      {/* Header */}
      <box style={{ marginBottom: 1 }}>
        <text attributes={TextAttributes.BOLD} fg="cyan">
          Workshop Factory - New Workshop
        </text>
      </box>

      {/* Step indicator */}
      <box style={{ marginBottom: 1 }}>
        <text attributes={TextAttributes.DIM}>
          Step {step + 1} of 5
        </text>
      </box>

      {/* Step 0: Topic */}
      {step === 0 && (
        <box style={{ flexDirection: 'column' }}>
          <text fg="yellow">What topic should this workshop cover?</text>
          <box style={{ marginTop: 1 }}>
            <text fg="green">&gt; </text>
            <text>{inputValue}</text>
            <text fg="cyan">█</text>
          </box>
        </box>
      )}

      {/* Step 1: Audience Level */}
      {step === 1 && (
        <box style={{ flexDirection: 'column' }}>
          <text fg="yellow">Select audience level:</text>
          <box style={{ marginTop: 1, flexDirection: 'column' }}>
            {AUDIENCE_LEVELS.map((level, index) => (
              <box key={level}>
                <text fg={index === selectedIndex ? 'green' : 'white'}>
                  {index === selectedIndex ? '› ' : '  '}
                  {level}
                </text>
              </box>
            ))}
          </box>
          <box style={{ marginTop: 1 }}>
            <text attributes={TextAttributes.DIM}>Use ↑↓ to navigate, Enter to select</text>
          </box>
        </box>
      )}

      {/* Step 2: Audience Stack */}
      {step === 2 && (
        <box style={{ flexDirection: 'column' }}>
          <text fg="yellow">What technology stack? (optional, press Enter to skip)</text>
          <box style={{ marginTop: 1 }}>
            <text fg="green">&gt; </text>
            <text>{inputValue}</text>
            <text fg="cyan">█</text>
          </box>
        </box>
      )}

      {/* Step 3: Duration */}
      {step === 3 && (
        <box style={{ flexDirection: 'column' }}>
          <text fg="yellow">Select workshop duration:</text>
          <box style={{ marginTop: 1, flexDirection: 'column' }}>
            {DURATION_OPTIONS.map((option, index) => (
              <box key={option.label}>
                <text fg={index === selectedIndex ? 'green' : 'white'}>
                  {index === selectedIndex ? '› ' : '  '}
                  {option.label}
                </text>
              </box>
            ))}
          </box>
          <box style={{ marginTop: 1 }}>
            <text attributes={TextAttributes.DIM}>Use ↑↓ to navigate, Enter to select</text>
          </box>
        </box>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <box style={{ flexDirection: 'column' }}>
          <text attributes={TextAttributes.BOLD} fg="cyan">
            Review your workshop configuration:
          </text>
          
          <box style={{ marginTop: 1, marginBottom: 1 }} />
          
          <box style={{ flexDirection: 'column', paddingLeft: 2 }}>
            <box>
              <text attributes={TextAttributes.BOLD}>Topic: </text>
              <text>{topic}</text>
            </box>
            <box>
              <text attributes={TextAttributes.BOLD}>Audience: </text>
              <text>{audienceLevel}</text>
              {audienceStack && (
                <text> ({audienceStack})</text>
              )}
            </box>
            <box>
              <text attributes={TextAttributes.BOLD}>Duration: </text>
              <text>{DURATION_OPTIONS.find(d => d.minutes === duration)?.label}</text>
            </box>
            {contextFiles.length > 0 && (
              <box style={{ flexDirection: 'column' }}>
                <text attributes={TextAttributes.BOLD}>Context files:</text>
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
      <box style={{ marginTop: 1 }}>
        <text attributes={TextAttributes.DIM}>Press ESC to cancel</text>
      </box>
    </box>
  );
}
