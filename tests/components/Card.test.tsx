import { describe, it, expect, vi } from 'vitest';
import { create, act } from 'react-test-renderer';
import { Card } from '../../src/components/Card';
import { findByText, findAllByText, findByRole, queryByText } from './test-utils';
import type { Card as CardType, Player } from '../../src/core/types';

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

const players: Player[] = [
  { name: 'Priya', score: 0 },
  { name: 'Rahul', score: 0 },
  { name: 'Anjali', score: 0 },
];

describe('Card', () => {
  it('renders front face with plot text', () => {
    const card = makeCard();
    const tree = create(
      <Card card={card} isFlipped={false} onFlip={() => {}} />,
    );
    expect(findByText(tree.root, card.c)).toBeTruthy();
  });

  it('renders industry badge as HINDI for HI cards', () => {
    const tree = create(
      <Card card={makeCard({ ind: 'HI' })} isFlipped={false} onFlip={() => {}} />,
    );
    expect(findAllByText(tree.root, /HINDI/).length).toBeGreaterThan(0);
  });

  it('renders industry badge as TELUGU for TE cards', () => {
    const tree = create(
      <Card card={makeCard({ ind: 'TE' })} isFlipped={false} onFlip={() => {}} />,
    );
    expect(findAllByText(tree.root, /TELUGU/).length).toBeGreaterThan(0);
  });

  it('shows TAP TO REVEAL on unflipped card', () => {
    const tree = create(
      <Card card={makeCard()} isFlipped={false} onFlip={() => {}} />,
    );
    expect(findAllByText(tree.root, /TAP TO REVEAL/).length).toBeGreaterThan(0);
  });

  it('renders back face with movie title when flipped', () => {
    const card = makeCard({ n: 'Sholay' });
    const tree = create(
      <Card card={card} isFlipped={true} onFlip={() => {}} />,
    );
    expect(findByText(tree.root, 'Sholay')).toBeTruthy();
  });

  it('renders year pill on back face', () => {
    const card = makeCard({ y: '2005' });
    const tree = create(
      <Card card={card} isFlipped={true} onFlip={() => {}} />,
    );
    expect(findByText(tree.root, '2005')).toBeTruthy();
  });

  it('shows every player in picker including the reader', () => {
    const card = makeCard();
    const tree = create(
      <Card
        card={card}
        isFlipped={true}
        onFlip={() => {}}
        players={players}
        readerIdx={0}
      />,
    );
    expect(findByText(tree.root, 'Priya')).toBeTruthy();
    expect(findByText(tree.root, 'Rahul')).toBeTruthy();
    expect(findByText(tree.root, 'Anjali')).toBeTruthy();
    const buttons = tree.root.findAll(
      (n) => n.type === 'button' && typeof n.props.className === 'string' && n.props.className.includes('v8-pchip'),
    );
    expect(buttons.length).toBe(4); // 3 players + NOBODY
  });

  it('reader can claim points too (not filtered from picker)', () => {
    const card = makeCard();
    const tree = create(
      <Card
        card={card}
        isFlipped={true}
        onFlip={() => {}}
        players={players}
        readerIdx={1}
      />,
    );
    const pickerButtons = tree.root.findAll(
      (n) => n.type === 'button' && typeof n.props.className === 'string' && n.props.className.includes('v8-pchip') && !n.props.className.includes('nobody'),
    );
    expect(pickerButtons.length).toBe(3);
  });

  it('shows NOBODY button in picker', () => {
    const tree = create(
      <Card
        card={makeCard()}
        isFlipped={true}
        onFlip={() => {}}
        players={players}
        readerIdx={0}
      />,
    );
    expect(findByText(tree.root, 'NOBODY')).toBeTruthy();
  });

  it('calls onFlip when clicked while unflipped', () => {
    const onFlip = vi.fn();
    const tree = create(
      <Card card={makeCard()} isFlipped={false} onFlip={onFlip} />,
    );
    const button = findByRole(tree.root, 'button');
    act(() => {
      button.props.onClick();
    });
    expect(onFlip).toHaveBeenCalledOnce();
  });

  it('does NOT call onFlip when clicked while already flipped', () => {
    const onFlip = vi.fn();
    const tree = create(
      <Card card={makeCard()} isFlipped={true} onFlip={onFlip} />,
    );
    const button = findByRole(tree.root, 'button');
    expect(button.props.onClick).toBeUndefined();
  });

  it('flip animation class toggles correctly', () => {
    const tree = create(
      <Card card={makeCard()} isFlipped={false} onFlip={() => {}} />,
    );
    const button = findByRole(tree.root, 'button');
    expect(button.props.className).not.toContain('flipped');

    // Re-render with flipped
    tree.update(
      <Card card={makeCard()} isFlipped={true} onFlip={() => {}} />,
    );
    const button2 = findByRole(tree.root, 'button');
    expect(button2.props.className).toContain('flipped');
  });

  it('has correct accessibility attributes when unflipped', () => {
    const card = makeCard();
    const tree = create(
      <Card card={card} isFlipped={false} onFlip={() => {}} />,
    );
    const button = findByRole(tree.root, 'button');
    expect(button.props.tabIndex).toBe(0);
    expect(button.props['aria-label']).toContain('tap to flip');
  });

  it('has correct accessibility attributes when flipped', () => {
    const card = makeCard({ n: 'DDLJ', y: '1995' });
    const tree = create(
      <Card card={card} isFlipped={true} onFlip={() => {}} />,
    );
    const button = findByRole(tree.root, 'button');
    expect(button.props.tabIndex).toBe(-1);
    expect(button.props['aria-label']).toContain('DDLJ');
    expect(button.props['aria-label']).toContain('1995');
  });

  it('triggers flip on Enter key when unflipped', () => {
    const onFlip = vi.fn();
    const tree = create(
      <Card card={makeCard()} isFlipped={false} onFlip={onFlip} />,
    );
    const button = findByRole(tree.root, 'button');
    act(() => {
      button.props.onKeyDown({ key: 'Enter', preventDefault: vi.fn() });
    });
    expect(onFlip).toHaveBeenCalledOnce();
  });

  it('triggers flip on Space key when unflipped', () => {
    const onFlip = vi.fn();
    const tree = create(
      <Card card={makeCard()} isFlipped={false} onFlip={onFlip} />,
    );
    const button = findByRole(tree.root, 'button');
    act(() => {
      button.props.onKeyDown({ key: ' ', preventDefault: vi.fn() });
    });
    expect(onFlip).toHaveBeenCalledOnce();
  });

  it('does NOT trigger flip on Enter key when already flipped', () => {
    const onFlip = vi.fn();
    const tree = create(
      <Card card={makeCard()} isFlipped={true} onFlip={onFlip} />,
    );
    const button = findByRole(tree.root, 'button');
    act(() => {
      button.props.onKeyDown({ key: 'Enter', preventDefault: vi.fn() });
    });
    expect(onFlip).not.toHaveBeenCalled();
  });

  it('shows difficulty indicator with colored dot', () => {
    const tree = create(
      <Card card={makeCard({ diff: 'hard' })} isFlipped={false} onFlip={() => {}} />,
    );
    // Difficulty text is rendered in the v8-card-diff element
    const diffEl = tree.root.find(
      (n) => typeof n.props.className === 'string' && n.props.className.includes('v8-card-diff'),
    );
    expect(diffEl).toBeTruthy();
    // The dot child has a style with the hard color
    const dot = tree.root.find(
      (n) => typeof n.props.className === 'string' && n.props.className.includes('v8-card-diff__dot'),
    );
    expect(dot.props.style.background).toBe('#C8321C');
  });

  it('does not show picker when no players provided', () => {
    const tree = create(
      <Card card={makeCard()} isFlipped={true} onFlip={() => {}} />,
    );
    expect(queryByText(tree.root, 'WHO GUESSED IT?')).toBeNull();
  });

  it('shows report link on back face', () => {
    const tree = create(
      <Card card={makeCard()} isFlipped={true} onFlip={() => {}} />,
    );
    expect(findAllByText(tree.root, /REPORT/).length).toBeGreaterThan(0);
  });

  it('calls onAwardPoints when picker button is tapped', () => {
    const onAward = vi.fn();
    const card = makeCard();
    const tree = create(
      <Card
        card={card}
        isFlipped={true}
        onFlip={() => {}}
        players={players}
        readerIdx={0}
        onAwardPoints={onAward}
      />,
    );
    // First non-nobody picker button is Priya (idx 0) since no players are filtered out
    const firstPickerBtn = tree.root.findAll(
      (n) => n.type === 'button' && typeof n.props.className === 'string' && n.props.className.includes('v8-pchip') && !n.props.className.includes('nobody'),
    )[0];
    act(() => {
      firstPickerBtn.props.onClick({ stopPropagation: vi.fn() });
    });
    expect(onAward).toHaveBeenCalledWith(0, card);
  });

  it('calls onAwardNobody when NOBODY button is tapped', () => {
    const onNobody = vi.fn();
    const card = makeCard();
    const tree = create(
      <Card
        card={card}
        isFlipped={true}
        onFlip={() => {}}
        players={players}
        readerIdx={0}
        onAwardNobody={onNobody}
      />,
    );
    const nobodyBtn = tree.root.find(
      (n) => n.type === 'button' && typeof n.props.className === 'string' && n.props.className.includes('v8-pchip--nobody'),
    );
    act(() => {
      nobodyBtn.props.onClick({ stopPropagation: vi.fn() });
    });
    expect(onNobody).toHaveBeenCalledWith(card);
  });
});
