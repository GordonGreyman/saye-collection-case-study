'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { buildDiscoverUrl, type DiscoverFilters } from '@/features/discover/filters'
import type { FilterOptions } from '@/features/discover/queries'

interface FilterBarProps {
  filters: DiscoverFilters
  filterOptions: FilterOptions
}

function toggleFilter(values: string[], value: string) {
  if (values.includes(value)) {
    return values.filter(item => item !== value)
  }

  return [...values, value]
}

export function FilterBar({ filters, filterOptions }: FilterBarProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const updateFilters = (nextFilters: DiscoverFilters) => {
    startTransition(() => {
      router.replace(buildDiscoverUrl(nextFilters))
    })
  }

  const onToggle = (category: 'geography' | 'discipline' | 'interests', value: string) => {
    const nextFilters: DiscoverFilters = {
      ...filters,
      [category]: toggleFilter(filters[category], value),
      page: 1,
    }

    updateFilters(nextFilters)
  }

  return (
    <div className="space-y-4 mb-8">
      <form
        className="grid md:grid-cols-[1fr_auto_auto] gap-2"
        onSubmit={event => {
          event.preventDefault()
          const formData = new FormData(event.currentTarget)
          const q = String(formData.get('q') ?? '').trim()
          updateFilters({ ...filters, q, page: 1 })
        }}
      >
        <input
          name="q"
          key={filters.q}
          type="search"
          defaultValue={filters.q}
          placeholder="Search names, disciplines, geographies..."
          className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          Search
        </button>
        <select
          value={filters.sort}
          onChange={e =>
            updateFilters({
              ...filters,
              sort: e.target.value as DiscoverFilters['sort'],
              page: 1,
            })
          }
          className="bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="newest">Newest</option>
          <option value="name_asc">Name A-Z</option>
          <option value="name_desc">Name Z-A</option>
        </select>
      </form>

      <FilterRow
        label="Geography"
        options={filterOptions.geographies}
        selected={filters.geography}
        isPending={isPending}
        onToggle={value => onToggle('geography', value)}
      />
      <FilterRow
        label="Discipline"
        options={filterOptions.disciplines}
        selected={filters.discipline}
        isPending={isPending}
        onToggle={value => onToggle('discipline', value)}
      />
      <FilterRow
        label="Interests"
        options={filterOptions.interests}
        selected={filters.interests}
        isPending={isPending}
        onToggle={value => onToggle('interests', value)}
      />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() =>
            updateFilters({
              geography: [],
              discipline: [],
              interests: [],
              q: '',
              sort: 'newest',
              page: 1,
            })
          }
          className="text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          Clear all
        </button>
      </div>
    </div>
  )
}

interface FilterRowProps {
  label: string
  options: string[]
  selected: string[]
  isPending: boolean
  onToggle: (value: string) => void
}

function FilterRow({ label, options, selected, isPending, onToggle }: FilterRowProps) {
  if (options.length === 0) {
    return null
  }

  return (
    <div className={`${isPending ? 'opacity-50' : ''} transition-opacity`}>
      <p className="text-xs uppercase tracking-wider text-text-muted mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(option => {
          const active = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`px-3 py-1.5 rounded-full border text-sm transition ${
                active
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white/5 border-white/10 text-text-muted hover:border-accent'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}
