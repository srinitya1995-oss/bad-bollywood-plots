import { useEffect } from 'react';
import { getGameInstance } from './gameInstance';

const ABANDON_TIMEOUT = 30_000;

export function useAbandonDetection(): void {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const instance = getGameInstance();

    const fireAbandon = () => {
      const state = instance.fsm.getState();
      if (state === 'playing' || state === 'flipped' || state === 'scoring' || state === 'turnChange') {
        instance.endGame('abandon');
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        timer = setTimeout(fireAbandon, ABANDON_TIMEOUT);
      } else if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const handleBeforeUnload = () => fireAbandon();

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (timer) clearTimeout(timer);
    };
  }, []);
}
