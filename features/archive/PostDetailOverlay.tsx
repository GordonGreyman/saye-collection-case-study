'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Maximize2,
  MapPin,
  Minimize2,
  Move,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
import { fetchProfileArchiveItems, fetchRelatedItems } from '@/features/archive/actions'
import {
  getRelatedMockArchiveItems,
  getMockProfileArchiveItems,
  isMockProfileId,
} from '@/features/discover/mockArchiveItems'
import { deleteArchiveItemClient, saveThumbPositionClient } from '@/features/archive/clientActions'
import type { RelatedArchiveItem } from '@/features/archive/actions'
import {
  domainFromUrl,
  isLikelyHttpUrl,
  normalizeHttpUrl,
  resolveArchiveEntry,
} from '@/features/archive/entry'
import { lockBodyScroll } from '@/lib/ui/bodyScrollLock'
import type { ArchiveItem, Profile } from '@/lib/types'

interface PostDetailOverlayProps {
  item: ArchiveItem
  items: ArchiveItem[]
  onClose: () => void
  isOwner?: boolean
  onEditInComposer?: (item: ArchiveItem) => void
  onOpenRelated?: (item: ArchiveItem, options: { fullscreen: boolean }) => void
  onItemUpdate?: (item: ArchiveItem) => void
  initialFullscreen?: boolean
  profile?: Profile | null
}

const C = {
  bg: '#0d0d0d',
  surf: '#141414',
  surfB: '#1a1a1a',
  line: 'rgba(255,255,255,0.07)',
  lineB: 'rgba(255,255,255,0.14)',
  text: '#f2f2f2',
  sub: '#d4d4d4',
  muted: '#9a9a9a',
  faint: '#3a3a3a',
  accent: '#9b7ff8',
  accentDim: 'rgba(155,127,248,0.12)',
}

function hasRelatedProfile(item: ArchiveItem | RelatedArchiveItem): item is RelatedArchiveItem {
  return 'profiles' in item
}

function renderInlineFormattedText(content: string, keyPrefix: string): ReactNode[] {
  const output: ReactNode[] = []
  const pattern = /(\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_|<u>(.*?)<\/u>)/g

  let cursor = 0
  let match: RegExpExecArray | null = pattern.exec(content)
  let index = 0

  while (match) {
    if (match.index > cursor) {
      output.push(content.slice(cursor, match.index))
    }

    const [full, , linkText, linkUrl, boldText, italicA, italicB, underlineText] = match
    const key = `${keyPrefix}-${index}`
    if (linkText && linkUrl) {
      const normalizedUrl = normalizeHttpUrl(linkUrl)
      if (isLikelyHttpUrl(normalizedUrl)) {
        output.push(
          <a
            key={key}
            href={normalizedUrl}
            target="_blank"
            rel="noreferrer"
            style={{ color: C.accent, textDecoration: 'underline' }}
          >
            {linkText}
          </a>,
        )
      } else {
        output.push(full)
      }
    } else if (boldText) {
      output.push(<strong key={key}>{boldText}</strong>)
    } else if (italicA || italicB) {
      output.push(<em key={key}>{italicA || italicB}</em>)
    } else if (underlineText) {
      output.push(<u key={key}>{underlineText}</u>)
    } else {
      output.push(full)
    }

    cursor = match.index + full.length
    index += 1
    match = pattern.exec(content)
  }

  if (cursor < content.length) {
    output.push(content.slice(cursor))
  }

  return output
}

function renderTextBlock(content: string, isTitle: boolean, keyPrefix: string) {
  const lines = content.split('\n')
  const nodes: ReactNode[] = []

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    const trimmed = line.trim()
    const key = `${keyPrefix}-${i}`

    if (!trimmed) {
      nodes.push(<div key={key} style={{ height: isTitle ? 8 : 10 }} />)
      continue
    }

    if (trimmed.startsWith('# ')) {
      nodes.push(
        <h3
          key={key}
          style={{
            fontFamily: "'Space Grotesk',sans-serif",
            fontWeight: 700,
            fontSize: 23,
            color: '#f1f1f1',
            lineHeight: 1.24,
            margin: '0 0 12px',
          }}
        >
          {renderInlineFormattedText(trimmed.slice(2), `${key}-h`)}
        </h3>,
      )
      continue
    }

    if (trimmed.startsWith('> ')) {
      nodes.push(
        <blockquote
          key={key}
          style={{
            margin: '0 0 14px',
            padding: '6px 0 6px 14px',
            borderLeft: `2px solid ${C.accent}66`,
            color: '#cfcfcf',
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: 16,
            lineHeight: 1.72,
          }}
        >
          {renderInlineFormattedText(trimmed.slice(2), `${key}-q`)}
        </blockquote>,
      )
      continue
    }

    if (trimmed.startsWith('- ')) {
      const listItems: string[] = [trimmed.slice(2)]
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith('- ')) {
        i += 1
        listItems.push(lines[i].trim().slice(2))
      }
      nodes.push(
        <ul
          key={key}
          style={{
            margin: '0 0 14px 20px',
            color: '#c0c0c0',
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: 16,
            lineHeight: 1.75,
            padding: 0,
          }}
        >
          {listItems.map((item, idx) => (
            <li key={`${key}-li-${idx}`} style={{ marginBottom: 4 }}>
              {renderInlineFormattedText(item, `${key}-li-${idx}`)}
            </li>
          ))}
        </ul>,
      )
      continue
    }

    nodes.push(
      <p
        key={key}
        style={{
          fontFamily: "'Space Grotesk',sans-serif",
          fontWeight: isTitle ? 700 : 400,
          fontSize: isTitle ? 28 : 16,
          color: isTitle ? '#f1f1f1' : '#c0c0c0',
          lineHeight: isTitle ? 1.22 : 1.78,
          margin: isTitle ? '0 0 20px' : '0 0 14px',
          whiteSpace: 'pre-wrap',
        }}
      >
        {renderInlineFormattedText(line, `${key}-p`)}
      </p>,
    )
  }

  return <div style={{ marginBottom: isTitle ? 8 : 0 }}>{nodes}</div>
}

function RolePill({ role }: { role: string }) {
  const colors: Record<string, string> = {
    Artist: '#9b7ff8',
    Curator: '#5eadc9',
    Institution: '#6abf69',
  }
  const color = colors[role] ?? C.accent
  return (
    <span
      style={{
        fontFamily: "'DM Mono',monospace",
        fontSize: 10,
        letterSpacing: '0.1em',
        color,
        border: `1px solid ${color}44`,
        borderRadius: 3,
        padding: '3px 7px',
        background: `${color}14`,
      }}
    >
      {role.toUpperCase()}
    </span>
  )
}

function BrokenImageNotice({ url }: { url: string }) {
  return (
    <div
      style={{
        padding: '18px 20px',
        border: `1px solid ${C.line}`,
        borderRadius: 8,
        background: '#080808',
        color: C.muted,
        fontFamily: "'Space Grotesk',sans-serif",
        fontSize: 14,
        lineHeight: 1.55,
      }}
    >
      Image could not be loaded.{' '}
      <a href={url} target="_blank" rel="noreferrer" style={{ color: C.accent }}>
        Open source
      </a>
    </div>
  )
}

function MiniCard({
  item,
  authorName,
  onClick,
}: {
  item: ArchiveItem
  authorName?: string
  onClick: () => void
}) {
  const entry = useMemo(() => resolveArchiveEntry(item), [item])
  const [hov, setHov] = useState(false)
  const cover = entry.thumbnailUrl || entry.imageUrl

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? C.surfB : C.surf,
        border: `1px solid ${hov ? C.lineB : C.line}`,
        borderRadius: 6,
        overflow: 'hidden',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s',
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? '0 10px 28px rgba(0,0,0,0.45)' : 'none',
        width: '100%',
      }}
    >
      {cover ? (
        <div style={{ height: 110, overflow: 'hidden', background: '#080808' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt={entry.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.82, transition: 'opacity 0.15s' }}
          />
        </div>
      ) : (
        <div
          style={{
            height: 64,
            background: `linear-gradient(135deg, ${C.accentDim}, transparent)`,
            borderBottom: `1px solid ${C.line}`,
          }}
        />
      )}
      <div style={{ padding: '10px 12px 12px' }}>
        <p
          style={{
            fontFamily: "'Space Grotesk',sans-serif",
            fontWeight: 600,
            fontSize: 13,
            color: '#e0e0e0',
            margin: '0 0 5px',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {entry.title}
        </p>
        {authorName && (
          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: C.muted, margin: 0 }}>
            {authorName}
          </p>
        )}
      </div>
    </button>
  )
}

export function PostDetailOverlay({
  item: initialItem,
  items,
  onClose,
  isOwner = false,
  onEditInComposer,
  onOpenRelated,
  onItemUpdate,
  initialFullscreen = false,
  profile,
}: PostDetailOverlayProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.max(0, items.findIndex(i => i.id === initialItem.id)),
  )
  const [saving, setSaving] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(initialFullscreen)
  const [actionError, setActionError] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [profileHeaderVisible, setProfileHeaderVisible] = useState(true)
  const [relatedItems, setRelatedItems] = useState<RelatedArchiveItem[]>([])
  const [externalSelection, setExternalSelection] = useState<RelatedArchiveItem | null>(null)
  const [creatorItems, setCreatorItems] = useState<RelatedArchiveItem[]>([])
  const [failedImages, setFailedImages] = useState<{ itemId: string; urls: string[] }>({ itemId: '', urls: [] })

  const [isRepositioning, setIsRepositioning] = useState(false)
  const [thumbPos, setThumbPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 })
  const [draftPos, setDraftPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 })
  const [isSavingPos, setIsSavingPos] = useState(false)
  const dragState = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null)
  const coverContainerRef = useRef<HTMLDivElement>(null)

  const profileHeaderRef = useRef<HTMLDivElement>(null)

  const item = externalSelection ?? items[currentIndex] ?? initialItem
  const activeProfile = externalSelection?.profiles
    ? {
        id: externalSelection.profile_id,
        role: externalSelection.profiles.role,
        display_name: externalSelection.profiles.display_name,
        bio: null,
        geography: null,
        discipline: null,
        interests: [],
        avatar_url: null,
        banner_color: null,
        banner_image_url: null,
        banner_position_x: null,
        banner_position_y: null,
        created_at: externalSelection.created_at,
      }
    : profile
  const entry = useMemo(() => resolveArchiveEntry(item), [item])
  const firstTextIndex = entry.blocks.findIndex(b => b.type === 'text')
  const coverImage = entry.thumbnailUrl || entry.imageUrl
  const imageFailed = useCallback((url: string) => failedImages.itemId === item.id && failedImages.urls.includes(url), [failedImages, item.id])
  const markImageFailed = useCallback((url: string) => {
    setFailedImages(prev => {
      if (prev.itemId !== item.id) return { itemId: item.id, urls: [url] }
      return prev.urls.includes(url) ? prev : { itemId: item.id, urls: [...prev.urls, url] }
    })
  }, [item.id])

  useEffect(() => {
    const pos = entry.thumbnailPosition ?? { x: 50, y: 50 }
    setThumbPos(pos)
    setDraftPos(pos)
    setIsRepositioning(false)
  }, [item.id, entry.thumbnailPosition])

  const handleRepoDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: draftPos.x,
      startPosY: draftPos.y,
    }

    const onMove = (ev: MouseEvent) => {
      if (!dragState.current || !coverContainerRef.current) return
      const rect = coverContainerRef.current.getBoundingClientRect()
      const dx = ((ev.clientX - dragState.current.startX) / rect.width) * 100
      const dy = ((ev.clientY - dragState.current.startY) / rect.height) * 100
      setDraftPos({
        x: Math.max(0, Math.min(100, dragState.current.startPosX - dx)),
        y: Math.max(0, Math.min(100, dragState.current.startPosY - dy)),
      })
    }
    const onUp = () => {
      dragState.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [draftPos])

  const handleRepoSave = useCallback(async () => {
    setIsSavingPos(true)
    const result = await saveThumbPositionClient(item.id, item.content, draftPos)
    setIsSavingPos(false)
    if ('error' in result) {
      setActionError(result.error)
      return
    }
    setThumbPos(draftPos)
    setIsRepositioning(false)
    // Update the parent immediately so reopening the overlay shows the new position
    try {
      const patched = JSON.parse(item.content) as Record<string, unknown>
      patched.thumbnailPosition = draftPos
      onItemUpdate?.({ ...item, content: JSON.stringify(patched) })
    } catch {}
  }, [item, draftPos, onItemUpdate])

  const handleRepoCancel = useCallback(() => {
    setDraftPos(thumbPos)
    setIsRepositioning(false)
  }, [thumbPos])

  const createdAt = (() => {
    const date = new Date(item.created_at)
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
  })()
  const canManageCurrentItem = Boolean(isOwner && profile?.id && item.profile_id === profile.id)

  // Track profile header visibility for sticky compact bar
  useEffect(() => {
    const el = profileHeaderRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setProfileHeaderVisible(entry.isIntersecting),
      { threshold: 0.1 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [item.id])

  // Fetch related items from other users
  useEffect(() => {
    if (isMockProfileId(item.profile_id)) {
      setRelatedItems(getRelatedMockArchiveItems(item.profile_id, 6))
      return
    }
    fetchRelatedItems(item.profile_id, 6).then(results => {
      setRelatedItems(results.length ? results : getRelatedMockArchiveItems(item.profile_id, 6))
    }).catch(() => {})
  }, [item.profile_id])

  useEffect(() => {
    if (isMockProfileId(item.profile_id)) {
      setCreatorItems(getMockProfileArchiveItems(item.profile_id, item.id, 6))
      return
    }
    fetchProfileArchiveItems(item.profile_id, item.id, 6).then(setCreatorItems).catch(() => {
      setCreatorItems([])
    })
  }, [item.id, item.profile_id])

  useEffect(() => {
    const releaseScrollLock = lockBodyScroll()
    return releaseScrollLock
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (deleteConfirmOpen) {
          setDeleteConfirmOpen(false)
          return
        }
        onClose()
        return
      }
      if (event.key === 'ArrowLeft') {
        setActionError('')
        setExternalSelection(null)
        setCurrentIndex(i => (i - 1 + items.length) % items.length)
      }
      if (event.key === 'ArrowRight') {
        setActionError('')
        setExternalSelection(null)
        setCurrentIndex(i => (i + 1) % items.length)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [deleteConfirmOpen, items.length, onClose])

  const deleteItem = useCallback(async () => {
    setActionError('')
    setSaving(true)
    const result = await deleteArchiveItemClient(item.id)
    setSaving(false)
    if ('error' in result) {
      setActionError(result.error)
      return
    }
    setDeleteConfirmOpen(false)
    onClose()
    router.refresh()
  }, [item.id, onClose, router])

  const moreItems = creatorItems.length
    ? creatorItems
    : externalSelection
      ? []
      : items.filter(i => i.profile_id === item.profile_id && i.id !== item.id).slice(0, 6)

  const initials = activeProfile?.display_name?.charAt(0)?.toUpperCase() ?? '?'

  const openProfile = useCallback((profileId?: string | null) => {
    if (!profileId) return
    onClose()
    router.push(`/profile/${profileId}`)
  }, [onClose, router])

  const actionBtnStyle: CSSProperties = {
    background: 'rgba(8,8,8,0.74)',
    border: `1px solid ${C.line}`,
    borderRadius: 4,
    minWidth: 32,
    height: 32,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: C.muted,
    cursor: saving ? 'not-allowed' : 'pointer',
    padding: '0 9px',
    transition: 'all 0.15s',
  }

  const overlayTopOffset = 72
  const panelHeight = isFullscreen
    ? `calc(100vh - ${overlayTopOffset + 12}px)`
    : `calc(100vh - ${overlayTopOffset + 24}px)`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(6,6,6,0.92)',
        backdropFilter: 'blur(14px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: `${overlayTopOffset}px 12px 12px`,
      }}
    >
      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={e => e.stopPropagation()}
        style={{
          background: C.bg,
          border: `1px solid ${C.line}`,
          borderRadius: isFullscreen ? 10 : 8,
          width: isFullscreen ? 'calc(100vw - 24px)' : '100%',
          maxWidth: isFullscreen ? 'none' : 900,
          height: panelHeight,
          transition: 'width 150ms ease, max-width 150ms ease, height 150ms ease, border-radius 150ms ease',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Sticky compact header (shows when profile header scrolls away) */}
        <AnimatePresence>
          {!profileHeaderVisible && activeProfile && (
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 16px',
                background: 'rgba(14,14,14,0.96)',
                backdropFilter: 'blur(12px)',
                borderBottom: `1px solid ${C.line}`,
              }}
            >
              <button
                type="button"
                onClick={() => openProfile(item.profile_id)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: C.accentDim,
                  border: `1px solid ${C.accent}44`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Space Grotesk',sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  color: C.accent,
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
                aria-label={`Open ${activeProfile.display_name}'s profile`}
              >
                {initials}
              </button>
              <div>
                <button
                  type="button"
                  onClick={() => openProfile(item.profile_id)}
                  style={{
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontWeight: 600,
                    fontSize: 13,
                    color: C.text,
                    marginRight: 8,
                    background: 'transparent',
                    border: 0,
                    padding: 0,
                    cursor: 'pointer',
                  }}
                  className="profile-link-btn"
                >
                  {activeProfile.display_name}
                </button>
                <span
                  style={{
                    fontFamily: "'DM Mono',monospace",
                    fontSize: 10,
                    color: C.accent,
                    letterSpacing: '0.08em',
                  }}
                >
                  {activeProfile.role.toUpperCase()}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons — top right */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            right: 34,
            zIndex: 30,
            display: 'flex',
            gap: 8,
            padding: 6,
            borderRadius: 8,
            background: 'rgba(8,8,8,0.62)',
            border: `1px solid ${C.line}`,
            backdropFilter: 'blur(9px)',
          }}
        >
          {canManageCurrentItem && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (onEditInComposer) onEditInComposer(item)
                  else setActionError('Edit is available from the composer view.')
                }}
                disabled={saving}
                aria-label="Edit in composer"
                className="overlay-action-btn"
                style={actionBtnStyle}
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={saving}
                aria-label="Delete entry"
                className="overlay-action-btn overlay-action-btn-danger"
                style={{ ...actionBtnStyle, border: '1px solid rgba(248,113,113,0.28)', color: '#f87171' }}
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setIsFullscreen(prev => !prev)}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            className="overlay-action-btn"
            style={actionBtnStyle}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="overlay-action-btn"
            style={actionBtnStyle}
          >
            <X size={14} />
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY: 'auto', flex: 1 }}>

          {/* ── Profile / uploader header ─────────────────────── */}
          <div
            ref={profileHeaderRef}
            style={{
              padding: '36px 36px 28px',
              borderBottom: `1px solid ${C.line}`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 20,
              flexWrap: 'wrap',
            }}
          >
            {/* Avatar */}
            <button
              type="button"
              onClick={() => openProfile(item.profile_id)}
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: C.accentDim,
                border: `2px solid ${C.accent}55`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Space Grotesk',sans-serif",
                fontWeight: 800,
                fontSize: 24,
                color: C.accent,
                flexShrink: 0,
                overflow: 'hidden',
                cursor: 'pointer',
              }}
              aria-label={`Open ${activeProfile?.display_name ?? 'profile'}`}
            >
              {activeProfile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeProfile.avatar_url}
                  alt={activeProfile.display_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                initials
              )}
            </button>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                <button
                  type="button"
                  onClick={() => openProfile(item.profile_id)}
                  style={{
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontWeight: 700,
                    fontSize: 20,
                    color: C.text,
                    margin: 0,
                    background: 'transparent',
                    border: 0,
                    padding: 0,
                    cursor: 'pointer',
                  }}
                  className="profile-link-btn"
                >
                  {activeProfile?.display_name ?? 'Unknown'}
                </button>
                {activeProfile?.role && <RolePill role={activeProfile.role} />}
              </div>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                {activeProfile?.discipline && (
                  <span
                    style={{
                      fontFamily: "'DM Mono',monospace",
                      fontSize: 13,
                      color: C.sub,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {activeProfile.discipline}
                  </span>
                )}
                {activeProfile?.geography && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontFamily: "'DM Mono',monospace",
                      fontSize: 13,
                      color: C.sub,
                    }}
                  >
                    <MapPin size={12} />
                    {activeProfile.geography}
                  </span>
                )}
                {createdAt && (
                  <span
                    style={{
                      fontFamily: "'DM Mono',monospace",
                      fontSize: 12,
                      color: '#b8b8b8',
                    }}
                  >
                    {createdAt}
                  </span>
                )}
              </div>

              {activeProfile?.bio && (
                <p
                  style={{
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontSize: 13,
                    color: C.muted,
                    lineHeight: 1.6,
                    margin: '10px 0 0',
                    maxWidth: 480,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {activeProfile.bio}
                </p>
              )}
            </div>
          </div>

          {/* ── Cover image (thumbnail) ───────────────────────── */}
          {coverImage && !imageFailed(coverImage) && (
            <div
              ref={coverContainerRef}
              style={{
                background: '#060606',
                overflow: 'hidden',
                borderBottom: `1px solid ${C.line}`,
                position: 'relative',
                cursor: isRepositioning ? 'grab' : undefined,
                userSelect: isRepositioning ? 'none' : undefined,
              }}
              onMouseDown={isRepositioning ? handleRepoDragStart : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImage}
                alt="Cover"
                onError={() => markImageFailed(coverImage)}
                draggable={false}
                style={{
                  width: '100%',
                  height: 'clamp(170px, 26vw, 310px)',
                  objectFit: 'cover',
                  objectPosition: `${isRepositioning ? draftPos.x : thumbPos.x}% ${isRepositioning ? draftPos.y : thumbPos.y}%`,
                  display: 'block',
                  pointerEvents: 'none',
                  transition: isRepositioning ? 'none' : 'object-position 0.25s ease',
                }}
              />

              {/* Reposition mode: hint + save/cancel */}
              {isRepositioning && (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <span
                      style={{
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        fontFamily: "'Space Grotesk',sans-serif",
                        fontSize: 13,
                        padding: '6px 14px',
                        borderRadius: 4,
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      Drag image to reposition
                    </span>
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      display: 'flex',
                      gap: 8,
                      zIndex: 10,
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleRepoCancel}
                      style={{
                        background: 'rgba(20,20,20,0.82)',
                        border: `1px solid ${C.lineB}`,
                        borderRadius: 4,
                        color: C.sub,
                        fontFamily: "'Space Grotesk',sans-serif",
                        fontSize: 12,
                        padding: '5px 12px',
                        cursor: 'pointer',
                        backdropFilter: 'blur(6px)',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => { void handleRepoSave() }}
                      disabled={isSavingPos}
                      style={{
                        background: 'rgba(155,127,248,0.18)',
                        border: `1px solid ${C.accent}66`,
                        borderRadius: 4,
                        color: C.accent,
                        fontFamily: "'Space Grotesk',sans-serif",
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '5px 12px',
                        cursor: isSavingPos ? 'not-allowed' : 'pointer',
                        backdropFilter: 'blur(6px)',
                      }}
                    >
                      {isSavingPos ? 'Saving…' : 'Save position'}
                    </button>
                  </div>
                </>
              )}

              {/* Reposition trigger (owner, not in reposition mode) */}
              {!isRepositioning && canManageCurrentItem && (
                <button
                  type="button"
                  onClick={() => {
                    setDraftPos(thumbPos)
                    setIsRepositioning(true)
                  }}
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    right: 10,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(14,14,14,0.72)',
                    border: `1px solid ${C.lineB}`,
                    borderRadius: 4,
                    color: C.sub,
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontSize: 12,
                    padding: '5px 11px',
                    cursor: 'pointer',
                    backdropFilter: 'blur(6px)',
                    opacity: 0,
                    transition: 'opacity 0.15s, transform 0.15s',
                  }}
                  className="cover-reposition-btn"
                  aria-label="Reposition cover image"
                >
                  <Move size={12} />
                  Reposition
                </button>
              )}
            </div>
          )}

          {/* ── Canvas blocks ─────────────────────────────────── */}
          <div style={{ padding: '32px 36px 28px' }}>
            {entry.blocks.map((block, index) => {
              if (block.type === 'image') {
                const imageUrl = normalizeHttpUrl(block.content)
                if (coverImage && imageUrl === coverImage && !imageFailed(coverImage)) {
                  return null
                }
                if (imageFailed(imageUrl)) {
                  return <BrokenImageNotice key={block.id} url={imageUrl} />
                }
                return (
                  <div
                    key={block.id}
                    style={{
                      marginBottom: 24,
                      border: `1px solid ${C.line}`,
                      borderRadius: 8,
                      overflow: 'hidden',
                      background: '#080808',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt="Archive item"
                      onError={() => markImageFailed(imageUrl)}
                      style={{
                        maxWidth: '100%',
                        maxHeight: index === 0 && !coverImage ? '60vh' : '50vh',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </div>
                )
              }

              if (block.type === 'link') {
                const linkDomain = domainFromUrl(block.content)
                return (
                  <a
                    key={block.id}
                    href={block.content}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 18,
                      fontFamily: "'DM Mono',monospace",
                      fontSize: 11,
                      letterSpacing: '0.08em',
                      color: C.accent,
                      textDecoration: 'none',
                      padding: '9px 15px',
                      border: '1px solid rgba(155,127,248,0.28)',
                      borderRadius: 3,
                      background: 'rgba(155,127,248,0.06)',
                      transition: 'all 0.15s',
                    }}
                    className="detail-link-btn"
                  >
                    <ExternalLink size={12} />
                    OPEN {linkDomain || 'LINK'}
                  </a>
                )
              }

              const isTitle = index === firstTextIndex
              return <div key={block.id}>{renderTextBlock(block.content, isTitle, block.id)}</div>
            })}

            {entry.blocks.length === 0 && (
              <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, color: '#ddd', lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: '0 0 24px' }}>
                {item.content}
              </p>
            )}

            {actionError && (
              <div style={{ marginTop: 12, fontFamily: "'DM Mono',monospace", fontSize: 11, color: '#f87171' }}>
                {actionError}
              </div>
            )}
          </div>

          {/* ── More by [name] ────────────────────────────────── */}
          {moreItems.length > 0 && (
            <div style={{ borderTop: `1px solid ${C.line}`, padding: '36px 36px 32px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20 }}>
                <h3
                  style={{
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontWeight: 700,
                    fontSize: 18,
                    color: C.text,
                    margin: 0,
                  }}
                >
                  More by
                </h3>
                <button
                  type="button"
                  onClick={() => openProfile(item.profile_id)}
                  style={{
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontWeight: 700,
                    fontSize: 18,
                    color: C.accent,
                    background: 'transparent',
                    border: 0,
                    padding: 0,
                    cursor: 'pointer',
                  }}
                  className="profile-link-btn"
                >
                  {activeProfile?.display_name ?? 'this artist'}
                </button>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: 12,
                }}
              >
                {moreItems.map(morItem => (
                  <MiniCard
                    key={morItem.id}
                    item={morItem}
                    onClick={() => {
                      if (onOpenRelated) {
                        onOpenRelated(morItem, { fullscreen: isFullscreen })
                        return
                      }
                      const idx = items.findIndex(i => i.id === morItem.id)
                      if (idx >= 0) {
                        setExternalSelection(null)
                        setCurrentIndex(idx)
                      } else if (hasRelatedProfile(morItem)) {
                        setExternalSelection(morItem)
                        setActionError('')
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── You may also like ─────────────────────────────── */}
          {relatedItems.length > 0 && (
            <div
              style={{
                borderTop: `1px solid ${C.line}`,
                background: '#111',
                padding: '36px 36px 40px',
              }}
            >
              <div style={{ marginBottom: 20 }}>
                <h3
                  style={{
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontWeight: 700,
                    fontSize: 18,
                    color: C.text,
                    margin: '0 0 4px',
                  }}
                >
                  You may also like
                </h3>
                <p
                  style={{
                    fontFamily: "'DM Mono',monospace",
                    fontSize: 10,
                    color: C.muted,
                    margin: 0,
                    letterSpacing: '0.06em',
                  }}
                >
                  FROM THE COLLECTIVE
                </p>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: 12,
                }}
              >
                {relatedItems.map(rel => (
                  <MiniCard
                    key={rel.id}
                    item={rel}
                    authorName={rel.profiles?.display_name}
                    onClick={() => {
                      if (onOpenRelated) {
                        onOpenRelated(rel, { fullscreen: isFullscreen })
                        return
                      }
                      setActionError('')
                      setExternalSelection(rel)
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <AnimatePresence>
          {deleteConfirmOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmOpen(false)}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 40,
                background: 'rgba(4,4,4,0.74)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                onClick={e => e.stopPropagation()}
                style={{
                  width: 'min(460px, 100%)',
                  borderRadius: 8,
                  border: `1px solid ${C.lineB}`,
                  background: '#121212',
                  padding: 18,
                  boxShadow: '0 18px 46px rgba(0,0,0,0.5)',
                }}
              >
                <h3
                  style={{
                    margin: '0 0 8px',
                    color: C.text,
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  Delete archive entry?
                </h3>
                <p
                  style={{
                    margin: '0 0 14px',
                    color: C.muted,
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontSize: 14,
                    lineHeight: 1.6,
                  }}
                >
                  This action is permanent and cannot be undone.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmOpen(false)}
                    disabled={saving}
                    style={{
                      border: `1px solid ${C.lineB}`,
                      borderRadius: 4,
                      background: 'transparent',
                      color: C.sub,
                      fontFamily: "'Space Grotesk',sans-serif",
                      fontSize: 13,
                      padding: '8px 13px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => { void deleteItem() }}
                    disabled={saving}
                    style={{
                      border: '1px solid rgba(248,113,113,0.5)',
                      borderRadius: 4,
                      background: 'rgba(127,29,29,0.22)',
                      color: '#fca5a5',
                      fontFamily: "'Space Grotesk',sans-serif",
                      fontWeight: 700,
                      fontSize: 13,
                      padding: '8px 13px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Left/right nav */}
      {items.length > 1 && (
        <>
          <button
            aria-label="Previous item"
            onClick={e => {
              e.stopPropagation()
              setActionError('')
              setCurrentIndex(i => (i - 1 + items.length) % items.length)
            }}
            style={{
              position: 'fixed',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(20,20,20,0.85)',
              border: `1px solid ${C.line}`,
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#aaa',
              zIndex: 1001,
            }}
            className="overlay-nav-btn"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            aria-label="Next item"
            onClick={e => {
              e.stopPropagation()
              setActionError('')
              setCurrentIndex(i => (i + 1) % items.length)
            }}
            style={{
              position: 'fixed',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(20,20,20,0.85)',
              border: `1px solid ${C.line}`,
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#aaa',
              zIndex: 1001,
            }}
            className="overlay-nav-btn"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      <style jsx>{`
        .overlay-action-btn,
        .overlay-nav-btn {
          transition: all 0.15s ease;
        }

        .overlay-action-btn:not(:disabled):hover {
          transform: translateY(-1px);
          border-color: rgba(255, 255, 255, 0.26);
          color: #f2f2f2;
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
        }

        .overlay-action-btn-danger:not(:disabled):hover {
          border-color: rgba(248, 113, 113, 0.48);
          color: #fca5a5;
          background: rgba(127, 29, 29, 0.24);
        }

        .overlay-action-btn:focus-visible,
        .overlay-nav-btn:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(155, 127, 248, 0.24);
        }

        .overlay-nav-btn:hover {
          transform: translateY(-50%) scale(1.04);
          border-color: rgba(255, 255, 255, 0.22);
          color: #f2f2f2;
          background: rgba(26, 26, 26, 0.92);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.45);
        }

        .detail-link-btn:hover {
          background: rgba(155, 127, 248, 0.12);
          border-color: rgba(155, 127, 248, 0.5);
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
        }

        .profile-link-btn:hover {
          color: #ffffff !important;
          text-decoration: underline;
          text-decoration-color: rgba(155, 127, 248, 0.65);
          text-underline-offset: 3px;
        }

        :hover > .cover-reposition-btn,
        .cover-reposition-btn:focus-visible {
          opacity: 1 !important;
        }

        .cover-reposition-btn:hover {
          border-color: rgba(255, 255, 255, 0.22);
          color: #f2f2f2;
          background: rgba(26, 26, 26, 0.88);
        }
      `}</style>
    </motion.div>
  )
}
