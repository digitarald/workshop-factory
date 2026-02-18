import React, { useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import type { ExistingWorkshop } from '../workshops.js';

export interface WorkshopPickerProps {
  workshops: ExistingWorkshop[];
  isLoading?: boolean;
  isOpening?: boolean;
  error?: string;
  onCreateNew: () => void;
  onSelect: (workshop: ExistingWorkshop) => void;
}

export function WorkshopPicker({
  workshops,
  isLoading = false,
  isOpening = false,
  error,
  onCreateNew,
  onSelect,
}: WorkshopPickerProps) {
  const { exit } = useApp();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const optionCount = workshops.length + 1;

  useInput((_, key) => {
    if (isLoading || isOpening) {
      if (key.escape) {
        exit();
      }
      return;
    }

    if (key.upArrow) {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : optionCount - 1));
      return;
    }

    if (key.downArrow) {
      setSelectedIndex((prev) => (prev < optionCount - 1 ? prev + 1 : 0));
      return;
    }

    if (key.return) {
      if (selectedIndex === 0) {
        onCreateNew();
        return;
      }

      const workshop = workshops[selectedIndex - 1];
      if (!workshop) {
        return;
      }

      onSelect(workshop);
      return;
    }

    if (key.escape) {
      exit();
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">Workshop Factory</Text>
      </Box>

      <Box marginBottom={1}>
        <Text color="yellow">Select a workshop:</Text>
      </Box>

      {error && (
        <Box marginBottom={1}>
          <Text color="red">{error}</Text>
        </Box>
      )}

      {isLoading ? (
        <Text dimColor>Loading workshops...</Text>
      ) : (
        <Box flexDirection="column">
          <Box flexDirection="column" marginBottom={workshops.length > 0 ? 1 : 0}>
            <Text color={selectedIndex === 0 ? 'green' : 'white'}>
              {selectedIndex === 0 ? '› ' : '  '}
              Create new workshop
            </Text>
          </Box>

          {workshops.length === 0 ? (
            <Text dimColor>No existing workshops found in this directory.</Text>
          ) : (
            workshops.map((workshop, index) => {
              const itemIndex = index + 1;
              const selected = selectedIndex === itemIndex;
              return (
                <Box key={workshop.path} flexDirection="column" marginBottom={1}>
                  <Text color={selected ? 'green' : 'white'}>
                    {selected ? '› ' : '  '}
                    {workshop.title}
                  </Text>
                  <Box paddingLeft={2}>
                    <Text dimColor>
                      {workshop.path} • {workshop.duration} min • {workshop.moduleCount} modules
                    </Text>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>
          {isLoading
            ? 'Loading workshops... Press ESC to cancel'
            : isOpening
              ? 'Opening workshop... Press ESC to cancel'
              : 'Use ↑↓ to navigate, Enter to select, ESC to cancel'}
        </Text>
      </Box>
    </Box>
  );
}
