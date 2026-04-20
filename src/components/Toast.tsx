import { useState, useEffect, useCallback } from 'react';

let showToastFn: ((msg: string) => void) | null = null;

export function toast(msg: string): void {
  showToastFn?.(msg);
}

export function Toast() {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  const show = useCallback((msg: string) => {
    setMessage(msg);
    setVisible(true);
    setTimeout(() => setVisible(false), 2600);
  }, []);

  useEffect(() => {
    showToastFn = show;
    return () => { showToastFn = null; };
  }, [show]);

  return (
    <div className={`toast${visible ? ' show' : ''}`} role="status" aria-live="polite" aria-atomic="true">
      {message}
    </div>
  );
}
