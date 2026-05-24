/**
 * Schema AST Parser
 * 
 * A pure TypeScript compiler module that walks the layout trees and cross-references
 * graph connections to build a structured AST compilation object.
 * 
 * This parser processes the unified JSON schema and extracts:
 * 1. State and prop variables from logicGraph
 * 2. Event handler execution paths from EventTrigger -> Action -> Condition chains
 * 3. Virtual-JSX node tree from layoutTree with style declarations and data bindings
 */

import { AppSchema, LayoutNode, LogicNode, LogicEdge } from '../types/schema';

/**
 * Represents a parsed state hook in the AST
 */
export interface ParsedState {
  id: string;
  name: string;
  initialValue: any;
  dataType: string;
}

/**
 * Represents a parsed prop in the AST
 */
export interface ParsedProp {
  id: string;
  name: string;
  dataType: string;
}

/**
 * Represents a parsed event handler in the AST
 */
export interface ParsedHandler {
  triggerId: string;
  eventType: string;
  actions: string[];
  code: string;
}

/**
 * Represents a parsed JSX node in the AST
 */
export interface ParsedJSXNode {
  id: string;
  type: string;
  props: Record<string, any>;
  styles: Record<string, string>;
  children: (ParsedJSXNode | string)[];
  dataBinding?: {
    textContent?: string;
    value?: string;
  };
  eventBinding?: {
    onClick?: string;
    onChange?: string;
  };
}

/**
 * The complete parsed AST structure
 */
export interface ParsedAST {
  states: ParsedState[];
  props: ParsedProp[];
  handlers: ParsedHandler[];
  effects: any[];
  jsxTree: ParsedJSXNode | null;
}

/**
 * Parse the unified schema into an intermediate AST representation
 * 
 * @param schema - The unified AppSchema containing layoutTree and logicGraph
 * @returns A parsed AST object with states, props, handlers, and JSX tree
 */
export function parseSchemaToAST(schema: AppSchema): ParsedAST {
  const states: ParsedState[] = [];
  const props: ParsedProp[] = [];
  const handlers: ParsedHandler[] = [];
  const effects: any[] = [];

  // Step 1: Extract state and prop variables from logicGraph
  schema.logicGraph.nodes.forEach((node) => {
    if (node.type === 'state' && node.data.name) {
      states.push({
        id: node.id,
        name: node.data.name,
        initialValue: node.data.initialValue,
        dataType: node.data.dataType || 'any',
      });
    } else if (node.type === 'prop' && node.data.name) {
      props.push({
        id: node.id,
        name: node.data.name,
        dataType: node.data.dataType || 'any',
      });
    }
  });

  // Step 2: Build execution paths from event triggers through actions
  handlers.push(...buildHandlers(schema));

  // Step 3: Extract effects
  effects.push(...buildEffects(schema));

  // Step 4: Recursively traverse layoutTree to build JSX tree
  const jsxTree = buildJSXTree(schema.layoutTree, schema.logicGraph);

  return {
    states,
    props,
    handlers,
    effects,
    jsxTree,
  };
}

/**
 * Build event handlers by tracing connections from EventTrigger nodes
 * 
 * @param schema - The unified AppSchema
 * @returns Array of parsed handlers
 */
function buildHandlers(schema: AppSchema): ParsedHandler[] {
  const handlers: ParsedHandler[] = [];
  const { nodes, edges } = schema.logicGraph;

  // Find all event trigger nodes
  const eventTriggers = nodes.filter((n) => n.type === 'eventTrigger');

  eventTriggers.forEach((trigger) => {
    const actions = traceActionsFromTrigger(trigger.id, nodes, edges);
    
    if (actions.length > 0) {
      const handlerCode = generateHandlerCode(trigger, actions);
      
      handlers.push({
        triggerId: trigger.id,
        eventType: trigger.data.eventType || 'onClick',
        actions: actions.map((a) => a.id),
        code: handlerCode,
      });
    }
  });

  return handlers;
}

/**
 * Trace action nodes from an event trigger through the graph
 * 
 * @param triggerId - The ID of the event trigger node
 * @param nodes - All logic nodes
 * @param edges - All logic edges
 * @returns Array of action nodes reachable from the trigger
 */
function traceActionsFromTrigger(
  triggerId: string,
  nodes: LogicNode[],
  edges: LogicEdge[]
): LogicNode[] {
  const actions: LogicNode[] = [];
  const visited = new Set<string>();

  function traverse(nodeId: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    // Find outgoing edges from this node
    const outgoingEdges = edges.filter((e) => e.source === nodeId);

    outgoingEdges.forEach((edge) => {
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (!targetNode) return;

      if (targetNode.type === 'action') {
        actions.push(targetNode);
      } else if (targetNode.type === 'condition') {
        // For conditions, we'd need to handle both true/false branches
        // For now, just continue traversing
        traverse(targetNode.id);
      } else {
        traverse(targetNode.id);
      }
    });
  }

  traverse(triggerId);
  return actions;
}

/**
 * Generate handler code string from trigger and actions
 * 
 * @param trigger - The event trigger node
 * @param actions - Array of action nodes
 * @param allNodes - All logic nodes for reference
 * @returns Generated handler code string
 */
function generateHandlerCode(
  trigger: LogicNode,
  actions: LogicNode[]
): string {
  const lines: string[] = [];
  
  actions.forEach((action) => {
    if (action.data.actionType === 'setState') {
      // Generate setState call
      const expression = action.data.expression || 'undefined';
      lines.push(`    set${capitalize(expression)}(${expression});`);
    } else if (action.data.actionType === 'consoleLog') {
      lines.push(`    console.log(${action.data.expression || "''"});`);
    } else if (action.data.actionType === 'fetchApi') {
      lines.push(`    fetch(${action.data.expression || "''"});`);
    }
  });

  if (lines.length === 0) {
    return '';
  }

  return `const handle_${trigger.id} = () => {\n${lines.join('\n')}\n  };`;
}

/**
 * Build effects from effect nodes in the logic graph
 * 
 * @param schema - The unified AppSchema
 * @returns Array of effect configurations
 */
function buildEffects(schema: AppSchema): any[] {
  const effects: any[] = [];
  const { nodes, edges } = schema.logicGraph;

  const effectNodes = nodes.filter((n) => n.type === 'effect');

  effectNodes.forEach((effect) => {
    // Find dependencies (inbound edges from state nodes)
    const inboundEdges = edges.filter((e) => e.target === effect.id);
    const dependencies = inboundEdges
      .map((e) => nodes.find((n) => n.id === e.source))
      .filter((n): n is LogicNode => n !== undefined && n.type === 'state')
      .map((n) => n.data.name);

    // Find actions triggered by this effect
    const outboundEdges = edges.filter((e) => e.source === effect.id);
    const triggeredActions = outboundEdges
      .map((e) => nodes.find((n) => n.id === e.target))
      .filter((n): n is LogicNode => n !== undefined);

    effects.push({
      id: effect.id,
      dependencies,
      actions: triggeredActions.map((a) => a.id),
    });
  });

  return effects;
}

/**
 * Build JSX tree from layout tree recursively
 * 
 * @param layoutTree - The layout tree structure
 * @param logicGraph - The logic graph for data bindings
 * @param nodeId - Current node ID to process (defaults to rootId)
 * @returns Parsed JSX node or null
 */
function buildJSXTree(
  layoutTree: { rootId: string; nodes: Record<string, LayoutNode> },
  logicGraph: { nodes: LogicNode[]; edges: LogicEdge[] },
  nodeId?: string
): ParsedJSXNode | null {
  const id = nodeId || layoutTree.rootId;
  const node = layoutTree.nodes[id];

  if (!node) return null;

  // Process children recursively
  const children: (ParsedJSXNode | string)[] = [];
  node.children.forEach((childId) => {
    const childResult = buildJSXTree(layoutTree, logicGraph, childId);
    if (childResult) {
      children.push(childResult);
    } else {
      // If it's a text node without a proper structure, try to get text content
      const childNode = layoutTree.nodes[childId];
      if (childNode && childNode.type === 'text') {
        children.push(childNode.props.value || '');
      }
    }
  });

  // Resolve data bindings to actual variable names
  const resolvedProps = { ...node.props };
  
  if (node.dataBinding?.textContent) {
    const stateNode = logicGraph.nodes.find((n) => n.id === node.dataBinding?.textContent);
    if (stateNode && stateNode.data.name) {
      resolvedProps.textContent = `{${stateNode.data.name}}`;
    }
  }

  return {
    id: node.id,
    type: node.type,
    props: resolvedProps,
    styles: node.styles,
    children,
    dataBinding: node.dataBinding,
    eventBinding: node.eventBinding,
  };
}

/**
 * Capitalize the first letter of a string
 * 
 * @param str - Input string
 * @returns Capitalized string
 */
function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
