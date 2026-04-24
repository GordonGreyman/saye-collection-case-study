'use client'

import { SayeShell } from '@/features/handoff/shell'
import { ArchiveScreen } from '@/features/handoff/screens'

export default function ArchivePage() {
  return <SayeShell current="archive">{(navigate) => <ArchiveScreen navigate={navigate} />}</SayeShell>
}
