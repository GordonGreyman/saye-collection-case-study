import { redirect } from 'next/navigation'
import { SayeShell } from '@/features/handoff/shell'
import { createClient } from '@/lib/supabase/server'
import { getProfileById } from '@/features/profiles/queries'
import { getHandoffNavState } from '@/features/handoff/server'

export default async function BuildProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/build-profile')
  }

  const [profile, navState] = await Promise.all([
    getProfileById(user.id),
    getHandoffNavState(),
  ])

  return (
    <SayeShell
      current="build-profile"
      navState={navState}
      screenProps={{ defaultValues: profile }}
    />
  )
}
