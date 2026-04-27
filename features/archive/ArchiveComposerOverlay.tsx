'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowDown,
  ArrowUp,
  ImageIcon,
  Link2,
  LinkIcon,
  ListIcon,
  Move,
  Pilcrow,
  Type,
  UnderlineIcon,
  X,
} from 'lucide-react'
import { addArchiveItemClient, updateArchiveItemClient } from '@/features/archive/clientActions'
import {
  hasUsefulContent,
  isLikelyHttpUrl,
  normalizeHttpUrl,
} from '@/features/archive/entry'
import { uploadArchiveImage } from '@/features/archive/upload'
import { useToast } from '@/components/ui/ToastProvider'
import { lockBodyScroll } from '@/lib/ui/bodyScrollLock'
import type { ArchiveCanvasBlock, ArchiveCanvasBlockType, ArchiveItemType } from '@/lib/types'

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
    thumbnailUrl?: string
    blocks?: ArchiveCanvasBlock[]
  }
  editTarget?: {
    id: string
    type: ArchiveItemType
  } | null
}

interface CanvasBlockDraft {
  id: string
  type: ArchiveCanvasBlockType
  content: string
  file?: File | null
  filePreview?: string
}

function makeId() {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function newBlock(type: ArchiveCanvasBlockType, content = ''): CanvasBlockDraft {
  return { id: makeId(), type, content, ...(type === 'image' ? { file: null } : {}) }
}

// ─── Sub-block components (defined at module level to avoid remount) ──────────

interface BlockShellProps {
  label: string
  icon: React.ReactNode
  isFirst: boolean
  isLast: boolean
  onMove: (dir: -1 | 1) => void
  onRemove: () => void
  children: React.ReactNode
}

function BlockShell({ label, icon, isFirst, isLast, onMove, onRemove, children }: BlockShellProps) {
  return (
    <div
      className="canvas-block"
      style={{
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 6,
        overflow: 'hidden',
        background: '#111',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '7px 10px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: '#0e0e0e',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontFamily: "'DM Mono',monospace",
            fontSize: 10,
            letterSpacing: '0.1em',
            color: '#606060',
          }}
        >
          {icon}
          {label}
        </span>
        <div style={{ display: 'flex', gap: 3 }}>
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={isFirst}
            style={ctrlBtnStyle}
            aria-label="Move block up"
          >
            <ArrowUp size={12} />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={isLast}
            style={ctrlBtnStyle}
            aria-label="Move block down"
          >
            <ArrowDown size={12} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            style={{ ...ctrlBtnStyle, color: '#f87171' }}
            aria-label="Remove block"
          >
            <X size={12} />
          </button>
        </div>
      </div>
      {children}
    </div>
  )
}

interface TextBlockProps {
  block: CanvasBlockDraft
  isFirst: boolean
  isLast: boolean
  onContentChange: (v: string) => void
  onApplyWrap: (prefix: string, suffix?: string, placeholder?: string) => void
  onPrefixLines: (token: string) => void
  onInsertLink: () => void
  onMove: (dir: -1 | 1) => void
  onRemove: () => void
  textareaRef: (el: HTMLTextAreaElement | null) => void
}

function TextBlock({
  block,
  isFirst,
  isLast,
  onContentChange,
  onApplyWrap,
  onPrefixLines,
  onInsertLink,
  onMove,
  onRemove,
  textareaRef,
}: TextBlockProps) {
  return (
    <BlockShell
      label="TEXT"
      icon={<Type size={11} />}
      isFirst={isFirst}
      isLast={isLast}
      onMove={onMove}
      onRemove={onRemove}
    >
      <div
        style={{
          display: 'flex',
          gap: 4,
          alignItems: 'center',
          padding: '6px 8px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: '#0f0f0f',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => onApplyWrap('**')}
          style={toolBtnStyle}
          className="composer-tool-btn"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => onApplyWrap('*')}
          style={{ ...toolBtnStyle, fontStyle: 'italic' }}
          className="composer-tool-btn"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => onApplyWrap('<u>', '</u>')}
          style={{ ...toolBtnStyle, textDecoration: 'underline' }}
          className="composer-tool-btn"
        >
          <UnderlineIcon size={11} />
        </button>
        <button
          type="button"
          onClick={() => onPrefixLines('# ')}
          style={toolBtnStyle}
          className="composer-tool-btn"
        >
          <Pilcrow size={11} /> H1
        </button>
        <button
          type="button"
          onClick={() => onPrefixLines('- ')}
          style={toolBtnStyle}
          className="composer-tool-btn"
        >
          <ListIcon size={11} /> List
        </button>
        <button
          type="button"
          onClick={() => onPrefixLines('> ')}
          style={toolBtnStyle}
          className="composer-tool-btn"
        >
          Quote
        </button>
        <button
          type="button"
          onClick={onInsertLink}
          style={toolBtnStyle}
          className="composer-tool-btn"
        >
          <Link2 size={11} /> Link
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={block.content}
        onChange={e => onContentChange(e.target.value)}
        placeholder="Write something..."
        style={{
          width: '100%',
          minHeight: 140,
          border: 'none',
          outline: 'none',
          resize: 'vertical',
          background: '#111',
          color: '#e8e8e8',
          padding: '14px 14px',
          fontFamily: "'Space Grotesk',sans-serif",
          fontSize: 15,
          lineHeight: 1.7,
        }}
      />
    </BlockShell>
  )
}

interface ImageBlockProps {
  block: CanvasBlockDraft
  isFirst: boolean
  isLast: boolean
  onFileSelect: (file: File | null) => void
  onUrlChange: (url: string) => void
  onMove: (dir: -1 | 1) => void
  onRemove: () => void
}

function ImageBlock({
  block,
  isFirst,
  isLast,
  onFileSelect,
  onUrlChange,
  onMove,
  onRemove,
}: ImageBlockProps) {
  const preview = block.filePreview || (isLikelyHttpUrl(normalizeHttpUrl(block.content)) ? normalizeHttpUrl(block.content) : '')
  const showUrl = !block.file

  return (
    <BlockShell
      label="IMAGE"
      icon={<ImageIcon size={11} />}
      isFirst={isFirst}
      isLast={isLast}
      onMove={onMove}
      onRemove={onRemove}
    >
      <div style={{ padding: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
          <label
            className="composer-upload-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              border: '1px dashed rgba(255,255,255,0.18)',
              borderRadius: 5,
              padding: '8px 12px',
              color: '#b6b6b6',
              fontFamily: "'Space Grotesk',sans-serif",
              fontSize: 12,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <ImageIcon size={12} />
            Upload file
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={e => onFileSelect(e.target.files?.[0] ?? null)}
              style={{ display: 'none' }}
            />
          </label>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: '#484848' }}>or</span>
          {showUrl && (
            <input
              value={block.content}
              onChange={e => onUrlChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="composer-side-input"
              style={{ ...sideInputStyle, flex: 1, minWidth: 180 }}
            />
          )}
          {block.file && (
            <button
              type="button"
              onClick={() => onFileSelect(null)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(248,113,113,0.3)',
                borderRadius: 4,
                color: '#f87171',
                fontFamily: "'DM Mono',monospace",
                fontSize: 10,
                padding: '6px 10px',
                cursor: 'pointer',
              }}
            >
              Remove file
            </button>
          )}
        </div>
        {preview && (
          <div
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 5,
              overflow: 'hidden',
              background: '#0d0d0d',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              style={{ display: 'block', width: '100%', maxHeight: 280, objectFit: 'cover' }}
            />
          </div>
        )}
      </div>
    </BlockShell>
  )
}

interface LinkBlockProps {
  block: CanvasBlockDraft
  isFirst: boolean
  isLast: boolean
  onContentChange: (v: string) => void
  onMove: (dir: -1 | 1) => void
  onRemove: () => void
}

function LinkBlock({ block, isFirst, isLast, onContentChange, onMove, onRemove }: LinkBlockProps) {
  return (
    <BlockShell
      label="LINK"
      icon={<LinkIcon size={11} />}
      isFirst={isFirst}
      isLast={isLast}
      onMove={onMove}
      onRemove={onRemove}
    >
      <div style={{ padding: 12 }}>
        <input
          value={block.content}
          onChange={e => onContentChange(e.target.value)}
          placeholder="https://example.com"
          className="composer-side-input"
          style={sideInputStyle}
        />
      </div>
    </BlockShell>
  )
}

// ─── Main overlay ─────────────────────────────────────────────────────────────

export function ArchiveComposerOverlay({
  open,
  profileId,
  onClose,
  onSaved,
  initialDraft,
  editTarget,
}: ArchiveComposerOverlayProps) {
  const { showToast } = useToast()
  const [title, setTitle] = useState('')
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailContent, setThumbnailContent] = useState('')
  const [thumbnailPreview, setThumbnailPreview] = useState('')
  const [thumbPos, setThumbPos] = useState({ x: 50, y: 50 })
  const [isThumbRepositioning, setIsThumbRepositioning] = useState(false)
  const thumbPreviewRef = useRef<HTMLDivElement>(null)
  const thumbDragState = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null)
  const [blocks, setBlocks] = useState<CanvasBlockDraft[]>([newBlock('text')])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const textareaRefs = useRef(new Map<string, HTMLTextAreaElement>())
  const blocksRef = useRef(blocks)

  const isEditingExisting = Boolean(editTarget)

  const thumbnailPreviewRef = useRef(thumbnailPreview)

  useEffect(() => {
    blocksRef.current = blocks
  }, [blocks])

  useEffect(() => {
    thumbnailPreviewRef.current = thumbnailPreview
  }, [thumbnailPreview])

  // Cleanup all file previews on unmount
  useEffect(() => {
    return () => {
      for (const b of blocksRef.current) {
        if (b.filePreview) URL.revokeObjectURL(b.filePreview)
      }
      if (thumbnailPreviewRef.current) URL.revokeObjectURL(thumbnailPreviewRef.current)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    return lockBodyScroll()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, saving])

  // Hydrate from initialDraft / editTarget
  useEffect(() => {
    if (!open) return

    /* eslint-disable react-hooks/set-state-in-effect */
    // Revoke existing previews
    for (const b of blocksRef.current) {
      if (b.filePreview) URL.revokeObjectURL(b.filePreview)
    }
    if (thumbnailPreviewRef.current) {
      URL.revokeObjectURL(thumbnailPreviewRef.current)
      setThumbnailPreview('')
    }
    setThumbnailFile(null)
    setThumbnailContent(initialDraft?.thumbnailUrl ?? '')

    if (initialDraft?.blocks && initialDraft.blocks.length > 0) {
      // Extract title from first text block, rest become the canvas
      const [firstText, ...rest] = initialDraft.blocks
      if (firstText?.type === 'text') {
        setTitle(firstText.content)
        setBlocks(
          rest.length
            ? rest.map(b => ({ id: b.id || makeId(), type: b.type, content: b.content, ...(b.type === 'image' ? { file: null } : {}) }))
            : [newBlock('text')],
        )
      } else {
        setTitle('')
        setBlocks(initialDraft.blocks.map(b => ({ id: b.id || makeId(), type: b.type, content: b.content, ...(b.type === 'image' ? { file: null } : {}) })))
      }
    } else if (initialDraft) {
      setTitle(initialDraft.title ?? '')
      const legacyBlocks: CanvasBlockDraft[] = []
      if (hasUsefulContent(initialDraft.body))
        legacyBlocks.push(newBlock('text', initialDraft.body!))
      if (hasUsefulContent(initialDraft.imageUrl))
        legacyBlocks.push(newBlock('image', initialDraft.imageUrl!))
      if (hasUsefulContent(initialDraft.link))
        legacyBlocks.push(newBlock('link', initialDraft.link!))
      setBlocks(legacyBlocks.length ? legacyBlocks : [newBlock('text')])
    } else {
      setTitle('')
      setBlocks([newBlock('text')])
    }
    setError('')
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open, initialDraft, editTarget])

  const updateBlock = (id: string, updates: Partial<CanvasBlockDraft>) => {
    setBlocks(prev => prev.map(b => (b.id === id ? { ...b, ...updates } : b)))
  }

  const handleFileSelect = (id: string, file: File | null) => {
    const old = blocksRef.current.find(b => b.id === id)
    if (old?.filePreview) URL.revokeObjectURL(old.filePreview)
    const filePreview = file ? URL.createObjectURL(file) : undefined
    updateBlock(id, { file, filePreview, content: '' })
  }

  const removeBlock = (id: string) => {
    const block = blocksRef.current.find(b => b.id === id)
    if (block?.filePreview) URL.revokeObjectURL(block.filePreview)
    textareaRefs.current.delete(id)
    setBlocks(prev => prev.filter(b => b.id !== id))
  }

  const moveBlock = (id: string, dir: -1 | 1) => {
    setBlocks(prev => {
      const i = prev.findIndex(b => b.id === id)
      if (i < 0) return prev
      const j = i + dir
      if (j < 0 || j >= prev.length) return prev
      const clone = [...prev]
      const [moved] = clone.splice(i, 1)
      clone.splice(j, 0, moved)
      return clone
    })
  }

  const applyWrap = (id: string, prefix: string, suffix = prefix, placeholder = 'text') => {
    const textarea = textareaRefs.current.get(id)
    const current = blocksRef.current.find(b => b.id === id)?.content ?? ''
    if (!textarea) {
      updateBlock(id, { content: `${current}${prefix}${placeholder}${suffix}` })
      return
    }
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = current.slice(start, end) || placeholder
    updateBlock(id, {
      content: `${current.slice(0, start)}${prefix}${selected}${suffix}${current.slice(end)}`,
    })
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length)
    })
  }

  const prefixLines = (id: string, token: string) => {
    const textarea = textareaRefs.current.get(id)
    const current = blocksRef.current.find(b => b.id === id)?.content ?? ''
    if (!textarea) {
      updateBlock(id, { content: `${current}${token}List item` })
      return
    }
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = current.slice(start, end) || 'List item'
    const transformed = selected
      .split('\n')
      .map(l => `${token}${l}`)
      .join('\n')
    updateBlock(id, {
      content: `${current.slice(0, start)}${transformed}${current.slice(end)}`,
    })
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(start, start + transformed.length)
    })
  }

  const insertMarkdownLink = (id: string) => {
    const textarea = textareaRefs.current.get(id)
    const current = blocksRef.current.find(b => b.id === id)?.content ?? ''
    const defaultText = 'link text'
    const defaultUrl = 'https://example.com'

    if (!textarea) {
      updateBlock(id, { content: `${current}[${defaultText}](${defaultUrl})` })
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = current.slice(start, end).trim() || defaultText
    const replacement = `[${selected}](${defaultUrl})`

    updateBlock(id, {
      content: `${current.slice(0, start)}${replacement}${current.slice(end)}`,
    })

    requestAnimationFrame(() => {
      const urlStart = start + selected.length + 3
      textarea.focus()
      textarea.setSelectionRange(urlStart, urlStart + defaultUrl.length)
    })
  }

  const handleThumbDragStart = (e: React.MouseEvent) => {
    e.preventDefault()
    thumbDragState.current = { startX: e.clientX, startY: e.clientY, startPosX: thumbPos.x, startPosY: thumbPos.y }
    const onMove = (ev: MouseEvent) => {
      if (!thumbDragState.current || !thumbPreviewRef.current) return
      const rect = thumbPreviewRef.current.getBoundingClientRect()
      const dx = ((ev.clientX - thumbDragState.current.startX) / rect.width) * 100
      const dy = ((ev.clientY - thumbDragState.current.startY) / rect.height) * 100
      setThumbPos({
        x: Math.max(0, Math.min(100, thumbDragState.current.startPosX - dx)),
        y: Math.max(0, Math.min(100, thumbDragState.current.startPosY - dy)),
      })
    }
    const onUp = () => {
      thumbDragState.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const stopWithError = (message: string) => {
    setSaving(false)
    setError(message)
    showToast(message, 'error')
  }

  const save = async () => {
    setSaving(true)
    setError('')

    // Upload thumbnail file if set
    let resolvedThumbnail = thumbnailContent.trim()
    if (thumbnailFile) {
      const result = await uploadArchiveImage(thumbnailFile, profileId)
      if ('error' in result) {
        stopWithError(result.error)
        return
      }
      resolvedThumbnail = result.url
    }

    // Upload file-backed image blocks
    const resolved: CanvasBlockDraft[] = []
    for (const block of blocks) {
      if (block.type === 'image' && block.file) {
        const result = await uploadArchiveImage(block.file, profileId)
        if ('error' in result) {
          stopWithError(result.error)
          return
        }
        resolved.push({ ...block, content: result.url, file: null })
      } else {
        resolved.push(block)
      }
    }

    // Validate URL blocks before building canvas
    for (const block of resolved) {
      if (block.type === 'image' || block.type === 'link') {
        if (!hasUsefulContent(block.content)) continue
        if (!isLikelyHttpUrl(normalizeHttpUrl(block.content))) {
          stopWithError(
            block.type === 'image'
              ? 'One of your image blocks has an invalid URL.'
              : 'One of your link blocks has an invalid URL.',
          )
          return
        }
      }
    }

    // Build canvas — title always goes first if set
    const titleBlock: ArchiveCanvasBlock[] = title.trim()
      ? [{ id: 'title', type: 'text', content: title.trim() }]
      : []

    const bodyBlocks: ArchiveCanvasBlock[] = resolved
      .map(block => {
        const raw = block.content.trim()
        if (!raw) return null
        if (block.type === 'image' || block.type === 'link') {
          const url = normalizeHttpUrl(raw)
          if (!isLikelyHttpUrl(url)) return null
          return { id: block.id, type: block.type, content: url }
        }
        return { id: block.id, type: block.type, content: raw }
      })
      .filter((b): b is ArchiveCanvasBlock => b !== null)

    const canvas = [...titleBlock, ...bodyBlocks]

    if (canvas.length === 0) {
      stopWithError('Add at least one piece of content: text, link, or image.')
      return
    }

    const thumbnailArg = resolvedThumbnail && isLikelyHttpUrl(normalizeHttpUrl(resolvedThumbnail))
      ? normalizeHttpUrl(resolvedThumbnail)
      : undefined

    const result = editTarget
      ? await updateArchiveItemClient(editTarget.id, { canvas, thumbnail: thumbnailArg, thumbnailPosition: thumbPos })
      : await addArchiveItemClient({ canvas, thumbnail: thumbnailArg, thumbnailPosition: thumbPos })

    if ('error' in result) {
      stopWithError(result.error)
      return
    }

    // Cleanup previews before reset
    for (const b of blocksRef.current) {
      if (b.filePreview) URL.revokeObjectURL(b.filePreview)
    }

    setSaving(false)
    setTitle('')
    setThumbnailFile(null)
    setThumbnailContent('')
    setThumbnailPreview('')
    setBlocks([newBlock('text')])
    setError('')
    showToast(editTarget ? 'Archive item updated.' : 'Added to archive.', 'success')
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
              alignItems: 'flex-start',
              justifyContent: 'center',
              padding: '76px 24px 24px',
              overflowY: 'auto',
            }}
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              onClick={e => e.stopPropagation()}
              style={{
                width: 'min(860px, 100%)',
                maxHeight: 'calc(100vh - 112px)',
                display: 'flex',
                flexDirection: 'column',
                background: '#141414',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
              }}
            >
              {/* Sticky header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 22px',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(20,20,20,0.96)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '8px 8px 0 0',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    fontFamily: "'DM Mono',monospace",
                    fontSize: 11,
                    color: '#9b7ff8',
                    letterSpacing: '0.12em',
                  }}
                >
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

              {/* Scrollable canvas */}
              <div style={{ padding: '18px 22px 6px', overflowY: 'auto', flex: 1 }}>

                {/* Thumbnail / Cover Image */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: '#606060', letterSpacing: '0.1em', marginBottom: 8 }}>
                    COVER IMAGE
                  </div>
                  {(thumbnailPreview || (thumbnailContent && isLikelyHttpUrl(normalizeHttpUrl(thumbnailContent)))) ? (
                    <div
                      ref={thumbPreviewRef}
                      onMouseDown={isThumbRepositioning ? handleThumbDragStart : undefined}
                      style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#0d0d0d', marginBottom: 8, width: '100%', aspectRatio: '21 / 7', cursor: isThumbRepositioning ? 'grab' : 'default', userSelect: isThumbRepositioning ? 'none' : 'auto' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbnailPreview || normalizeHttpUrl(thumbnailContent)}
                        alt="Cover"
                        draggable={false}
                        style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${thumbPos.x}% ${thumbPos.y}%`, pointerEvents: 'none', transition: isThumbRepositioning ? 'none' : 'object-position 0.2s ease' }}
                      />
                      {isThumbRepositioning && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                          <span style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', fontFamily: "'Space Grotesk',sans-serif", fontSize: 11, padding: '4px 10px', borderRadius: 3, backdropFilter: 'blur(4px)' }}>Drag to reposition</span>
                        </div>
                      )}
                      <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
                        {!isThumbRepositioning && (
                          <button type="button" onClick={() => setIsThumbRepositioning(true)}
                            style={{ background: 'rgba(8,8,8,0.74)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 4, color: '#b6b6b6', padding: '5px 8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: "'DM Mono',monospace", fontSize: 10 }}>
                            <Move size={10} /> Reposition
                          </button>
                        )}
                        {isThumbRepositioning && (
                          <button type="button" onClick={() => setIsThumbRepositioning(false)}
                            style={{ background: 'rgba(8,8,8,0.74)', border: '1px solid rgba(155,127,248,0.4)', borderRadius: 4, color: '#9b7ff8', padding: '5px 8px', cursor: 'pointer', fontFamily: "'DM Mono',monospace", fontSize: 10 }}>
                            Done
                          </button>
                        )}
                        {!isThumbRepositioning && (
                          <button type="button"
                            onClick={() => { if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview); setThumbnailFile(null); setThumbnailContent(''); setThumbnailPreview(''); setThumbPos({ x: 50, y: 50 }) }}
                            style={{ background: 'rgba(8,8,8,0.74)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 4, color: '#f87171', padding: '5px 8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: "'DM Mono',monospace", fontSize: 10 }}>
                            <X size={10} /> Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <label
                        className="composer-upload-btn"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px dashed rgba(255,255,255,0.18)', borderRadius: 5, padding: '8px 12px', color: '#b6b6b6', fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, cursor: 'pointer', flexShrink: 0 }}
                      >
                        <ImageIcon size={12} /> Upload cover
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={e => {
                            const file = e.target.files?.[0] ?? null
                            if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview)
                            setThumbnailFile(file)
                            setThumbnailPreview(file ? URL.createObjectURL(file) : '')
                            setThumbnailContent('')
                          }}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: '#484848' }}>or</span>
                      <input
                        value={thumbnailContent}
                        onChange={e => {
                          if (thumbnailPreview) { URL.revokeObjectURL(thumbnailPreview); setThumbnailPreview(''); setThumbnailFile(null) }
                          setThumbnailContent(e.target.value)
                        }}
                        placeholder="https://example.com/cover.jpg"
                        className="composer-side-input"
                        style={{ ...sideInputStyle, flex: 1, minWidth: 180 }}
                      />
                    </div>
                  )}
                </div>

                {/* Title input */}
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Untitled"
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#f2f2f2',
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontWeight: 800,
                    fontSize: 'clamp(28px, 3.5vw, 46px)',
                    lineHeight: 1.05,
                    letterSpacing: '-0.02em',
                    marginBottom: 18,
                    padding: '0 2px',
                  }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {blocks.map((block, index) => {
                    const isFirst = index === 0
                    const isLast = index === blocks.length - 1

                    if (block.type === 'text') {
                      return (
                        <TextBlock
                          key={block.id}
                          block={block}
                          isFirst={isFirst}
                          isLast={isLast}
                          onContentChange={v => updateBlock(block.id, { content: v })}
                          onApplyWrap={(p, s, ph) => applyWrap(block.id, p, s, ph)}
                          onPrefixLines={t => prefixLines(block.id, t)}
                          onInsertLink={() => insertMarkdownLink(block.id)}
                          onMove={dir => moveBlock(block.id, dir)}
                          onRemove={() => removeBlock(block.id)}
                          textareaRef={el => {
                            if (el) textareaRefs.current.set(block.id, el)
                            else textareaRefs.current.delete(block.id)
                          }}
                        />
                      )
                    }

                    if (block.type === 'image') {
                      return (
                        <ImageBlock
                          key={block.id}
                          block={block}
                          isFirst={isFirst}
                          isLast={isLast}
                          onFileSelect={file => handleFileSelect(block.id, file)}
                          onUrlChange={url => {
                            const old = blocksRef.current.find(b => b.id === block.id)
                            if (old?.filePreview) URL.revokeObjectURL(old.filePreview)
                            updateBlock(block.id, { content: url, file: null, filePreview: undefined })
                          }}
                          onMove={dir => moveBlock(block.id, dir)}
                          onRemove={() => removeBlock(block.id)}
                        />
                      )
                    }

                    return (
                      <LinkBlock
                        key={block.id}
                        block={block}
                        isFirst={isFirst}
                        isLast={isLast}
                        onContentChange={v => updateBlock(block.id, { content: v })}
                        onMove={dir => moveBlock(block.id, dir)}
                        onRemove={() => removeBlock(block.id)}
                      />
                    )
                  })}
                </div>

                {/* Add block strip */}
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    marginTop: 14,
                    paddingTop: 14,
                    paddingBottom: 14,
                    borderTop: '1px dashed rgba(255,255,255,0.07)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setBlocks(prev => [...prev, newBlock('text')])}
                    className="add-block-btn"
                    style={addBlockBtnStyle}
                  >
                    <Type size={12} />
                    Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setBlocks(prev => [...prev, newBlock('image')])}
                    className="add-block-btn"
                    style={addBlockBtnStyle}
                  >
                    <ImageIcon size={12} />
                    Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setBlocks(prev => [...prev, newBlock('link')])}
                    className="add-block-btn"
                    style={addBlockBtnStyle}
                  >
                    <LinkIcon size={12} />
                    Link
                  </button>
                </div>
              </div>

              {/* Sticky footer */}
              <div
                style={{
                  padding: '14px 22px',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(14,14,14,0.96)',
                  borderRadius: '0 0 8px 8px',
                  flexShrink: 0,
                }}
              >
                {error && (
                  <div
                    style={{
                      fontFamily: "'DM Mono',monospace",
                      fontSize: 11,
                      color: '#f87171',
                      marginBottom: 10,
                    }}
                  >
                    {error}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
                    style={secondaryActionStyle}
                    className="composer-secondary-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={save}
                    disabled={saving}
                    style={primaryActionStyle}
                    className="composer-primary-btn"
                  >
                    {saving
                      ? isEditingExisting
                        ? 'Saving...'
                        : 'Publishing...'
                      : isEditingExisting
                        ? 'Save Changes'
                        : 'Publish to Archive'}
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
        .composer-side-input,
        .add-block-btn {
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
          outline: none;
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

        .add-block-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(155, 127, 248, 0.5);
          color: #9b7ff8;
          background: rgba(155, 127, 248, 0.06);
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.3);
        }

        .canvas-block {
          transition: box-shadow 0.15s ease;
        }

        .canvas-block:focus-within {
          box-shadow: 0 0 0 1px rgba(155, 127, 248, 0.25);
          border-color: rgba(155, 127, 248, 0.22) !important;
        }
      `}</style>
    </>
  )
}

const ctrlBtnStyle: CSSProperties = {
  width: 24,
  height: 24,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 4,
  background: 'transparent',
  color: '#606060',
  cursor: 'pointer',
  padding: 0,
}

const toolBtnStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 4,
  background: 'transparent',
  color: '#808080',
  padding: '4px 7px',
  fontFamily: "'DM Mono',monospace",
  fontSize: 10,
  cursor: 'pointer',
  fontWeight: 700,
}

const sideInputStyle: CSSProperties = {
  width: '100%',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 5,
  background: '#141414',
  color: '#e8e8e8',
  padding: '9px 11px',
  outline: 'none',
  fontFamily: "'Space Grotesk',sans-serif",
  fontSize: 13,
}

const addBlockBtnStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 5,
  background: 'transparent',
  color: '#707070',
  padding: '7px 12px',
  fontFamily: "'Space Grotesk',sans-serif",
  fontSize: 12,
  cursor: 'pointer',
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
