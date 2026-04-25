'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { AddBlockPanel } from '@/features/archive/AddBlockPanel'
import { ArchiveItem } from '@/features/archive/ArchiveItem'
import { PostDetailOverlay } from '@/features/archive/PostDetailOverlay'
import type { ArchiveItem as ArchiveItemType } from '@/lib/types'

interface ArchiveGridProps {
  items: ArchiveItemType[]
  isOwner: boolean
  profileId: string
}

export function ArchiveGrid({ items, isOwner, profileId }: ArchiveGridProps) {
  const [selectedItem, setSelectedItem] = useState<ArchiveItemType | null>(null)

  if (items.length === 0) {
    return (
      <section className="mt-8">
        {isOwner ? (
          <div className="text-center py-10">
            <h2 className="text-3xl font-heading text-text-primary">Your archive is empty.</h2>
            <p className="text-text-muted mt-2 mb-5">Add your first piece.</p>
            <div className="max-w-xl mx-auto">
              <AddBlockPanel profileId={profileId} isOwner defaultOpen />
            </div>
          </div>
        ) : (
          <p className="text-text-muted text-center py-14">Nothing here yet.</p>
        )}
      </section>
    )
  }

  return (
    <section className="mt-8">
      <AddBlockPanel profileId={profileId} isOwner={isOwner} />
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
        {items.map(item => (
          <div key={item.id} className="break-inside-avoid mb-4">
            <ArchiveItem
              item={item}
              isOwner={isOwner}
              onExpand={() => setSelectedItem(item)}
            />
          </div>
        ))}
      </div>
      <AnimatePresence>
        {selectedItem && (
          <PostDetailOverlay
            key={selectedItem.id}
            item={selectedItem}
            items={items}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
