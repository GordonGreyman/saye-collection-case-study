import { SayeShell } from '@/features/handoff/shell'
import { sanitizeNextPath } from '@/lib/auth/next-path'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>
}) {
  const params = await searchParams
  const nextPath = sanitizeNextPath(Array.isArray(params.next) ? params.next[0] : params.next)

  return (
    <SayeShell
      current="auth"
      screenProps={{ nextPath }}
    />
  )
}
