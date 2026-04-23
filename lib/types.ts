export type ProfileRole = 'Artist' | 'Curator' | 'Institution'

export type Profile = {
  id: string
  role: ProfileRole
  display_name: string
  bio: string | null
  geography: string | null
  discipline: string | null
  interests: string[]
  avatar_url: string | null
  created_at: string
}

export type ArchiveItemType = 'image' | 'text' | 'link'

export type ArchiveItem = {
  id: string
  profile_id: string
  type: ArchiveItemType
  content: string
  created_at: string
}
