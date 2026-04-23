interface BadgeProps {
  children: React.ReactNode
  variant?: 'role' | 'interest'
}

export function Badge({ children, variant = 'interest' }: BadgeProps) {
  const styles: Record<string, string> = {
    role: 'bg-accent/20 text-accent border border-accent/30',
    interest: 'bg-white/5 text-text-muted border border-white/10',
  }
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  )
}
