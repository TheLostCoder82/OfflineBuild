/**
 * Component Exporter Tests
 * 
 * Unit tests for ComponentExporter.ts using Vitest.
 * Tests generation of TypeScript React component files from AST payloads.
 */

import { describe, it, expect } from 'vitest';
import { generateComponentFile } from './ComponentExporter';
import { ParsedAST } from './SchemaASTParser';

describe('generateComponentFile', () => {
  it('should generate a basic component with no state', () => {
    const ast: ParsedAST = {
      states: [],
      props: [],
      handlers: [],
      effects: [],
      jsxTree: {
        id: 'root',
        type: 'div',
        props: { className: 'container' },
        styles: { padding: '16px' },
        children: [],
      },
    };

    const code = generateComponentFile(ast);

    expect(code).toContain("import React from 'react'");
    expect(code).toContain('export const GeneratedComponent');
    expect(code).toContain('<div');
    expect(code).toContain('className="container"');
  });

  it('should generate useState hooks for states', () => {
    const ast: ParsedAST = {
      states: [
        {
          id: 'state1',
          name: 'counter',
          initialValue: 0,
          dataType: 'number',
        },
        {
          id: 'state2',
          name: 'message',
          initialValue: 'Hello',
          dataType: 'string',
        },
      ],
      props: [],
      handlers: [],
      effects: [],
      jsxTree: null,
    };

    const code = generateComponentFile(ast);

    expect(code).toContain("import { useState } from 'react'");
    expect(code).toContain('const [counter, setCounter] = useState(0)');
    expect(code).toContain("const [message, setMessage] = useState('Hello')");
  });

  it('should generate Props interface for props', () => {
    const ast: ParsedAST = {
      states: [],
      props: [
        {
          id: 'prop1',
          name: 'title',
          dataType: 'string',
        },
        {
          id: 'prop2',
          name: 'count',
          dataType: 'number',
        },
      ],
      handlers: [],
      effects: [],
      jsxTree: null,
    };

    const code = generateComponentFile(ast);

    expect(code).toContain('interface Props');
    expect(code).toContain('title: string');
    expect(code).toContain('count: number');
    expect(code).toContain('React.FC<Props>');
  });

  it('should generate JSX tree with proper indentation', () => {
    const ast: ParsedAST = {
      states: [],
      props: [],
      handlers: [],
      effects: [],
      jsxTree: {
        id: 'root',
        type: 'div',
        props: {},
        styles: {},
        children: [
          {
            id: 'h1',
            type: 'h1',
            props: {},
            styles: {},
            children: ['Welcome'],
          },
          {
            id: 'p',
            type: 'p',
            props: {},
            styles: {},
            children: ['This is a paragraph'],
          },
        ],
      },
    };

    const code = generateComponentFile(ast);

    expect(code).toContain('<div>');
    expect(code).toContain('<h1>');
    expect(code).toContain('Welcome');
    expect(code).toContain('</h1>');
    expect(code).toContain('<p>');
    expect(code).toContain('This is a paragraph');
    expect(code).toContain('</p>');
    expect(code).toContain('</div>');
  });

  it('should generate inline styles from style objects', () => {
    const ast: ParsedAST = {
      states: [],
      props: [],
      handlers: [],
      effects: [],
      jsxTree: {
        id: 'root',
        type: 'div',
        props: {},
        styles: {
          padding: '16px',
          backgroundColor: 'blue',
          fontSize: '14',
        },
        children: [],
      },
    };

    const code = generateComponentFile(ast);

    expect(code).toContain('style={');
    expect(code).toContain('padding: "16px"');
    expect(code).toContain('backgroundColor: "blue"');
  });

  it('should handle self-closing tags for empty elements', () => {
    const ast: ParsedAST = {
      states: [],
      props: [],
      handlers: [],
      effects: [],
      jsxTree: {
        id: 'root',
        type: 'input',
        props: { type: 'text', placeholder: 'Enter text' },
        styles: {},
        children: [],
      },
    };

    const code = generateComponentFile(ast);

    expect(code).toContain('<input');
    expect(code).toContain('type="text"');
    expect(code).toContain('placeholder="Enter text"');
    expect(code).toContain('/>');
  });

  it('should generate event handlers from handlers array', () => {
    const ast: ParsedAST = {
      states: [
        {
          id: 'state1',
          name: 'counter',
          initialValue: 0,
          dataType: 'number',
        },
      ],
      props: [],
      handlers: [
        {
          triggerId: 'click1',
          eventType: 'onClick',
          actions: ['action1'],
          code: 'const handle_click1 = () => {\n    setCounter(counter + 1);\n  };',
        },
      ],
      effects: [],
      jsxTree: null,
    };

    const code = generateComponentFile(ast);

    expect(code).toContain('const handle_click1 = () => {');
    expect(code).toContain('setCounter(counter + 1)');
  });

  it('should generate useEffect hooks for effects', () => {
    const ast: ParsedAST = {
      states: [
        {
          id: 'state1',
          name: 'counter',
          initialValue: 0,
          dataType: 'number',
        },
      ],
      props: [],
      handlers: [],
      effects: [
        {
          id: 'effect1',
          dependencies: ['counter'],
          actions: [],
        },
      ],
      jsxTree: null,
    };

    const code = generateComponentFile(ast);

    expect(code).toContain("import { useEffect } from 'react'");
    expect(code).toContain('useEffect(() => {');
    expect(code).toContain('[counter]');
  });

  it('should generate a complete counter button component', () => {
    const ast: ParsedAST = {
      states: [
        {
          id: 'counterState',
          name: 'counter',
          initialValue: 0,
          dataType: 'number',
        },
      ],
      props: [],
      handlers: [
        {
          triggerId: 'clickTrigger',
          eventType: 'onClick',
          actions: ['incrementAction'],
          code: 'const handle_clickTrigger = () => {\n    setCounter(counter + 1);\n  };',
        },
      ],
      effects: [],
      jsxTree: {
        id: 'root',
        type: 'div',
        props: { className: 'container' },
        styles: { display: 'flex', gap: '8px' },
        children: [
          {
            id: 'text1',
            type: 'p',
            props: {},
            styles: {},
            children: ['{counter}'],
          },
          {
            id: 'button1',
            type: 'button',
            props: { className: 'btn' },
            styles: { padding: '8px' },
            children: ['Increment'],
            eventBinding: {
              onClick: 'clickTrigger',
            },
          },
        ],
      },
    };

    const code = generateComponentFile(ast);

    // Check imports
    expect(code).toContain("import React from 'react'");
    expect(code).toContain("import { useState } from 'react'");

    // Check state declaration
    expect(code).toContain('const [counter, setCounter] = useState(0)');

    // Check handler
    expect(code).toContain('const handle_clickTrigger = () => {');
    expect(code).toContain('setCounter(counter + 1)');

    // Check JSX structure
    expect(code).toContain('<div');
    expect(code).toContain('className="container"');
    expect(code).toContain('<p>');
    expect(code).toContain('{counter}');
    expect(code).toContain('<button');
    expect(code).toContain('Increment');
    expect(code).toContain('onClick={handle_clickTrigger}');
  });

  it('should produce syntactically valid TypeScript code', () => {
    const ast: ParsedAST = {
      states: [
        {
          id: 'state1',
          name: 'count',
          initialValue: 0,
          dataType: 'number',
        },
      ],
      props: [
        {
          id: 'prop1',
          name: 'initialValue',
          dataType: 'number',
        },
      ],
      handlers: [],
      effects: [],
      jsxTree: {
        id: 'root',
        type: 'div',
        props: {},
        styles: {},
        children: [
          {
            id: 'span1',
            type: 'span',
            props: {},
            styles: {},
            children: ['{count}'],
          },
        ],
      },
    };

    const code = generateComponentFile(ast);

    // Basic syntax checks
    expect(code).toContain('export const GeneratedComponent');
    expect(code).toContain('export default GeneratedComponent');
    
    // Check balanced braces
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    expect(openBraces).toBe(closeBraces);

    // Check balanced parentheses
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    expect(openParens).toBe(closeParens);
  });
});
