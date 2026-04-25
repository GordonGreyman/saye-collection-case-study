import { SayeShell } from '@/features/handoff/shell'
import { getHandoffNavState } from '@/features/handoff/server'

export default async function LandingPage() {
  const navState = await getHandoffNavState()

  return <SayeShell current="landing" navState={navState} />
}
