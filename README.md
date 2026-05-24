# React-Spaghetti

A visual IDE designed to create React Components using a unified layout tree and node-based logic graph.

## Overview

React-Spaghetti bridges the gap between visual design and programmatic logic by providing:

- **Visual Layout Canvas**: Drag-and-drop interface for building UI component hierarchies
- **Logic Flow Graph**: Node-based editor for defining state, events, actions, and conditions
- **Unified Schema**: Single source of truth connecting visual elements to logic nodes via data bindings
- **Code Generation**: Automatic TypeScript React code export from your designs

## Project Structure

```
src/
├── components/          # UI components
│   ├── WorkspaceShell.tsx      # Main IDE layout (VS Code-like interface)
│   └── WorkspaceShell.test.tsx
├── store/               # State management
│   ├── useWorkspaceStore.tsx   # Global state with undo/redo support
│   └── useWorkspaceStore.test.tsx
├── compiler/            # Code generation engine
│   ├── SchemaASTParser.ts      # Parse schema to intermediate AST
│   ├── SchemaASTParser.test.ts
│   ├── ComponentExporter.ts    # Generate TypeScript React code
│   └── ComponentExporter.test.ts
├── types/               # TypeScript type definitions
│   └── schema.ts               # Unified JSON schema definitions
├── test/                # Test utilities
│   └── setup.ts                # Test configuration
├── main.tsx             # Application entry point
└── index.css            # Global styles with Tailwind CSS
```

## Architecture

### Unified JSON Schema

The application uses a single schema (`AppSchema`) that represents both:
- **Layout Tree**: Hierarchical structure of visual UI elements
- **Logic Graph**: Directed graph of state, events, actions, and conditions

Visual elements bind to logic nodes through `dataBinding` and `eventBinding` properties.

### Phase-by-Phase Implementation

The project follows a structured 4-phase development approach:

#### Phase 1: Workspace Shell & Core State Management ✅
- VS Code-like IDE interface with 5 zones
- Centralized state store with history (undo/redo)
- TypeScript interfaces matching the unified schema

#### Phase 2: Visual Layout Canvas & Properties Inspector 🚧
- Drag-and-drop canvas using @craftjs/core
- Properties panel for CSS styling
- Real-time state synchronization

#### Phase 3: Logic Designer Graph Engine ⏳
- React Flow-based node editor
- Custom nodes for state, props, triggers, actions, conditions
- Connection validation rules

#### Phase 4: AST Transpiler & Code Generation Engine ✅
- Schema-to-AST parser
- TypeScript React code generator
- Formatted JSX output with proper indentation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Testing

```bash
npm test        # Run tests in watch mode
npm run test:run # Run tests once
```

### Build

```bash
npm run build
```

## Component Mapping Matrix

| Logic Node Type | React Mapping | Generated Code |
|----------------|---------------|----------------|
| `state` | `useState` Hook | `const [name, setName] = useState(initial);` |
| `prop` | Component Prop | `interface Props { name: type; }` |
| `eventTrigger` | Event Handler | `onClick={() => handle_id()}` |
| `action` | Handler Function | `const handle_id = () => { setState(val); };` |
| `condition` | If/Else Block | `if (expression) { ... } else { ... }` |
| `effect` | `useEffect` Hook | `useEffect(() => { ... }, [deps]);` |

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling utility classes
- **@craftjs/core** - Drag-and-drop canvas engine
- **@xyflow/react** (React Flow) - Node-based graph editor
- **Vitest** - Testing framework
- **React Testing Library** - Component testing utilities

## License

MIT
