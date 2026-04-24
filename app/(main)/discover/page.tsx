'use client'

import { SayeShell } from '@/features/handoff/shell'
import { DiscoverScreen } from '@/features/handoff/screens'

export default function DiscoverPage() {
  return <SayeShell current="discover">{(navigate) => <DiscoverScreen navigate={navigate} />}</SayeShell>
}
