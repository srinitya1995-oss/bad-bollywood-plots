import type { ReactTestRenderer, ReactTestInstance } from 'react-test-renderer';

/**
 * Find all nodes whose text content matches the given string or regex.
 */
export function findByText(root: ReactTestInstance, text: string | RegExp): ReactTestInstance {
  const results = findAllByText(root, text);
  if (results.length === 0) throw new Error(`Unable to find text: ${text}`);
  return results[0];
}

export function findAllByText(root: ReactTestInstance, text: string | RegExp): ReactTestInstance[] {
  return root.findAll((node) => {
    if (typeof node.children[0] === 'string') {
      const content = node.children[0];
      return typeof text === 'string' ? content.includes(text) : text.test(content);
    }
    return false;
  });
}

export function queryByText(root: ReactTestInstance, text: string | RegExp): ReactTestInstance | null {
  const results = findAllByText(root, text);
  return results.length > 0 ? results[0] : null;
}

/**
 * Find element by prop value.
 */
export function findByProp(root: ReactTestInstance, prop: string, value: unknown): ReactTestInstance {
  return root.find((node) => node.props[prop] === value);
}

export function findByRole(root: ReactTestInstance, role: string): ReactTestInstance {
  return root.find((node) => node.props.role === role);
}

export function findByAriaLabel(root: ReactTestInstance, label: string): ReactTestInstance {
  return root.find((node) => node.props['aria-label'] === label);
}

export function findAllByAriaLabel(root: ReactTestInstance, label: string): ReactTestInstance[] {
  return root.findAll((node) => node.props['aria-label'] === label);
}
