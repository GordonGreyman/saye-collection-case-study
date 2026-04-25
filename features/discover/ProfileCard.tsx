'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { DiscoverProfile } from '@/features/discover/queries'

interface ProfileCardProps {
  profile: DiscoverProfile
  index: number
}

const AVATAR_BKGS = ['#1a0a2e', '#0a1a0a', '#1a0a0a', '#0a0a1e', '#1a1200']

const roleStyle: Record<string, { bg: string; text: string; border: string }> = {
  Artist: { bg: 'rgba(155,127,248,0.1)', text: '#9b7ff8', border: 'rgba(155,127,248,0.2)' },
  Curator: { bg: 'rgba(200,200,200,0.07)', text: '#c8c8c8', border: 'rgba(200,200,200,0.14)' },
  Institution: { bg: 'rgba(91,63,212,0.14)', text: '#a78bfa', border: 'rgba(91,63,212,0.28)' },
}

export function ProfileCard({ profile, index }: ProfileCardProps) {
  const initial = profile.display_name?.charAt(0).toUpperCase() || '?'
  const bkg = AVATAR_BKGS[(profile.display_name?.charCodeAt(0) ?? 0) % AVATAR_BKGS.length]
  const rs = roleStyle[profile.role] ?? roleStyle.Artist
  const delay = Math.min(index * 0.05, 0.3)

  return (
    <Link href={`/profile/${profile.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut', delay }}
        whileHover={{ y: -3 }}
        style={{
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        className="hover:!border-[rgba(255,255,255,0.1)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
      >
        {/* Header bar */}
        <div style={{
          height: 72,
          background: `linear-gradient(135deg, ${bkg} 0%, #080808 100%)`,
          position: 'relative', display: 'flex', alignItems: 'center',
          padding: '0 20px', gap: 14,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: '#f0f0f0',
          }}>
            {initial}
          </div>
          <div style={{
            position: 'absolute', top: 10, right: 12,
            padding: '3px 9px', borderRadius: 100,
            background: rs.bg, border: `1px solid ${rs.border}`,
            fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.12em', color: rs.text,
          }}>
            {profile.role.toUpperCase()}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '18px 20px' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15, color: '#f0f0f0', marginBottom: 4 }}>
            {profile.display_name}
          </div>
          {(profile.discipline || profile.geography) && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9a9a9a', marginBottom: 14, letterSpacing: '0.04em' }}>
              {[profile.discipline, profile.geography].filter(Boolean).join(' · ')}
            </div>
          )}
          {profile.interests && profile.interests.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {profile.interests.slice(0, 4).map(t => (
                <span key={t} style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9, color: '#9a9a9a',
                  padding: '3px 7px', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 2,
                }}>
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.article>
    </Link>
  )
}
