/**
 * Schema AST Parser Tests
 * 
 * Unit tests for SchemaASTParser.ts using Vitest.
 * Tests parsing of mock JSON layout project models with state, events, and layout trees.
 */

import { describe, it, expect } from 'vitest';
import { parseSchemaToAST } from './SchemaASTParser';
import { AppSchema } from '../types/schema';

describe('parseSchemaToAST', () => {
  it('should extract state variables from logicGraph', () => {
    const mockSchema: AppSchema = {
      projectMetadata: {
        componentName: 'TestComponent',
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
            props: {},
            styles: {},
          },
        },
      },
      logicGraph: {
        nodes: [
          {
            id: 'state1',
            type: 'state',
            position: { x: 100, y: 100 },
            data: {
              name: 'counter',
              initialValue: 0,
              dataType: 'number',
            },
          },
          {
            id: 'state2',
            type: 'state',
            position: { x: 200, y: 100 },
            data: {
              name: 'message',
              initialValue: 'Hello',
              dataType: 'string',
            },
          },
        ],
        edges: [],
      },
    };

    const ast = parseSchemaToAST(mockSchema);

    expect(ast.states.length).toBe(2);
    expect(ast.states[0].name).toBe('counter');
    expect(ast.states[0].initialValue).toBe(0);
    expect(ast.states[1].name).toBe('message');
    expect(ast.states[1].initialValue).toBe('Hello');
  });

  it('should extract prop variables from logicGraph', () => {
    const mockSchema: AppSchema = {
      projectMetadata: {
        componentName: 'TestComponent',
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
            props: {},
            styles: {},
          },
        },
      },
      logicGraph: {
        nodes: [
          {
            id: 'prop1',
            type: 'prop',
            position: { x: 100, y: 100 },
            data: {
              name: 'title',
              dataType: 'string',
            },
          },
        ],
        edges: [],
      },
    };

    const ast = parseSchemaToAST(mockSchema);

    expect(ast.props.length).toBe(1);
    expect(ast.props[0].name).toBe('title');
    expect(ast.props[0].dataType).toBe('string');
  });

  it('should build a JSX tree from layoutTree', () => {
    const mockSchema: AppSchema = {
      projectMetadata: {
        componentName: 'TestComponent',
        framework: 'react-ts',
        stylingStrategy: 'tailwind',
      },
      layoutTree: {
        rootId: 'root',
        nodes: {
          root: {
            id: 'root',
            type: 'div',
            children: ['button1'],
            props: { className: 'container' },
            styles: { padding: '16px' },
          },
          button1: {
            id: 'button1',
            type: 'button',
            children: [],
            props: { className: 'btn' },
            styles: { backgroundColor: 'blue' },
          },
        },
      },
      logicGraph: {
        nodes: [],
        edges: [],
      },
    };

    const ast = parseSchemaToAST(mockSchema);

    expect(ast.jsxTree).not.toBeNull();
    expect(ast.jsxTree?.type).toBe('div');
    expect(ast.jsxTree?.children.length).toBe(1);
    expect(ast.jsxTree?.children[0]).toHaveProperty('type', 'button');
  });

  it('should handle text nodes in layout tree', () => {
    const mockSchema: AppSchema = {
      projectMetadata: {
        componentName: 'TestComponent',
        framework: 'react-ts',
        stylingStrategy: 'tailwind',
      },
      layoutTree: {
        rootId: 'root',
        nodes: {
          root: {
            id: 'root',
            type: 'div',
            children: ['text1'],
            props: {},
            styles: {},
          },
          text1: {
            id: 'text1',
            type: 'text',
            children: [],
            props: { value: 'Hello World' },
            styles: {},
          },
        },
      },
      logicGraph: {
        nodes: [],
        edges: [],
      },
    };

    const ast = parseSchemaToAST(mockSchema);

    expect(ast.jsxTree).not.toBeNull();
    expect(ast.jsxTree?.children.length).toBeGreaterThan(0);
  });

  it('should resolve data bindings to variable names', () => {
    const mockSchema: AppSchema = {
      projectMetadata: {
        componentName: 'TestComponent',
        framework: 'react-ts',
        stylingStrategy: 'tailwind',
      },
      layoutTree: {
        rootId: 'root',
        nodes: {
          root: {
            id: 'root',
            type: 'div',
            children: ['text1'],
            props: {},
            styles: {},
          },
          text1: {
            id: 'text1',
            type: 'p',
            children: [],
            props: {},
            styles: {},
            dataBinding: {
              textContent: 'state1',
            },
          },
        },
      },
      logicGraph: {
        nodes: [
          {
            id: 'state1',
            type: 'state',
            position: { x: 100, y: 100 },
            data: {
              name: 'counter',
              initialValue: 0,
              dataType: 'number',
            },
          },
        ],
        edges: [],
      },
    };

    const ast = parseSchemaToAST(mockSchema);

    expect(ast.jsxTree).not.toBeNull();
    expect(ast.jsxTree?.children.length).toBeGreaterThan(0);
    const textNode = ast.jsxTree?.children[0] as any;
    expect(textNode.dataBinding?.textContent).toBe('state1');
  });

  it('should return empty arrays for empty schema', () => {
    const mockSchema: AppSchema = {
      projectMetadata: {
        componentName: 'EmptyComponent',
        framework: 'react-ts',
        stylingStrategy: 'tailwind',
      },
      layoutTree: {
        rootId: 'root',
        nodes: {},
      },
      logicGraph: {
        nodes: [],
        edges: [],
      },
    };

    const ast = parseSchemaToAST(mockSchema);

    expect(ast.states.length).toBe(0);
    expect(ast.props.length).toBe(0);
    expect(ast.handlers.length).toBe(0);
    expect(ast.effects.length).toBe(0);
    expect(ast.jsxTree).toBeNull();
  });

  it('should parse a complete counter button example', () => {
    const mockSchema: AppSchema = {
      projectMetadata: {
        componentName: 'CounterButton',
        framework: 'react-ts',
        stylingStrategy: 'tailwind',
      },
      layoutTree: {
        rootId: 'root',
        nodes: {
          root: {
            id: 'root',
            type: 'div',
            children: ['text1', 'button1'],
            props: { className: 'container' },
            styles: { display: 'flex', gap: '8px' },
          },
          text1: {
            id: 'text1',
            type: 'p',
            children: [],
            props: {},
            styles: {},
            dataBinding: {
              textContent: 'counterState',
            },
          },
          button1: {
            id: 'button1',
            type: 'button',
            children: [],
            props: { className: 'btn' },
            styles: { padding: '8px' },
            eventBinding: {
              onClick: 'clickTrigger',
            },
          },
        },
      },
      logicGraph: {
        nodes: [
          {
            id: 'counterState',
            type: 'state',
            position: { x: 100, y: 100 },
            data: {
              name: 'counter',
              initialValue: 0,
              dataType: 'number',
            },
          },
          {
            id: 'clickTrigger',
            type: 'eventTrigger',
            position: { x: 100, y: 200 },
            data: {
              eventType: 'onClick',
            },
          },
          {
            id: 'incrementAction',
            type: 'action',
            position: { x: 300, y: 200 },
            data: {
              actionType: 'setState',
              expression: 'counter + 1',
            },
          },
        ],
        edges: [
          {
            id: 'edge1',
            source: 'clickTrigger',
            target: 'incrementAction',
          },
        ],
      },
    };

    const ast = parseSchemaToAST(mockSchema);

    // Should have the counter state
    expect(ast.states.length).toBe(1);
    expect(ast.states[0].name).toBe('counter');

    // Should have at least one handler
    expect(ast.handlers.length).toBeGreaterThan(0);

    // Should have a JSX tree with root and children
    expect(ast.jsxTree).not.toBeNull();
    expect(ast.jsxTree?.children.length).toBe(2);
  });
});
