import type {
  ArchiveCanvasBlock,
  ArchiveCanvasBlockType,
  ArchiveItem,
  ArchiveItemType,
} from '@/lib/types'

export type ArchiveEntryResolved = {
  title: string
  body: string
  imageUrl: string
  thumbnailUrl: string
  referenceUrl: string
  primaryType: ArchiveItemType
  blocks: ArchiveCanvasBlock[]
}

type ArchiveEntrySource = Pick<ArchiveItem, 'type' | 'content'>

function clean(value?: string | null) {
  return (value ?? '').trim()
}

export function hasUsefulContent(value: string | null | undefined) {
  return Boolean(value && value.trim())
}

export function normalizeHttpUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export function isLikelyHttpUrl(value: string) {
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

export function domainFromUrl(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, '')
  } catch {
    return value
  }
}

function splitLegacyText(content: string) {
  const normalized = content.replace(/\r\n/g, '\n').trim()
  if (!normalized) {
    return { title: '', body: '' }
  }
  const [head = '', ...rest] = normalized.split('\n\n')
  return { title: head, body: rest.join('\n\n') }
}

function normalizeBlockType(value: unknown): ArchiveCanvasBlockType | null {
  return value === 'text' || value === 'image' || value === 'link' ? value : null
}

function ensureBlockId(index: number, id?: string) {
  const normalized = (id ?? '').trim()
  return normalized || `block-${index + 1}`
}

export function sanitizeCanvasBlocks(input: unknown): ArchiveCanvasBlock[] {
  if (!Array.isArray(input)) {
    return []
  }

  return (input as unknown[])
    .map((block, index) => {
      if (!block || typeof block !== 'object') return null
      const b = block as Record<string, unknown>
      const type = normalizeBlockType(b.type)
      const content = clean(b.content as string | null | undefined)
      if (!type || !content) return null

      if (type === 'image' || type === 'link') {
        const normalizedUrl = normalizeHttpUrl(content)
        if (!isLikelyHttpUrl(normalizedUrl)) return null
        return { id: ensureBlockId(index, b.id as string | undefined), type, content: normalizedUrl }
      }

      return { id: ensureBlockId(index, b.id as string | undefined), type, content }
    })
    .filter((block): block is ArchiveCanvasBlock => Boolean(block))
}

type ParsedCanvas = { blocks: ArchiveCanvasBlock[]; thumbnailUrl: string }

// Detect canvas stored as JSON in the content field (new format).
function tryParseCanvasFromContent(content: string): ParsedCanvas | null {
  if (!content.startsWith('{')) return null
  try {
    const parsed = JSON.parse(content) as Record<string, unknown>
    if (parsed._v === 1 && Array.isArray(parsed.blocks)) {
      const blocks = sanitizeCanvasBlocks(parsed.blocks)
      const rawThumb = typeof parsed.thumbnail === 'string' ? normalizeHttpUrl(parsed.thumbnail) : ''
      const thumbnailUrl = rawThumb && isLikelyHttpUrl(rawThumb) ? rawThumb : ''
      return { blocks, thumbnailUrl }
    }
  } catch {
    // not JSON — fall through to legacy parser
  }
  return null
}

function buildCanvasFromLegacyContent(item: ArchiveEntrySource): ArchiveCanvasBlock[] {
  const blocks: ArchiveCanvasBlock[] = []

  if (item.type === 'text') {
    const { title, body } = splitLegacyText(clean(item.content))
    if (title) blocks.push({ id: 'title', type: 'text', content: title })
    if (body) {
      body
        .split(/\n{2,}/)
        .map(p => p.trim())
        .filter(Boolean)
        .forEach((part, i) => {
          blocks.push({ id: `body-${i + 1}`, type: 'text', content: part })
        })
    }
    return blocks
  }

  if (item.type === 'image') {
    const url = normalizeHttpUrl(clean(item.content))
    if (isLikelyHttpUrl(url)) {
      blocks.push({ id: 'image-1', type: 'image', content: url })
    }
    return blocks
  }

  if (item.type === 'link') {
    const url = normalizeHttpUrl(clean(item.content))
    if (isLikelyHttpUrl(url)) {
      blocks.push({ id: 'link-1', type: 'link', content: url })
    }
    return blocks
  }

  return blocks
}

export function summarizeCanvasBlocks(blocks: ArchiveCanvasBlock[]) {
  const textBlocks = blocks.filter(b => b.type === 'text').map(b => clean(b.content))
  const imageBlock = blocks.find(b => b.type === 'image')
  const linkBlock = blocks.find(b => b.type === 'link')

  const title = textBlocks[0] || ''
  const body = textBlocks.slice(1).join('\n\n')
  const imageUrl = imageBlock ? normalizeHttpUrl(imageBlock.content) : ''
  const referenceUrl = linkBlock ? normalizeHttpUrl(linkBlock.content) : ''

  let primaryType: ArchiveItemType = 'text'
  if (referenceUrl) primaryType = 'link'
  else if (imageUrl) primaryType = 'image'

  return { title, body, imageUrl, referenceUrl, primaryType }
}

export function resolveArchiveEntry(item: ArchiveEntrySource): ArchiveEntryResolved {
  const content = clean(item.content)

  // New format: canvas stored as JSON in content
  const parsed = tryParseCanvasFromContent(content)

  const blocks = parsed ? parsed.blocks : buildCanvasFromLegacyContent(item)
  const thumbnailUrl = parsed?.thumbnailUrl ?? ''
  const summary = summarizeCanvasBlocks(blocks)

  const resolvedTitle =
    summary.title ||
    (summary.primaryType === 'link'
      ? domainFromUrl(summary.referenceUrl)
      : summary.primaryType === 'image'
        ? 'Archive image'
        : 'Archive note')

  return {
    title: resolvedTitle,
    body: summary.body,
    imageUrl: summary.imageUrl,
    thumbnailUrl,
    referenceUrl: summary.referenceUrl,
    primaryType: summary.primaryType,
    blocks,
  }
}

export function draftFromArchiveEntry(item: ArchiveEntrySource) {
  const entry = resolveArchiveEntry(item)
  return {
    title: entry.title === 'Archive image' || entry.title === 'Archive note' ? '' : entry.title,
    body: entry.body,
    link: entry.referenceUrl,
    imageUrl: entry.imageUrl,
    thumbnailUrl: entry.thumbnailUrl,
    blocks: entry.blocks,
  }
}
