/**
 * Component Exporter
 * 
 * A string-builder generation utility that converts the parsed AST payload into
 * clean, production-ready TypeScript React component files.
 * 
 * This generator:
 * - Includes imports for React hooks like useState or useEffect as needed
 * - Writes clean TSX type interfaces for component props
 * - Formats hook declarations and event handler methods inside the component body
 * - Renders the layout structure as formatted JSX with proper code indentation
 * - Maps node style rules into standard React inline style={{...}} attributes
 */

import { ParsedAST, ParsedJSXNode, ParsedProp, ParsedState, ParsedHandler } from './SchemaASTParser';

/**
 * Generate a complete TypeScript React component file from a parsed AST
 * 
 * @param ast - The parsed AST payload from SchemaASTParser
 * @returns A formatted TypeScript React component string
 */
export function generateComponentFile(ast: ParsedAST): string {
  const lines: string[] = [];

  // Generate imports
  lines.push(generateImports(ast));

  // Generate Props interface if there are props
  if (ast.props.length > 0) {
    lines.push(generatePropsInterface(ast.props));
  }

  // Generate component declaration
  const componentName = 'GeneratedComponent';
  lines.push(`export const ${componentName}: React.FC${ast.props.length > 0 ? '<Props>' : ''} = () => {`);
  lines.push('');

  // Generate state hooks
  if (ast.states.length > 0) {
    lines.push(generateStateHooks(ast.states));
    lines.push('');
  }

  // Generate event handlers
  if (ast.handlers.length > 0) {
    lines.push(generateEventHandlers(ast.handlers));
    lines.push('');
  }

  // Generate effects
  if (ast.effects.length > 0) {
    lines.push(generateEffects(ast.effects));
    lines.push('');
  }

  // Generate JSX return statement
  lines.push('  return (');
  if (ast.jsxTree) {
    lines.push(generateJSX(ast.jsxTree, '    '));
  } else {
    lines.push('    <div>No content</div>');
  }
  lines.push('  );');
  lines.push('};');
  lines.push('');
  lines.push(`export default ${componentName};`);

  return lines.join('\n');
}

/**
 * Generate import statements based on what's needed in the AST
 * 
 * @param ast - The parsed AST
 * @returns Import statements string
 */
function generateImports(ast: ParsedAST): string {
  const imports: string[] = ["import React from 'react';"];

  // Check if we need useState
  if (ast.states.length > 0) {
    imports.push("import { useState } from 'react';");
  }

  // Check if we need useEffect
  if (ast.effects.length > 0) {
    imports.push("import { useEffect } from 'react';");
  }

  return imports.join('\n') + '\n';
}

/**
 * Generate TypeScript Props interface
 * 
 * @param props - Array of parsed props
 * @returns Props interface definition string
 */
function generatePropsInterface(props: ParsedProp[]): string {
  const propLines = props.map((prop) => `  ${prop.name}: ${mapDataType(prop.dataType)};`);
  
  return `interface Props {\n${propLines.join('\n')}\n}\n`;
}

/**
 * Generate useState hook declarations
 * 
 * @param states - Array of parsed states
 * @returns State hook declarations string
 */
function generateStateHooks(states: ParsedState[]): string {
  return states
    .map((state) => {
      const initialValue = formatInitialValue(state.initialValue, state.dataType);
      return `  const [${state.name}, set${capitalize(state.name)}] = useState(${initialValue});`;
    })
    .join('\n');
}

/**
 * Generate event handler functions
 * 
 * @param handlers - Array of parsed handlers
 * @returns Event handler functions string
 */
function generateEventHandlers(handlers: ParsedHandler[]): string {
  return handlers
    .map((handler) => {
      if (handler.code) {
        return handler.code.split('\n').map((line: string) => '  ' + line).join('\n');
      }
      return '';
    })
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Generate useEffect hooks
 * 
 * @param effects - Array of effect configurations
 * @returns Effect hooks string
 */
function generateEffects(effects: any[]): string {
  return effects
    .map((effect) => {
      const deps = effect.dependencies.length > 0 
        ? `[${effect.dependencies.join(', ')}]` 
        : '[]';
      
      return `  useEffect(() => {\n    // Effect logic for ${effect.id}\n  }, ${deps});`;
    })
    .join('\n\n');
}

/**
 * Recursively generate JSX from a parsed JSX node
 * 
 * @param node - The parsed JSX node
 * @param indent - Current indentation level
 * @returns Formatted JSX string
 */
function generateJSX(node: ParsedJSXNode | string, indent: string): string {
  // Handle text nodes
  if (typeof node === 'string') {
    return `${indent}${node}`;
  }

  // Build opening tag with attributes
  let openTag = `${indent}<${node.type}`;

  // Add props (excluding className which is handled separately)
  Object.entries(node.props).forEach(([key, value]) => {
    if (key === 'textContent') {
      // Skip textContent prop, it's handled via children
      return;
    }
    
    if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
      // It's a variable reference
      openTag += `\n${indent}  ${key}={${value.slice(1, -1)}}`;
    } else if (typeof value === 'string') {
      openTag += `\n${indent}  ${key}="${value}"`;
    } else if (value !== undefined && value !== null) {
      openTag += `\n${indent}  ${key}={${JSON.stringify(value)}}`;
    }
  });

  // Add inline styles if present
  if (Object.keys(node.styles).length > 0) {
    const styleObj = formatStyleObject(node.styles);
    openTag += `\n${indent}  style={${styleObj}}`;
  }

  // Add event bindings
  if (node.eventBinding?.onClick) {
    openTag += `\n${indent}  onClick={handle_${node.eventBinding.onClick}}`;
  }
  if (node.eventBinding?.onChange) {
    openTag += `\n${indent}  onChange={handle_${node.eventBinding.onChange}}`;
  }

  // Close opening tag
  openTag += '>';

  // Process children
  if (node.children.length === 0) {
    // Self-closing tag
    return openTag.replace('>', ' />');
  }

  // Check if children are only text
  const hasOnlyTextChildren = node.children.every((child) => typeof child === 'string');

  if (hasOnlyTextChildren && node.children.length === 1) {
    // Single text child - inline
    return `${openTag}${node.children[0]}</${node.type}>`;
  }

  // Multiple children or complex children
  const childJSX = node.children
    .map((child) => generateJSX(child, indent + '  '))
    .filter(Boolean)
    .join('\n');

  return `${openTag}\n${childJSX}\n${indent}</${node.type}>`;
}

/**
 * Format a style object for inline React styles
 * 
 * @param styles - Style key-value pairs
 * @returns Formatted style object string
 */
function formatStyleObject(styles: Record<string, string>): string {
  const styleEntries = Object.entries(styles).map(([key, value]) => {
    const camelKey = kebabToCamel(key);
    // Try to parse numeric values
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && String(numericValue) === value) {
      return `${camelKey}: ${numericValue}`;
    }
    return `${camelKey}: "${value}"`;
  });

  return `{ ${styleEntries.join(', ')} }`;
}

/**
 * Convert kebab-case to camelCase
 * 
 * @param str - Kebab-case string
 * @returns CamelCase string
 */
function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_match, letter) => letter.toUpperCase());
}

/**
 * Format initial value based on data type
 * 
 * @param value - The initial value
 * @param dataType - The data type
 * @returns Formatted initial value string
 */
function formatInitialValue(value: any, dataType: string): string {
  if (value === undefined || value === null) {
    switch (dataType) {
      case 'string':
        return "''";
      case 'number':
        return '0';
      case 'boolean':
        return 'false';
      case 'object':
        return '{}';
      default:
        return 'undefined';
    }
  }

  if (typeof value === 'string') {
    return `'${value}'`;
  }

  return String(value);
}

/**
 * Map schema data type to TypeScript type
 * 
 * @param dataType - Schema data type
 * @returns TypeScript type string
 */
function mapDataType(dataType: string): string {
  switch (dataType) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'object':
      return 'Record<string, any>';
    default:
      return 'any';
  }
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
