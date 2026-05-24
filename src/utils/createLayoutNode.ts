import { LayoutNode } from '../types/schema';

export function createLayoutNode(type: LayoutNode['type']): LayoutNode {
  const baseStyle: Record<string, string> = {
    padding: '10px',
    margin: '8px',
    color: '#cbd5e1',
    backgroundColor: '#0f172a',
  };

  const props: LayoutNode['props'] = {
    className: 'text-slate-200',
  };

  if (type === 'input') {
    props.placeholder = 'Type here';
  }

  if (type === 'text') {
    props.value = 'Text node';
  }

  if (type === 'button') {
    props.value = 'Button';
  }

  if (type === 'h1') {
    props.value = 'Heading';
  }

  return {
    id: `${type}-${Date.now()}`,
    type,
    children: [],
    props,
    styles: baseStyle,
  };
}

export default createLayoutNode;
