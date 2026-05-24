import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkspaceProvider } from '../store/useWorkspaceStore';
import { VisualCanvas } from './VisualCanvas';

describe('VisualCanvas', () => {
  it('renders the visual canvas and toolbox controls', () => {
    render(
      <WorkspaceProvider>
        <VisualCanvas />
      </WorkspaceProvider>
    );

    expect(screen.getByText('Visual Canvas')).toBeInTheDocument();
    expect(screen.getByText('Add div')).toBeInTheDocument();
    expect(screen.getByText('Add button')).toBeInTheDocument();
    expect(screen.getByText('Selected node: none')).toBeInTheDocument();
  });
});
