'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { buildDiscoverUrl, type DiscoverFilters } from '@/features/discover/filters'
import type { FilterOptions } from '@/features/discover/queries'

interface FilterBarProps {
  filters: DiscoverFilters
  filterOptions: FilterOptions
}

function toggleFilter(values: string[], value: string) {
  return values.includes(value) ? values.filter(item => item !== value) : [...values, value]
}

type GroupId = 'geo' | 'disc' | 'int'

const groups: { id: GroupId; label: string; category: 'geography' | 'discipline' | 'interests' }[] = [
  { id: 'geo', label: 'Geography', category: 'geography' },
  { id: 'disc', label: 'Discipline', category: 'discipline' },
  { id: 'int', label: 'Interests', category: 'interests' },
]

export function FilterBar({ filters, filterOptions }: FilterBarProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const [openGroup, setOpenGroup] = useState<GroupId>('geo')
  const [search, setSearch] = useState(filters.q)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSearch(filters.q)
  }, [filters.q])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (filters.q === search.trim()) return
      window.history.replaceState(
        null,
        '',
        buildDiscoverUrl({ ...filters, q: search.trim(), page: 1 }),
      )
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [filters, search])

  const updateFilters = (nextFilters: DiscoverFilters) => {
    startTransition(() => {
      router.replace(buildDiscoverUrl(nextFilters))
    })
  }

  const onToggle = (category: 'geography' | 'discipline' | 'interests', value: string) => {
    updateFilters({ ...filters, [category]: toggleFilter(filters[category], value), page: 1 })
  }

  const clearAll = () =>
    updateFilters({ geography: [], discipline: [], interests: [], q: '', sort: 'newest', page: 1 })

  const totalActive = filters.geography.length + filters.discipline.length + filters.interests.length

  const optionsMap: Record<GroupId, string[]> = {
    geo: filterOptions.geographies,
    disc: filterOptions.disciplines,
    int: filterOptions.interests,
  }
  const selectedMap: Record<GroupId, string[]> = {
    geo: filters.geography,
    disc: filters.discipline,
    int: filters.interests,
  }

  return (
    <div style={{ marginBottom: 36, opacity: isPending ? 0.6 : 1, transition: 'opacity 0.18s' }}>
      {/* Search bar */}
      <form
        style={{ position: 'relative', marginBottom: 28, maxWidth: 600 }}
        onSubmit={e => {
          e.preventDefault()
          updateFilters({ ...filters, q: search.trim(), page: 1 })
        }}
      >
        <input
          ref={searchInputRef}
          name="q"
          type="search"
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Search by name, discipline, keyword…"
          style={{
            width: '100%', boxSizing: 'border-box', background: '#111111',
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: 4,
            padding: '14px 48px 14px 20px', color: '#f0f0f0',
            fontFamily: 'var(--font-heading)', fontSize: 14, outline: 'none',
          }}
        />
        <span style={{
          position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)',
          fontFamily: 'var(--font-mono)', fontSize: 10, color: '#333', pointerEvents: 'none',
        }}>
          ⌘K
        </span>
      </form>

      {/* Tab accordion */}
      <div style={{
        background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, marginBottom: 16,
      }}>
        {/* Group tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {groups.map(g => {
            const count = selectedMap[g.id].length
            const isOpen = openGroup === g.id
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setOpenGroup(g.id)}
                style={{
                  padding: '12px 24px', background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
                  color: isOpen ? '#9b7ff8' : '#444',
                  borderBottom: `2px solid ${isOpen ? '#9b7ff8' : 'transparent'}`,
                  marginBottom: -1, transition: 'all 0.18s',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                {g.label.toUpperCase()}
                {count > 0 && (
                  <span style={{
                    background: '#9b7ff8', color: '#080808', borderRadius: 100,
                    width: 16, height: 16, display: 'inline-flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 8, fontWeight: 700,
                  }}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
          {totalActive > 0 && (
            <button
              type="button"
              onClick={clearAll}
              style={{
                marginLeft: 'auto', padding: '12px 20px', background: 'none', border: 'none',
                cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 9,
                letterSpacing: '0.08em', color: '#3a3a3a',
              }}
            >
              CLEAR ALL ×
            </button>
          )}
        </div>

        {/* Chips panel */}
        <div style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {optionsMap[openGroup].map(chip => {
            const active = selectedMap[openGroup].includes(chip)
            const cat = groups.find(g => g.id === openGroup)!.category
            return (
              <button
                key={chip}
                type="button"
                onClick={() => onToggle(cat, chip)}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
                  padding: '6px 14px', borderRadius: 100,
                  border: `1px solid ${active ? '#9b7ff8' : 'rgba(255,255,255,0.07)'}`,
                  background: active ? 'rgba(155,127,248,0.12)' : 'transparent',
                  color: active ? '#9b7ff8' : '#555',
                  cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}
              >
                {chip}
              </button>
            )
          })}
          {optionsMap[openGroup].length === 0 && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#333', letterSpacing: '0.08em' }}>
              No options yet
            </span>
          )}
        </div>
      </div>

      {/* Active filter summary */}
      {totalActive > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#333', letterSpacing: '0.08em' }}>
            FILTERING:
          </span>
          {[...filters.geography, ...filters.discipline, ...filters.interests].map(f => (
            <span
              key={f}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, color: '#9b7ff8',
                background: 'rgba(155,127,248,0.08)', border: '1px solid rgba(155,127,248,0.2)',
                padding: '3px 10px', borderRadius: 100,
              }}
            >
              {f}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
