'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import type { ArchiveItem } from '@/lib/types'

interface PostDetailOverlayProps {
  item: ArchiveItem
  items: ArchiveItem[]
  onClose: () => void
}

const T = {
  surf: '#141414',
  line: 'rgba(255,255,255,0.07)',
  text: '#f2f2f2',
  muted: '#555',
  artist: '#9b7ff8',
  artistDim: 'rgba(155,127,248,0.12)',
}

export function PostDetailOverlay({ item: initialItem, items, onClose }: PostDetailOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(
    () => Math.max(0, items.findIndex(i => i.id === initialItem.id))
  )

  const item = items[currentIndex] ?? initialItem

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft')
        setCurrentIndex(i => (i - 1 + items.length) % items.length)
      if (e.key === 'ArrowRight')
        setCurrentIndex(i => (i + 1) % items.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, items.length])

  const createdAt = (() => {
    const d = new Date(item.created_at)
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString()
  })()

  const domain = item.type === 'link' ? (() => {
    try { return new URL(item.content).hostname } catch { return item.content }
  })() : ''

  const linkHref = item.type === 'link'
    ? (/^https?:\/\//i.test(item.content) ? item.content : `https://${item.content}`)
    : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(8,8,8,0.88)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        onClick={e => e.stopPropagation()}
        style={{
          background: T.surf,
          border: `1px solid ${T.line}`,
          borderRadius: 6,
          width: '100%',
          maxWidth: 720,
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 14, right: 14, zIndex: 10,
            background: 'rgba(8,8,8,0.7)', border: `1px solid ${T.line}`,
            borderRadius: '50%', width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: T.muted,
          }}
        >
          <X size={14} />
        </button>

        {/* IMAGE */}
        {item.type === 'image' && (
          <div>
            {/^https?:\/\//i.test(item.content) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.content}
                alt="Archive item"
                style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', display: 'block' }}
              />
            )}
            {createdAt && (
              <div style={{ padding: '16px 24px', borderTop: `1px solid ${T.line}` }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: T.muted }}>{createdAt}</p>
              </div>
            )}
          </div>
        )}

        {/* TEXT */}
        {item.type === 'text' && (
          <div style={{ padding: '40px 36px' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 8,
              letterSpacing: '0.12em', color: T.artist, marginBottom: 20,
            }}>TEXT</div>
            <p style={{
              fontFamily: 'var(--font-heading)', fontSize: 16, color: '#ddd',
              lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: '0 0 24px',
            }}>{item.content}</p>
            {createdAt && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: T.muted }}>{createdAt}</p>
            )}
          </div>
        )}

        {/* LINK */}
        {item.type === 'link' && (
          <div style={{ padding: '40px 36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.artist }} />
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 9,
                letterSpacing: '0.1em', color: T.artist,
              }}>LINK</span>
              {domain && (
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  color: T.muted, marginLeft: 'auto',
                }}>{domain}</span>
              )}
            </div>
            <p style={{
              fontFamily: 'var(--font-heading)', fontSize: 14, color: '#aaa',
              wordBreak: 'break-all', marginBottom: 24, lineHeight: 1.5,
            }}>{item.content}</p>
            {linkHref && (
              <a
                href={linkHref}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  letterSpacing: '0.1em', color: T.artist, textDecoration: 'none',
                  padding: '8px 16px',
                  border: `1px solid rgba(155,127,248,0.25)`,
                  borderRadius: 2,
                }}
              >
                <ExternalLink size={11} />
                OPEN LINK
              </a>
            )}
            {createdAt && (
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: T.muted, marginTop: 24,
              }}>{createdAt}</p>
            )}
          </div>
        )}
      </motion.div>

      {/* Prev / Next */}
      {items.length > 1 && (
        <>
          <button
            aria-label="Previous item"
            onClick={e => {
              e.stopPropagation()
              setCurrentIndex(i => (i - 1 + items.length) % items.length)
            }}
            style={{
              position: 'fixed', left: 20, top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(20,20,20,0.85)',
              border: `1px solid ${T.line}`,
              borderRadius: '50%', width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#aaa',
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            aria-label="Next item"
            onClick={e => {
              e.stopPropagation()
              setCurrentIndex(i => (i + 1) % items.length)
            }}
            style={{
              position: 'fixed', right: 20, top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(20,20,20,0.85)',
              border: `1px solid ${T.line}`,
              borderRadius: '50%', width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#aaa',
            }}
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}
    </motion.div>
  )
}
