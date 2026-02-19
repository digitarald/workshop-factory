import React, { useState } from 'react';
import { useKeyboard, useRenderer } from '@opentui/react';
import { KeyEvent } from '@opentui/core';
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
  const renderer = useRenderer();
  const exit = () => {
    renderer.stop();
    process.exit(0);
  };
  const [selectedIndex, setSelectedIndex] = useState(0);

  const optionCount = workshops.length + 1;

  useKeyboard((event: KeyEvent) => {
    if (isLoading || isOpening) {
      if (event.name === 'escape') {
        exit();
      }
      return;
    }

    if (event.name === 'up') {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : optionCount - 1));
      return;
    }

    if (event.name === 'down') {
      setSelectedIndex((prev) => (prev < optionCount - 1 ? prev + 1 : 0));
      return;
    }

    if (event.name === 'return') {
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

    if (event.name === 'escape') {
      exit();
    }
  });

  return (
    <box flexDirection="column" padding={1}>
      <box marginBottom={1}>
        <text attributes="bold" fg="cyan">Workshop Factory</text>
      </box>

      <box marginBottom={1}>
        <text fg="yellow">Select a workshop:</text>
      </box>

      {error && (
        <box marginBottom={1}>
          <text fg="red">{error}</text>
        </box>
      )}

      {isLoading ? (
        <text opacity={0.5}>Loading workshops...</text>
      ) : (
        <box flexDirection="column">
          <box flexDirection="column" marginBottom={workshops.length > 0 ? 1 : 0}>
            <text fg={selectedIndex === 0 ? 'green' : 'white'}>
              {selectedIndex === 0 ? '› ' : '  '}
              Create new workshop
            </text>
          </box>

          {workshops.length === 0 ? (
            <text opacity={0.5}>No existing workshops found in this directory.</text>
          ) : (
            workshops.map((workshop, index) => {
              const itemIndex = index + 1;
              const selected = selectedIndex === itemIndex;
              return (
                <box key={workshop.path} flexDirection="column" marginBottom={1}>
                  <text fg={selected ? 'green' : 'white'}>
                    {selected ? '› ' : '  '}
                    {workshop.title}
                  </text>
                  <box paddingLeft={2}>
                    <text opacity={0.5}>
                      {workshop.path} • {workshop.duration} min • {workshop.moduleCount} modules
                    </text>
                  </box>
                </box>
              );
            })
          )}
        </box>
      )}

      <box marginTop={1}>
        <text opacity={0.5}>
          {isLoading
            ? 'Loading workshops... Press ESC to cancel'
            : isOpening
              ? 'Opening workshop... Press ESC to cancel'
              : 'Use ↑↓ to navigate, Enter to select, ESC to cancel'}
        </text>
      </box>
    </box>
  );
}
