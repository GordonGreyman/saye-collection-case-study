'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface EmptyStateProps {
  variant: 'no-profiles' | 'no-results'
}

export function EmptyState({ variant }: EmptyStateProps) {
  const router = useRouter()

  if (variant === 'no-profiles') {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 40, color: 'rgba(255,255,255,0.1)', letterSpacing: '-0.02em' }}>
          Be the first to join Saye.
        </h2>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 14, color: '#555', marginTop: 12 }}>
          Build your profile and get discovered.
        </p>
        <Link href="/build-profile" style={{
          display: 'inline-flex', marginTop: 24,
          background: '#9b7ff8', border: 'none', borderRadius: 3,
          padding: '13px 32px', fontFamily: 'var(--font-heading)', fontWeight: 600,
          fontSize: 13, letterSpacing: '0.07em', color: '#080808', textDecoration: 'none',
        }}>
          JOIN THE COLLECTIVE →
        </Link>
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 56, color: 'rgba(255,255,255,0.06)', letterSpacing: '-0.03em' }}>
        Nothing found.
      </h2>
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: 14, color: '#555', marginTop: 12 }}>
        Try removing a filter.
      </p>
      <button
        type="button"
        onClick={() => router.replace('/discover')}
        style={{
          marginTop: 24, background: 'transparent',
          border: '1px solid rgba(155,127,248,0.25)', borderRadius: 3,
          padding: '10px 20px', fontFamily: 'var(--font-heading)', fontWeight: 600,
          fontSize: 13, letterSpacing: '0.07em', color: '#9b7ff8', cursor: 'pointer',
        }}
      >
        CLEAR FILTERS
      </button>
    </div>
  )
}
