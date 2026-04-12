import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="screen active" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '32px', color: 'var(--cream)', marginBottom: '1rem' }}>Oops!</h1>
          <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--cream)', opacity: 0.8, marginBottom: '2rem' }}>Something went wrong. Tap below to restart.</p>
          <button className="btn-primary" onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}>Restart</button>
        </main>
      );
    }
    return this.props.children;
  }
}
