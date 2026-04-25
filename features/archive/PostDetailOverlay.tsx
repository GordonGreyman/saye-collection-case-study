'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Expand,
  ExternalLink,
  Minimize2,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
import { deleteArchiveItem, updateArchiveItem } from '@/features/archive/actions'
import { lockBodyScroll } from '@/lib/ui/bodyScrollLock'
import type { ArchiveItem } from '@/lib/types'

interface PostDetailOverlayProps {
  item: ArchiveItem
  items: ArchiveItem[]
  onClose: () => void
  isOwner?: boolean
  onEditInComposer?: (item: ArchiveItem) => void
}

const T = {
  surf: '#141414',
  line: 'rgba(255,255,255,0.07)',
  text: '#f2f2f2',
  muted: '#9a9a9a',
  artist: '#9b7ff8',
}

function normalizeHttpUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

function isLikelyHttpUrl(value: string) {
  if (!value) {
    return false
  }
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname)
  } catch {
    return false
  }
}

export function PostDetailOverlay({
  item: initialItem,
  items,
  onClose,
  isOwner = false,
  onEditInComposer,
}: PostDetailOverlayProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(() => Math.max(0, items.findIndex(i => i.id === initialItem.id)))
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [draftContent, setDraftContent] = useState(initialItem.content)
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState('')

  const item = items[currentIndex] ?? initialItem
  const canUseComposerEdit = Boolean(onEditInComposer)

  useEffect(() => {
    const releaseScrollLock = lockBodyScroll()
    return releaseScrollLock
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isEditing) {
          setIsEditing(false)
          setDraftContent(item.content)
          setActionError('')
          return
        }
        onClose()
        return
      }

      if (isEditing) {
        return
      }

      if (event.key === 'ArrowLeft') {
        setActionError('')
        setCurrentIndex(index => (index - 1 + items.length) % items.length)
      }
      if (event.key === 'ArrowRight') {
        setActionError('')
        setCurrentIndex(index => (index + 1) % items.length)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isEditing, item.content, items.length, onClose])

  const createdAt = (() => {
    const date = new Date(item.created_at)
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString()
  })()

  const domain =
    item.type === 'link'
      ? (() => {
          try {
            return new URL(item.content).hostname
          } catch {
            return item.content
          }
        })()
      : ''

  const linkHref = item.type === 'link' ? normalizeHttpUrl(item.content) : null
  const draftLinkHref = item.type === 'link' || item.type === 'image' ? normalizeHttpUrl(draftContent) : ''
  const canPreviewDraftImage = item.type === 'image' && isLikelyHttpUrl(draftLinkHref)

  const saveEdit = async () => {
    setActionError('')
    const nextContent = draftContent.trim()

    if (!nextContent) {
      setActionError('Content cannot be empty.')
      return
    }

    if (item.type === 'link' || item.type === 'image') {
      if (!isLikelyHttpUrl(draftLinkHref)) {
        setActionError('Please use a valid URL.')
        return
      }
    }

    setSaving(true)
    const result = await updateArchiveItem(item.id, {
      type: item.type,
      content: item.type === 'text' ? nextContent : draftLinkHref,
    })
    setSaving(false)

    if ('error' in result) {
      setActionError(result.error)
      return
    }

    setIsEditing(false)
    router.refresh()
  }

  const deleteItem = async () => {
    setActionError('')

    if (!window.confirm('Delete this archive entry?')) {
      return
    }

    setSaving(true)
    const result = await deleteArchiveItem(item.id)
    setSaving(false)

    if ('error' in result) {
      setActionError(result.error)
      return
    }

    onClose()
    router.refresh()
  }

  const actionBtnStyle: CSSProperties = {
    background: 'rgba(8,8,8,0.74)',
    border: `1px solid ${T.line}`,
    borderRadius: 4,
    minWidth: 32,
    height: 32,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: T.muted,
    cursor: saving ? 'not-allowed' : 'pointer',
    padding: '0 9px',
    transition: 'all 0.15s',
  }

  const editableContent = (
    <>
      {item.type === 'text' ? (
        <textarea
          value={draftContent}
          onChange={event => setDraftContent(event.target.value)}
          style={{
            width: '100%',
            minHeight: 260,
            background: '#0f0f0f',
            border: `1px solid ${T.line}`,
            borderRadius: 4,
            padding: '14px 16px',
            color: '#e6e6e6',
            fontFamily: 'var(--font-heading)',
            fontSize: 15,
            lineHeight: 1.7,
            outline: 'none',
            resize: 'vertical',
          }}
        />
      ) : (
        <input
          value={draftContent}
          onChange={event => setDraftContent(event.target.value)}
          placeholder={item.type === 'image' ? 'https://example.com/image.jpg' : 'https://example.com'}
          style={{
            width: '100%',
            background: '#0f0f0f',
            border: `1px solid ${T.line}`,
            borderRadius: 4,
            padding: '12px 14px',
            color: '#e6e6e6',
            fontFamily: 'var(--font-heading)',
            fontSize: 14,
            outline: 'none',
          }}
        />
      )}

      {canPreviewDraftImage && (
        <div style={{ marginTop: 14, border: `1px solid ${T.line}`, borderRadius: 4, overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={draftLinkHref}
            alt="Draft preview"
            style={{ width: '100%', maxHeight: '50vh', objectFit: 'contain', display: 'block' }}
          />
        </div>
      )}
    </>
  )

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
        background: 'rgba(8,8,8,0.88)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isFullScreen ? 0 : 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        onClick={event => event.stopPropagation()}
        style={{
          background: T.surf,
          border: `1px solid ${T.line}`,
          borderRadius: isFullScreen ? 0 : 6,
          width: isFullScreen ? '100vw' : '100%',
          maxWidth: isFullScreen ? '100vw' : 720,
          maxHeight: isFullScreen ? '100vh' : '90vh',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            zIndex: 10,
            display: 'flex',
            gap: 8,
            padding: 6,
            borderRadius: 8,
            background: 'rgba(8,8,8,0.62)',
            border: `1px solid ${T.line}`,
            backdropFilter: 'blur(9px)',
          }}
        >
          <button
            type="button"
            onClick={() => setIsFullScreen(value => !value)}
            aria-label={isFullScreen ? 'Exit full screen' : 'View full screen'}
            className="overlay-action-btn"
            style={actionBtnStyle}
          >
            {isFullScreen ? <Minimize2 size={14} /> : <Expand size={14} />}
          </button>
          {isOwner && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (canUseComposerEdit && onEditInComposer) {
                    onEditInComposer(item)
                    return
                  }
                  if (isEditing) {
                    void saveEdit()
                  } else {
                    setActionError('')
                    setIsEditing(true)
                    setDraftContent(item.content)
                  }
                }}
                disabled={saving}
                aria-label={isEditing ? 'Save edits' : canUseComposerEdit ? 'Edit in composer' : 'Edit entry'}
                className="overlay-action-btn"
                style={actionBtnStyle}
              >
                {isEditing ? <Check size={14} /> : <Pencil size={14} />}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isEditing && !canUseComposerEdit) {
                    setIsEditing(false)
                    setDraftContent(item.content)
                    setActionError('')
                    return
                  }
                  void deleteItem()
                }}
                disabled={saving}
                aria-label={isEditing ? 'Cancel editing' : 'Delete entry'}
                className={isEditing ? 'overlay-action-btn' : 'overlay-action-btn overlay-action-btn-danger'}
                style={{
                  ...actionBtnStyle,
                  border: `1px solid ${isEditing ? T.line : 'rgba(248,113,113,0.28)'}`,
                  color: isEditing ? T.muted : '#f87171',
                }}
              >
                {isEditing ? <X size={14} /> : <Trash2 size={14} />}
              </button>
            </>
          )}
          <button onClick={onClose} aria-label="Close" className="overlay-action-btn" style={actionBtnStyle}>
            <X size={14} />
          </button>
        </div>

        {item.type === 'image' && (
          <div style={{ position: 'relative' }}>
            {isEditing ? (
              <div style={{ padding: '48px 24px 22px' }}>{editableContent}</div>
            ) : /^https?:\/\//i.test(item.content) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <>
                <img src={item.content} alt="Archive item" style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(to bottom, rgba(8,8,8,0.5) 0%, rgba(8,8,8,0.18) 30%, rgba(8,8,8,0.56) 100%)' }} />
              </>
            ) : (
              <div style={{ minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'rgba(255,255,255,0.02)' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9a9a9a', wordBreak: 'break-all' }}>{item.content}</p>
              </div>
            )}
            {createdAt && <div style={{ padding: '16px 24px', borderTop: `1px solid ${T.line}` }}><p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: T.muted }}>{createdAt}</p></div>}
          </div>
        )}

        {item.type === 'text' && (
          <div style={{ padding: '40px 36px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.12em', color: T.artist, marginBottom: 20 }}>TEXT</div>
            {isEditing ? (
              editableContent
            ) : (
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 16, color: '#ddd', lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: '0 0 24px' }}>{item.content}</p>
            )}
            {createdAt && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: T.muted, marginTop: 20 }}>{createdAt}</p>}
          </div>
        )}

        {item.type === 'link' && (
          <div style={{ padding: '40px 36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.artist }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: T.artist }}>LINK</span>
              {domain && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: T.muted, marginLeft: 'auto' }}>{domain}</span>}
            </div>
            {isEditing ? (
              editableContent
            ) : (
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 14, color: '#aaa', wordBreak: 'break-all', marginBottom: 24, lineHeight: 1.5 }}>{item.content}</p>
            )}
            {!isEditing && linkHref && (
              <a
                href={linkHref}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  color: T.artist,
                  textDecoration: 'none',
                  padding: '8px 16px',
                  border: `1px solid rgba(155,127,248,0.25)`,
                  borderRadius: 2,
                }}
              >
                <ExternalLink size={11} />
                OPEN LINK
              </a>
            )}
            {createdAt && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: T.muted, marginTop: 24 }}>{createdAt}</p>}
          </div>
        )}

        {actionError && (
          <div style={{ padding: '0 36px 24px', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#f87171' }}>
            {actionError}
          </div>
        )}
      </motion.div>

      {items.length > 1 && !isEditing && (
        <>
          <button
            aria-label="Previous item"
            onClick={event => {
              event.stopPropagation()
              setActionError('')
              setCurrentIndex(index => (index - 1 + items.length) % items.length)
            }}
            style={{
              position: 'fixed',
              left: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(20,20,20,0.85)',
              border: `1px solid ${T.line}`,
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#aaa',
            }}
            className="overlay-nav-btn"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            aria-label="Next item"
            onClick={event => {
              event.stopPropagation()
              setActionError('')
              setCurrentIndex(index => (index + 1) % items.length)
            }}
            style={{
              position: 'fixed',
              right: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(20,20,20,0.85)',
              border: `1px solid ${T.line}`,
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#aaa',
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
      `}</style>
    </motion.div>
  )
}
