import { describe, it, expect, vi, beforeEach } from 'vitest';
import { create, act } from 'react-test-renderer';
import { findByText, findAllByText, findByAriaLabel, queryByText } from './test-utils';

// Mock hooks BEFORE importing the component
const mockStartSoloGame = vi.fn();
const mockSelectMode = vi.fn();
const mockSetGameMode = vi.fn();

vi.mock('../../src/hooks/useGameActions', () => ({
  useGameActions: () => ({
    startSoloGame: mockStartSoloGame,
    selectMode: mockSelectMode,
    setGameMode: mockSetGameMode,
  }),
}));

vi.mock('../../src/components/SuggestSheet', () => ({
  SuggestSheet: () => null,
}));

vi.mock('../../src/components/FeedbackSheet', () => ({
  FeedbackSheet: () => null,
}));

// Import component AFTER mocks are set up
import { HomeScreen } from '../../src/components/HomeScreen';

describe('HomeScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "BAD" and "PLOTS" title text', () => {
    const tree = create(<HomeScreen />);
    expect(findByText(tree.root, 'BAD')).toBeTruthy();
    expect(findByText(tree.root, 'PLOTS')).toBeTruthy();
  });

  it('renders Hindi cinema button', () => {
    const tree = create(<HomeScreen />);
    expect(findByAriaLabel(tree.root, 'Play Hindi Films')).toBeTruthy();
    expect(findByText(tree.root, 'Hindi')).toBeTruthy();
  });

  it('renders Telugu cinema button', () => {
    const tree = create(<HomeScreen />);
    expect(findByAriaLabel(tree.root, 'Play Telugu Films')).toBeTruthy();
    expect(findByText(tree.root, 'Telugu')).toBeTruthy();
  });

  it('renders Party and Endless mode buttons', () => {
    const tree = create(<HomeScreen />);
    expect(findByText(tree.root, 'Party')).toBeTruthy();
    expect(findByText(tree.root, 'Endless')).toBeTruthy();
  });

  it('Party mode is active by default', () => {
    const tree = create(<HomeScreen />);
    const partyBtn = findByText(tree.root, 'Party');
    expect(partyBtn.props['aria-pressed']).toBe(true);
    const endlessBtn = findByText(tree.root, 'Endless');
    expect(endlessBtn.props['aria-pressed']).toBe(false);
  });

  it('Bollywood button calls startSoloGame with BW by default (no multiplayer)', () => {
    const tree = create(<HomeScreen />);
    const bwBtn = findByAriaLabel(tree.root, 'Play Hindi Films');
    act(() => {
      bwBtn.props.onClick();
    });
    expect(mockStartSoloGame).toHaveBeenCalledWith('HI');
    expect(mockSelectMode).not.toHaveBeenCalled();
  });

  it('Tollywood button calls startSoloGame with TW by default', () => {
    const tree = create(<HomeScreen />);
    const twBtn = findByAriaLabel(tree.root, 'Play Telugu Films');
    act(() => {
      twBtn.props.onClick();
    });
    expect(mockStartSoloGame).toHaveBeenCalledWith('TE');
  });

  it('switching to Endless mode calls setGameMode', () => {
    const tree = create(<HomeScreen />);
    const endlessBtn = findByText(tree.root, 'Endless');
    act(() => {
      endlessBtn.props.onClick();
    });
    expect(mockSetGameMode).toHaveBeenCalledWith('endless');
  });

  it('shows Endless description when Endless mode is selected', () => {
    const tree = create(<HomeScreen />);
    const endlessBtn = findByText(tree.root, 'Endless');
    act(() => {
      endlessBtn.props.onClick();
    });
    expect(findByText(tree.root, 'Keep going until you drop')).toBeTruthy();
  });

  it('shows Party description by default', () => {
    const tree = create(<HomeScreen />);
    expect(findByText(tree.root, /12 cards/)).toBeTruthy();
  });

  it('with multiplayer enabled, cinema button calls selectMode instead of startSoloGame', () => {
    const tree = create(<HomeScreen />);
    const friendsBtn = findByText(tree.root, '+ Add friends');
    act(() => {
      friendsBtn.props.onClick();
    });
    const bwBtn = findByAriaLabel(tree.root, 'Play Hindi Films');
    act(() => {
      bwBtn.props.onClick();
    });
    expect(mockSelectMode).toHaveBeenCalledWith('HI');
    expect(mockStartSoloGame).not.toHaveBeenCalled();
  });

  it('renders tagline', () => {
    const tree = create(<HomeScreen />);
    expect(findByText(tree.root, 'Guess the movie from the terrible plot')).toBeTruthy();
  });
});
