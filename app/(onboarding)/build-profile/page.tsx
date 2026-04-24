'use client'

import { SayeShell } from '@/features/handoff/shell'
import { BuildProfileScreen } from '@/features/handoff/screens'

export default function BuildProfilePage() {
  return <SayeShell current="build-profile">{(navigate) => <BuildProfileScreen navigate={navigate} />}</SayeShell>
}
