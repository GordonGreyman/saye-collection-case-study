'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

interface EmptyStateProps {
  variant: 'no-profiles' | 'no-results'
}

export function EmptyState({ variant }: EmptyStateProps) {
  const router = useRouter()

  if (variant === 'no-profiles') {
    return (
      <div className="text-center py-20">
        <h2 className="text-4xl font-heading text-white/20">Be the first to join Saye.</h2>
        <p className="text-text-muted mt-3">Build your profile and get discovered.</p>
        <div className="mt-6">
          <Link
            href="/build-profile"
            className="inline-flex px-6 py-3 rounded-lg bg-accent text-white hover:bg-purple-700 text-sm font-semibold transition-colors"
          >
            Join Saye
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center py-20">
      <h2 className="text-6xl font-heading text-white/10">Nothing found.</h2>
      <p className="text-text-muted mt-3">Try removing a filter.</p>
      <div className="mt-6">
        <Button variant="ghost" type="button" onClick={() => router.replace('/discover')}>
          Clear filters
        </Button>
      </div>
    </div>
  )
}
