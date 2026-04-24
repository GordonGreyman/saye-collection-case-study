'use client'

import { SayeShell } from '@/features/handoff/shell'
import { AuthScreen } from '@/features/handoff/screens'

export default function LoginPage() {
  return <SayeShell current="auth">{(navigate) => <AuthScreen navigate={navigate} />}</SayeShell>
}
