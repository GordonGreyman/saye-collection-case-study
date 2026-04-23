import { createClient } from '@/lib/supabase/server'
import { sanitizeNextPath } from '@/lib/auth/next-path'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const nextPath = sanitizeNextPath(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL(nextPath, origin))
}
