import { useWorkspaceStore } from '../store/useWorkspaceStore';

const displayOptions = ['block', 'inline-block', 'flex', 'grid', 'inline'];
const flexDirectionOptions = ['row', 'column', 'row-reverse', 'column-reverse'];
const alignOptions = ['stretch', 'flex-start', 'center', 'flex-end', 'baseline'];
const justifyOptions = ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'];

export function PropertiesPanel() {
  const { state, selectedLayoutNodeId, updateLayoutNode } = useWorkspaceStore();
  const selectedNode = selectedLayoutNodeId ? state.layoutTree.nodes[selectedLayoutNodeId] : undefined;

  if (!selectedNode) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">
        Select a visual node element on the canvas to configure properties
      </div>
    );
  }

  const styles = selectedNode.styles || {};

  const patchStyle = (key: string, value: string) => {
    updateLayoutNode(selectedNode.id, {
      styles: {
        ...styles,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-4 overflow-y-auto px-4 py-3">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Selected Node</h3>
        <div className="mt-2 rounded border border-slate-700 bg-slate-900 p-3 text-sm text-slate-200">
          <div>ID: {selectedNode.id}</div>
          <div>Type: {selectedNode.type}</div>
        </div>
      </div>

      <div className="space-y-3 rounded border border-slate-700 bg-slate-900 p-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Layout</div>
        <label className="block text-xs text-slate-300">
          Display
          <select
            className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100"
            value={styles.display ?? ''}
            onChange={(event) => patchStyle('display', event.target.value)}
          >
            <option value="">Default</option>
            {displayOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-slate-300">
          Flex Direction
          <select
            className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100"
            value={styles.flexDirection ?? ''}
            onChange={(event) => patchStyle('flexDirection', event.target.value)}
          >
            <option value="">Default</option>
            {flexDirectionOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-slate-300">
          Align Items
          <select
            className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100"
            value={styles.alignItems ?? ''}
            onChange={(event) => patchStyle('alignItems', event.target.value)}
          >
            <option value="">Default</option>
            {alignOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-slate-300">
          Justify Content
          <select
            className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100"
            value={styles.justifyContent ?? ''}
            onChange={(event) => patchStyle('justifyContent', event.target.value)}
          >
            <option value="">Default</option>
            {justifyOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-3 rounded border border-slate-700 bg-slate-900 p-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Spacing</div>
        <label className="block text-xs text-slate-300">
          Padding
          <input
            id="padding"
            className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100"
            value={styles.padding ?? ''}
            onChange={(event) => patchStyle('padding', event.target.value)}
          />
        </label>
        <label className="block text-xs text-slate-300">
          Margin
          <input
            id="margin"
            className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100"
            value={styles.margin ?? ''}
            onChange={(event) => patchStyle('margin', event.target.value)}
          />
        </label>
      </div>

      <div className="space-y-3 rounded border border-slate-700 bg-slate-900 p-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Typography</div>
        <label className="block text-xs text-slate-300">
          Font Size
          <input
            id="font-size"
            className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100"
            value={styles.fontSize ?? ''}
            onChange={(event) => patchStyle('fontSize', event.target.value)}
          />
        </label>
        <label className="block text-xs text-slate-300">
          Font Weight
          <input
            id="font-weight"
            className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100"
            value={styles.fontWeight ?? ''}
            onChange={(event) => patchStyle('fontWeight', event.target.value)}
          />
        </label>
        <label className="block text-xs text-slate-300">
          Text Color
          <input
            id="text-color"
            className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100"
            value={styles.color ?? ''}
            onChange={(event) => patchStyle('color', event.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

export default PropertiesPanel;
