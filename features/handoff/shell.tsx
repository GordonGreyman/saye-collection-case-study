'use client'

import { useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { pathForScreen } from '@/features/handoff/navigation'
import type { NavigateFn, SayeScreen } from '@/features/handoff/navigation'
import { SayeNav2 } from '@/features/handoff/ui'
import {
  ArchiveScreen,
  AuthScreen,
  BuildProfileScreen,
  DiscoverScreen,
  LandingScreen,
  ProfileScreen,
} from '@/features/handoff/screens'
import { createClient } from '@/lib/supabase/client'
import type { HandoffNavState } from '@/features/handoff/server'

export function SayeShell({
  current,
  navState = { isAuthenticated: false, profileId: null },
  screenProps = {},
}: {
  current: SayeScreen
  navState?: HandoffNavState
  screenProps?: Record<string, unknown>
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

  const navigatePath = useCallback(
    (path: string) => {
      router.push(path)
      window.scrollTo({ top: 0 })
    },
    [router],
  )

  const signOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/discover')
    router.refresh()
  }, [router])

  return (
    <div>
      <SayeNav2
        current={current}
        navigate={navigate}
        navState={navState}
        navigatePath={navigatePath}
        onSignOut={signOut}
      />

      <div key={pathname} className="screen">
        {current === 'landing' && <LandingScreen navigate={navigate} {...screenProps} />}
        {current === 'discover' && <DiscoverScreen navigate={navigate} {...screenProps} />}
        {current === 'archive' && <ArchiveScreen navigate={navigate} {...screenProps} />}
        {current === 'build-profile' && <BuildProfileScreen navigate={navigate} {...screenProps} />}
        {current === 'profile' && <ProfileScreen navigate={navigate} {...screenProps} />}
        {current === 'auth' && <AuthScreen navigate={navigate} {...screenProps} />}
      </div>
    </div>
  )
}
