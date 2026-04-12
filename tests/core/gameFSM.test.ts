import { describe, it, expect, vi } from 'vitest';
import { GameFSM } from '../../src/core/gameFSM';
import { TypedEventBus } from '../../src/core/eventBus';

function createFSM() {
  const bus = new TypedEventBus();
  const fsm = new GameFSM(bus);
  return { bus, fsm };
}

describe('GameFSM', () => {
  it('starts in home state', () => {
    const { fsm } = createFSM();
    expect(fsm.getState()).toBe('home');
  });

  it('transitions home → setup', () => {
    const { fsm } = createFSM();
    fsm.transition('setup');
    expect(fsm.getState()).toBe('setup');
  });

  it('transitions setup → playing', () => {
    const { fsm } = createFSM();
    fsm.transition('setup');
    fsm.transition('playing');
    expect(fsm.getState()).toBe('playing');
  });

  it('rejects invalid transitions silently', () => {
    const { fsm } = createFSM();
    fsm.transition('flipped');
    expect(fsm.getState()).toBe('home');
  });

  it('emits fsm:transition on the event bus', () => {
    const { bus, fsm } = createFSM();
    const handler = vi.fn();
    bus.on('fsm:transition', handler);
    fsm.transition('setup');
    expect(handler).toHaveBeenCalledWith({ from: 'home', to: 'setup' });
  });

  it('does not emit on invalid transitions', () => {
    const { bus, fsm } = createFSM();
    const handler = vi.fn();
    bus.on('fsm:transition', handler);
    fsm.transition('results');
    expect(handler).not.toHaveBeenCalled();
  });

  it('holds and returns payload', () => {
    const { fsm } = createFSM();
    fsm.transition('setup', { industry: 'BW' });
    expect(fsm.getPayload()).toEqual({ industry: 'BW' });
  });

  it('notifies subscribers on transition', () => {
    const { fsm } = createFSM();
    const subscriber = vi.fn();
    fsm.subscribe(subscriber);
    fsm.transition('setup');
    expect(subscriber).toHaveBeenCalledOnce();
  });

  it('full game flow: home → setup → playing → flipped → scoring → results', () => {
    const { fsm } = createFSM();
    fsm.transition('setup');
    fsm.transition('playing');
    fsm.transition('flipped');
    fsm.transition('scoring');
    fsm.transition('results');
    expect(fsm.getState()).toBe('results');
  });

  it('results → home', () => {
    const { fsm } = createFSM();
    fsm.transition('setup'); fsm.transition('playing'); fsm.transition('flipped'); fsm.transition('scoring'); fsm.transition('results');
    fsm.transition('home');
    expect(fsm.getState()).toBe('home');
  });

  it('results → playing (replay)', () => {
    const { fsm } = createFSM();
    fsm.transition('setup'); fsm.transition('playing'); fsm.transition('flipped'); fsm.transition('scoring'); fsm.transition('results');
    fsm.transition('playing');
    expect(fsm.getState()).toBe('playing');
  });

  it('scoring → turnChange', () => {
    const { fsm } = createFSM();
    fsm.transition('setup'); fsm.transition('playing'); fsm.transition('flipped'); fsm.transition('scoring');
    fsm.transition('turnChange');
    expect(fsm.getState()).toBe('turnChange');
  });

  it('turnChange → playing', () => {
    const { fsm } = createFSM();
    fsm.transition('setup'); fsm.transition('playing'); fsm.transition('flipped'); fsm.transition('scoring'); fsm.transition('turnChange');
    fsm.transition('playing');
    expect(fsm.getState()).toBe('playing');
  });

  it('scoring → continue', () => {
    const { fsm } = createFSM();
    fsm.transition('setup'); fsm.transition('playing'); fsm.transition('flipped'); fsm.transition('scoring');
    fsm.transition('continue');
    expect(fsm.getState()).toBe('continue');
  });

  it('continue → playing', () => {
    const { fsm } = createFSM();
    fsm.transition('setup'); fsm.transition('playing'); fsm.transition('flipped'); fsm.transition('scoring'); fsm.transition('continue');
    fsm.transition('playing');
    expect(fsm.getState()).toBe('playing');
  });

  it('continue → results', () => {
    const { fsm } = createFSM();
    fsm.transition('setup'); fsm.transition('playing'); fsm.transition('flipped'); fsm.transition('scoring'); fsm.transition('continue');
    fsm.transition('results');
    expect(fsm.getState()).toBe('results');
  });

  it('transitions home → playing (solo skip setup)', () => {
    const { fsm } = createFSM();
    fsm.transition('playing');
    expect(fsm.getState()).toBe('playing');
  });

  it('playing → home (exit)', () => {
    const { fsm } = createFSM();
    fsm.transition('setup'); fsm.transition('playing');
    fsm.transition('home');
    expect(fsm.getState()).toBe('home');
  });

  it('getSnapshot returns stable ref when no change', () => {
    const { fsm } = createFSM();
    expect(fsm.getSnapshot()).toBe(fsm.getSnapshot());
  });

  it('getSnapshot returns new ref after transition', () => {
    const { fsm } = createFSM();
    const snap1 = fsm.getSnapshot();
    fsm.transition('setup');
    const snap2 = fsm.getSnapshot();
    expect(snap1).not.toBe(snap2);
    expect(snap2.state).toBe('setup');
  });
});
