import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkspaceProvider } from '../store/useWorkspaceStore';
import { WorkspaceShell } from './WorkspaceShell';
import { VisualCanvas } from './VisualCanvas';

describe('Workspace Sidebar integration', () => {
  it('adds a node to the canvas when a palette item is clicked', async () => {
    render(
      <WorkspaceProvider>
        <WorkspaceShell visualView={<VisualCanvas />} logicView={<div />} />
      </WorkspaceProvider>
    );

    // Click the Div palette item in the left sidebar
    const divItem = screen.getByText('Div');
    fireEvent.click(divItem);

    // The VisualCanvas renders a "Selected node:" indicator
    const selectedLabel = await screen.findByText(/Selected node:/i);
    expect(selectedLabel).toBeInTheDocument();
    // Ensure it's not the default 'none' value
    expect(selectedLabel.textContent).not.toMatch(/none/i);
  });
});
