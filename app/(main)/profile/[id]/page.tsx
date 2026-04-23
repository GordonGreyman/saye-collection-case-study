import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/server'
import { getArchiveItems, getProfile } from '@/features/archive/queries'
import { ArchiveGrid } from '@/features/archive/ArchiveGrid'
import { ShareProfileButton } from '@/features/profiles/ShareProfileButton'

interface ProfilePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { id } = await params
  const profile = await getProfile(id)

  if (!profile) {
    return {
      title: 'Profile not found | Saye',
    }
  }

  return {
    title: `${profile.display_name} | Saye`,
    description: profile.bio ?? `${profile.display_name} on Saye Collective.`,
    openGraph: {
      title: `${profile.display_name} | Saye`,
      description: profile.bio ?? `${profile.display_name} on Saye Collective.`,
      type: 'profile',
    },
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const [profile, archiveItems, authResult] = await Promise.all([
    getProfile(id),
    getArchiveItems(id),
    supabase.auth.getUser(),
  ])

  if (!profile) {
    notFound()
  }

  const user = authResult.data.user
  const isOwner = user?.id === id

  return (
    <div className="max-w-6xl mx-auto">
      <header className="relative">
        <div className="absolute right-0 top-0 flex items-center gap-2">
          <ShareProfileButton profileId={profile.id} />
          {isOwner && (
            <Link
              href="/build-profile"
              className="px-4 py-2 rounded-lg border border-accent text-accent hover:bg-accent hover:text-white text-sm transition-colors"
            >
              Edit Profile
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <h1 className="text-5xl font-heading font-bold text-text-primary">{profile.display_name}</h1>
          <Badge variant="role">{profile.role}</Badge>
        </div>

        {profile.bio && <p className="text-text-muted mt-4 max-w-2xl">{profile.bio}</p>}

        <div className="flex flex-wrap gap-2 mt-4">
          {profile.geography && (
            <span className="inline-flex px-3 py-1 rounded-full border border-white/10 text-xs text-text-muted">
              {profile.geography}
            </span>
          )}
          {profile.discipline && (
            <span className="inline-flex px-3 py-1 rounded-full border border-white/10 text-xs text-text-muted">
              {profile.discipline}
            </span>
          )}
          {profile.interests.map(interest => (
            <Badge key={interest}>{interest}</Badge>
          ))}
        </div>
      </header>

      <ArchiveGrid items={archiveItems} isOwner={isOwner} profileId={profile.id} />
    </div>
  )
}
