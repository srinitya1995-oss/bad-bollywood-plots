import { describe, it, expect, vi, beforeEach } from 'vitest';
import { create } from 'react-test-renderer';
import { findByText, queryByText, findByAriaLabel } from './test-utils';

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

let mockCanResume = false;
vi.mock('../../src/hooks/useResumeSession', () => ({
  useResumeSession: () => ({
    canResume: mockCanResume,
    resumeData: null,
    clearResume: vi.fn(),
  }),
}));

vi.mock('../../src/components/SuggestSheet', () => ({
  SuggestSheet: () => null,
}));

vi.mock('../../src/components/FeedbackSheet', () => ({
  FeedbackSheet: () => null,
}));

vi.mock('../../src/components/HowToScreen', () => ({
  HowToScreen: () => null,
}));

vi.mock('../../src/components/SettingsScreen', () => ({
  SettingsScreen: () => null,
}));

// Import component AFTER mocks are set up
import { HomeScreen } from '../../src/components/HomeScreen';

describe('HomeScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCanResume = false;
  });

  it('renders title "BAD BOLLYWOOD PLOTS"', () => {
    const tree = create(<HomeScreen />);
    expect(findByText(tree.root, 'BAD')).toBeTruthy();
    expect(findByText(tree.root, 'BOLLYWOOD')).toBeTruthy();
    expect(findByText(tree.root, 'PLOTS')).toBeTruthy();
  });

  it('renders "PASS & PLAY" button', () => {
    const tree = create(<HomeScreen />);
    const btn = findByAriaLabel(tree.root, 'Pass and Play');
    expect(btn).toBeTruthy();
  });

  it('renders "SOLO" button', () => {
    const tree = create(<HomeScreen />);
    const btn = findByAriaLabel(tree.root, 'Solo');
    expect(btn).toBeTruthy();
  });

  it('renders Made by @Srinitya link', () => {
    const tree = create(<HomeScreen />);
    const link = findByText(tree.root, 'Made by @Srinitya');
    expect(link).toBeTruthy();
    expect(link.props.href).toBe('https://www.linkedin.com/in/srinityaduppanapudisatya/');
  });

  it('renders resume pill when canResume is true', () => {
    mockCanResume = true;
    const tree = create(<HomeScreen />);
    expect(findByText(tree.root, 'Resume last game')).toBeTruthy();
  });

  it('does not render resume pill when canResume is false', () => {
    mockCanResume = false;
    const tree = create(<HomeScreen />);
    expect(queryByText(tree.root, 'Resume last game')).toBeNull();
  });

  it('PASS & PLAY button calls selectMode with HI', () => {
    const tree = create(<HomeScreen />);
    const btn = findByAriaLabel(tree.root, 'Pass and Play');
    btn.props.onClick();
    expect(mockSelectMode).toHaveBeenCalledWith('HI');
  });

  it('SOLO button calls startSoloGame with HI', () => {
    const tree = create(<HomeScreen />);
    const btn = findByAriaLabel(tree.root, 'Solo');
    btn.props.onClick();
    expect(mockStartSoloGame).toHaveBeenCalledWith('HI');
  });
});
