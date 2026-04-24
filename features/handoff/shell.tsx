'use client'

import { useCallback } from 'react'
import type { ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { pathForScreen } from '@/features/handoff/navigation'
import type { NavigateFn, SayeScreen } from '@/features/handoff/navigation'
import { SayeNav2 } from '@/features/handoff/ui'

const NAV_ITEMS: Array<{ id: SayeScreen; label: string }> = [
  { id: 'landing', label: 'Home' },
  { id: 'discover', label: 'Discover' },
  { id: 'archive', label: 'Archive' },
  { id: 'build-profile', label: 'Profile' },
  { id: 'profile', label: 'User' },
  { id: 'auth', label: 'Auth' },
]

export function SayeShell({
  current,
  children,
}: {
  current: SayeScreen
  children: (navigate: NavigateFn) => ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const navigate = useCallback<NavigateFn>(
    (screen) => {
      router.push(pathForScreen(screen))
      window.scrollTo({ top: 0 })
    },
    [router],
  )

  return (
    <div>
      <SayeNav2 current={current} navigate={navigate} />

      <div key={pathname} className="screen">
        {children(navigate)}
      </div>

      <div className="demo-nav">
        {NAV_ITEMS.map(({ id, label }) => (
          <button key={id} className={current === id ? 'active' : ''} onClick={() => navigate(id)}>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
