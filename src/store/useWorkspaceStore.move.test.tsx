import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { WorkspaceProvider, useWorkspaceStore } from './useWorkspaceStore';
import { createLayoutNode } from '../utils/createLayoutNode';
import { act } from 'react';

function Capture(): null {
  const api = useWorkspaceStore();
  // expose a getter so tests can read the latest context after updates
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  React.useEffect(() => { (globalThis as any).getApi = () => api; }, [api]);
  return null;
}

describe('useWorkspaceStore moveLayoutNode', () => {
  it('moves a node from one parent to another at a specific index', async () => {
    render(
      <WorkspaceProvider>
        <Capture />
      </WorkspaceProvider>
    );

    // access captured API via getter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const api = (globalThis as any).getApi() as ReturnType<typeof useWorkspaceStore>;
    const rootId = api.state.layoutTree.rootId;

    const parentA = createLayoutNode('div');
    const parentB = createLayoutNode('div');
    const child = createLayoutNode('span');
    // ensure unique ids in tests (createLayoutNode uses Date.now)
    parentB.id = parentB.id + '-b';
    child.id = child.id + '-c';

    await act(async () => {
      api.addLayoutNode(parentA.id, parentA);
      api.addLayoutNode(parentB.id, parentB);
      api.addLayoutNode(child.id, child);

      // add both parents to root
      api.updateLayoutNode(rootId, { children: [parentA.id, parentB.id] });

      // put child under parentA
      api.updateLayoutNode(parentA.id, { children: [child.id] });
    });

    // allow state to settle
    await Promise.resolve();

    // Debug: dump nodes
    // eslint-disable-next-line no-console
    // call getter to obtain latest context
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const latest1 = (globalThis as any).getApi();
    // eslint-disable-next-line no-console
    console.log('nodes after setup:', Object.keys(latest1.state.layoutTree.nodes));

    // Sanity check
    expect(latest1.state.layoutTree.nodes[parentA.id].children).toContain(child.id);
    expect(latest1.state.layoutTree.nodes[parentB.id].children).not.toContain(child.id);

    // Move child to parentB at index 0
    await act(async () => {
      latest1.moveLayoutNode(child.id, parentB.id, 0);
    });

    await Promise.resolve();

    // get fresh snapshot
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const latest2 = (globalThis as any).getApi();
    expect(latest2.state.layoutTree.nodes[parentA.id].children).not.toContain(child.id);
    expect(latest2.state.layoutTree.nodes[parentB.id].children[0]).toBe(child.id);
  });

  it('reorders within same parent when index provided', async () => {
    render(
      <WorkspaceProvider>
        <Capture />
      </WorkspaceProvider>
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const api = (globalThis as any).getApi() as ReturnType<typeof useWorkspaceStore>;
    const rootId = api.state.layoutTree.rootId;

    const parent = createLayoutNode('div');
    const child1 = createLayoutNode('div');
    const child2 = createLayoutNode('div');
    // ensure unique ids
    child1.id = child1.id + '-1';
    child2.id = child2.id + '-2';

    await act(async () => {
      api.addLayoutNode(parent.id, parent);
      api.addLayoutNode(child1.id, child1);
      api.addLayoutNode(child2.id, child2);

      api.updateLayoutNode(rootId, { children: [parent.id] });
      api.updateLayoutNode(parent.id, { children: [child1.id, child2.id] });
    });

    await Promise.resolve();

    // Debug: dump nodes
    // eslint-disable-next-line no-console
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const snapshot = (globalThis as any).getApi();
    // eslint-disable-next-line no-console
    console.log('nodes for reorder test:', Object.keys(snapshot.state.layoutTree.nodes));

    // Move child2 to index 0 under same parent
    await act(async () => {
      api.moveLayoutNode(child2.id, parent.id, 0);
    });

    await Promise.resolve();

    // get fresh snapshot
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const latest = (globalThis as any).getApi();
    expect(latest.state.layoutTree.nodes[parent.id].children[0]).toBe(child2.id);
    expect(latest.state.layoutTree.nodes[parent.id].children[1]).toBe(child1.id);
  });
});
