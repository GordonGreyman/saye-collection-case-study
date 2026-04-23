'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/Badge'
import type { DiscoverProfile } from '@/features/discover/queries'

interface ProfileCardProps {
  profile: DiscoverProfile
  index: number
}

export function ProfileCard({ profile, index }: ProfileCardProps) {
  const initials = profile.display_name?.charAt(0).toUpperCase() || '?'
  const delay = Math.min(index * 0.05, 0.3)

  return (
    <Link href={`/profile/${profile.id}`}>
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut', delay }}
        whileHover={{ scale: 1.02 }}
        className="bg-surface border border-white/10 rounded-xl p-4 relative hover:shadow-[0_0_24px_rgba(157,0,255,0.2)] transition-shadow"
      >
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-full bg-accent/20 text-accent font-heading font-bold flex items-center justify-center">
            {initials}
          </div>
          <Badge variant="role">{profile.role}</Badge>
        </div>

        <h3 className="text-2xl font-heading text-text-primary mt-3">{profile.display_name}</h3>
        {profile.discipline && <p className="text-text-muted text-sm mt-1">{profile.discipline}</p>}

        {profile.geography && (
          <span className="inline-flex mt-3 text-xs text-text-muted border border-white/10 rounded-full px-2 py-1">
            {profile.geography}
          </span>
        )}
      </motion.article>
    </Link>
  )
}
