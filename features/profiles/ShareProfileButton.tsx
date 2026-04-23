'use client'

import { useToast } from '@/components/ui/ToastProvider'

interface ShareProfileButtonProps {
  profileId: string
}

export function ShareProfileButton({ profileId }: ShareProfileButtonProps) {
  const { showToast } = useToast()

  const onCopy = async () => {
    const url = `${window.location.origin}/profile/${profileId}`
    try {
      await navigator.clipboard.writeText(url)
      showToast('Profile link copied.', 'success')
    } catch {
      showToast('Unable to copy link in this browser.', 'error')
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="px-4 py-2 rounded-lg border border-white/10 text-text-muted hover:text-text-primary hover:border-accent text-sm transition-colors"
    >
      Share Profile
    </button>
  )
}
