import type { TypedEventBus } from '../core/eventBus';

declare global {
  interface Window {
    posthog?: {
      init(token: string, config: Record<string, unknown>): void;
      capture(event: string, props?: Record<string, unknown>): void;
    };
  }
}

const POSTHOG_TOKEN = import.meta.env.VITE_POSTHOG_TOKEN ?? 'phc_im021jzJ6Lx5QSvJdSSeVb23IROC0Kpbrs75X2NOzTd';
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST ?? 'https://us.i.posthog.com';

export function initPostHog(): void {
  try {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = `${POSTHOG_HOST}/static/array.js`;
    document.head.appendChild(script);

    script.onload = () => {
      window.posthog?.init(POSTHOG_TOKEN, {
        api_host: POSTHOG_HOST,
        autocapture: false,
      });
    };
  } catch { /* analytics non-critical */ }
}

export function initAnalyticsSubscriber(bus: TypedEventBus, sessionId: string): void {
  const capture = (event: string, props: Record<string, unknown> = {}) => {
    try {
      window.posthog?.capture(event, { ...props, session: sessionId, ts: Date.now() });
    } catch { /* non-critical */ }
  };

  bus.on('game:started', (data) => capture('game_start', data));
  bus.on('card:loaded', (data) => capture('card_view', data));
  bus.on('card:flipped', (data) => capture('card_flip', data));
  bus.on('score:updated', (data) => capture('card_result', data));
  bus.on('game:ended', (data) => capture('game_end', data));
  bus.on('fsm:transition', (data) => capture('state_transition', data));
  bus.on('player:turn-changed', (data) => capture('turn_change', data));
}
