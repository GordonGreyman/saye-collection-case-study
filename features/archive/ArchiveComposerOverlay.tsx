'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ImageIcon, LinkIcon, ListIcon, Pilcrow, Type, UnderlineIcon, X } from 'lucide-react'
import { addArchiveItem, updateArchiveItem } from '@/features/archive/actions'
import { uploadArchiveImage } from '@/features/archive/upload'
import { lockBodyScroll } from '@/lib/ui/bodyScrollLock'
import type { ArchiveItemType } from '@/lib/types'

interface ArchiveComposerOverlayProps {
  open: boolean
  profileId: string
  onClose: () => void
  onSaved: () => void
  initialDraft?: {
    title?: string
    body?: string
    link?: string
    imageUrl?: string
  }
  editTarget?: {
    id: string
    type: ArchiveItemType
  } | null
}

function hasUsefulContent(value: string) {
  return Boolean(value && value.trim())
}

function normalizeHttpUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

function isLikelyHttpUrl(value: string) {
  if (!hasUsefulContent(value)) {
    return false
  }
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname)
  } catch {
    return false
  }
}

export function ArchiveComposerOverlay({
  open,
  profileId,
  onClose,
  onSaved,
  initialDraft,
  editTarget,
}: ArchiveComposerOverlayProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [link, setLink] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  const filePreview = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : ''),
    [selectedFile],
  )

  const normalizedImageUrl = normalizeHttpUrl(imageUrl)
  const showImagePreview = !selectedFile && isLikelyHttpUrl(normalizedImageUrl)
  const isEditingExisting = Boolean(editTarget)

  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview)
      }
    }
  }, [filePreview])

  useEffect(() => {
    if (!open) {
      return
    }
    const releaseScrollLock = lockBodyScroll()
    return releaseScrollLock
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving) {
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, saving])

  useEffect(() => {
    if (!open || (!initialDraft && !editTarget)) {
      return
    }

    setTitle(initialDraft?.title ?? '')
    setBody(initialDraft?.body ?? '')
    setLink(initialDraft?.link ?? '')
    setImageUrl(initialDraft?.imageUrl ?? '')
    setSelectedFile(null)
    setError('')
  }, [open, initialDraft, editTarget])

  const resetComposer = () => {
    setTitle('')
    setBody('')
    setLink('')
    setImageUrl('')
    setSelectedFile(null)
    setError('')
  }

  const applyWrap = (prefix: string, suffix = prefix, placeholder = 'text') => {
    const textarea = bodyRef.current
    if (!textarea) {
      setBody(prev => `${prev}${prefix}${placeholder}${suffix}`)
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    setBody(prev => {
      const selected = prev.slice(start, end) || placeholder
      return `${prev.slice(0, start)}${prefix}${selected}${suffix}${prev.slice(end)}`
    })

    window.requestAnimationFrame(() => {
      const selectedLength = (textarea.value.slice(start, end) || placeholder).length
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedLength)
    })
  }

  const prefixLines = (token: string) => {
    const textarea = bodyRef.current
    if (!textarea) {
      setBody(prev => `${prev}${token}List item`)
      return
    }
    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    setBody(prev => {
      const selected = prev.slice(start, end) || 'List item'
      const transformed = selected
        .split('\n')
        .map(line => `${token}${line}`)
        .join('\n')
      return `${prev.slice(0, start)}${transformed}${prev.slice(end)}`
    })

    window.requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(start, end + token.length)
    })
  }

  const save = async () => {
    setSaving(true)
    setError('')

    const textPayload = [title.trim(), body.trim()].filter(Boolean).join('\n\n')
    const normalizedLink = normalizeHttpUrl(link)

    if (isEditingExisting && editTarget) {
      if (editTarget.type === 'text') {
        if (!hasUsefulContent(textPayload)) {
          setSaving(false)
          setError('Add title or body text before saving.')
          return
        }

        const result = await updateArchiveItem(editTarget.id, {
          type: 'text',
          content: textPayload,
        })

        if ('error' in result) {
          setSaving(false)
          setError(result.error)
          return
        }

        setSaving(false)
        resetComposer()
        onSaved()
        onClose()
        return
      }

      if (editTarget.type === 'link') {
        if (!hasUsefulContent(normalizedLink) || !isLikelyHttpUrl(normalizedLink)) {
          setSaving(false)
          setError('Add a valid web link.')
          return
        }

        const result = await updateArchiveItem(editTarget.id, {
          type: 'link',
          content: normalizedLink,
        })

        if ('error' in result) {
          setSaving(false)
          setError(result.error)
          return
        }

        setSaving(false)
        resetComposer()
        onSaved()
        onClose()
        return
      }

      let resolvedImage = ''
      if (selectedFile) {
        const uploadResult = await uploadArchiveImage(selectedFile, profileId)
        if ('error' in uploadResult) {
          setSaving(false)
          setError(uploadResult.error)
          return
        }
        resolvedImage = uploadResult.url
      } else if (hasUsefulContent(imageUrl) && isLikelyHttpUrl(normalizedImageUrl)) {
        resolvedImage = normalizedImageUrl
      }

      if (!hasUsefulContent(resolvedImage)) {
        setSaving(false)
        setError('Add a valid image URL (for example: https://example.com/image.jpg).')
        return
      }

      const result = await updateArchiveItem(editTarget.id, {
        type: 'image',
        content: resolvedImage,
      })

      if ('error' in result) {
        setSaving(false)
        setError(result.error)
        return
      }

      setSaving(false)
      resetComposer()
      onSaved()
      onClose()
      return
    }

    if (hasUsefulContent(link) && !isLikelyHttpUrl(normalizedLink)) {
      setSaving(false)
      setError('Add a valid web link.')
      return
    }

    let resolvedImage = ''
    if (selectedFile) {
      const uploadResult = await uploadArchiveImage(selectedFile, profileId)
      if ('error' in uploadResult) {
        setSaving(false)
        setError(uploadResult.error)
        return
      }
      resolvedImage = uploadResult.url
    } else if (hasUsefulContent(imageUrl)) {
      if (!isLikelyHttpUrl(normalizedImageUrl)) {
        setSaving(false)
        setError('Add a valid image URL (for example: https://example.com/image.jpg).')
        return
      }
      resolvedImage = normalizedImageUrl
    }

    const entries: Array<{ type: 'text' | 'link' | 'image'; content: string }> = []
    if (hasUsefulContent(textPayload)) {
      entries.push({ type: 'text', content: textPayload })
    }
    if (hasUsefulContent(normalizedLink)) {
      entries.push({ type: 'link', content: normalizedLink })
    }
    if (hasUsefulContent(resolvedImage)) {
      entries.push({ type: 'image', content: resolvedImage })
    }

    if (entries.length === 0) {
      setSaving(false)
      setError('Add at least one piece of content: text, link, or image.')
      return
    }

    for (const entry of entries) {
      const result = await addArchiveItem(entry)
      if ('error' in result) {
        setSaving(false)
        setError(result.error)
        return
      }
    }

    setSaving(false)
    resetComposer()
    onSaved()
    onClose()
  }

  return (
    <>
      <AnimatePresence>
        {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1200,
            background: 'rgba(8,8,8,0.86)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={event => event.stopPropagation()}
            style={{
              width: 'min(1080px, 100%)',
              maxHeight: '92vh',
              overflow: 'auto',
              background: '#141414',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 22px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                position: 'sticky',
                top: 0,
                background: 'rgba(20,20,20,0.96)',
                backdropFilter: 'blur(8px)',
                zIndex: 2,
              }}
            >
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: '#9b7ff8', letterSpacing: '0.12em' }}>
                {isEditingExisting ? 'EDIT ARCHIVE ENTRY' : 'NEW ARCHIVE ENTRY'}
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="composer-icon-btn"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'transparent',
                  color: '#9a9a9a',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
                aria-label="Close composer"
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ padding: '22px 22px 26px' }}>
              <input
                value={title}
                onChange={event => setTitle(event.target.value)}
                placeholder="Untitled"
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#f2f2f2',
                  fontFamily: "'Space Grotesk',sans-serif",
                  fontWeight: 800,
                  fontSize: 'clamp(30px, 4vw, 54px)',
                  lineHeight: 1.02,
                  letterSpacing: '-0.02em',
                  marginBottom: 18,
                }}
              />

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.7fr 1fr',
                  gap: 16,
                }}
              >
                <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden' }}>
                  <div
                    style={{
                      display: 'flex',
                      gap: 6,
                      alignItems: 'center',
                      padding: '8px 10px',
                      borderBottom: '1px solid rgba(255,255,255,0.07)',
                      background: '#111111',
                      flexWrap: 'wrap',
                    }}
                  >
                    <button type="button" onClick={() => applyWrap('**')} style={toolBtnStyle} className="composer-tool-btn"><Type size={14} /> B</button>
                    <button type="button" onClick={() => applyWrap('_')} style={toolBtnStyle} className="composer-tool-btn"><Type size={14} /> I</button>
                    <button type="button" onClick={() => applyWrap('<u>', '</u>')} style={toolBtnStyle} className="composer-tool-btn"><UnderlineIcon size={14} /> U</button>
                    <button type="button" onClick={() => applyWrap('# ', '')} style={toolBtnStyle} className="composer-tool-btn"><Pilcrow size={14} /> H1</button>
                    <button type="button" onClick={() => prefixLines('- ')} style={toolBtnStyle} className="composer-tool-btn"><ListIcon size={14} /> List</button>
                    <button type="button" onClick={() => prefixLines('> ')} style={toolBtnStyle} className="composer-tool-btn">Quote</button>
                    <button type="button" onClick={() => applyWrap('[', '](https://)')} style={toolBtnStyle} className="composer-tool-btn"><LinkIcon size={14} /> Link</button>
                  </div>
                  <textarea
                    ref={bodyRef}
                    value={body}
                    onChange={event => setBody(event.target.value)}
                    placeholder="Write your notes, process, references, or context..."
                    style={{
                      width: '100%',
                      minHeight: 360,
                      border: 'none',
                      outline: 'none',
                      resize: 'vertical',
                      background: '#141414',
                      color: '#e8e8e8',
                      padding: 16,
                      fontFamily: "'Space Grotesk',sans-serif",
                      fontSize: 15,
                      lineHeight: 1.7,
                    }}
                  />
                </div>

                <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: 14, background: '#101010' }}>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.1em', color: '#9a9a9a', marginBottom: 10 }}>
                    ASSETS
                  </div>

                  <label
                    className="composer-upload-btn"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      border: '1px dashed rgba(255,255,255,0.18)',
                      borderRadius: 6,
                      padding: '12px 10px',
                      color: '#b6b6b6',
                      fontFamily: "'Space Grotesk',sans-serif",
                      fontSize: 13,
                      cursor: 'pointer',
                      marginBottom: 10,
                    }}
                  >
                    <ImageIcon size={14} />
                    Upload image file
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={event => setSelectedFile(event.target.files?.[0] ?? null)}
                      style={{ display: 'none' }}
                    />
                  </label>

                  <input
                    value={imageUrl}
                    onChange={event => setImageUrl(event.target.value)}
                    placeholder="Image URL"
                    className="composer-side-input"
                    style={sideInputStyle}
                  />
                  <input
                    value={link}
                    onChange={event => setLink(event.target.value)}
                    placeholder="Reference link"
                    className="composer-side-input"
                    style={{ ...sideInputStyle, marginTop: 8 }}
                  />

                  {(selectedFile || showImagePreview) && (
                    <div
                      style={{
                        marginTop: 12,
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6,
                        overflow: 'hidden',
                        background: '#0d0d0d',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedFile ? filePreview : normalizedImageUrl}
                        alt="Selected image preview"
                        style={{ display: 'block', width: '100%', maxHeight: 200, objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div style={{ marginTop: 12, fontFamily: "'DM Mono',monospace", fontSize: 11, color: '#f87171' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
                <button type="button" onClick={onClose} disabled={saving} style={secondaryActionStyle} className="composer-secondary-btn">
                  Cancel
                </button>
                <button type="button" onClick={save} disabled={saving} style={primaryActionStyle} className="composer-primary-btn">
                  {saving ? (isEditingExisting ? 'Saving...' : 'Publishing...') : (isEditingExisting ? 'Save Changes' : 'Publish to Archive')}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .composer-icon-btn,
        .composer-tool-btn,
        .composer-upload-btn,
        .composer-secondary-btn,
        .composer-primary-btn,
        .composer-side-input {
          transition: all 0.15s ease;
        }

        .composer-icon-btn:not(:disabled):hover {
          transform: translateY(-1px);
          color: #f2f2f2;
          border-color: rgba(255, 255, 255, 0.28);
          background: rgba(255, 255, 255, 0.04);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.38);
        }

        .composer-tool-btn:hover {
          transform: translateY(-1px);
          color: #f2f2f2;
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
        }

        .composer-upload-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(255, 255, 255, 0.34);
          color: #f2f2f2;
          background: rgba(255, 255, 255, 0.03);
          box-shadow: 0 10px 18px rgba(0, 0, 0, 0.35);
        }

        .composer-side-input:hover {
          border-color: rgba(255, 255, 255, 0.28);
        }

        .composer-side-input:focus {
          border-color: rgba(155, 127, 248, 0.6);
          box-shadow: 0 0 0 3px rgba(155, 127, 248, 0.18);
        }

        .composer-secondary-btn:not(:disabled):hover {
          transform: translateY(-1px);
          border-color: rgba(255, 255, 255, 0.28);
          color: #f2f2f2;
          background: rgba(255, 255, 255, 0.04);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.35);
        }

        .composer-primary-btn:not(:disabled):hover {
          transform: translateY(-1px);
          background: #b49fff;
          box-shadow: 0 12px 24px rgba(155, 127, 248, 0.3);
        }
      `}</style>
    </>
  )
}

const toolBtnStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: 4,
  background: 'transparent',
  color: '#9a9a9a',
  padding: '5px 8px',
  fontFamily: "'DM Mono',monospace",
  fontSize: 10,
  cursor: 'pointer',
}

const sideInputStyle: CSSProperties = {
  width: '100%',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 5,
  background: '#141414',
  color: '#e8e8e8',
  padding: '10px 11px',
  outline: 'none',
  fontFamily: "'Space Grotesk',sans-serif",
  fontSize: 13,
}

const secondaryActionStyle: CSSProperties = {
  border: '1px solid rgba(255,255,255,0.16)',
  borderRadius: 4,
  background: 'transparent',
  color: '#b1b1b1',
  fontFamily: "'Space Grotesk',sans-serif",
  fontSize: 13,
  padding: '10px 16px',
  cursor: 'pointer',
}

const primaryActionStyle: CSSProperties = {
  border: 'none',
  borderRadius: 4,
  background: '#9b7ff8',
  color: '#080808',
  fontFamily: "'Space Grotesk',sans-serif",
  fontWeight: 700,
  fontSize: 13,
  padding: '10px 16px',
  cursor: 'pointer',
}
