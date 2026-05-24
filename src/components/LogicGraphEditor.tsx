import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Handle,
  Node,
  Position,
  ReactFlowProvider,
  Connection,
  OnConnect,
  OnEdgesDelete,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { LogicNode, LogicEdge } from '../types/schema';

function StateNode({ data }: { data: LogicNode['data'] }) {
  return (
    <div className="rounded border border-slate-700 bg-slate-900 p-3 text-sm text-slate-100 shadow-sm">
      <Handle type="target" position={Position.Left} id="target" className="!bg-sky-500" />
      <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">State</div>
      <div className="text-sm text-slate-200">{data.name || 'state'}</div>
      <div className="mt-1 text-xs text-slate-500">Initial: {String(data.initialValue ?? '')}</div>
    </div>
  );
}

function PropNode({ data }: { data: LogicNode['data'] }) {
  return (
    <div className="rounded border border-slate-700 bg-slate-900 p-3 text-sm text-slate-100 shadow-sm">
      <Handle type="target" position={Position.Left} id="target" className="!bg-sky-500" />
      <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">Prop</div>
      <div className="text-sm text-slate-200">{data.name || 'prop'}</div>
      <div className="mt-1 text-xs text-slate-500">Type: {data.dataType || 'string'}</div>
    </div>
  );
}

function EventTriggerNode({ data }: { data: LogicNode['data'] }) {
  return (
    <div className="rounded border border-slate-700 bg-slate-900 p-3 text-sm text-slate-100 shadow-sm">
      <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">Event Trigger</div>
      <div className="text-sm text-slate-200">{data.eventType || 'onClick'}</div>
      <div className="mt-1 text-xs text-slate-500">Trigger source for action flow</div>
      <Handle type="source" position={Position.Right} id="output" className="!bg-emerald-500" />
    </div>
  );
}

function ActionNode({ data }: { data: LogicNode['data'] }) {
  return (
    <div className="rounded border border-slate-700 bg-slate-900 p-3 text-sm text-slate-100 shadow-sm">
      <Handle type="target" position={Position.Left} id="target" className="!bg-sky-500" />
      <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">Action</div>
      <div className="text-sm text-slate-200">{data.actionType || 'setState'}</div>
      <div className="mt-1 text-xs text-slate-500">{data.expression || 'expression'}</div>
      <Handle type="source" position={Position.Right} id="output" className="!bg-emerald-500" />
    </div>
  );
}

function ConditionNode({ data }: { data: LogicNode['data'] }) {
  return (
    <div className="rounded border border-slate-700 bg-slate-900 p-3 text-sm text-slate-100 shadow-sm">
      <Handle type="target" position={Position.Left} id="target" className="!bg-sky-500" />
      <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">Condition</div>
      <div className="text-sm text-slate-200">{data.expression || 'if condition'}</div>
      <div className="mt-2 flex gap-2">
        <div className="text-[10px] uppercase tracking-wider text-slate-500">True</div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500">False</div>
      </div>
      <Handle type="source" position={Position.Right} id="true" className="!bg-emerald-500" style={{ top: '30%' }} />
      <Handle type="source" position={Position.Right} id="false" className="!bg-fuchsia-500" style={{ top: '70%' }} />
    </div>
  );
}

export function isValidGraphConnection(connection: Connection, nodes: LogicNode[]) {
  if (!connection.source || !connection.target) return false;
  const sourceNode = nodes.find((node) => node.id === connection.source);
  const targetNode = nodes.find((node) => node.id === connection.target);
  if (!sourceNode || !targetNode) return false;

  if (sourceNode.type === 'eventTrigger') {
    return targetNode.type === 'action' || targetNode.type === 'condition';
  }

  if (sourceNode.type === 'condition') {
    return targetNode.type === 'action';
  }

  if (sourceNode.type === 'action') {
    return targetNode.type === 'action' || targetNode.type === 'state' || targetNode.type === 'prop';
  }

  return false;
}

const nodeTypes = {
  state: StateNode,
  prop: PropNode,
  eventTrigger: EventTriggerNode,
  action: ActionNode,
  condition: ConditionNode,
};

export function LogicGraphEditor() {
  const {
    state,
    connectLogicNodes,
    removeLogicEdge,
    updateLogicNode,
  } = useWorkspaceStore();

  const flowNodes = useMemo<Node[]>(() => {
    return state.logicGraph.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
    }));
  }, [state.logicGraph.nodes]);

  const flowEdges = useMemo<Edge[]>(() => {
    return state.logicGraph.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      animated: true,
      style: { stroke: '#60a5fa', strokeWidth: 2 },
    }));
  }, [state.logicGraph.edges]);

  const handleConnect = useCallback<OnConnect>(
    (connection) => {
      if (!isValidGraphConnection(connection, state.logicGraph.nodes)) return;
      if (!connection.source || !connection.target) return;

      const edgeId = `edge-${connection.source}-${connection.target}-${Date.now()}`;
      const edge: LogicEdge = {
        id: edgeId,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle ?? undefined,
        targetHandle: connection.targetHandle ?? undefined,
      };
      connectLogicNodes(edge);
    },
    [connectLogicNodes, state.logicGraph.nodes]
  );

  const handleEdgesDelete = useCallback<OnEdgesDelete>(
    (edges) => {
      edges.forEach((edge) => {
        if (edge.id) removeLogicEdge(edge.id);
      });
    },
    [removeLogicEdge]
  );

  const handleNodeDragStop = useCallback(
    (_event: any, node: Node) => {
      const nodeData = state.logicGraph.nodes.find((entry) => entry.id === node.id);
      if (!nodeData) return;
      updateLogicNode(node.id, { position: node.position });
    },
    [state.logicGraph.nodes, updateLogicNode]
  );

  return (
    <div className="h-full w-full bg-slate-950 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-700 bg-slate-900 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Logic Graph Editor</h2>
          <p className="text-xs text-slate-400">Drag connections between nodes to define action flow.</p>
        </div>
      </div>

      <div className="h-[calc(100%-56px)]">
        <ReactFlowProvider>
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            nodeTypes={nodeTypes}
            onConnect={handleConnect}
            onEdgesDelete={handleEdgesDelete}
            onNodeDragStop={handleNodeDragStop}
            fitView
            className="h-full w-full"
          >
            <Background color="#334155" gap={16} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
}
