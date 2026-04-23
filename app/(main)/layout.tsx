import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-bg">
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 bg-bg/80 backdrop-blur-sm z-50">
        <Link
          href="/discover"
          className="text-xl font-heading font-bold text-text-primary tracking-widest hover:text-accent transition-colors"
        >
          SAYE
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/discover"
            className="text-text-muted hover:text-text-primary text-sm transition-colors"
          >
            Discover
          </Link>
          {user && (
            <Link
              href={`/profile/${user.id}`}
              className="text-text-muted hover:text-text-primary text-sm transition-colors"
            >
              Profile
            </Link>
          )}
        </div>
      </nav>
      <main className="px-6 py-8">{children}</main>
    </div>
  )
}
