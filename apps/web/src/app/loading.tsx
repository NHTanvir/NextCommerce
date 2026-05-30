export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
    }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: '4px solid var(--color-border)',
        borderTopColor: 'var(--color-accent)',
        animation: 'spin 0.75s linear infinite',
      }} />
    </div>
  );
}
