'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArchiveItem } from '@/features/archive/ArchiveItem'
import { domainFromUrl } from '@/features/archive/entry'
import type { ArchiveItem as ArchiveItemType } from '@/lib/types'
import type { Profile } from '@/lib/types'

interface ProfileContentProps {
  profile: Profile
  archiveItems: ArchiveItemType[]
  isOwner: boolean
}

const tabs = ['WORK', 'ABOUT', 'CONNECTIONS'] as const
type Tab = typeof tabs[number]

export function ProfileContent({ profile, archiveItems, isOwner }: ProfileContentProps) {
  const [active, setActive] = useState<Tab>('WORK')

  return (
    <>
      {/* Tab bar */}
      <div style={{
        display: 'flex', alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '0 48px',
      }}>
        {tabs.map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            style={{
              padding: '16px 24px', background: 'none', border: 'none',
              borderBottom: `2px solid ${active === tab ? '#9b7ff8' : 'transparent'}`,
              marginBottom: -1, fontFamily: 'var(--font-mono)', fontSize: 9,
              letterSpacing: '0.1em', color: active === tab ? '#9b7ff8' : '#9a9a9a',
              cursor: 'pointer', transition: 'all 0.18s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '40px 48px 80px' }}>
        {active === 'WORK' && (
          <>
            {isOwner && (
              <div style={{ marginBottom: 24 }}>
                <Link
                  href="/build-profile"
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em',
                    padding: '7px 16px', background: 'transparent',
                    border: '1px solid rgba(155,127,248,0.25)', borderRadius: 2,
                    color: '#9b7ff8', textDecoration: 'none',
                  }}
                >
                  + ADD TO ARCHIVE
                </Link>
              </div>
            )}
            {archiveItems.length === 0 && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#9a9a9a', letterSpacing: '0.1em' }}>
                NO WORKS YET
              </p>
            )}
            <div style={{ columns: '280px', columnGap: 16 }}>
              {archiveItems.map(item => (
                <div key={item.id} style={{ breakInside: 'avoid', marginBottom: 16 }}>
                  <ArchiveItem item={item} isOwner={isOwner} />
                </div>
              ))}
            </div>
          </>
        )}

        {active === 'ABOUT' && (
          <div style={{ maxWidth: 600 }}>
            {profile.bio && (
              <>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', color: '#9b7ff8', marginBottom: 16 }}>
                  BIO
                </div>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 15, color: '#777', lineHeight: 1.75, margin: '0 0 32px' }}>
                  {profile.bio}
                </p>
              </>
            )}

            {profile.website_url && (
              <>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', color: '#9b7ff8', marginBottom: 12 }}>
                  WEBSITE
                </div>
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-block', fontFamily: 'var(--font-heading)', fontSize: 15, color: '#9b7ff8', textDecoration: 'none', marginBottom: 32 }}
                >
                  {domainFromUrl(profile.website_url)}
                </a>
              </>
            )}

            {profile.interests && profile.interests.length > 0 && (
              <>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', color: '#9b7ff8', marginBottom: 12 }}>
                  INTERESTS
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {profile.interests.map(t => (
                    <span
                      key={t}
                      style={{
                        fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
                        padding: '6px 14px', borderRadius: 100,
                        border: '1px solid rgba(255,255,255,0.14)',
                        color: '#9a9a9a',
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {active === 'CONNECTIONS' && (
          <div style={{ textAlign: 'center', paddingTop: 48 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#9a9a9a', letterSpacing: '0.1em' }}>
              CONNECTIONS COMING SOON
            </p>
            <Link
              href="/discover"
              style={{
                display: 'inline-block', marginTop: 20,
                fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em',
                color: '#9b7ff8', textDecoration: 'none',
              }}
            >
              DISCOVER PROFILES →
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
