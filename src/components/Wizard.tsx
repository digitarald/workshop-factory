import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';

interface WizardProps {
  contextFiles?: string[];
  onComplete: (params: {
    topic: string;
    audience: { level: 'beginner' | 'intermediate' | 'advanced'; stack?: string };
    duration: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    contextFiles: string[];
  }) => void;
}

type AudienceLevel = 'beginner' | 'intermediate' | 'advanced';
type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface DurationOption {
  label: string;
  minutes: number;
}

const AUDIENCE_LEVELS: AudienceLevel[] = ['beginner', 'intermediate', 'advanced'];
const DIFFICULTY_LEVELS: Difficulty[] = ['beginner', 'intermediate', 'advanced'];
const DURATION_OPTIONS: DurationOption[] = [
  { label: '30min', minutes: 30 },
  { label: '60min', minutes: 60 },
  { label: '90min', minutes: 90 },
  { label: '120min', minutes: 120 },
  { label: 'half-day (4h)', minutes: 240 },
  { label: 'full-day (8h)', minutes: 480 },
];

export function Wizard({ contextFiles = [], onComplete }: WizardProps) {
  const { exit } = useApp();
  
  // State machine: 0=topic, 1=audience_level, 2=audience_stack, 3=duration, 4=difficulty, 5=confirm
  const [step, setStep] = useState(0);
  
  // Collected data
  const [topic, setTopic] = useState('');
  const [audienceLevel, setAudienceLevel] = useState<AudienceLevel>('beginner');
  const [audienceStack, setAudienceStack] = useState('');
  const [duration, setDuration] = useState(60);
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  
  // UI state for current step
  const [inputValue, setInputValue] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Step 0: Topic (text input)
  useInput((input, key) => {
    if (step === 0) {
      if (key.return) {
        if (inputValue.trim()) {
          setTopic(inputValue.trim());
          setInputValue('');
          setStep(1);
        }
      } else if (key.backspace || key.delete) {
        setInputValue([...inputValue].slice(0, -1).join(''));
      } else if (key.escape) {
        exit();
      } else if (!key.ctrl && !key.meta && input) {
        setInputValue(inputValue + input);
      }
    }
  }, { isActive: step === 0 });

  // Step 1: Audience Level (select)
  useInput((input, key) => {
    if (step === 1) {
      if (key.upArrow) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : AUDIENCE_LEVELS.length - 1));
      } else if (key.downArrow) {
        setSelectedIndex((prev) => (prev < AUDIENCE_LEVELS.length - 1 ? prev + 1 : 0));
      } else if (key.return) {
        setAudienceLevel(AUDIENCE_LEVELS[selectedIndex]!);
        setSelectedIndex(0);
        setStep(2);
      } else if (key.escape) {
        exit();
      }
    }
  }, { isActive: step === 1 });

  // Step 2: Audience Stack (text input, optional)
  useInput((input, key) => {
    if (step === 2) {
      if (key.return) {
        setAudienceStack(inputValue.trim());
        setInputValue('');
        setSelectedIndex(0);
        setStep(3);
      } else if (key.backspace || key.delete) {
        setInputValue([...inputValue].slice(0, -1).join(''));
      } else if (key.escape) {
        exit();
      } else if (!key.ctrl && !key.meta && input) {
        setInputValue(inputValue + input);
      }
    }
  }, { isActive: step === 2 });

  // Step 3: Duration (select)
  useInput((input, key) => {
    if (step === 3) {
      if (key.upArrow) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : DURATION_OPTIONS.length - 1));
      } else if (key.downArrow) {
        setSelectedIndex((prev) => (prev < DURATION_OPTIONS.length - 1 ? prev + 1 : 0));
      } else if (key.return) {
        setDuration(DURATION_OPTIONS[selectedIndex]!.minutes);
        setSelectedIndex(0);
        setStep(4);
      } else if (key.escape) {
        exit();
      }
    }
  }, { isActive: step === 3 });

  // Step 4: Difficulty (select)
  useInput((input, key) => {
    if (step === 4) {
      if (key.upArrow) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : DIFFICULTY_LEVELS.length - 1));
      } else if (key.downArrow) {
        setSelectedIndex((prev) => (prev < DIFFICULTY_LEVELS.length - 1 ? prev + 1 : 0));
      } else if (key.return) {
        setDifficulty(DIFFICULTY_LEVELS[selectedIndex]!);
        setStep(5);
      } else if (key.escape) {
        exit();
      }
    }
  }, { isActive: step === 4 });

  // Step 5: Confirm (y/n)
  useInput((input, key) => {
    if (step === 5) {
      if (input === 'y' || input === 'Y') {
        onComplete({
          topic,
          audience: {
            level: audienceLevel,
            stack: audienceStack || undefined,
          },
          duration,
          difficulty,
          contextFiles,
        });
      } else if (input === 'n' || input === 'N') {
        exit();
      } else if (key.escape) {
        exit();
      }
    }
  }, { isActive: step === 5 });

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text bold color="cyan">
          Workshop Factory - New Workshop
        </Text>
      </Box>

      {/* Step indicator */}
      <Box marginBottom={1}>
        <Text dimColor>
          Step {step + 1} of 6
        </Text>
      </Box>

      {/* Step 0: Topic */}
      {step === 0 && (
        <Box flexDirection="column">
          <Text color="yellow">What topic should this workshop cover?</Text>
          <Box marginTop={1}>
            <Text color="green">&gt; </Text>
            <Text>{inputValue}</Text>
            <Text color="cyan">█</Text>
          </Box>
        </Box>
      )}

      {/* Step 1: Audience Level */}
      {step === 1 && (
        <Box flexDirection="column">
          <Text color="yellow">Select audience level:</Text>
          <Box marginTop={1} flexDirection="column">
            {AUDIENCE_LEVELS.map((level, index) => (
              <Box key={level}>
                <Text color={index === selectedIndex ? 'green' : 'white'}>
                  {index === selectedIndex ? '› ' : '  '}
                  {level}
                </Text>
              </Box>
            ))}
          </Box>
          <Box marginTop={1}>
            <Text dimColor>Use ↑↓ to navigate, Enter to select</Text>
          </Box>
        </Box>
      )}

      {/* Step 2: Audience Stack */}
      {step === 2 && (
        <Box flexDirection="column">
          <Text color="yellow">What technology stack? (optional, press Enter to skip)</Text>
          <Box marginTop={1}>
            <Text color="green">&gt; </Text>
            <Text>{inputValue}</Text>
            <Text color="cyan">█</Text>
          </Box>
        </Box>
      )}

      {/* Step 3: Duration */}
      {step === 3 && (
        <Box flexDirection="column">
          <Text color="yellow">Select workshop duration:</Text>
          <Box marginTop={1} flexDirection="column">
            {DURATION_OPTIONS.map((option, index) => (
              <Box key={option.label}>
                <Text color={index === selectedIndex ? 'green' : 'white'}>
                  {index === selectedIndex ? '› ' : '  '}
                  {option.label}
                </Text>
              </Box>
            ))}
          </Box>
          <Box marginTop={1}>
            <Text dimColor>Use ↑↓ to navigate, Enter to select</Text>
          </Box>
        </Box>
      )}

      {/* Step 4: Difficulty */}
      {step === 4 && (
        <Box flexDirection="column">
          <Text color="yellow">Select difficulty level:</Text>
          <Box marginTop={1} flexDirection="column">
            {DIFFICULTY_LEVELS.map((level, index) => (
              <Box key={level}>
                <Text color={index === selectedIndex ? 'green' : 'white'}>
                  {index === selectedIndex ? '› ' : '  '}
                  {level}
                </Text>
              </Box>
            ))}
          </Box>
          <Box marginTop={1}>
            <Text dimColor>Use ↑↓ to navigate, Enter to select</Text>
          </Box>
        </Box>
      )}

      {/* Step 5: Confirm */}
      {step === 5 && (
        <Box flexDirection="column">
          <Text bold color="cyan">
            Review your workshop configuration:
          </Text>
          
          <Box marginY={1} />
          
          <Box flexDirection="column" paddingLeft={2}>
            <Box>
              <Text bold>Topic: </Text>
              <Text>{topic}</Text>
            </Box>
            <Box>
              <Text bold>Audience: </Text>
              <Text>{audienceLevel}</Text>
              {audienceStack && (
                <Text> ({audienceStack})</Text>
              )}
            </Box>
            <Box>
              <Text bold>Duration: </Text>
              <Text>{DURATION_OPTIONS.find(d => d.minutes === duration)?.label}</Text>
            </Box>
            <Box>
              <Text bold>Difficulty: </Text>
              <Text>{difficulty}</Text>
            </Box>
            {contextFiles.length > 0 && (
              <Box flexDirection="column">
                <Text bold>Context files:</Text>
                {contextFiles.map((file) => (
                  <Text key={file}>  • {file}</Text>
                ))}
              </Box>
            )}
          </Box>

          <Box>
            <Text color="yellow">Create this workshop? (y/n): </Text>
          </Box>
        </Box>
      )}

      {/* Footer hint */}
      <Box marginTop={1}>
        <Text dimColor>Press ESC to cancel</Text>
      </Box>
    </Box>
  );
}
