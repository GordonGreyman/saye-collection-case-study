import Link from 'next/link'
import { buildDiscoverUrl, DISCOVER_PAGE_SIZE, parseDiscoverFilters } from '@/features/discover/filters'
import { getFilterOptions, getProfiles } from '@/features/discover/queries'
import { FilterBar } from '@/features/discover/FilterBar'
import { ProfileCard } from '@/features/discover/ProfileCard'
import { EmptyState } from '@/features/discover/EmptyState'

interface DiscoverPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const params = await searchParams
  const filters = parseDiscoverFilters(params)

  const [{ profiles, total }, filterOptions] = await Promise.all([getProfiles(filters), getFilterOptions()])
  const totalPages = Math.max(1, Math.ceil(total / DISCOVER_PAGE_SIZE))
  const hasPrev = filters.page > 1
  const hasNext = filters.page < totalPages

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-5xl font-heading font-bold text-text-primary">DISCOVER</h1>
        <p className="text-text-muted text-sm mt-2">Find artists, curators, and institutions.</p>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-text-muted">{filterOptions.newThisWeek} new this week</span>
        </div>
      </header>

      <FilterBar filters={filters} filterOptions={filterOptions} />

      {profiles.length === 0 && filterOptions.totalProfiles === 0 && <EmptyState variant="no-profiles" />}

      {profiles.length === 0 && filterOptions.totalProfiles > 0 && <EmptyState variant="no-results" />}

      {profiles.length > 0 && (
        <>
          <p className="text-sm text-text-muted mb-4">
            Showing page {filters.page} of {totalPages} ({total} results)
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile, index) => (
              <ProfileCard key={profile.id} profile={profile} index={index} />
            ))}
          </div>
          <div className="flex items-center justify-between mt-6">
            {hasPrev ? (
              <Link
                href={buildDiscoverUrl({ ...filters, page: filters.page - 1 })}
                className="px-4 py-2 rounded-lg border border-white/10 text-sm text-text-muted hover:text-text-primary hover:border-accent transition-colors"
              >
                Previous
              </Link>
            ) : (
              <span />
            )}

            {hasNext ? (
              <Link
                href={buildDiscoverUrl({ ...filters, page: filters.page + 1 })}
                className="px-4 py-2 rounded-lg border border-white/10 text-sm text-text-muted hover:text-text-primary hover:border-accent transition-colors"
              >
                Next
              </Link>
            ) : (
              <span />
            )}
          </div>
        </>
      )}
    </div>
  )
}
