import { describe, it, expect, vi, beforeEach } from 'vitest';
import { create } from 'react-test-renderer';
import { findByText, queryByText } from './test-utils';
import { createScorerState } from '../../src/core/scorer';

// Mutable payload for per-test customization
const mockPayload = {
  scorer: {
    ...createScorerState([{ name: 'Player 1', score: 0 }]),
    correctCount: 7,
    totalPts: 15,
  },
  leaderboard: [{ name: 'Player 1', score: 15 }],
  idx: 10,
  scores: [15] as number[],
};

vi.mock('../../src/hooks/useGameState', () => ({
  useGameState: () => ({
    state: 'results',
    payload: mockPayload,
  }),
}));

const mockReplay = vi.fn();
const mockExitGame = vi.fn();

vi.mock('../../src/hooks/useGameActions', () => ({
  useGameActions: () => ({
    replay: mockReplay,
    exitGame: mockExitGame,
  }),
}));

import { ResultsScreen } from '../../src/components/ResultsScreen';

describe('ResultsScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset payload to single-player defaults
    mockPayload.scorer = {
      ...createScorerState([{ name: 'Player 1', score: 0 }]),
      correctCount: 7,
      totalPts: 15,
    };
    mockPayload.idx = 10;
    mockPayload.leaderboard = [{ name: 'Player 1', score: 15 }];
    mockPayload.scores = [15];
  });

  it('renders "FINAL VERDICT" header', () => {
    const tree = create(<ResultsScreen />);
    expect(findByText(tree.root, 'FINAL VERDICT')).toBeTruthy();
  });

  it('renders "Final Verdict" in the panel masthead', () => {
    const tree = create(<ResultsScreen />);
    expect(findByText(tree.root, 'Final Verdict')).toBeTruthy();
  });

  it('renders player scores in the leaderboard', () => {
    mockPayload.scorer = {
      ...createScorerState([
        { name: 'Alice', score: 0 },
        { name: 'Bob', score: 0 },
      ]),
      correctCount: 5,
      totalPts: 10,
    };
    mockPayload.scores = [20, 12];
    mockPayload.leaderboard = [
      { name: 'Alice', score: 20 },
      { name: 'Bob', score: 12 },
    ];

    const tree = create(<ResultsScreen />);
    expect(findByText(tree.root, 'Alice')).toBeTruthy();
    expect(findByText(tree.root, 'Bob')).toBeTruthy();
    expect(findByText(tree.root, '20 pts')).toBeTruthy();
    expect(findByText(tree.root, '12 pts')).toBeTruthy();
  });

  it('renders PLAY AGAIN button', () => {
    const tree = create(<ResultsScreen />);
    expect(findByText(tree.root, 'PLAY AGAIN')).toBeTruthy();
  });

  it('renders HOME button', () => {
    const tree = create(<ResultsScreen />);
    expect(findByText(tree.root, 'HOME')).toBeTruthy();
  });

  it('shows winner section for multiplayer', () => {
    mockPayload.scorer = {
      ...createScorerState([
        { name: 'Priya', score: 0 },
        { name: 'Raj', score: 0 },
      ]),
      correctCount: 5,
      totalPts: 10,
    };
    mockPayload.scores = [25, 18];

    const tree = create(<ResultsScreen />);
    expect(findByText(tree.root, 'Priya')).toBeTruthy();
    expect(findByText(tree.root, 'MOVIE BUFF')).toBeTruthy();
  });

  it('shows solo stats for single player', () => {
    const tree = create(<ResultsScreen />);
    expect(findByText(tree.root, 'Correct')).toBeTruthy();
    expect(findByText(tree.root, 'Points')).toBeTruthy();
  });

  it('does not show winner section for single player', () => {
    const tree = create(<ResultsScreen />);
    expect(queryByText(tree.root, 'MOVIE BUFF')).toBeNull();
  });

  it('renders a random desi film quote', () => {
    const tree = create(<ResultsScreen />);
    // The quote is wrapped in quotes and rendered in a <p> element
    const quoteNode = tree.root.find(
      (n) =>
        typeof n.props.className === 'string' &&
        n.props.className.includes('v8-results-quote'),
    );
    expect(quoteNode).toBeTruthy();
    // The quote text should be non-empty and wrapped in double quotes
    const text = quoteNode.children[0];
    expect(typeof text === 'string' && text.startsWith('"') && text.endsWith('"')).toBe(true);
  });

  it('shows plots played count', () => {
    const tree = create(<ResultsScreen />);
    expect(findByText(tree.root, '10 Plots Played')).toBeTruthy();
  });
});
