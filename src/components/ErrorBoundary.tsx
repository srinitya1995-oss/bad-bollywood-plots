import { Component, type ReactNode } from 'react';

declare global {
  interface Window { posthog?: { capture: (e: string, p?: Record<string, unknown>) => void } }
}

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error('[ErrorBoundary]', error);
    try {
      window.posthog?.capture('app_error', {
        message: error.message,
        stack: error.stack?.slice(0, 2000),
        componentStack: info.componentStack?.slice(0, 2000),
      });
    } catch { /* non-critical */ }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="screen active" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', background: 'var(--stage)' }}>
          <h1 style={{ fontFamily: 'Anton, sans-serif', fontSize: 36, color: 'var(--paper)', letterSpacing: '0.02em', textShadow: '3px 3px 0 var(--tomato)', marginBottom: 12 }}>SOMETHING BROKE</h1>
          <p style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', color: 'var(--paper)', opacity: 0.8, marginBottom: '1.5rem', maxWidth: 320 }}>A tiny backstage mishap. Refresh to restart the show.</p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 14, letterSpacing: '0.2em', background: 'var(--gold-bright)', color: 'var(--v8-ink)', border: '2px solid var(--v8-ink)', borderRadius: 999, padding: '10px 22px', cursor: 'pointer' }}
          >RELOAD</button>
        </main>
      );
    }
    return this.props.children;
  }
}
