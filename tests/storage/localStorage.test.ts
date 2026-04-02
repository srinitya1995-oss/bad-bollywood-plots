import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageAdapter } from '../../src/storage/localStorage';
import type { StorageAdapter } from '../../src/storage/interface';

const store = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => store.set(key, value),
  removeItem: (key: string) => store.delete(key),
  clear: () => store.clear(),
} as Storage;

describe('LocalStorageAdapter', () => {
  let adapter: StorageAdapter;
  beforeEach(() => { store.clear(); adapter = new LocalStorageAdapter(mockLocalStorage); });

  it('returns empty seen cards initially', () => { expect(adapter.getSeenCards()).toEqual([]); });
  it('marks and retrieves seen cards', () => { adapter.markCardsSeen(['bw01', 'bw02']); expect(adapter.getSeenCards()).toEqual(['bw01', 'bw02']); });
  it('accumulates seen cards across calls', () => { adapter.markCardsSeen(['bw01']); adapter.markCardsSeen(['bw02']); expect(adapter.getSeenCards()).toEqual(['bw01', 'bw02']); });
  it('deduplicates seen cards', () => { adapter.markCardsSeen(['bw01', 'bw01']); expect(adapter.getSeenCards()).toEqual(['bw01']); });
  it('clears seen cards', () => { adapter.markCardsSeen(['bw01']); adapter.clearSeenCards(); expect(adapter.getSeenCards()).toEqual([]); });
  it('returns 0 for high score initially', () => { expect(adapter.getHighScore()).toBe(0); });
  it('sets and gets high score', () => { adapter.setHighScore(42); expect(adapter.getHighScore()).toBe(42); });
  it('saves and retrieves events in buffer', () => {
    const event = { event: 'test', props: {}, sessionId: 'abc', timestamp: 1000 };
    adapter.logEvent(event);
    expect(adapter.getEventBuffer()).toEqual([event]);
  });
  it('clears event buffer', () => {
    adapter.logEvent({ event: 'test', props: {}, sessionId: 'abc', timestamp: 1000 });
    adapter.clearEventBuffer();
    expect(adapter.getEventBuffer()).toEqual([]);
  });
  it('caps event buffer at 500', () => {
    for (let i = 0; i < 510; i++) { adapter.logEvent({ event: `e${i}`, props: {}, sessionId: 'abc', timestamp: i }); }
    expect(adapter.getEventBuffer()).toHaveLength(500);
  });
});
