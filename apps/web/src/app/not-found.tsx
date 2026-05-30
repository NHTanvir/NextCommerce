import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '1.25rem',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <span style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--color-accent)', letterSpacing: '-0.04em' }}>
        404
      </span>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Page Not Found</h1>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: 400 }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="btn btn--primary">
        Back to Home
      </Link>
    </div>
  );
}
