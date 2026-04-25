import { notFound } from 'next/navigation'
import { SayeShell } from '@/features/handoff/shell'
import { getArchiveItems, getProfile } from '@/features/archive/queries'
import { createClient } from '@/lib/supabase/server'
import { getHandoffNavState } from '@/features/handoff/server'
import { getSuggestedProfiles } from '@/features/profiles/queries'
import { getMockPersonaById, getSuggestedMockPersonas } from '@/features/discover/mockPersonas'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const mockPersona = getMockPersonaById(id)

  if (id === 'demo' || mockPersona) {
    const [userResult, navState] = await Promise.all([
      supabase.auth.getUser(),
      getHandoffNavState(),
    ])

    const suggestedProfiles = mockPersona
      ? getSuggestedMockPersonas(mockPersona.id, mockPersona.interests ?? [])
      : []

    const profile = mockPersona
      ? {
          id: mockPersona.id,
          role: mockPersona.role,
          display_name: mockPersona.display_name,
          bio: mockPersona.bio ?? null,
          geography: mockPersona.geography ?? null,
          discipline: mockPersona.discipline ?? null,
          interests: mockPersona.interests ?? [],
          avatar_url: null,
          created_at: mockPersona.created_at,
        }
      : null

    return (
      <SayeShell
        current="profile"
        navState={navState}
        screenProps={{
          profile,
          archiveItems: [],
          isOwner: false,
          viewerIsAuthenticated: Boolean(userResult.data.user),
          suggestedProfiles,
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
