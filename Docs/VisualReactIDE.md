Role & Goal: You are an expert software architect and full-stack developer. I want to build a custom, browser-based Integrated Development Environment (IDE) with a user interface structured like Visual Studio Code. The core feature of this IDE is a visual scripting and design environment that allows users to build production-ready React components (.jsx/.tsx) using a drag-and-drop UI builder and a node-based logic graph.

Core Architecture & Tech Stack:

Shell/UI: VS Code-like layout (Sidebar for files/tools, Main Canvas/Editor area, Right-hand Properties panel, Bottom panel for console/output).

Visual Layout Editor: A drag-and-drop interface utilizing existing JavaScript libraries (e.g., @craftjs/core or react-grid-layout) to arrange standard HTML elements and visually manipulate their CSS properties.

Logic Engine: A node-based flow graph powered by React Flow to define component logic, state changes, event handlers, and data flow.

Code Generation: A compiler module that translates the visual layout and the React Flow graph into clean, modular, and human-readable JSX/TSX code.

Feature Breakdown & System Requirements:

The Visual Designer (HTML/CSS):

Provide a toolbox of standard HTML elements (div, span, button, input, h1-h6, etc.).

Enable users to drag elements onto a central canvas, nesting them as needed.

A property inspector panel to visually modify CSS styles (Flexbox/Grid layout, spacing, typography, colors) and map them to the elements.

The Logic Designer (React Flow):

Create custom React Flow nodes representing React concepts: State (useState), Effects (useEffect), Props, Event Triggers (onClick, onChange), and Conditional Logic.

Allow users to connect an event trigger node (e.g., Button Click) to a state mutation node, which then connects to a visual element's prop or style.

The Code Generation Engine:

The system must parse the layout tree and the React Flow graph into an intermediate AST (Abstract Syntax Tree) or JSON schema.

Convert this schema into a standalone React component file (.tsx) that handles internal state, receives props, and outputs the correct JSX structure with scoped styles (e.g., CSS Modules or Styled Components).

What I Need From You:
Please provide a comprehensive system architecture overview and an implementation roadmap for this project. Specifically, include:

Data Structure: A proposed JSON schema that represents both the visual layout tree and the React Flow logic graph in a unified way.

Component Mapping: An explanation of how React Flow nodes should be mapped to actual React hooks and lifecycle events during code generation.

Step-by-Step Guide: A phase-by-phase development plan, highlighting recommended open-source libraries for the drag-and-drop UI and property panels to accelerate development.

Proof of Concept: A minimal code example showing how a simple React Flow graph (e.g., clicking a button increments a counter text element) would be parsed and generated into clean JSX code.