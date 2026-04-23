import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AccountMenu } from '@/features/auth/AccountMenu'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const hasUser = Boolean(user)

  let hasProfile = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    hasProfile = Boolean(profile)
  }

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
          {!hasUser && (
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg border border-accent text-accent hover:bg-accent hover:text-white text-sm transition-colors"
            >
              Join Saye
            </Link>
          )}
          {hasUser && !hasProfile && (
            <>
              <Link
                href="/build-profile"
                className="px-4 py-2 rounded-lg bg-accent text-white hover:bg-purple-700 text-sm transition-colors"
              >
                Complete Profile
              </Link>
              <AccountMenu />
            </>
          )}
          {hasUser && hasProfile && (
            <>
              <Link
                href={`/profile/${user!.id}`}
                className="text-text-muted hover:text-text-primary text-sm transition-colors"
              >
                Profile
              </Link>
              <AccountMenu />
            </>
          )}
        </div>
      </nav>
      <main className="px-6 py-8">{children}</main>
      <footer className="border-t border-white/5 px-6 py-6 mt-10">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-text-muted">
          <Link href="/privacy" className="hover:text-text-primary transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-text-primary transition-colors">
            Terms
          </Link>
          <Link href="/community-guidelines" className="hover:text-text-primary transition-colors">
            Guidelines
          </Link>
          <Link href="/report-abuse" className="hover:text-text-primary transition-colors">
            Report Abuse
          </Link>
        </div>
      </footer>
    </div>
  )
}
