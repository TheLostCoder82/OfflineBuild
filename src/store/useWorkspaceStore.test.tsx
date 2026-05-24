/**
 * Workspace Store Tests
 * 
 * Comprehensive unit tests for useWorkspaceStore.tsx using Vitest.
 * Tests state management, layout node mutations, logic graph operations, and undo/redo functionality.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { WorkspaceProvider, useWorkspaceStore } from './useWorkspaceStore';
import { LayoutNode, LogicNode, LogicEdge } from '../types/schema';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <WorkspaceProvider>{children}</WorkspaceProvider>
);

describe('useWorkspaceStore', () => {
  beforeEach(() => {
    // Reset is handled by re-rendering in each test
  });

  describe('initial state', () => {
    it('should initialize with default project metadata', () => {
      const { result } = renderHook(() => useWorkspaceStore(), { wrapper });

      expect(result.current.state.projectMetadata.componentName).toBe('MyComponent');
      expect(result.current.state.projectMetadata.framework).toBe('react-ts');
      expect(result.current.state.projectMetadata.stylingStrategy).toBe('tailwind');
    });

    it('should initialize with a root layout node', () => {
      const { result } = renderHook(() => useWorkspaceStore(), { wrapper });

      expect(result.current.state.layoutTree.rootId).toBe('root');
      expect(result.current.state.layoutTree.nodes.root).toBeDefined();
      expect(result.current.state.layoutTree.nodes.root.type).toBe('div');
    });

    it('should initialize with empty logic graph', () => {
      const { result } = renderHook(() => useWorkspaceStore(), { wrapper });

      expect(result.current.state.logicGraph.nodes).toEqual([]);
      expect(result.current.state.logicGraph.edges).toEqual([]);
    });
  });

  describe('layout node operations', () => {
    it('should update a layout node and save to history', () => {
      const { result } = renderHook(() => useWorkspaceStore(), { wrapper });

      const initialStyles = result.current.state.layoutTree.nodes.root.styles;

      act(() => {
        result.current.updateLayoutNode('root', { styles: { ...initialStyles, padding: '24px' } });
      });

      expect(result.current.state.layoutTree.nodes.root.styles.padding).toBe('24px');
      expect(result.current.canUndo).toBe(true);
    });

    it('should add a new layout node', () => {
      const { result } = renderHook(() => useWorkspaceStore(), { wrapper });

      const newNode: LayoutNode = {
        id: 'button1',
        type: 'button',
        children: [],
        props: { className: 'btn' },
        styles: { padding: '8px' },
      };

      act(() => {
        result.current.addLayoutNode('button1', newNode);
      });

      expect(result.current.state.layoutTree.nodes.button1).toBeDefined();
      expect(result.current.state.layoutTree.nodes.button1.type).toBe('button');
    });

    it('should remove a layout node', () => {
      const { result } = renderHook(() => useWorkspaceStore(), { wrapper });

      // First add a node
      const newNode: LayoutNode = {
        id: 'tempNode',
        type: 'span',
        children: [],
        props: {},
        styles: {},
      };

      act(() => {
        result.current.addLayoutNode('tempNode', newNode);
      });

      expect(result.current.state.layoutTree.nodes.tempNode).toBeDefined();

      // Then remove it
      act(() => {
        result.current.removeLayoutNode('tempNode');
      });

      expect(result.current.state.layoutTree.nodes.tempNode).toBeUndefined();
    });
  });

  describe('logic graph operations', () => {
    it('should add a logic node', () => {
      const { result } = renderHook(() => useWorkspaceStore(), { wrapper });

      const stateNode: LogicNode = {
        id: 'state1',
        type: 'state',
        position: { x: 100, y: 100 },
        data: { name: 'counter', initialValue: 0, dataType: 'number' },
      };

      act(() => {
        result.current.addLogicNode(stateNode);
      });

      expect(result.current.state.logicGraph.nodes.length).toBe(1);
      expect(result.current.state.logicGraph.nodes[0].data.name).toBe('counter');
    });

    it('should update a logic node', () => {
      const { result } = renderHook(() => useWorkspaceStore(), { wrapper });

      const stateNode: LogicNode = {
        id: 'state1',
        type: 'state',
        position: { x: 100, y: 100 },
        data: { name: 'counter', initialValue: 0, dataType: 'number' },
      };

      act(() => {
        result.current.addLogicNode(stateNode);
      });

      act(() => {
        result.current.updateLogicNode('state1', { data: { initialValue: 10 } });
      });

      expect(result.current.state.logicGraph.nodes[0].data.initialValue).toBe(10);
    });

    it('should remove a logic node and its connected edges', () => {
      const { result } = renderHook(() => useWorkspaceStore(), { wrapper });

      const stateNode: LogicNode = {
        id: 'state1',
        type: 'state',
        position: { x: 100, y: 100 },
        data: { name: 'counter', initialValue: 0 },
      };

      const edge: LogicEdge = {
        id: 'edge1',
        source: 'event1',
        target: 'state1',
      };

      act(() => {
        result.current.addLogicNode(stateNode);
        result.current.connectLogicNodes(edge);
      });

      expect(result.current.state.logicGraph.nodes.length).toBe(1);
      expect(result.current.state.logicGraph.edges.length).toBe(1);

      act(() => {
        result.current.removeLogicNode('state1');
      });

      expect(result.current.state.logicGraph.nodes.length).toBe(0);
      expect(result.current.state.logicGraph.edges.length).toBe(0);
    });

    it('should connect two logic nodes with an edge', () => {
      const { result } = renderHook(() => useWorkspaceStore(), { wrapper });

      const edge: LogicEdge = {
        id: 'edge1',
        source: 'event1',
        target: 'action1',
      };

      act(() => {
        result.current.connectLogicNodes(edge);
      });

      expect(result.current.state.logicGraph.edges.length).toBe(1);
      expect(result.current.state.logicGraph.edges[0].source).toBe('event1');
      expect(result.current.state.logicGraph.edges[0].target).toBe('action1');
    });

    it('should remove a logic edge', () => {
      const { result } = renderHook(() => useWorkspaceStore(), { wrapper });

      const edge: LogicEdge = {
        id: 'edge1',
        source: 'event1',
        target: 'action1',
      };

      act(() => {
        result.current.connectLogicNodes(edge);
      });

      act(() => {
        result.current.removeLogicEdge('edge1');
      });

      expect(result.current.state.logicGraph.edges.length).toBe(0);
    });
  });

  describe('undo/redo functionality', () => {
    it('should undo a layout node update', () => {
      const { result } = renderHook(() => useWorkspaceStore(), { wrapper });

      const initialPadding = result.current.state.layoutTree.nodes.root.styles.padding;

      act(() => {
        result.current.updateLayoutNode('root', { styles: { padding: '32px' } });
      });

      expect(result.current.state.layoutTree.nodes.root.styles.padding).toBe('32px');

      act(() => {
        result.current.undo();
      });

      expect(result.current.state.layoutTree.nodes.root.styles.padding).toBe(initialPadding);
    });

    it('should redo a layout node update after undo', () => {
      const { result } = renderHook(() => useWorkspaceStore(), { wrapper });

      act(() => {
        result.current.updateLayoutNode('root', { styles: { padding: '32px' } });
      });

      act(() => {
        result.current.undo();
      });

      expect(result.current.state.layoutTree.nodes.root.styles.padding).not.toBe('32px');

      act(() => {
        result.current.redo();
      });

      expect(result.current.state.layoutTree.nodes.root.styles.padding).toBe('32px');
    });

    it('should not undo when there are no past states', () => {
      const { result } = renderHook(() => useWorkspaceStore(), { wrapper });

      expect(result.current.canUndo).toBe(false);

      act(() => {
        result.current.undo();
      });

      expect(result.current.canUndo).toBe(false);
    });

    it('should not redo when there are no future states', () => {
      const { result } = renderHook(() => useWorkspaceStore(), { wrapper });

      expect(result.current.canRedo).toBe(false);

      act(() => {
        result.current.redo();
      });

      expect(result.current.canRedo).toBe(false);
    });

    it('should handle multiple undo/redo operations', () => {
      const { result } = renderHook(() => useWorkspaceStore(), { wrapper });

      act(() => {
        result.current.updateLayoutNode('root', { styles: { padding: '10px' } });
        result.current.updateLayoutNode('root', { styles: { padding: '20px' } });
        result.current.updateLayoutNode('root', { styles: { padding: '30px' } });
      });

      expect(result.current.state.layoutTree.nodes.root.styles.padding).toBe('30px');

      act(() => {
        result.current.undo();
      });
      expect(result.current.state.layoutTree.nodes.root.styles.padding).toBe('20px');

      act(() => {
        result.current.undo();
      });
      expect(result.current.state.layoutTree.nodes.root.styles.padding).toBe('10px');

      act(() => {
        result.current.redo();
      });
      expect(result.current.state.layoutTree.nodes.root.styles.padding).toBe('20px');

      act(() => {
        result.current.redo();
      });
      expect(result.current.state.layoutTree.nodes.root.styles.padding).toBe('30px');
    });
  });

  describe('canUndo/canRedo flags', () => {
    it('should set canUndo to true after a mutation', () => {
      const { result } = renderHook(() => useWorkspaceStore(), { wrapper });

      expect(result.current.canUndo).toBe(false);

      act(() => {
        result.current.updateLayoutNode('root', { styles: { padding: '20px' } });
      });

      expect(result.current.canUndo).toBe(true);
    });

    it('should set canRedo to true after undo', () => {
      const { result } = renderHook(() => useWorkspaceStore(), { wrapper });

      act(() => {
        result.current.updateLayoutNode('root', { styles: { padding: '20px' } });
      });

      expect(result.current.canRedo).toBe(false);

      act(() => {
        result.current.undo();
      });

      expect(result.current.canRedo).toBe(true);
    });
  });
});
