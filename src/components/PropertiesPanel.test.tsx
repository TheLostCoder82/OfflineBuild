import { useEffect } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkspaceProvider, useWorkspaceStore } from '../store/useWorkspaceStore';
import { PropertiesPanel } from './PropertiesPanel';
import { LayoutNode } from '../types/schema';

function TestPropertiesSetup() {
  const { addLayoutNode, setSelectedLayoutNodeId, state } = useWorkspaceStore();

  useEffect(() => {
    const node: LayoutNode = {
      id: 'selected-node',
      type: 'div',
      children: [],
      props: { className: 'test-node' },
      styles: {
        display: 'flex',
        padding: '12px',
      },
    };

    addLayoutNode(node.id, node);
    setSelectedLayoutNodeId(node.id);
  }, [addLayoutNode, setSelectedLayoutNodeId]);

  return <div data-testid="current-padding">{state.layoutTree.nodes['selected-node']?.styles.padding}</div>;
}

describe('PropertiesPanel', () => {
  it('prepopulates selected node style fields and updates the store', async () => {
    render(
      <WorkspaceProvider>
        <PropertiesPanel />
        <TestPropertiesSetup />
      </WorkspaceProvider>
    );

    const paddingInput = await screen.findByDisplayValue('12px');
    expect(paddingInput).toBeInTheDocument();

    fireEvent.change(paddingInput, { target: { value: '16px' } });

    await waitFor(() => {
      expect(screen.getByTestId('current-padding')).toHaveTextContent('16px');
    });
  });
});
