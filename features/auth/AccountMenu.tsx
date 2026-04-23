'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AccountMenu() {
  const router = useRouter()
  const supabase = createClient()

  const signOut = async () => {
    await supabase.auth.signOut()
    router.replace('/discover')
    router.refresh()
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/settings/account"
        className="text-text-muted hover:text-text-primary text-sm transition-colors"
      >
        Settings
      </Link>
      <button
        type="button"
        onClick={signOut}
        className="text-text-muted hover:text-text-primary text-sm transition-colors"
      >
        Log out
      </button>
    </div>
  )
}
