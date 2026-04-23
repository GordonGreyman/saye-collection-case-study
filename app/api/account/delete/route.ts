import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { deleteAccountWithCleanup, type AdminClient } from '@/features/auth/account-lifecycle'

type DeletePayload = {
  confirmationText?: string
  password?: string
}

export async function POST(request: Request) {
  let body: DeletePayload = {}

  try {
    body = (await request.json()) as DeletePayload
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if ((body.confirmationText ?? '').trim() !== 'DELETE') {
    return NextResponse.json({ error: 'Type DELETE to confirm account deletion.' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.email) {
    return NextResponse.json({ error: 'Account email missing.' }, { status: 400 })
  }

  const password = (body.password ?? '').trim()
  if (!password) {
    return NextResponse.json({ error: 'Password is required for account deletion.' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Server is missing Supabase account deletion configuration.' },
      { status: 500 }
    )
  }

  const reauthClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { error: reauthError } = await reauthClient.auth.signInWithPassword({
    email: user.email,
    password,
  })

  if (reauthError) {
    return NextResponse.json({ error: 'Reauthentication failed.' }, { status: 401 })
  }

  const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const result = await deleteAccountWithCleanup(adminClient as unknown as AdminClient, user.id)
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
