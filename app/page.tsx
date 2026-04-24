'use client'

import { SayeShell } from '@/features/handoff/shell'
import { LandingScreen } from '@/features/handoff/screens'

export default function LandingPage() {
  return <SayeShell current="landing">{(navigate) => <LandingScreen navigate={navigate} />}</SayeShell>
}
