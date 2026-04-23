'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface LoginFormProps {
  nextPath: string
}

export function LoginForm({ nextPath }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const supabase = createClient()

  const handleGoogle = async () => {
    setLoading(true)
    setError('')

    const callbackUrl = new URL('/auth/callback', window.location.origin)
    callbackUrl.searchParams.set('next', nextPath)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl.toString() },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const callbackUrl = new URL('/auth/callback', window.location.origin)
    callbackUrl.searchParams.set('next', nextPath)

    const { error } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: callbackUrl.toString(),
            },
          })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setLoading(false)
    router.replace(nextPath)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <h1 className="text-5xl font-heading font-bold text-text-primary tracking-widest">
            SAYE
          </h1>
          <p className="text-text-muted mt-3 text-sm tracking-wide uppercase">
            Discovery Engine
          </p>
        </div>

        <div className="bg-surface rounded-2xl p-8 border border-white/5">
          <Button
            variant="ghost"
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2.5 mb-6"
            disabled={loading}
          >
            <Globe size={16} />
            Continue with Google
          </Button>

          <div className="relative flex items-center mb-6">
            <div className="flex-1 border-t border-white/10" />
            <span className="px-4 text-xs text-text-muted">or</span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          <form onSubmit={handleEmail} className="flex flex-col gap-4">
            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="********"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-text-muted text-sm mt-6">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setMode(m => (m === 'signin' ? 'signup' : 'signin'))}
              className="text-accent hover:underline"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
