import React, { useState } from 'react';
import { useKeyboard, useRenderer } from '@opentui/react';
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
  const [selectedIndex, setSelectedIndex] = useState(0);

  const optionCount = workshops.length + 1;

  useKeyboard((key) => {
    if (key.name === 'escape') {
      renderer.destroy();
      return;
    }

    if (isLoading || isOpening) return;

    if (key.name === 'up') {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : optionCount - 1));
      return;
    }

    if (key.name === 'down') {
      setSelectedIndex((prev) => (prev < optionCount - 1 ? prev + 1 : 0));
      return;
    }

    if (key.name === 'return' || key.name === 'enter') {
      if (selectedIndex === 0) {
        onCreateNew();
        return;
      }

      const workshop = workshops[selectedIndex - 1];
      if (!workshop) return;

      onSelect(workshop);
    }
  });

  return (
    <box flexDirection="column" padding={1}>
      <box marginBottom={1}>
        <text fg="cyan"><strong>Workshop Factory</strong></text>
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
        <text fg="#888888">Loading workshops...</text>
      ) : (
        <box flexDirection="column">
          <box flexDirection="column" marginBottom={workshops.length > 0 ? 1 : 0}>
            <text fg={selectedIndex === 0 ? 'green' : 'white'}>
              {selectedIndex === 0 ? '› ' : '  '}
              Create new workshop
            </text>
          </box>

          {workshops.length === 0 ? (
            <text fg="#888888">No existing workshops found in this directory.</text>
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
                    <text fg="#888888">
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
        <text fg="#888888">
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
