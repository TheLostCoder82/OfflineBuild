import React, { useState, useRef } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { LayoutNode } from '../types/schema';
import { createLayoutNode } from '../utils/createLayoutNode';

const PRIMITIVE_TYPES: Array<LayoutNode['type']> = [
  'div',
  'span',
  'button',
  'input',
  'h1',
  'h2',
  'h3',
  'p',
  'text',
];

function RenderLayoutNode({ node, onDragStart, onDragOver, onDrop }: {
  node: LayoutNode,
  onDragStart?: (e: React.DragEvent, id: string) => void,
  onDragOver?: (e: React.DragEvent, id: string) => void,
  onDrop?: (e: React.DragEvent, id: string) => void,
}) {
  const { state, selectedLayoutNodeId, setSelectedLayoutNodeId } = useWorkspaceStore();
  const isSelected = selectedLayoutNodeId === node.id;

  const children = node.children.map((childId) => {
    const child = state.layoutTree.nodes[childId];
    return child ? <RenderLayoutNode key={child.id} node={child} /> : null;
  });

  const sharedProps = {
    className: node.props.className,
    style: {
      ...node.styles,
      cursor: 'pointer',
      outline: isSelected ? '2px solid #2563eb' : 'none',
    },
    onClick: (event: React.MouseEvent) => {
      event.stopPropagation();
      setSelectedLayoutNodeId(node.id);
    },
    draggable: true,
    onDragStart: (e: React.DragEvent) => onDragStart?.(e, node.id),
    onDragOver: (e: React.DragEvent) => onDragOver?.(e, node.id),
    onDrop: (e: React.DragEvent) => onDrop?.(e, node.id),
  } as React.HTMLAttributes<HTMLElement>;

  if (node.type === 'text') {
    return (
      <span data-testid={`node-${node.id}`} {...sharedProps}>
        {node.props.value ?? 'Text node'}
      </span>
    );
  }

  if (node.type === 'input') {
    return (
      <input
        data-testid={`node-${node.id}`}
        {...(sharedProps as React.InputHTMLAttributes<HTMLInputElement>)}
        placeholder={node.props.placeholder}
        value={node.props.value}
        readOnly
      />
    );
  }

  const tag = node.type as React.ElementType;
  const elementProps = {
    ...sharedProps,
    type: node.type === 'button' ? 'button' : undefined,
  } as any;

  return React.createElement(tag, { 'data-testid': `node-${node.id}`, ...elementProps }, node.props.value ?? children);
}

// use shared createLayoutNode from utils

export function VisualCanvas() {
  const {
    state,
    addLayoutNode,
    updateLayoutNode,
    selectedLayoutNodeId,
    setSelectedLayoutNodeId,
  } = useWorkspaceStore();

  const [preview, setPreview] = useState<{ visible: boolean; x: number; y: number; targetId?: string | null }>({ visible: false, x: 0, y: 0, targetId: null });
  const dropzoneRef = useRef<HTMLDivElement | null>(null);

  const rootNode = state.layoutTree.nodes[state.layoutTree.rootId];

  function findParentId(nodeId: string): string | null {
    const entries = Object.entries(state.layoutTree.nodes);
    for (const [id, node] of entries) {
      if (node.children.includes(nodeId)) return id;
    }
    return null;
  }

  const addNodeToRoot = (type: LayoutNode['type']) => {
    if (!rootNode) return;

    const nextNode = createLayoutNode(type);
    addLayoutNode(nextNode.id, nextNode);
    updateLayoutNode(rootNode.id, {
      children: [...rootNode.children, nextNode.id],
    });
    setSelectedLayoutNodeId(nextNode.id);
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = dropzoneRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    setPreview({ visible: true, x, y, targetId: null });
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setPreview({ visible: false, x: 0, y: 0, targetId: null });
    const type = e.dataTransfer?.getData('application/react-spaghetti-node');
    const movingId = e.dataTransfer?.getData('application/react-spaghetti-node-id');
    const rect = dropzoneRef.current?.getBoundingClientRect();
    const left = rect ? `${e.clientX - rect.left}px` : undefined;
    const top = rect ? `${e.clientY - rect.top}px` : undefined;

    if (type) {
      const nextNode = createLayoutNode(type as LayoutNode['type']);
      if (left) nextNode.styles.left = left;
      if (top) nextNode.styles.top = top;
      nextNode.styles.position = 'absolute';
      addLayoutNode(nextNode.id, nextNode);
      if (rootNode) updateLayoutNode(rootNode.id, { children: [...rootNode.children, nextNode.id] });
      setSelectedLayoutNodeId(nextNode.id);
      return;
    }

    if (movingId) {
      // move existing node to root and set position
      const prevParent = findParentId(movingId);
      if (prevParent) {
        const prevChildren = state.layoutTree.nodes[prevParent].children.filter((c) => c !== movingId);
        updateLayoutNode(prevParent, { children: prevChildren });
      }
      const movedNode = state.layoutTree.nodes[movingId];
      const newStyles = { ...movedNode.styles, position: 'absolute' } as Record<string, string>;
      if (left) newStyles.left = left;
      if (top) newStyles.top = top;
      updateLayoutNode(movingId, { styles: newStyles });
      if (rootNode) updateLayoutNode(rootNode.id, { children: [...rootNode.children, movingId] });
      setSelectedLayoutNodeId(movingId);
    }
  };

  const handleNodeDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer?.setData('application/react-spaghetti-node-id', id);
    e.dataTransfer!.effectAllowed = 'move';
  };

  const handleNodeDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    setPreview({ visible: true, x, y, targetId });
  };

  const handleNodeDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setPreview({ visible: false, x: 0, y: 0, targetId: null });
    const type = e.dataTransfer?.getData('application/react-spaghetti-node');
    const movingId = e.dataTransfer?.getData('application/react-spaghetti-node-id');
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const left = `${e.clientX - rect.left}px`;
    const top = `${e.clientY - rect.top}px`;

    if (type) {
      const nextNode = createLayoutNode(type as LayoutNode['type']);
      nextNode.styles.position = 'absolute';
      nextNode.styles.left = left;
      nextNode.styles.top = top;
      addLayoutNode(nextNode.id, nextNode);
      // nest on drop
      const targetNode = state.layoutTree.nodes[targetId];
      updateLayoutNode(targetId, { children: [...targetNode.children, nextNode.id] });
      setSelectedLayoutNodeId(nextNode.id);
      return;
    }

    if (movingId) {
      // move existing node under targetId
      const prevParent = findParentId(movingId);
      if (prevParent) {
        const prevChildren = state.layoutTree.nodes[prevParent].children.filter((c) => c !== movingId);
        updateLayoutNode(prevParent, { children: prevChildren });
      }
      const movedNode = state.layoutTree.nodes[movingId];
      const newStyles = { ...movedNode.styles, position: 'absolute', left, top } as Record<string, string>;
      updateLayoutNode(movingId, { styles: newStyles });
      const targetNode = state.layoutTree.nodes[targetId];
      updateLayoutNode(targetId, { children: [...targetNode.children, movingId] });
      setSelectedLayoutNodeId(movingId);
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-700 bg-slate-900 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Visual Canvas</h2>
          <p className="text-xs text-slate-400">Build your layout nodes and select elements to edit styles.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRIMITIVE_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className="rounded bg-slate-800 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700"
              onClick={() => addNodeToRoot(type)}
            >
              Add {type}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4" onClick={() => setSelectedLayoutNodeId(null)}>
        <div className="mb-3 text-xs text-slate-400">Selected node: {selectedLayoutNodeId ?? 'none'}</div>

        <div
          ref={dropzoneRef}
          className="min-h-[360px] rounded border border-slate-700 bg-slate-950 p-4 relative"
          data-testid="canvas-dropzone"
          onDragOver={handleCanvasDragOver}
          onDrop={handleCanvasDrop}
        >
          {rootNode ? (
            <RenderLayoutNode node={rootNode} onDragStart={handleNodeDragStart} onDragOver={handleNodeDragOver} onDrop={handleNodeDrop} />
          ) : (
            <div className="text-slate-500">No root node found.</div>
          )}

          {preview.visible && (
            <div
              data-testid="drag-preview"
              style={{ position: 'absolute', left: preview.x, top: preview.y, width: 10, height: 10, background: '#60a5fa', borderRadius: 4, pointerEvents: 'none' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default VisualCanvas;
