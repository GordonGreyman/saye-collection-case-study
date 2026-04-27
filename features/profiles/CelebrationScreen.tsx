'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface CelebrationScreenProps {
  name: string
  userId?: string
}

export function CelebrationScreen({ name, userId }: CelebrationScreenProps) {
  const router = useRouter()

  useEffect(() => {
    const dest = userId ? `/profile/${userId}` : '/discover'
    const timeout = setTimeout(() => { router.push(dest) }, 2500)
    return () => clearTimeout(timeout)
  }, [router, userId])

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
        background: 'radial-gradient(circle, rgba(155,127,248,0.1) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', color: '#9b7ff8', marginBottom: 32 }}>
        PROFILE LIVE
      </div>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(40px,6vw,72px)', color: '#f0f0f0', margin: 0, letterSpacing: '-0.02em', lineHeight: 1 }}>
        Welcome to Saye,
      </h2>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(40px,6vw,72px)', color: '#9b7ff8', letterSpacing: '-0.02em', lineHeight: 1, marginTop: 8 }}>
        {name}.
      </div>
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: 14, color: '#9a9a9a', marginTop: 24 }}>
        {userId ? 'Taking you to your profile…' : 'Your identity is live. Taking you to Discover…'}
      </p>
    </div>
  )
}
