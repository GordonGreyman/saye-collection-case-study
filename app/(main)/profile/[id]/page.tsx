import { notFound } from 'next/navigation'
import { SayeShell } from '@/features/handoff/shell'
import { getArchiveItems, getProfile } from '@/features/archive/queries'
import { createClient } from '@/lib/supabase/server'
import { getHandoffNavState } from '@/features/handoff/server'
import { getSuggestedProfiles } from '@/features/profiles/queries'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  if (id === 'demo') {
    const [userResult, navState] = await Promise.all([
      supabase.auth.getUser(),
      getHandoffNavState(),
    ])

    return (
      <SayeShell
        current="profile"
        navState={navState}
        screenProps={{
          profile: null,
          archiveItems: [],
          isOwner: false,
          viewerIsAuthenticated: Boolean(userResult.data.user),
          suggestedProfiles: [],
        }}
      />
    )
  }

  const [profile, archiveItems, userResult, navState] = await Promise.all([
    getProfile(id),
    getArchiveItems(id),
    supabase.auth.getUser(),
    getHandoffNavState(),
  ])

  if (!profile) {
    notFound()
  }

  const isOwner = userResult.data.user?.id === profile.id
  const viewerIsAuthenticated = Boolean(userResult.data.user)
  const suggestedProfiles = await getSuggestedProfiles(profile.id, profile.interests ?? [])

  return (
    <SayeShell
      current="profile"
      navState={navState}
      screenProps={{
        profile,
        archiveItems,
        isOwner,
        viewerIsAuthenticated,
        suggestedProfiles,
      }}
    />
  )
}
