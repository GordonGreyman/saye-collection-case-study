import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BuildProfileWizard } from '@/features/profiles/BuildProfileWizard'
import { getProfileById } from '@/features/profiles/queries'

export default async function BuildProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/build-profile')
  }

  const profile = await getProfileById(user.id)

  return (
    <div className="min-h-screen bg-bg px-4 py-10">
      <BuildProfileWizard defaultValues={profile} />
    </div>
  )
}
