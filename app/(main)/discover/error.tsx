'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

interface DiscoverErrorProps {
  error: Error & { digest?: string }
  unstable_retry: () => void
}

export default function DiscoverError({ error, unstable_retry }: DiscoverErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
      <h2 className="text-3xl font-heading text-text-primary">Something went wrong.</h2>
      <Button type="button" variant="ghost" className="mt-4" onClick={() => unstable_retry()}>
        Retry
      </Button>
    </div>
  )
}
