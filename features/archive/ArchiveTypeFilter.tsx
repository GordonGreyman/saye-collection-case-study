'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

const types = [
  { id: 'all', label: 'ALL' },
  { id: 'image', label: 'IMAGE' },
  { id: 'text', label: 'TEXT' },
  { id: 'link', label: 'LINK' },
]

export function ArchiveTypeFilter({ current }: { current: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const navigate = (type: string) => {
    startTransition(() => {
      const url = type === 'all' ? '/archive' : `/archive?type=${type}`
      router.replace(url)
    })
  }

  return (
    <div style={{
      display: 'flex', gap: 6, marginBottom: 36, flexWrap: 'wrap',
      opacity: isPending ? 0.6 : 1, transition: 'opacity 0.18s',
    }}>
      {types.map(t => {
        const active = current === t.id
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => navigate(t.id)}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em',
              padding: '7px 16px', borderRadius: 2,
              background: active ? '#9b7ff8' : 'transparent',
              border: `1px solid ${active ? '#9b7ff8' : 'rgba(255,255,255,0.08)'}`,
              color: active ? '#080808' : '#9a9a9a',
              cursor: 'pointer', transition: 'all 0.15s', fontWeight: active ? 700 : 400,
            }}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
