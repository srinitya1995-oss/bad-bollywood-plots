import { describe, it, expect, vi } from 'vitest';
import { TypedEventBus } from '../../src/core/eventBus';

describe('TypedEventBus', () => {
  it('emits and receives typed events', () => {
    const bus = new TypedEventBus();
    const handler = vi.fn();
    bus.on('game:started', handler);
    bus.emit('game:started', { mode: 'HI', gameMode: 'party', playerCount: 2 });
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith({ mode: 'HI', gameMode: 'party', playerCount: 2 });
  });

  it('does not call unsubscribed handlers', () => {
    const bus = new TypedEventBus();
    const handler = vi.fn();
    bus.on('card:flipped', handler);
    bus.off('card:flipped', handler);
    bus.emit('card:flipped', { cardId: 'bw01', idx: 0 });
    expect(handler).not.toHaveBeenCalled();
  });

  it('supports multiple handlers for the same event', () => {
    const bus = new TypedEventBus();
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    bus.on('score:updated', handler1);
    bus.on('score:updated', handler2);
    bus.emit('score:updated', { result: 'correct', pts: 2, totalPts: 5 });
    expect(handler1).toHaveBeenCalledOnce();
    expect(handler2).toHaveBeenCalledOnce();
  });

  it('does not cross-fire between event types', () => {
    const bus = new TypedEventBus();
    const handler = vi.fn();
    bus.on('game:started', handler);
    bus.emit('game:ended', { reason: 'completed', totalPts: 10, correctCount: 8, totalPlayed: 12 });
    expect(handler).not.toHaveBeenCalled();
  });
});
