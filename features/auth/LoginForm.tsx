'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface LoginFormProps {
  nextPath: string
}

export function LoginForm({ nextPath }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
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
    if (error) { setError(error.message); setLoading(false) }
  }

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const callbackUrl = new URL('/auth/callback', window.location.origin)
    callbackUrl.searchParams.set('next', nextPath)

    const { error } = mode === 'signin'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: callbackUrl.toString() } })

    if (error) { setError(error.message); setLoading(false); return }
    setLoading(false)
    router.replace(nextPath)
    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#080808',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px',
    }}>
      {/* Glow */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(91,63,212,0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, letterSpacing: '0.16em', color: '#f0f0f0' }}>
            SAYE
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', color: '#9b7ff8', marginTop: 4 }}>
            COLLECTIVE
          </div>
        </div>

        {/* Toggle pill */}
        <div style={{
          display: 'flex', background: '#111111',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 4, marginBottom: 32, padding: 3,
        }}>
          {(['signin', 'signup'] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError('') }}
              style={{
                flex: 1, padding: '9px 0',
                background: mode === m ? 'rgba(155,127,248,0.12)' : 'transparent',
                border: `1px solid ${mode === m ? 'rgba(155,127,248,0.25)' : 'transparent'}`,
                borderRadius: 3,
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
                color: mode === m ? '#9b7ff8' : '#444',
                cursor: 'pointer', transition: 'all 0.18s',
              }}
            >
              {m === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>
          ))}
        </div>

        <form onSubmit={handleEmail} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'signup' && (
            <SayeInput
              label="Full Name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          )}
          <SayeInput
            label="Email"
            type="email"
            placeholder="hello@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <SayeInput
            label="Password"
            type="password"
            placeholder="········"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {mode === 'signin' && (
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#3a3a3a', cursor: 'pointer', letterSpacing: '0.06em' }}>
                Forgot password?
              </span>
            </div>
          )}
          {error && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#f87171', letterSpacing: '0.04em' }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8, width: '100%', padding: '13px',
              background: loading ? 'rgba(155,127,248,0.5)' : '#9b7ff8',
              border: 'none', borderRadius: 3, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13,
              letterSpacing: '0.07em', color: '#080808', transition: 'background 0.18s',
            }}
          >
            {loading ? 'LOADING…' : mode === 'signin' ? 'SIGN IN →' : 'CREATE ACCOUNT →'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '28px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#333', letterSpacing: '0.08em' }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: '100%', padding: '12px',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 3, color: '#555',
            fontFamily: 'var(--font-heading)', fontSize: 13,
            cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.18s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = '#c8c8c8' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#555' }}
        >
          Continue with Google
        </button>

        {/* Footer switch */}
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#333', letterSpacing: '0.06em' }}>
            {mode === 'signin' ? 'New here? ' : 'Already a member? '}
          </span>
          <button
            type="button"
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: 9, color: '#9b7ff8', letterSpacing: '0.06em',
            }}
          >
            {mode === 'signin' ? 'Create account' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}

function SayeInput({
  label, type = 'text', placeholder, value, onChange, required, minLength,
}: {
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  minLength?: number
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: '#555', textTransform: 'uppercase' }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          background: '#0c0c0c',
          border: `1px solid ${focused ? 'rgba(155,127,248,0.45)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 3, padding: '12px 16px', color: '#f0f0f0',
          fontFamily: 'var(--font-heading)', fontSize: 14, outline: 'none',
          width: '100%', boxSizing: 'border-box', transition: 'border-color 0.18s',
          boxShadow: focused ? '0 0 0 3px rgba(155,127,248,0.06)' : 'none',
        }}
      />
    </div>
  )
}
