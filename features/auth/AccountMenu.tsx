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

  const linkStyle: React.CSSProperties = {
    fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 400,
    color: '#555', textDecoration: 'none', transition: 'color 0.18s',
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <Link href="/settings/account" style={linkStyle} className="hover:!text-[#f0f0f0]">
        Settings
      </Link>
      <button
        type="button"
        onClick={signOut}
        style={{ ...linkStyle, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        className="hover:!text-[#f0f0f0]"
      >
        Log out
      </button>
    </div>
  )
}
