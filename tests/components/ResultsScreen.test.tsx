import { describe, it, expect, vi, beforeEach } from 'vitest';
import { create } from 'react-test-renderer';
import { findByText, queryByText } from './test-utils';
import { createScorerState } from '../../src/core/scorer';
import { createAdaptiveState } from '../../src/core/adaptive';

// Mutable payload for per-test customization
const mockPayload = {
  scorer: {
    ...createScorerState([{ name: 'Player 1', score: 15 }]),
    correctCount: 7,
    totalPts: 15,
  },
  verdict: { title: 'Filmi Genius!', verdict: 'You really know your movies.' } as { title: string; verdict: string } | null,
  leaderboard: [{ name: 'Player 1', score: 15 }],
  gameMode: 'party' as 'party' | 'endless',
  highScore: 30,
  idx: 10,
  adaptive: createAdaptiveState(),
  abilityTier: 'Movie Buff',
  abilityPercentile: 75,
};

vi.mock('../../src/hooks/useGameState', () => ({
  useGameState: () => ({
    state: 'results',
    payload: mockPayload,
  }),
}));

const mockReplay = vi.fn();
const mockGetShareText = vi.fn(() => 'Share text');

vi.mock('../../src/hooks/useGameActions', () => ({
  useGameActions: () => ({
    replay: mockReplay,
    getShareText: mockGetShareText,
  }),
}));

vi.mock('../../src/components/FeedbackSheet', () => ({
  FeedbackSheet: () => null,
}));

vi.mock('../../src/components/Toast', () => ({
  toast: vi.fn(),
}));

import { ResultsScreen } from '../../src/components/ResultsScreen';

describe('ResultsScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset payload to defaults
    mockPayload.scorer = {
      ...createScorerState([{ name: 'Player 1', score: 15 }]),
      correctCount: 7,
      totalPts: 15,
    };
    mockPayload.idx = 10;
    mockPayload.verdict = { title: 'Filmi Genius!', verdict: 'You really know your movies.' };
    mockPayload.gameMode = 'party';
    mockPayload.highScore = 30;
    mockPayload.leaderboard = [{ name: 'Player 1', score: 15 }];
    mockPayload.adaptive = createAdaptiveState();
    mockPayload.abilityTier = 'Movie Buff';
    mockPayload.abilityPercentile = 75;
  });

  it('renders the verdict title', () => {
    const tree = create(<ResultsScreen />);
    expect(findByText(tree.root, 'Filmi Genius!')).toBeTruthy();
  });

  it('renders "Game over" eyebrow text', () => {
    const tree = create(<ResultsScreen />);
    expect(findByText(tree.root, 'Game over')).toBeTruthy();
  });

  it('shows correct count stat', () => {
    const tree = create(<ResultsScreen />);
    // The stat label
    expect(findByText(tree.root, 'Correct')).toBeTruthy();
    // correctCount and idx rendered as: {scorer.correctCount}/{idx} (multiple children in span)
    const statNode = tree.root.find((n) =>
      typeof n.props.className === 'string' &&
      n.props.className.includes('res-stat-n') &&
      n.children.some(c => String(c) === String(mockPayload.scorer.correctCount))
    );
    expect(statNode).toBeTruthy();
  });

  it('shows rating stat from adaptive', () => {
    const tree = create(<ResultsScreen />);
    expect(findByText(tree.root, '1100')).toBeTruthy();
    expect(findByText(tree.root, 'Rating')).toBeTruthy();
  });

  it('shows points stat', () => {
    const tree = create(<ResultsScreen />);
    expect(findByText(tree.root, '15')).toBeTruthy();
    expect(findByText(tree.root, 'Points')).toBeTruthy();
  });

  it('renders Share score button', () => {
    const tree = create(<ResultsScreen />);
    expect(findByText(tree.root, 'Share score')).toBeTruthy();
  });

  it('renders Play again button', () => {
    const tree = create(<ResultsScreen />);
    expect(findByText(tree.root, 'Play again')).toBeTruthy();
  });

  it('renders "How was that?" feedback button', () => {
    const tree = create(<ResultsScreen />);
    expect(findByText(tree.root, 'How was that?')).toBeTruthy();
  });

  it('renders verdict blockquote text', () => {
    const tree = create(<ResultsScreen />);
    expect(findByText(tree.root, 'You really know your movies.')).toBeTruthy();
  });

  it('shows ability tier and percentile', () => {
    const tree = create(<ResultsScreen />);
    // abilityTier and percentile rendered as: {abilityTier} · Top {abilityPercentile}%
    // These are multiple children in a <p>, so search for the tier text node
    expect(findByText(tree.root, /Movie Buff/)).toBeTruthy();
    // Percentile is part of a multi-child text: "Top " + "75" + "%"
    const subNode = tree.root.find((n) =>
      typeof n.props.className === 'string' &&
      n.props.className.includes('res-sub') &&
      n.children.some(c => String(c).includes('75'))
    );
    expect(subNode).toBeTruthy();
  });

  it('falls back to "Done!" when verdict is null', () => {
    mockPayload.verdict = null;
    const tree = create(<ResultsScreen />);
    expect(findByText(tree.root, 'Done!')).toBeTruthy();
  });

  it('does not render leaderboard for single player', () => {
    const tree = create(<ResultsScreen />);
    expect(queryByText(tree.root, 'Leaderboard')).toBeNull();
  });

  it('renders leaderboard when there are multiple players', () => {
    mockPayload.leaderboard = [
      { name: 'Alice', score: 20 },
      { name: 'Bob', score: 15 },
    ];
    const tree = create(<ResultsScreen />);
    expect(findByText(tree.root, 'Leaderboard')).toBeTruthy();
    expect(findByText(tree.root, 'Alice')).toBeTruthy();
    expect(findByText(tree.root, 'Bob')).toBeTruthy();
  });
});
