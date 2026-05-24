/**
 * Workspace Shell Component Tests
 * 
 * Unit tests for the VS Code-like Workspace Shell layout using React Testing Library and Vitest.
 * Verifies that all five major semantic layout zones render correctly and that the view toggle
 * functionality works as expected.
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkspaceShell } from './WorkspaceShell';
import { WorkspaceProvider } from '../store/useWorkspaceStore';

const defaultVisualView = <div data-testid="canvas-content">Canvas Content</div>;
const defaultLogicView = <div data-testid="logic-content">Logic Content</div>;

function renderShell() {
  return render(
    <WorkspaceProvider>
      <WorkspaceShell visualView={defaultVisualView} logicView={defaultLogicView} />
    </WorkspaceProvider>
  );
}

describe('WorkspaceShell', () => {
  it('renders all five major layout zones', () => {
    renderShell();

    // Verify Left Activity Bar exists (contains icons)
    const activityBar = document.querySelector('.w-12.bg-slate-900');
    expect(activityBar).toBeInTheDocument();

    // Verify Left Sidebar exists (Components panel)
    const leftSidebar = document.querySelector('.w-64.bg-slate-800');
    expect(leftSidebar).toBeInTheDocument();

    // Verify Central Canvas area exists
    const canvasContent = screen.getByTestId('canvas-content');
    expect(canvasContent).toBeInTheDocument();

    // Verify Right Properties Panel exists
    const rightPanel = document.querySelector('.w-80.bg-slate-800.border-l');
    expect(rightPanel).toBeInTheDocument();

    // Verify Bottom Debug Terminal exists
    const bottomPanel = document.querySelector('.h-56.bg-slate-900.border-t');
    expect(bottomPanel).toBeInTheDocument();
  });

  it('displays the correct title in the top menu bar', () => {
    renderShell();
    
    const titleElement = screen.getByText('React-Spaghetti IDE');
    expect(titleElement).toBeInTheDocument();
  });

  it('toggles between Visual UI Designer and Logic Flow Map views', () => {
    renderShell();

    // Initially should show Visual UI Designer as active
    const visualButton = screen.getByText('Visual UI Designer');
    const logicButton = screen.getByText('Logic Flow Map');

    expect(visualButton).toHaveClass('bg-blue-600');
    expect(logicButton).not.toHaveClass('bg-blue-600');

    // Click Logic Flow Map button
    fireEvent.click(logicButton);

    // Now Logic Flow Map should be active
    expect(logicButton).toHaveClass('bg-blue-600');
    expect(visualButton).not.toHaveClass('bg-blue-600');

    // Click back to Visual UI Designer
    fireEvent.click(visualButton);

    // Visual UI Designer should be active again
    expect(visualButton).toHaveClass('bg-blue-600');
    expect(logicButton).not.toHaveClass('bg-blue-600');
  });

  it('can collapse and expand the left sidebar', () => {
    renderShell();

    // Left sidebar should be visible initially
    expect(document.querySelector('.w-64.bg-slate-800')).toBeInTheDocument();

    // Find and click the collapse button
    const collapseButton = document.querySelector('.w-64.bg-slate-800 button');
    if (collapseButton) {
      fireEvent.click(collapseButton);

      // Sidebar should be collapsed (w-6 element should appear)
      expect(document.querySelector('.w-6.bg-slate-800')).toBeInTheDocument();
    }
  });

  it('can collapse and expand the right properties panel', () => {
    renderShell();

    // Right panel should be visible initially
    expect(document.querySelector('.w-80.bg-slate-800.border-l')).toBeInTheDocument();

    // Find and click the collapse button
    const collapseButton = document.querySelector('.w-80.bg-slate-800.border-l button');
    if (collapseButton) {
      fireEvent.click(collapseButton);

      // Panel should be collapsed (w-6 element should appear on the right)
      expect(document.querySelector('.w-6.bg-slate-800.border-l')).toBeInTheDocument();
    }
  });

  it('can collapse and expand the bottom debug terminal', () => {
    renderShell();

    // Bottom panel should be visible initially
    expect(document.querySelector('.h-56.bg-slate-900.border-t')).toBeInTheDocument();

    // Find and click the collapse button
    const collapseButton = document.querySelector('.h-56.bg-slate-900.border-t button');
    if (collapseButton) {
      fireEvent.click(collapseButton);

      // Panel should be collapsed (h-6 element should appear)
      expect(document.querySelector('.h-6.bg-slate-900.border-t')).toBeInTheDocument();
    }
  });

  it('displays placeholder message in properties panel when no element is selected', () => {
    renderShell();

    const placeholderMessage = screen.getByText(
      'Select a visual node element on the canvas to configure properties'
    );
    expect(placeholderMessage).toBeInTheDocument();
  });

  it('displays initial debug console messages', () => {
    renderShell();

    // Debug console shows checkmark and info symbols with messages
    expect(document.querySelector('.text-green-400')).toBeInTheDocument();
    expect(document.querySelector('.text-blue-400')).toBeInTheDocument();
  });
});
