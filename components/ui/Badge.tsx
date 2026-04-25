interface BadgeProps {
  children: React.ReactNode
  variant?: 'role' | 'interest'
}

const variantStyles: Record<string, React.CSSProperties> = {
  role: {
    background: 'rgba(155,127,248,0.1)',
    color: '#9b7ff8',
    border: '1px solid rgba(155,127,248,0.2)',
  },
  interest: {
    background: 'transparent',
    color: '#9a9a9a',
    border: '1px solid rgba(255,255,255,0.14)',
  },
}

export function Badge({ children, variant = 'interest' }: BadgeProps) {
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em',
      padding: '3px 9px', borderRadius: 100, textTransform: 'uppercase',
      display: 'inline-flex', alignItems: 'center',
      ...variantStyles[variant],
    }}>
      {children}
    </span>
  )
}
