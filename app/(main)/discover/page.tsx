import { SayeShell } from '@/features/handoff/shell'
import { parseDiscoverFilters, type DiscoverSearchParams } from '@/features/discover/filters'
import { getFilterOptions, getInFocusData, getProfiles } from '@/features/discover/queries'
import { getHandoffNavState } from '@/features/handoff/server'

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<DiscoverSearchParams>
}) {
  const params = await searchParams
  const filters = parseDiscoverFilters(params)
  const [profilesResult, filterOptions, navState, inFocusData] = await Promise.all([
    getProfiles(filters),
    getFilterOptions(),
    getHandoffNavState(),
    getInFocusData(),
  ])

  return (
    <SayeShell
      current="discover"
      navState={navState}
      screenProps={{
        profiles: profilesResult.profiles,
        filterOptions,
        filters,
        totalProfiles: profilesResult.total,
        inFocusData,
      }}
    />
  )
}
