import { SayeShell } from '@/features/handoff/shell'
import { getArchiveItems } from '@/features/archive/queries'
import { getHandoffNavState } from '@/features/handoff/server'
import { createClient } from '@/lib/supabase/server'
import { getProfileById } from '@/features/profiles/queries'

export default async function ArchivePage() {
  const supabase = await createClient()
  const [{ data: { user } }, navState] = await Promise.all([
    supabase.auth.getUser(),
    getHandoffNavState(),
  ])

  if (!user) {
    return (
      <SayeShell
        current="archive"
        navState={navState}
        screenProps={{ items: [], profile: null, state: 'signedOut' }}
      />
    )
  }

  const profile = await getProfileById(user.id)
  if (!profile) {
    return (
      <SayeShell
        current="archive"
        navState={navState}
        screenProps={{ items: [], profile: null, state: 'missingProfile' }}
      />
    )
  }

  const items = await getArchiveItems(profile.id)

  return (
    <SayeShell
      current="archive"
      navState={navState}
      screenProps={{
        items,
        profile,
        state: 'ready',
        userProfileId: navState.profileId,
      }}
    />
  )
}
