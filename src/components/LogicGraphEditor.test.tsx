import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { WorkspaceProvider, useWorkspaceStore } from '../store/useWorkspaceStore';
import { LogicGraphEditor, isValidGraphConnection } from './LogicGraphEditor';
import { useEffect } from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <WorkspaceProvider>{children}</WorkspaceProvider>
);

function SeededLogicGraphEditor() {
  const { addLogicNode, connectLogicNodes } = useWorkspaceStore();

  useEffect(() => {
    addLogicNode({
      id: 'event1',
      type: 'eventTrigger',
      position: { x: 50, y: 50 },
      data: { eventType: 'onClick' },
    });
    addLogicNode({
      id: 'action1',
      type: 'action',
      position: { x: 250, y: 80 },
      data: { actionType: 'setState', expression: 'count + 1' },
    });
    connectLogicNodes({
      id: 'edge1',
      source: 'event1',
      target: 'action1',
      sourceHandle: 'output',
      targetHandle: 'target',
    });
  }, [addLogicNode, connectLogicNodes]);

  return <LogicGraphEditor />;
}

describe('LogicGraphEditor', () => {
  it('renders the logic graph editor container', () => {
    render(<LogicGraphEditor />, { wrapper });
    expect(screen.getByText('Logic Graph Editor')).toBeInTheDocument();
    expect(document.querySelector('.react-flow')).toBeInTheDocument();
  });

  it('renders custom logic nodes when state contains nodes', async () => {
    render(
      <WorkspaceProvider>
        <SeededLogicGraphEditor />
      </WorkspaceProvider>
    );

    await waitFor(() => expect(screen.getByText('Event Trigger')).toBeInTheDocument());
    expect(screen.getByText('Action')).toBeInTheDocument();
  });
});

describe('isValidGraphConnection', () => {
  const nodes: import('../types/schema').LogicNode[] = [
    { id: 'event1', type: 'eventTrigger', position: { x: 0, y: 0 }, data: {} },
    { id: 'action1', type: 'action', position: { x: 0, y: 0 }, data: {} },
    { id: 'state1', type: 'state', position: { x: 0, y: 0 }, data: {} },
    { id: 'condition1', type: 'condition', position: { x: 0, y: 0 }, data: {} },
  ];

  it('rejects invalid direct connections', () => {
    expect(
      isValidGraphConnection({ source: 'event1', target: 'state1', sourceHandle: null, targetHandle: null }, nodes)
    ).toBe(false);
    expect(
      isValidGraphConnection({ source: 'condition1', target: 'state1', sourceHandle: null, targetHandle: null }, nodes)
    ).toBe(false);
  });

  it('accepts valid eventTrigger-to-action connections', () => {
    expect(
      isValidGraphConnection({ source: 'event1', target: 'action1', sourceHandle: null, targetHandle: null }, nodes)
    ).toBe(true);
  });

  it('accepts valid action-to-state connections', () => {
    expect(
      isValidGraphConnection({ source: 'action1', target: 'state1', sourceHandle: null, targetHandle: null }, nodes)
    ).toBe(true);
  });
});
