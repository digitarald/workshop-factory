import React, { useState } from 'react';
import { useRenderer, useKeyboard } from '@opentui/react';
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
    if (isLoading || isOpening) {
      if (key === 'escape') {
        renderer.exit();
      }
      return;
    }

    if (key === 'up') {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : optionCount - 1));
      return;
    }

    if (key === 'down') {
      setSelectedIndex((prev) => (prev < optionCount - 1 ? prev + 1 : 0));
      return;
    }

    if (key === 'enter') {
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

    if (key === 'escape') {
      renderer.exit();
    }
  });

  return (
    <box style={{ flexDirection: 'column', padding: 1 }}>
      <box style={{ marginBottom: 1 }}>
        <text style={{ fontWeight: 'bold', color: 'cyan' }}>Workshop Factory</text>
      </box>

      <box style={{ marginBottom: 1 }}>
        <text style={{ color: 'yellow' }}>Select a workshop:</text>
      </box>

      {error && (
        <box style={{ marginBottom: 1 }}>
          <text style={{ color: 'red' }}>{error}</text>
        </box>
      )}

      {isLoading ? (
        <text style={{ opacity: 0.6 }}>Loading workshops...</text>
      ) : (
        <box style={{ flexDirection: 'column' }}>
          <box style={{ flexDirection: 'column', marginBottom: workshops.length > 0 ? 1 : 0 }}>
            <text style={{ color: selectedIndex === 0 ? 'green' : 'white' }}>
              {selectedIndex === 0 ? '› ' : '  '}
              Create new workshop
            </text>
          </box>

          {workshops.length === 0 ? (
            <text style={{ opacity: 0.6 }}>No existing workshops found in this directory.</text>
          ) : (
            workshops.map((workshop, index) => {
              const itemIndex = index + 1;
              const selected = selectedIndex === itemIndex;
              return (
                <box key={workshop.path} style={{ flexDirection: 'column', marginBottom: 1 }}>
                  <text style={{ color: selected ? 'green' : 'white' }}>
                    {selected ? '› ' : '  '}
                    {workshop.title}
                  </text>
                  <box style={{ paddingLeft: 2 }}>
                    <text style={{ opacity: 0.6 }}>
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
        <text style={{ opacity: 0.6 }}>
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
