'use client';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      gap: '1rem',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <span style={{ fontSize: '3rem' }}>⚠️</span>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Something went wrong</h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
        {error.message ?? 'An unexpected error occurred.'}
      </p>
      <button className="btn btn--outline" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
