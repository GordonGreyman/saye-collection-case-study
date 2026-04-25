export default function ArchiveLoading() {
  return (
    <div style={{ minHeight: '100vh', background: '#080808', padding: '88px 48px 80px' }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{
          width: 80, height: 10, background: '#141414', borderRadius: 2,
          marginBottom: 14, animation: 'shimmer 1.4s ease-in-out infinite',
        }} />
        <div style={{
          width: 340, height: 52, background: '#141414', borderRadius: 2,
          animation: 'shimmer 1.4s ease-in-out infinite', animationDelay: '0.1s',
        }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              background: '#141414', borderRadius: 4, height: 200,
              animation: 'shimmer 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.08}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
