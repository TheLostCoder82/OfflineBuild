import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkspaceProvider } from '../store/useWorkspaceStore';
import { WorkspaceShell } from './WorkspaceShell';
import { VisualCanvas } from './VisualCanvas';

// Helper to create a mock dataTransfer object
function createDataTransfer() {
  const data: Record<string, string> = {};
  return {
    data,
    setData: (k: string, v: string) => { data[k] = v; },
    getData: (k: string) => data[k],
    effectAllowed: '',
  } as unknown as DataTransfer;
}

describe('Drag and drop from sidebar to canvas', () => {
  it('creates and selects a new node on drop', async () => {
    render(
      <WorkspaceProvider>
        <WorkspaceShell visualView={<VisualCanvas />} logicView={<div />} />
      </WorkspaceProvider>
    );

    const divItem = screen.getByText('Div');
    const canvas = screen.getByTestId('canvas-dropzone');

    const dt = createDataTransfer();
    fireEvent.dragStart(divItem, { dataTransfer: dt });
    fireEvent.dragOver(canvas, { dataTransfer: dt });
    fireEvent.drop(canvas, { dataTransfer: dt });

    const selectedLabel = await screen.findByText(/Selected node:/i);
    expect(selectedLabel).toBeInTheDocument();
    expect(selectedLabel.textContent).not.toMatch(/none/i);
  });
});
