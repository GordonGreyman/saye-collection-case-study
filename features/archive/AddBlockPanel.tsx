/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/ToastProvider'
import { addArchiveItem } from '@/features/archive/actions'
import { uploadArchiveImage } from '@/features/archive/upload'
import type { ArchiveItemType } from '@/lib/types'

interface AddBlockPanelProps {
  profileId: string
  isOwner: boolean
  defaultOpen?: boolean
}

const BLOCK_TYPES: ArchiveItemType[] = ['text', 'image', 'link']
type ImageInputMode = 'upload' | 'url'

export function AddBlockPanel({ profileId, isOwner, defaultOpen = false }: AddBlockPanelProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [open, setOpen] = useState(defaultOpen)
  const [type, setType] = useState<ArchiveItemType>('text')
  const [imageInputMode, setImageInputMode] = useState<ImageInputMode>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const imagePreview = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : ''),
    [selectedFile]
  )

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  if (!isOwner) {
    return null
  }

  const submit = async () => {
    setError('')
    setLoading(true)

    let finalContent = content
    if (type === 'image' && imageInputMode === 'upload') {
      if (!selectedFile) {
        setLoading(false)
        const message = 'Select an image file first.'
        setError(message)
        showToast(message, 'error')
        return
      }

      const uploadResult = await uploadArchiveImage(selectedFile, profileId)
      if ('error' in uploadResult) {
        setLoading(false)
        setError(uploadResult.error)
        showToast(uploadResult.error, 'error')
        return
      }

      finalContent = uploadResult.url
    }

    const result = await addArchiveItem({ type, content: finalContent })
    setLoading(false)

    if ('error' in result) {
      setError(result.error)
      showToast(result.error, 'error')
      return
    }

    setContent('')
    setSelectedFile(null)
    setOpen(false)
    showToast('Added to archive.', 'success')
    router.refresh()
  }

  return (
    <div className="mb-6">
      {!open && (
        <Button type="button" variant="ghost" onClick={() => setOpen(true)}>
          + Add to Archive
        </Button>
      )}

      {open && (
        <div
          data-profile-id={profileId}
          className="bg-surface border border-white/10 rounded-xl p-4 animate-[fadeIn_.2s_ease-out]"
        >
          <div className="flex flex-wrap gap-2 mb-4">
            {BLOCK_TYPES.map(blockType => (
              <button
                key={blockType}
                type="button"
                onClick={() => {
                  setType(blockType)
                  setError('')
                }}
                className={`px-3 py-1.5 rounded-full border text-sm transition ${
                  type === blockType
                    ? 'bg-accent text-white border-accent'
                    : 'bg-white/5 border-white/10 text-text-muted hover:border-accent'
                }`}
              >
                {blockType === 'image' ? 'Image URL' : blockType[0].toUpperCase() + blockType.slice(1)}
              </button>
            ))}
          </div>

          {type === 'text' ? (
            <Textarea
              id="archive-text-content"
              placeholder="Write something..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          ) : type === 'image' ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setImageInputMode('upload')}
                  className={`px-3 py-1.5 rounded-full border text-sm transition ${
                    imageInputMode === 'upload'
                      ? 'bg-accent text-white border-accent'
                      : 'bg-white/5 border-white/10 text-text-muted hover:border-accent'
                  }`}
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode('url')}
                  className={`px-3 py-1.5 rounded-full border text-sm transition ${
                    imageInputMode === 'url'
                      ? 'bg-accent text-white border-accent'
                      : 'bg-white/5 border-white/10 text-text-muted hover:border-accent'
                  }`}
                >
                  Use URL
                </button>
              </div>

              {imageInputMode === 'upload' ? (
                <div className="space-y-3">
                  <input
                    id="archive-image-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={e => setSelectedFile(e.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-text-primary hover:file:bg-white/20"
                  />
                  {selectedFile && (
                    <div className="rounded-xl border border-white/10 overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Upload preview"
                        className="w-full max-h-72 object-cover"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <Input
                  id="archive-image-url"
                  placeholder="https://example.com/image.jpg"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                />
              )}
            </div>
          ) : (
            <Input
              id="archive-link-content"
              placeholder="https://example.com"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          )}

          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="button" onClick={submit} disabled={loading}>
              {loading ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
