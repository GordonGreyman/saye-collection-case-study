'use client'

import { SayeShell } from '@/features/handoff/shell'
import { ProfileScreen } from '@/features/handoff/screens'

export default function ProfilePage() {
  return <SayeShell current="profile">{(navigate) => <ProfileScreen navigate={navigate} />}</SayeShell>
}
