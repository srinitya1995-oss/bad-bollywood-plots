import { describe, it, expect, vi, beforeEach } from 'vitest';
import { create, act } from 'react-test-renderer';
import { findByText, queryByText, findByAriaLabel } from './test-utils';

// Mock hooks BEFORE importing the component
const mockReady = vi.fn();
const mockContinueGame = vi.fn();

vi.mock('../../src/hooks/useGameActions', () => ({
  useGameActions: () => ({
    ready: mockReady,
    continueGame: mockContinueGame,
  }),
}));

let mockState = 'turnChange';
interface MockLastResult {
  card: { diff: 'easy' | 'medium' | 'hard' };
  winnerIdx: number;
  correct: boolean;
}

let mockPayload: {
  readerIdx: number;
  lastResult: MockLastResult | null;
  scores: number[];
  idx: number;
  scorer: {
    players: { name: string; score: number }[];
    totalPts: number;
    correctCount: number;
    currentPlayerIdx: number;
  };
} = {
  readerIdx: 0,
  lastResult: null,
  scores: [0, 0],
  idx: 3,
  scorer: {
    players: [
      { name: 'Priya', score: 4 },
      { name: 'Rahul', score: 2 },
    ],
    totalPts: 6,
    correctCount: 2,
    currentPlayerIdx: 0,
  },
};

vi.mock('../../src/hooks/useGameState', () => ({
  useGameState: () => ({
    state: mockState,
    payload: mockPayload,
  }),
}));

const mockEndGame = vi.fn();
vi.mock('../../src/hooks/gameInstance', () => ({
  getGameInstance: () => ({
    endGame: mockEndGame,
  }),
}));

// Import component AFTER mocks
import { TurnInterstitial } from '../../src/components/TurnInterstitial';

describe('TurnInterstitial', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState = 'turnChange';
    mockPayload = {
      readerIdx: 0,
      lastResult: null,
      scores: [0, 0],
      idx: 3,
      scorer: {
        players: [
          { name: 'Priya', score: 4 },
          { name: 'Rahul', score: 2 },
        ],
        totalPts: 6,
        correctCount: 2,
        currentPlayerIdx: 0,
      },
    };
  });

  it('renders next player name in uppercase', () => {
    const tree = create(<TurnInterstitial />);
    const nameEl = findByText(tree.root, 'PRIYA');
    expect(nameEl).toBeTruthy();
  });

  it('renders "HAND THE PHONE TO" text', () => {
    const tree = create(<TurnInterstitial />);
    expect(findByText(tree.root, 'HAND THE PHONE TO')).toBeTruthy();
  });

  it('renders tap hint in turnChange state', () => {
    const tree = create(<TurnInterstitial />);
    expect(findByText(tree.root, 'TAP ANYWHERE TO CONTINUE')).toBeTruthy();
  });

  it('shows correct feedback pill when lastResult is correct', () => {
    mockPayload.lastResult = {
      card: { diff: 'medium' },
      winnerIdx: 0,
      correct: true,
    };
    const tree = create(<TurnInterstitial />);
    expect(findByText(tree.root, 'PRIYA')).toBeTruthy();
    expect(findByText(tree.root, '+2 PTS')).toBeTruthy();
    // Feedback pill exists with correct styling
    const pill = tree.root.findAll((n) => n.props['data-testid'] === 'feedback-pill');
    expect(pill.length).toBe(1);
    expect(pill[0].props.className).toContain('correct');
  });

  it('shows miss feedback pill when lastResult is incorrect', () => {
    mockPayload.lastResult = {
      card: { diff: 'medium' },
      winnerIdx: -1,
      correct: false,
    };
    const tree = create(<TurnInterstitial />);
    expect(findByText(tree.root, 'NOBODY GOT IT')).toBeTruthy();
  });

  it('calls ready() when tapping in turnChange state', () => {
    const tree = create(<TurnInterstitial />);
    const main = tree.root.findByType('main');
    act(() => {
      main.props.onClick();
    });
    expect(mockReady).toHaveBeenCalledTimes(1);
  });

  it('calls continueGame() when tapping in continue state', () => {
    mockState = 'continue';
    const tree = create(<TurnInterstitial />);
    const main = tree.root.findByType('main');
    act(() => {
      main.props.onClick();
    });
    expect(mockContinueGame).toHaveBeenCalledTimes(1);
  });

  it('shows report button when lastResult exists and handler provided', () => {
    mockPayload.lastResult = {
      card: { diff: 'easy' },
      winnerIdx: 0,
      correct: true,
    };
    const onReport = vi.fn();
    const tree = create(<TurnInterstitial onReportLastPlot={onReport} />);
    const reportBtn = findByAriaLabel(tree.root, 'Report last plot');
    expect(reportBtn).toBeTruthy();
    act(() => {
      reportBtn.props.onClick({ stopPropagation: vi.fn() });
    });
    expect(onReport).toHaveBeenCalledTimes(1);
  });

  it('does not show report button when no lastResult', () => {
    const tree = create(<TurnInterstitial onReportLastPlot={() => {}} />);
    expect(queryByText(tree.root, 'REPORT LAST PLOT')).toBeNull();
  });

  it('uses second player when readerIdx is 1', () => {
    mockPayload.readerIdx = 1;
    const tree = create(<TurnInterstitial />);
    expect(findByText(tree.root, 'RAHUL')).toBeTruthy();
  });

  it('shows interval state in continue mode', () => {
    mockState = 'continue';
    const tree = create(<TurnInterstitial />);
    expect(findByText(tree.root, 'INTERVAL')).toBeTruthy();
    expect(findByText(tree.root, 'KEEP GOING')).toBeTruthy();
    expect(findByText(tree.root, 'SEE RESULTS')).toBeTruthy();
  });

  it('calls endGame when "SEE RESULTS" is clicked in continue state', () => {
    mockState = 'continue';
    const tree = create(<TurnInterstitial />);
    // Find the button containing SEE RESULTS text
    const buttons = tree.root.findAllByType('button');
    const seeResultsBtn = buttons.find((b) => {
      try {
        return b.children.some((c) => typeof c === 'string' && c.includes('SEE RESULTS'));
      } catch { return false; }
    });
    expect(seeResultsBtn).toBeTruthy();
    act(() => {
      seeResultsBtn!.props.onClick({ stopPropagation: vi.fn() });
    });
    expect(mockEndGame).toHaveBeenCalledWith('completed');
  });
});
