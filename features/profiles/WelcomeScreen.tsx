interface WelcomeScreenProps {
  onStart: () => void
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div style={{
      minHeight: '100vh', background: '#080808',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '80px 48px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(91,63,212,0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, letterSpacing: '0.16em', color: '#f0f0f0' }}>
        SAYE
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', color: '#9b7ff8', marginTop: 4 }}>
        COLLECTIVE
      </div>
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: 15, color: '#9a9a9a', lineHeight: 1.7, maxWidth: 380, marginTop: 32 }}>
        A discovery engine for artists, curators, and institutions.
        Build your identity and join the collective.
      </p>
      <button
        type="button"
        onClick={onStart}
        style={{
          marginTop: 40, background: '#9b7ff8', border: 'none', borderRadius: 3,
          padding: '13px 32px', fontFamily: 'var(--font-heading)', fontWeight: 600,
          fontSize: 13, letterSpacing: '0.07em', color: '#080808', cursor: 'pointer',
        }}
      >
        BUILD YOUR IDENTITY →
      </button>
    </div>
  )
}
