const DEFAULT_NEXT_PATH = '/discover'

export function sanitizeNextPath(nextPath?: string | null) {
  if (!nextPath) {
    return DEFAULT_NEXT_PATH
  }

  if (!nextPath.startsWith('/') || nextPath.startsWith('//')) {
    return DEFAULT_NEXT_PATH
  }

  return nextPath
}
