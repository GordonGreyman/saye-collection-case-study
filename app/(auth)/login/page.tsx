import { LoginForm } from '@/features/auth/LoginForm'
import { sanitizeNextPath } from '@/lib/auth/next-path'

interface LoginPageProps {
  searchParams: Promise<{ next?: string | string[] }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const rawNext = Array.isArray(params.next) ? params.next[0] : params.next
  const nextPath = sanitizeNextPath(rawNext)

  return <LoginForm nextPath={nextPath} />
}
