/**
 * Workspace Shell Layout Component
 * 
 * Constructs a fixed viewport responsive workbench workspace mimicking VS Code.
 * Features a 48px global activity bar, 260px collapsible left-hand tool navigation,
 * an expansive central workflow canvas, adjustable 300px styling properties panel,
 * and a collapsible 240px debug output log panel.
 */

import React, { useState } from 'react';
import { PropertiesPanel } from './PropertiesPanel';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { createLayoutNode } from '../utils/createLayoutNode';
import { LayoutNode } from '../types/schema';

interface WorkspaceShellProps {
  visualView: React.ReactNode;
  logicView: React.ReactNode;
}

/**
 * Main Workspace Shell Component
 * 
 * Implements a VS Code-like IDE interface with five distinct zones:
 * 1. Left Activity Bar (48px) - Contains placeholder icons for File Explorer and Logic Graph layers
 * 2. Left Sidebar (260px) - For component library management
 * 3. Central Workflow Canvas (flex-1) - Primary editing area with view toggle
 * 4. Right Properties Panel (300px) - Style controls and configuration
 * 5. Bottom Debug Terminal (240px) - Structural log arrays and output
 * 
 * @param props - Component props including children
 * @returns Workspace shell layout
 */
export function WorkspaceShell({ visualView, logicView }: WorkspaceShellProps) {
  const [activeView, setActiveView] = useState<'visual' | 'logic'>('visual');
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [bottomPanelCollapsed, setBottomPanelCollapsed] = useState(false);
  const { state, addLayoutNode, updateLayoutNode, setSelectedLayoutNodeId } = useWorkspaceStore();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950">
      {/* Top Menu Bar (optional, for future expansion) */}
      <div className="h-8 bg-slate-900 border-b border-slate-700 flex items-center px-4">
        <span className="text-xs text-slate-400 font-medium">React-Spaghetti IDE</span>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Activity Bar - 48px */}
        <div className="w-12 bg-slate-900 border-r border-slate-700 flex flex-col items-center py-2 space-y-4">
          <button
            className="p-2 hover:bg-slate-800 rounded transition-colors"
            title="File Explorer"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </button>
          <button
            className="p-2 hover:bg-slate-800 rounded transition-colors"
            title="Logic Graph"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
          <button
            className="p-2 hover:bg-slate-800 rounded transition-colors"
            title="Settings"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* Left Sidebar - 260px (collapsible) */}
        {!leftSidebarCollapsed && (
          <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
            <div className="p-3 border-b border-slate-700 flex justify-between items-center">
              <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">
                Components
              </span>
              <button
                onClick={() => setLeftSidebarCollapsed(true)}
                className="text-slate-400 hover:text-slate-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                  <div className="text-xs text-slate-500 mb-2">Layout Elements</div>
                  <div className="space-y-1">
                    {['Div', 'Span', 'Button', 'Input', 'H1', 'H2', 'P', 'Text'].map((item) => {
                      const type = item.toLowerCase() as LayoutNode['type'];
                      return (
                        <div
                          key={item}
                          role="button"
                          draggable={true}
                          onDragStart={(e) => {
                            e.dataTransfer?.setData('application/react-spaghetti-node', type);
                            e.dataTransfer!.effectAllowed = 'copy';
                          }}
                          onClick={() => {
                            const rootNode = state.layoutTree.nodes[state.layoutTree.rootId];
                            const nextNode = createLayoutNode(type);
                            addLayoutNode(nextNode.id, nextNode);
                            updateLayoutNode(rootNode.id, { children: [...rootNode.children, nextNode.id] });
                            setSelectedLayoutNodeId(nextNode.id);
                          }}
                          className="px-2 py-1.5 text-sm text-slate-300 hover:bg-slate-700 rounded cursor-pointer"
                        >
                          {item}
                        </div>
                      );
                    })}
                  </div>
                </div>
          </div>
        )}

        {leftSidebarCollapsed && (
          <button
            onClick={() => setLeftSidebarCollapsed(false)}
            className="w-6 bg-slate-800 border-r border-slate-700 flex items-center justify-center hover:bg-slate-700"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Central Workflow Canvas - flex-1 */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {/* Canvas Header with View Toggle */}
          <div className="h-10 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveView('visual')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  activeView === 'visual'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                Visual UI Designer
              </button>
              <button
                onClick={() => setActiveView('logic')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  activeView === 'logic'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                Logic Flow Map
              </button>
            </div>
            <div className="text-xs text-slate-500">
              {activeView === 'visual' ? 'Visual Editor' : 'Logic Graph Editor'}
            </div>
          </div>

          {/* Canvas Content Area */}
          <div className="flex-1 overflow-auto relative">
            {activeView === 'visual' ? visualView : logicView}
          </div>
        </div>

        {/* Right Properties Panel - 300px (collapsible) */}
        {!rightPanelCollapsed && (
          <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
            <div className="p-3 border-b border-slate-700 flex justify-between items-center">
              <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">
                Properties
              </span>
              <button
                onClick={() => setRightPanelCollapsed(true)}
                className="text-slate-400 hover:text-slate-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <PropertiesPanel />
            </div>
          </div>
        )}

        {rightPanelCollapsed && (
          <button
            onClick={() => setRightPanelCollapsed(false)}
            className="w-6 bg-slate-800 border-l border-slate-700 flex items-center justify-center hover:bg-slate-700"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Bottom Debug Terminal Panel - 240px (collapsible) */}
      {!bottomPanelCollapsed && (
        <div className="h-56 bg-slate-900 border-t border-slate-700 flex flex-col">
          <div className="h-8 bg-slate-800 border-b border-slate-700 flex justify-between items-center px-4">
            <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">
              Debug Console
            </span>
            <button
              onClick={() => setBottomPanelCollapsed(true)}
              className="text-slate-400 hover:text-slate-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
            <div className="text-slate-400">
              <div className="text-green-400">✓</div> Workspace initialized
              <div className="text-blue-400">ℹ</div> Ready for component design
            </div>
          </div>
        </div>
      )}

      {bottomPanelCollapsed && (
        <button
          onClick={() => setBottomPanelCollapsed(false)}
          className="h-6 bg-slate-900 border-t border-slate-700 flex items-center justify-center hover:bg-slate-800"
        >
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default WorkspaceShell;
