/* eslint-disable @next/next/no-img-element */
'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/components/ui/ToastProvider'
import { deleteArchiveItem } from '@/features/archive/actions'
import type { ArchiveItem as ArchiveItemType } from '@/lib/types'

interface ArchiveItemProps {
  item: ArchiveItemType
  isOwner: boolean
  onExpand?: () => void
}

export function ArchiveItem({ item, isOwner, onExpand }: ArchiveItemProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const createdAt = useMemo(() => {
    const date = new Date(item.created_at)
    if (Number.isNaN(date.getTime())) {
      return ''
    }
    return date.toLocaleDateString()
  }, [item.created_at])

  const domain = useMemo(() => {
    if (item.type !== 'link') {
      return ''
    }

    try {
      return new URL(item.content).hostname
    } catch {
      return item.content
    }
  }, [item.content, item.type])

  const onDelete = async () => {
    setDeleting(true)
    setError('')

    const result = await deleteArchiveItem(item.id)
    setDeleting(false)

    if ('error' in result) {
      setError(result.error)
      showToast(result.error, 'error')
      return
    }

    setConfirming(false)
    showToast('Archive item deleted.', 'success')
    router.refresh()
  }

  return (
    <div
      className="relative"
      onClick={onExpand}
      style={{ cursor: onExpand ? 'pointer' : undefined }}
      {...(onExpand
        ? {
            role: 'button' as const,
            tabIndex: 0,
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onExpand()
              }
            },
          }
        : {})}
    >
      {isOwner && !confirming && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation()
            setConfirming(true)
          }}
          className="absolute right-2 top-2 z-10 bg-black/40 p-1.5 rounded-full text-text-muted hover:text-white"
          aria-label="Delete archive item"
        >
          <Trash2 size={14} />
        </button>
      )}

      {isOwner && confirming && (
        <div
          className="absolute right-2 top-2 z-10 flex items-center gap-2 bg-black/60 rounded-full px-2 py-1 text-xs"
          onClick={e => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="text-red-400 hover:text-red-300"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirming(false)
              setError('')
            }}
            className="text-text-muted hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}

      {item.type === 'image' && (
        <img
          src={item.content}
          alt="Archive item"
          className="w-full rounded-xl object-cover max-h-96 border border-white/10"
        />
      )}

      {item.type === 'text' && (
        <Card>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 8,
              letterSpacing: '0.12em',
              color: '#9b7ff8',
              marginBottom: 8,
            }}
          >
            TEXT
          </div>
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 14,
              color: '#ddd',
              lineHeight: 1.65,
              whiteSpace: 'pre-wrap',
            }}
          >
            {item.content}
          </p>
          {createdAt && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#7a7a7a', marginTop: 12 }}>
              {createdAt}
            </p>
          )}
        </Card>
      )}

      {item.type === 'link' && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              padding: '12px 18px',
              background: 'rgba(155,127,248,0.04)',
              borderBottom: '1px solid rgba(155,127,248,0.09)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#9b7ff8', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: '#9b7ff8' }}>
              LINK
            </span>
            {domain && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#9a9a9a', marginLeft: 'auto' }}>
                {domain} {'->'}
              </span>
            )}
          </div>
          <div style={{ padding: '14px 18px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#9b7ff8', wordBreak: 'break-all' }}>
              {onExpand ? (
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 13, lineHeight: 1.4 }}>{item.content}</span>
              ) : (
                <a
                  href={item.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{ fontFamily: 'var(--font-heading)', fontSize: 13, lineHeight: 1.4 }}
                >
                  {item.content}
                </a>
              )}
            </span>
            {createdAt && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#7a7a7a', marginTop: 10 }}>
                {createdAt}
              </p>
            )}
          </div>
        </Card>
      )}

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  )
}
