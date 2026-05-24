/**
 * Workspace Store Context
 * 
 * Implements the centralized application data state store engine context featuring
 * deep transaction snapshotting capability supporting undo/redo operations.
 * 
 * This is the single source of truth for the IDE application state, encapsulating:
 * - projectMetadata
 * - layoutTree (dynamic dictionary map)
 * - logicGraph (graph definition array)
 */

import { createContext, useContext, useReducer, useCallback, ReactNode, useState } from 'react';
import { AppSchema, LayoutNode, LogicNode, LogicEdge } from '../types/schema';

/**
 * History state for undo/redo functionality
 * Maintains past states, present state, and future states
 */
interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

/**
 * Initial state structure matching AppSchema
 */
const initialState: AppSchema = {
  projectMetadata: {
    componentName: 'MyComponent',
    framework: 'react-ts',
    stylingStrategy: 'tailwind',
  },
  layoutTree: {
    rootId: 'root',
    nodes: {
      root: {
        id: 'root',
        type: 'div',
        children: [],
        props: { className: 'container' },
        styles: { padding: '16px' },
      },
    },
  },
  logicGraph: {
    nodes: [],
    edges: [],
  },
};

/**
 * Action types for state mutations
 */
type WorkspaceAction =
  | { type: 'UPDATE_LAYOUT_NODE'; payload: { nodeId: string; nodeData: Partial<LayoutNode> } }
  | { type: 'ADD_LAYOUT_NODE'; payload: { nodeId: string; nodeData: LayoutNode } }
  | { type: 'REMOVE_LAYOUT_NODE'; payload: { nodeId: string } }
  | { type: 'ADD_LOGIC_NODE'; payload: { node: LogicNode } }
  | { type: 'UPDATE_LOGIC_NODE'; payload: { nodeId: string; nodeData: Partial<LogicNode> } }
  | { type: 'REMOVE_LOGIC_NODE'; payload: { nodeId: string } }
  | { type: 'CONNECT_LOGIC_NODES'; payload: { edge: LogicEdge } }
  | { type: 'REMOVE_LOGIC_EDGE'; payload: { edgeId: string } }
  | { type: 'MOVE_LAYOUT_NODE'; payload: { nodeId: string; newParentId: string; index?: number } }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_STATE'; payload: AppSchema };

/**
 * History-aware state type
 */
type HistoryAwareState = HistoryState<AppSchema>;

/**
 * Initial history state
 */
const initialHistoryState: HistoryAwareState = {
  past: [],
  present: initialState,
  future: [],
};

/**
 * Reducer function for managing workspace state with history
 * 
 * @param state - Current history-aware state
 * @param action - Action to process
 * @returns New history-aware state
 */
function workspaceReducer(state: HistoryAwareState, action: WorkspaceAction): HistoryAwareState {
  const saveToHistory = (newPresent: AppSchema): HistoryAwareState => ({
    past: [...state.past, state.present],
    present: newPresent,
    future: [],
  });

  switch (action.type) {
    case 'UPDATE_LAYOUT_NODE': {
      const { nodeId, nodeData } = action.payload;
      const newLayoutTree = {
        ...state.present.layoutTree,
        nodes: {
          ...state.present.layoutTree.nodes,
          [nodeId]: {
            ...state.present.layoutTree.nodes[nodeId],
            ...nodeData,
          },
        },
      };
      return saveToHistory({
        ...state.present,
        layoutTree: newLayoutTree,
      });
    }

    case 'ADD_LAYOUT_NODE': {
      const { nodeId, nodeData } = action.payload;
      const newLayoutTree = {
        ...state.present.layoutTree,
        nodes: {
          ...state.present.layoutTree.nodes,
          [nodeId]: nodeData,
        },
      };
      return saveToHistory({
        ...state.present,
        layoutTree: newLayoutTree,
      });
    }

    case 'REMOVE_LAYOUT_NODE': {
      const { nodeId } = action.payload;
      const { [nodeId]: removed, ...remainingNodes } = state.present.layoutTree.nodes;
      return saveToHistory({
        ...state.present,
        layoutTree: {
          ...state.present.layoutTree,
          nodes: remainingNodes,
        },
      });
    }

    case 'ADD_LOGIC_NODE': {
      const { node } = action.payload;
      const newLogicGraph = {
        ...state.present.logicGraph,
        nodes: [...state.present.logicGraph.nodes, node],
      };
      return saveToHistory({
        ...state.present,
        logicGraph: newLogicGraph,
      });
    }

    case 'UPDATE_LOGIC_NODE': {
      const { nodeId, nodeData } = action.payload;
      const newLogicGraph = {
        ...state.present.logicGraph,
        nodes: state.present.logicGraph.nodes.map((n) =>
          n.id === nodeId ? { ...n, ...nodeData } : n
        ),
      };
      return saveToHistory({
        ...state.present,
        logicGraph: newLogicGraph,
      });
    }

    case 'REMOVE_LOGIC_NODE': {
      const { nodeId } = action.payload;
      const newLogicGraph = {
        ...state.present.logicGraph,
        nodes: state.present.logicGraph.nodes.filter((n) => n.id !== nodeId),
        edges: state.present.logicGraph.edges.filter(
          (e) => e.source !== nodeId && e.target !== nodeId
        ),
      };
      return saveToHistory({
        ...state.present,
        logicGraph: newLogicGraph,
      });
    }

    case 'MOVE_LAYOUT_NODE': {
      const { nodeId, newParentId, index } = action.payload;
      const nodes = { ...state.present.layoutTree.nodes };

      // find previous parent (if any)
      let prevParentId: string | null = null;
      for (const [id, node] of Object.entries(nodes)) {
        if (node.children.includes(nodeId)) {
          prevParentId = id;
          break;
        }
      }

      // Remove from previous parent children
      if (prevParentId) {
        const prevParent = nodes[prevParentId];
        const prevChildren = prevParent.children.filter((c) => c !== nodeId);
        nodes[prevParentId] = { ...prevParent, children: prevChildren };
      }

      // Insert into new parent at specified index or append
      const parentNode = nodes[newParentId];
      if (!parentNode) return state;
      const newChildren = [...parentNode.children];
      const insertAt = typeof index === 'number' && index >= 0 && index <= newChildren.length ? index : newChildren.length;
      newChildren.splice(insertAt, 0, nodeId);
      nodes[newParentId] = { ...parentNode, children: newChildren };

      return saveToHistory({
        ...state.present,
        layoutTree: {
          ...state.present.layoutTree,
          nodes,
        },
      });
    }

    case 'CONNECT_LOGIC_NODES': {
      const { edge } = action.payload;
      const newLogicGraph = {
        ...state.present.logicGraph,
        edges: [...state.present.logicGraph.edges, edge],
      };
      return saveToHistory({
        ...state.present,
        logicGraph: newLogicGraph,
      });
    }

    case 'REMOVE_LOGIC_EDGE': {
      const { edgeId } = action.payload;
      const newLogicGraph = {
        ...state.present.logicGraph,
        edges: state.present.logicGraph.edges.filter((e) => e.id !== edgeId),
      };
      return saveToHistory({
        ...state.present,
        logicGraph: newLogicGraph,
      });
    }

    case 'UNDO': {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, state.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [state.present, ...state.future],
      };
    }

    case 'REDO': {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        past: [...state.past, state.present],
        present: next,
        future: newFuture,
      };
    }

    case 'SET_STATE': {
      return saveToHistory(action.payload);
    }

    default:
      return state;
  }
}

/**
 * Workspace context interface defining available actions
 */
interface WorkspaceContextType {
  state: AppSchema;
  updateLayoutNode: (nodeId: string, nodeData: Partial<LayoutNode>) => void;
  addLayoutNode: (nodeId: string, nodeData: LayoutNode) => void;
  removeLayoutNode: (nodeId: string) => void;
  addLogicNode: (node: LogicNode) => void;
  updateLogicNode: (nodeId: string, nodeData: Partial<LogicNode>) => void;
  removeLogicNode: (nodeId: string) => void;
  connectLogicNodes: (edge: LogicEdge) => void;
  removeLogicEdge: (edgeId: string) => void;
  moveLayoutNode: (nodeId: string, newParentId: string, index?: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  selectedLayoutNodeId: string | null;
  setSelectedLayoutNodeId: (id: string | null) => void;
}

/**
 * Create workspace context
 */
const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

/**
 * Workspace Provider Props
 */
interface WorkspaceProviderProps {
  children: ReactNode;
}

/**
 * Workspace Provider Component
 * 
 * Provides global state management for the IDE with undo/redo support
 * 
 * @param props - Provider props including children
 * @returns Provider component
 */
export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const [historyState, dispatch] = useReducer(workspaceReducer, initialHistoryState);
  const [selectedLayoutNodeId, setSelectedLayoutNodeId] = useState<string | null>(null);

  const canUndo = historyState.past.length > 0;
  const canRedo = historyState.future.length > 0;

  const updateLayoutNode = useCallback((nodeId: string, nodeData: Partial<LayoutNode>) => {
    dispatch({ type: 'UPDATE_LAYOUT_NODE', payload: { nodeId, nodeData } });
  }, []);

  const addLayoutNode = useCallback((nodeId: string, nodeData: LayoutNode) => {
    dispatch({ type: 'ADD_LAYOUT_NODE', payload: { nodeId, nodeData } });
  }, []);

  const removeLayoutNode = useCallback((nodeId: string) => {
    dispatch({ type: 'REMOVE_LAYOUT_NODE', payload: { nodeId } });
  }, []);

  const moveLayoutNode = useCallback((nodeId: string, newParentId: string, index?: number) => {
    dispatch({ type: 'MOVE_LAYOUT_NODE', payload: { nodeId, newParentId, index } });
  }, []);

  const addLogicNode = useCallback((node: LogicNode) => {
    dispatch({ type: 'ADD_LOGIC_NODE', payload: { node } });
  }, []);

  const updateLogicNode = useCallback((nodeId: string, nodeData: Partial<LogicNode>) => {
    dispatch({ type: 'UPDATE_LOGIC_NODE', payload: { nodeId, nodeData } });
  }, []);

  const removeLogicNode = useCallback((nodeId: string) => {
    dispatch({ type: 'REMOVE_LOGIC_NODE', payload: { nodeId } });
  }, []);

  const connectLogicNodes = useCallback((edge: LogicEdge) => {
    dispatch({ type: 'CONNECT_LOGIC_NODES', payload: { edge } });
  }, []);

  const removeLogicEdge = useCallback((edgeId: string) => {
    dispatch({ type: 'REMOVE_LOGIC_EDGE', payload: { edgeId } });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const value: WorkspaceContextType = {
    state: historyState.present,
    updateLayoutNode,
    addLayoutNode,
    removeLayoutNode,
    addLogicNode,
    updateLogicNode,
    removeLogicNode,
    connectLogicNodes,
    removeLogicEdge,
    moveLayoutNode,
    undo,
    redo,
    canUndo,
    canRedo,
    selectedLayoutNodeId,
    setSelectedLayoutNodeId,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

/**
 * Custom hook to access workspace state and actions
 * 
 * @returns Workspace context with state and all available actions
 * @throws Error if used outside of WorkspaceProvider
 */
export function useWorkspaceStore(): WorkspaceContextType {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspaceStore must be used within a WorkspaceProvider');
  }
  return context;
}
