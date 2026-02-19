import React, { useState } from 'react';
import { useKeyboard } from '@opentui/react';
import { TextAttributes } from '@opentui/core';
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
  const [selectedIndex, setSelectedIndex] = useState(0);

  const optionCount = workshops.length + 1;

  useKeyboard((event) => {
    if (isLoading || isOpening) {
      if (event.name === 'escape') {
        process.exit(0);
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
      process.exit(0);
    }
  });

  return (
    <box style={{ flexDirection: 'column', padding: 1 }}>
      <box style={{ marginBottom: 1 }}>
        <text attributes={TextAttributes.BOLD} fg="cyan">Workshop Factory</text>
      </box>

      <box style={{ marginBottom: 1 }}>
        <text fg="yellow">Select a workshop:</text>
      </box>

      {error && (
        <box style={{ marginBottom: 1 }}>
          <text fg="red">{error}</text>
        </box>
      )}

      {isLoading ? (
        <text attributes={TextAttributes.DIM}>Loading workshops...</text>
      ) : (
        <box style={{ flexDirection: 'column' }}>
          <box style={{ flexDirection: 'column', marginBottom: workshops.length > 0 ? 1 : 0 }}>
            <text fg={selectedIndex === 0 ? 'green' : 'white'}>
              {selectedIndex === 0 ? '› ' : '  '}
              Create new workshop
            </text>
          </box>

          {workshops.length === 0 ? (
            <text attributes={TextAttributes.DIM}>No existing workshops found in this directory.</text>
          ) : (
            workshops.map((workshop, index) => {
              const itemIndex = index + 1;
              const selected = selectedIndex === itemIndex;
              return (
                <box key={workshop.path} style={{ flexDirection: 'column', marginBottom: 1 }}>
                  <text fg={selected ? 'green' : 'white'}>
                    {selected ? '› ' : '  '}
                    {workshop.title}
                  </text>
                  <box style={{ paddingLeft: 2 }}>
                    <text attributes={TextAttributes.DIM}>
                      {workshop.path} • {workshop.duration} min • {workshop.moduleCount} modules
                    </text>
                  </box>
                </box>
              );
            })
          )}
        </box>
      )}

      <box style={{ marginTop: 1 }}>
        <text attributes={TextAttributes.DIM}>
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
