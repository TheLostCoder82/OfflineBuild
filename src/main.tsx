import React from 'react';
import ReactDOM from 'react-dom/client';
import { WorkspaceProvider } from './store/useWorkspaceStore';
import { WorkspaceShell } from './components/WorkspaceShell';
import { VisualCanvas } from './components/VisualCanvas';
import { LogicGraphEditor } from './components/LogicGraphEditor';
import './index.css';

/**
 * Main App Component
 * 
 * The root component of the React-Spaghetti IDE application.
 * Wraps the entire application in the WorkspaceProvider for global state management
 * and renders the WorkspaceShell layout.
 */
function App() {
  return (
    <WorkspaceProvider>
      <WorkspaceShell
        visualView={<VisualCanvas />}
        logicView={<LogicGraphEditor />}
      />
    </WorkspaceProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
