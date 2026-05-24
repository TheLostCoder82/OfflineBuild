/**
 * Unified JSON Schema for the IDE Project
 * 
 * This schema represents both the visual layout tree and the React Flow logic graph.
 * It maintains a distinct separation of concerns while allowing visual elements to bind
 * tightly to logic nodes via dataBinding and eventBinding.
 */

export interface ProjectMetadata {
  componentName: string;
  framework: 'react-ts' | 'react-js';
  stylingStrategy: 'tailwind' | 'css-modules' | 'styled-components';
}

/**
 * Layout Node represents a visual element in the UI tree
 */
export interface LayoutNode {
  id: string;
  type: 'div' | 'span' | 'button' | 'input' | 'h1' | 'h2' | 'h3' | 'p' | 'text';
  children: string[];
  props: {
    className?: string;
    placeholder?: string;
    value?: string;
    [key: string]: any;
  };
  styles: {
    [key: string]: string;
  };
  dataBinding?: {
    /** ID of the State or Prop logic node for text content */
    textContent?: string;
    /** ID of the State or Prop logic node for controlled inputs */
    value?: string;
  };
  eventBinding?: {
    /** ID of the Event Trigger logic node */
    onClick?: string;
    /** ID of the Event Trigger logic node */
    onChange?: string;
  };
}

/**
 * Logic Node represents a node in the React Flow logic graph
 */
export interface LogicNode {
  id: string;
  type: 'state' | 'effect' | 'prop' | 'eventTrigger' | 'action' | 'condition';
  position: {
    x: number;
    y: number;
  };
  data: {
    name?: string;
    initialValue?: any;
    dataType?: 'string' | 'number' | 'boolean' | 'object';
    eventType?: 'onClick' | 'onChange';
    actionType?: 'setState' | 'consoleLog' | 'fetchApi';
    expression?: string;
  };
}

/**
 * Logic Edge represents a connection between two logic nodes
 */
export interface LogicEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

/**
 * Layout Tree structure containing all visual nodes
 */
export interface LayoutTree {
  rootId: string;
  nodes: Record<string, LayoutNode>;
}

/**
 * Logic Graph structure containing all logic nodes and edges
 */
export interface LogicGraph {
  nodes: LogicNode[];
  edges: LogicEdge[];
}

/**
 * Main Application Schema - The single source of truth for the IDE
 */
export interface AppSchema {
  projectMetadata: ProjectMetadata;
  layoutTree: LayoutTree;
  logicGraph: LogicGraph;
}
