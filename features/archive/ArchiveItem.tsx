/* eslint-disable @next/next/no-img-element */
'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExternalLink, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/ToastProvider'
import { deleteArchiveItem } from '@/features/archive/actions'
import type { ArchiveItem as ArchiveItemType } from '@/lib/types'

interface ArchiveItemProps {
  item: ArchiveItemType
  isOwner: boolean
}

export function ArchiveItem({ item, isOwner }: ArchiveItemProps) {
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
    <div className="relative">
      {isOwner && !confirming && (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="absolute right-2 top-2 z-10 bg-black/40 p-1.5 rounded-full text-text-muted hover:text-white"
          aria-label="Delete archive item"
        >
          <Trash2 size={14} />
        </button>
      )}

      {isOwner && confirming && (
        <div className="absolute right-2 top-2 z-10 flex items-center gap-2 bg-black/60 rounded-full px-2 py-1 text-xs">
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
          <p className="text-text-primary whitespace-pre-wrap">{item.content}</p>
          {createdAt && <p className="text-text-muted text-xs mt-3">{createdAt}</p>}
        </Card>
      )}

      {item.type === 'link' && (
        <Card>
          <a
            href={item.content}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-accent hover:underline break-all"
          >
            <ExternalLink size={14} />
            {item.content}
          </a>
          {domain && (
            <div className="mt-3">
              <Badge>{domain}</Badge>
            </div>
          )}
          {createdAt && <p className="text-text-muted text-xs mt-3">{createdAt}</p>}
        </Card>
      )}

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  )
}
