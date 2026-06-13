'use client';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

function getFriendlyMessage(error: Error): string {
  const msg = error.message ?? '';
  if (/fetch failed|network|ECONNREFUSED|ENOTFOUND/i.test(msg)) {
    return "We couldn't reach our servers. Check your connection and try again.";
  }
  if (/timeout/i.test(msg)) {
    return 'The request took too long. Please try again.';
  }
  return 'An unexpected error occurred. Please try again.';
}

export default function GlobalError({ error, reset }: ErrorProps) {
  const isDev = process.env.NODE_ENV !== 'production';
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: '1rem',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <span style={{ fontSize: '3rem' }}>⚠️</span>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Something went wrong</h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem', maxWidth: 500 }}>
        {getFriendlyMessage(error)}
      </p>
      {isDev && error.message && (
        <code style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', opacity: 0.6 }}>
          {error.message}
        </code>
      )}
      <button className="btn btn--outline" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
