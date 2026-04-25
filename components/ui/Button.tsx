'use client'

import { useState } from 'react'
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  full?: boolean
}

const variants: Record<Variant, { default: React.CSSProperties; hover: React.CSSProperties }> = {
  primary: {
    default: { background: '#9b7ff8', color: '#080808', padding: '13px 32px' },
    hover: { background: '#b49fff', color: '#080808', padding: '13px 32px' },
  },
  secondary: {
    default: { background: 'transparent', color: '#666', padding: '13px 32px', border: '1px solid rgba(255,255,255,0.1)' },
    hover: { background: 'transparent', color: '#f0f0f0', padding: '13px 32px', border: '1px solid rgba(255,255,255,0.18)' },
  },
  ghost: {
    default: { background: 'transparent', color: '#9b7ff8', padding: '10px 20px', border: '1px solid rgba(155,127,248,0.2)' },
    hover: { background: 'rgba(155,127,248,0.08)', color: '#9b7ff8', padding: '10px 20px', border: '1px solid rgba(155,127,248,0.4)' },
  },
  danger: {
    default: { background: '#a93226', color: '#f0f0f0', padding: '11px 24px' },
    hover: { background: '#c0392b', color: '#f0f0f0', padding: '11px 24px' },
  },
}

export function Button({ variant = 'primary', full, className = '', style, children, disabled, ...props }: ButtonProps) {
  const [hov, setHov] = useState(false)
  const v = variants[variant]
  const mergedClassName = [variant === 'ghost' ? 'border' : '', className].filter(Boolean).join(' ')

  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      disabled={disabled}
      style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 600,
        fontSize: 13,
        letterSpacing: '0.07em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: 'none',
        transition: 'all 0.18s',
        borderRadius: 3,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: full ? '100%' : 'auto',
        opacity: disabled ? 0.5 : 1,
        ...(hov && !disabled ? v.hover : v.default),
        ...style,
      }}
      className={mergedClassName}
      {...props}
    >
      {children}
    </button>
  )
}
