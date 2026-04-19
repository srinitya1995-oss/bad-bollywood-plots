import { describe, it, expect, vi, beforeEach } from 'vitest';
import { create, act, ReactTestRenderer } from 'react-test-renderer';
import { findByText, findAllByText, findByAriaLabel, findAllByAriaLabel, queryByText } from './test-utils';

// Mock crypto.randomUUID
vi.stubGlobal('crypto', { randomUUID: () => `test-uuid-${Math.random()}` });

const mockStartGame = vi.fn();
const mockSelectMode = vi.fn();

vi.mock('../../src/hooks/useGameActions', () => ({
  useGameActions: () => ({
    startGame: mockStartGame,
    selectMode: mockSelectMode,
  }),
}));

// PlayerSetup reads initial mode from the game instance at mount time.
vi.mock('../../src/hooks/gameInstance', () => ({
  getGameInstance: () => ({
    getSetupInitialMode: () => 'party',
  }),
}));

import { PlayerSetup } from '../../src/components/PlayerSetup';

describe('PlayerSetup', () => {
  let onClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    onClose = vi.fn();
  });

  it('renders the setup panel with mast title', () => {
    const tree = create(<PlayerSetup onClose={onClose} />);
    expect(findByText(tree.root, "WHO'S PLAYING?")).toBeTruthy();
  });

  it('renders MIN/MAX subtitle in mast', () => {
    const tree = create(<PlayerSetup onClose={onClose} />);
    expect(findByText(tree.root, /MIN 2/)).toBeTruthy();
    expect(findByText(tree.root, /MAX 8/)).toBeTruthy();
  });

  it('renders two player inputs by default', () => {
    const tree = create(<PlayerSetup onClose={onClose} />);
    const inputs = tree.root.findAll((node) => typeof node.props['aria-label'] === 'string' && /Player \d+ name/.test(node.props['aria-label']));
    expect(inputs.length).toBe(2);
  });

  it('renders mode toggle buttons', () => {
    const tree = create(<PlayerSetup onClose={onClose} />);
    expect(findByText(tree.root, 'PASS & PLAY')).toBeTruthy();
    expect(findByText(tree.root, 'SOLO')).toBeTruthy();
  });

  it('can add a player', () => {
    const tree = create(<PlayerSetup onClose={onClose} />);
    const addBtn = findByAriaLabel(tree.root, 'Add another player');
    act(() => { addBtn.props.onClick(); });
    const inputs = tree.root.findAll((node) => typeof node.props['aria-label'] === 'string' && /Player \d+ name/.test(node.props['aria-label']));
    expect(inputs.length).toBe(3);
  });

  it('can remove a player when more than 2', () => {
    const tree = create(<PlayerSetup onClose={onClose} />);
    // Add a third player first
    const addBtn = findByAriaLabel(tree.root, 'Add another player');
    act(() => { addBtn.props.onClick(); });
    // Now remove one
    const removeBtn = findByAriaLabel(tree.root, 'Remove player 3');
    act(() => { removeBtn.props.onClick(); });
    const inputs = tree.root.findAll((node) => typeof node.props['aria-label'] === 'string' && /Player \d+ name/.test(node.props['aria-label']));
    expect(inputs.length).toBe(2);
  });

  it('does not show remove buttons when only 2 players', () => {
    const tree = create(<PlayerSetup onClose={onClose} />);
    const removeBtns = tree.root.findAll((node) => {
      return node.props['aria-label'] && /Remove player/.test(node.props['aria-label']);
    });
    expect(removeBtns.length).toBe(0);
  });

  it('start button exists and calls startGame + onClose', () => {
    const tree = create(<PlayerSetup onClose={onClose} />);
    const startBtn = findByText(tree.root, "LET'S GO");
    expect(startBtn).toBeTruthy();
    act(() => { startBtn.props.onClick(); });
    expect(mockStartGame).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('players have ids assigned', () => {
    const tree = create(<PlayerSetup onClose={onClose} />);
    const startBtn = findByText(tree.root, "LET'S GO");
    act(() => { startBtn.props.onClick(); });
    const players = mockStartGame.mock.calls[0][0];
    expect(players.length).toBe(2);
    expect(players[0].id).toBeDefined();
    expect(players[1].id).toBeDefined();
  });

  it('switching to solo mode shows 1 player', () => {
    const tree = create(<PlayerSetup onClose={onClose} />);
    const soloBtn = findByText(tree.root, 'SOLO');
    act(() => { soloBtn.props.onClick(); });
    const inputs = tree.root.findAll((node) => typeof node.props['aria-label'] === 'string' && /Player \d+ name/.test(node.props['aria-label']));
    expect(inputs.length).toBe(1);
  });

  it('hides add player button in solo mode', () => {
    const tree = create(<PlayerSetup onClose={onClose} />);
    const soloBtn = findByText(tree.root, 'SOLO');
    act(() => { soloBtn.props.onClick(); });
    const addBtns = tree.root.findAll((node) => {
      return node.props['aria-label'] === 'Add another player';
    });
    expect(addBtns.length).toBe(0);
  });

  it('close button calls onClose', () => {
    const tree = create(<PlayerSetup onClose={onClose} />);
    const closeBtn = findByAriaLabel(tree.root, 'Close setup');
    act(() => { closeBtn.props.onClick(); });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
