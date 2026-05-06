// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { create, act } from 'react-test-renderer';
import { findByAriaLabel } from './test-utils';
import type { GamePayload } from '../../src/hooks/gameInstance';

const mockPayload: Partial<GamePayload> = {
  scorer: {
    players: [{ name: 'Priya', score: 0 }, { name: 'Raj', score: 0 }],
    correctCount: 8,
    totalPts: 18,
    streak: 0,
  } as never,
  scores: [24, 18],
  idx: 12,
  industry: 'BW',
  adaptive: { ability: 1300, history: [] } as never,
  abilityTier: 'Movie Buff',
  abilityPercentile: 25,
};

vi.mock('../../src/hooks/useGameState', () => ({
  useGameState: () => ({ state: 'results', payload: mockPayload }),
}));

const captureMock = vi.fn();
const writeTextMock = vi.fn().mockResolvedValue(undefined);
const openMock = vi.fn();

beforeEach(() => {
  captureMock.mockClear();
  writeTextMock.mockClear();
  openMock.mockClear();
  (window as never as { posthog: { capture: typeof captureMock } }).posthog = { capture: captureMock };
  Object.assign(navigator, { clipboard: { writeText: writeTextMock } });
  vi.spyOn(window, 'open').mockImplementation(openMock);
});

import { ShareSection } from '../../src/components/ShareSection';

describe('ShareSection', () => {
  it('renders four channel buttons', () => {
    const tree = create(<ShareSection />);
    expect(findByAriaLabel(tree.root, 'Share on WhatsApp')).toBeTruthy();
    expect(findByAriaLabel(tree.root, 'Share on X')).toBeTruthy();
    expect(findByAriaLabel(tree.root, 'Share on Reddit')).toBeTruthy();
    expect(findByAriaLabel(tree.root, 'Copy share text')).toBeTruthy();
  });

  it('fires share_click with channel + party mode on WhatsApp click', () => {
    const tree = create(<ShareSection />);
    const btn = findByAriaLabel(tree.root, 'Share on WhatsApp');
    act(() => { btn.props.onClick(); });
    expect(captureMock).toHaveBeenCalledWith('share_click', { channel: 'whatsapp', mode: 'party' });
    expect(openMock).toHaveBeenCalledWith(
      expect.stringContaining('https://wa.me/?text='),
      '_blank',
    );
  });

  it('writes share text to clipboard on Copy click', () => {
    const tree = create(<ShareSection />);
    const btn = findByAriaLabel(tree.root, 'Copy share text');
    act(() => { btn.props.onClick(); });
    expect(captureMock).toHaveBeenCalledWith('share_click', { channel: 'copy', mode: 'party' });
    expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining('1. Priya 24'));
  });

  it('builds Reddit submit url with title + url params', () => {
    const tree = create(<ShareSection />);
    const btn = findByAriaLabel(tree.root, 'Share on Reddit');
    act(() => { btn.props.onClick(); });
    const calledUrl = openMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain('https://reddit.com/submit?title=');
    expect(calledUrl).toContain('&url=');
    expect(calledUrl).toContain(encodeURIComponent('utm_medium=reddit'));
  });
});
