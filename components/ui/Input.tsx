'use client'

import { useState } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  mono?: boolean
}

export function Input({ label, error, id, mono, className = '', ...props }: InputProps) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} className={className}>
      {label && (
        <label htmlFor={id} style={{
          fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em',
          color: '#555', textTransform: 'uppercase',
        }}>
          {label}
        </label>
      )}
      <input
        id={id}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          background: '#0c0c0c',
          border: `1px solid ${focused ? 'rgba(155,127,248,0.45)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 3, padding: '12px 16px', color: '#f0f0f0',
          fontFamily: mono ? 'var(--font-mono)' : 'var(--font-heading)',
          fontSize: mono ? 12 : 14, outline: 'none', width: '100%',
          boxSizing: 'border-box', transition: 'border-color 0.18s',
          boxShadow: focused ? '0 0 0 3px rgba(155,127,248,0.06)' : 'none',
        }}
        {...props}
      />
      {error && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#f87171', letterSpacing: '0.04em' }}>
          {error}
        </p>
      )}
    </div>
  )
}
