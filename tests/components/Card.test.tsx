import { describe, it, expect, vi } from 'vitest';
import { create, act } from 'react-test-renderer';
import { Card } from '../../src/components/Card';
import { findByText, findAllByText, findByRole } from './test-utils';
import type { Card as CardType } from '../../src/core/types';

function makeCard(overrides: Partial<CardType> = {}): CardType {
  return {
    id: 'bw01',
    ind: 'HI',
    diff: 'medium',
    era: '90s',
    y: '1995',
    n: 'Dilwale Dulhania Le Jayenge',
    f: 'Shah Rukh Khan almost did not get the role.',
    c: 'NRI guy stalks a girl across Europe and her dad is somehow okay with it.',
    ...overrides,
  };
}

describe('Card', () => {
  it('renders card front with clue text', () => {
    const card = makeCard();
    const tree = create(<Card card={card} isFlipped={false} onFlip={() => {}} />);
    expect(findByText(tree.root, card.c)).toBeTruthy();
  });

  it('renders industry badge as Bollywood for HI cards', () => {
    const tree = create(<Card card={makeCard({ ind: 'HI' })} isFlipped={false} onFlip={() => {}} />);
    expect(findAllByText(tree.root, /Bollywood/).length).toBeGreaterThan(0);
  });

  it('renders industry badge as Tollywood for TE cards', () => {
    const tree = create(<Card card={makeCard({ ind: 'TE' })} isFlipped={false} onFlip={() => {}} />);
    expect(findAllByText(tree.root, /Tollywood/).length).toBeGreaterThan(0);
  });

  it('renders era and difficulty in badge', () => {
    const card = makeCard({ era: '2000s', diff: 'hard' });
    const tree = create(<Card card={card} isFlipped={false} onFlip={() => {}} />);
    // Badge renders as: {era} · {diff} with multiple children
    const badge = tree.root.find((n) =>
      typeof n.props.className === 'string' && n.props.className.includes('card-badge')
    );
    const textContent = badge.children.filter(c => typeof c === 'string').join('');
    expect(textContent).toContain('2000s');
    expect(textContent).toContain('hard');
  });

  it('shows "Tap to reveal answer" on unflipped card', () => {
    const tree = create(<Card card={makeCard()} isFlipped={false} onFlip={() => {}} />);
    expect(findByText(tree.root, 'Tap to reveal answer')).toBeTruthy();
  });

  it('calls onFlip when clicked while unflipped', () => {
    const onFlip = vi.fn();
    const tree = create(<Card card={makeCard()} isFlipped={false} onFlip={onFlip} />);
    const button = findByRole(tree.root, 'button');
    act(() => {
      button.props.onClick();
    });
    expect(onFlip).toHaveBeenCalledOnce();
  });

  it('does NOT call onFlip when clicked while already flipped', () => {
    const onFlip = vi.fn();
    const tree = create(<Card card={makeCard()} isFlipped={true} onFlip={onFlip} />);
    const button = findByRole(tree.root, 'button');
    // onClick is undefined when flipped
    expect(button.props.onClick).toBeUndefined();
  });

  it('shows movie name on card back', () => {
    const card = makeCard({ n: 'Sholay' });
    const tree = create(<Card card={card} isFlipped={true} onFlip={() => {}} />);
    expect(findByText(tree.root, 'Sholay')).toBeTruthy();
  });

  it('has correct accessibility attributes', () => {
    const card = makeCard();
    const tree = create(<Card card={card} isFlipped={false} onFlip={() => {}} />);
    const button = findByRole(tree.root, 'button');
    expect(button.props.tabIndex).toBe(0);
    expect(button.props['aria-label']).toBe('Bollywood medium card \u2014 tap to flip and reveal answer');
  });

  it('updates aria-label when flipped to show movie info', () => {
    const card = makeCard({ n: 'DDLJ', y: '1995', diff: 'medium' });
    const tree = create(<Card card={card} isFlipped={true} onFlip={() => {}} />);
    const button = findByRole(tree.root, 'button');
    expect(button.props['aria-label']).toBe('DDLJ (1995) \u2014 Bollywood medium');
    expect(button.props.tabIndex).toBe(-1);
  });

  it('triggers flip on Enter key when unflipped', () => {
    const onFlip = vi.fn();
    const tree = create(<Card card={makeCard()} isFlipped={false} onFlip={onFlip} />);
    const button = findByRole(tree.root, 'button');
    act(() => {
      button.props.onKeyDown({ key: 'Enter', preventDefault: vi.fn() });
    });
    expect(onFlip).toHaveBeenCalledOnce();
  });

  it('triggers flip on Space key when unflipped', () => {
    const onFlip = vi.fn();
    const tree = create(<Card card={makeCard()} isFlipped={false} onFlip={onFlip} />);
    const button = findByRole(tree.root, 'button');
    act(() => {
      button.props.onKeyDown({ key: ' ', preventDefault: vi.fn() });
    });
    expect(onFlip).toHaveBeenCalledOnce();
  });

  it('does NOT trigger flip on Enter key when already flipped', () => {
    const onFlip = vi.fn();
    const tree = create(<Card card={makeCard()} isFlipped={true} onFlip={onFlip} />);
    const button = findByRole(tree.root, 'button');
    act(() => {
      button.props.onKeyDown({ key: 'Enter', preventDefault: vi.fn() });
    });
    expect(onFlip).not.toHaveBeenCalled();
  });

  it('adds "flipped" class when isFlipped is true', () => {
    const tree = create(<Card card={makeCard()} isFlipped={true} onFlip={() => {}} />);
    const button = findByRole(tree.root, 'button');
    expect(button.props.className).toContain('flipped');
  });

  it('does not add "flipped" class when isFlipped is false', () => {
    const tree = create(<Card card={makeCard()} isFlipped={false} onFlip={() => {}} />);
    const button = findByRole(tree.root, 'button');
    expect(button.props.className).not.toContain('flipped');
  });
});
