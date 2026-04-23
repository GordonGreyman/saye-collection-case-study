'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface ProfileErrorProps {
  error: Error & { digest?: string }
  unstable_retry: () => void
}

export default function ProfileError({ error, unstable_retry }: ProfileErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
      <h2 className="text-3xl font-heading text-text-primary">Profile unavailable.</h2>
      <div className="flex items-center gap-3 mt-5">
        <Button type="button" variant="ghost" onClick={() => unstable_retry()}>
          Retry
        </Button>
        <Link href="/discover" className="text-text-muted hover:text-text-primary text-sm">
          Back to Discover
        </Link>
      </div>
    </div>
  )
}
