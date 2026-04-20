import { describe, it, expect, vi } from 'vitest';
import { create } from 'react-test-renderer';
import { findByText, findAllByText } from './test-utils';

import { HowToScreen } from '../../src/components/HowToScreen';

describe('HowToScreen', () => {
  it('renders the title "HOW TO PLAY"', () => {
    const tree = create(<HowToScreen onClose={vi.fn()} />);
    expect(findByText(tree.root, 'HOW TO PLAY')).toBeTruthy();
  });

  it('renders all 4 rules', () => {
    const tree = create(<HowToScreen onClose={vi.fn()} />);
    expect(findByText(tree.root, 'Read the bad plot')).toBeTruthy();
    expect(findByText(tree.root, 'Guess the movie')).toBeTruthy();
    expect(findByText(tree.root, 'Award the guesser')).toBeTruthy();
    expect(findByText(tree.root, 'Pass the phone')).toBeTruthy();
  });

  it('renders point values', () => {
    const tree = create(<HowToScreen onClose={vi.fn()} />);
    expect(findByText(tree.root, '1 PT')).toBeTruthy();
    expect(findByText(tree.root, '2 PTS')).toBeTruthy();
    expect(findByText(tree.root, '3 PTS')).toBeTruthy();
  });

  it('renders GOT IT button', () => {
    const tree = create(<HowToScreen onClose={vi.fn()} />);
    expect(findByText(tree.root, 'GOT IT')).toBeTruthy();
  });

  it('calls onClose when GOT IT is clicked', () => {
    const onClose = vi.fn();
    const tree = create(<HowToScreen onClose={onClose} />);
    const btn = findByText(tree.root, 'GOT IT');
    btn.props.onClick();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders rule numbers 1 through 4', () => {
    const tree = create(<HowToScreen onClose={vi.fn()} />);
    for (const num of ['1', '2', '3', '4']) {
      expect(findAllByText(tree.root, num).length).toBeGreaterThanOrEqual(1);
    }
  });
});
