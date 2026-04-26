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
  banner_color: string | null
  banner_image_url: string | null
  banner_position_x: number | null
  banner_position_y: number | null
  created_at: string
}

export type ArchiveItemType = 'image' | 'text' | 'link'

export type ArchiveCanvasBlockType = 'text' | 'image' | 'link'

export type ArchiveCanvasBlock = {
  id: string
  type: ArchiveCanvasBlockType
  content: string
}

export type ArchiveItem = {
  id: string
  profile_id: string
  type: ArchiveItemType
  content: string
  created_at: string
}

export type ArchiveEntryInput = {
  canvas?: ArchiveCanvasBlock[]
  thumbnail?: string
  thumbnailPosition?: { x: number; y: number }
}
