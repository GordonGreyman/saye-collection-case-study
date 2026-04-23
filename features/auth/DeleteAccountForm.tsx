'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/ToastProvider'

export function DeleteAccountForm() {
  const [confirmationText, setConfirmationText] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()
  const supabase = createClient()

  const onDelete = async () => {
    setError('')
    setIsDeleting(true)

    const response = await fetch('/api/account/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmationText, password }),
    })

    const payload = (await response.json()) as { error?: string; success?: boolean }
    if (!response.ok || !payload.success) {
      setError(payload.error ?? 'Unable to delete account right now.')
      showToast(payload.error ?? 'Unable to delete account right now.', 'error')
      setIsDeleting(false)
      return
    }

    await supabase.auth.signOut()
    showToast('Your account has been deleted.', 'success')
    router.replace('/discover')
    router.refresh()
  }

  return (
    <section className="bg-surface border border-red-500/30 rounded-xl p-6 mt-8">
      <h2 className="text-2xl font-heading text-red-400">Delete Account</h2>
      <p className="text-text-muted mt-2 text-sm">
        This permanently removes your account and related profile/archive data.
      </p>

      <div className="mt-4 space-y-3">
        <Input
          id="delete-confirmation"
          label="Type DELETE to confirm"
          value={confirmationText}
          onChange={e => setConfirmationText(e.target.value)}
          placeholder="DELETE"
        />
        <Input
          id="delete-password"
          label="Current password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Your password"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>

      <div className="mt-5">
        <Button type="button" onClick={onDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-500">
          {isDeleting ? 'Deleting...' : 'Delete my account'}
        </Button>
      </div>
    </section>
  )
}
