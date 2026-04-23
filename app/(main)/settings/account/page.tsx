import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DeleteAccountForm } from '@/features/auth/DeleteAccountForm'

export default async function AccountSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/settings/account')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <header>
        <h1 className="text-4xl font-heading text-text-primary">Account Settings</h1>
        <p className="text-text-muted mt-2">Manage your session and account lifecycle controls.</p>
      </header>

      <DeleteAccountForm />
    </div>
  )
}
