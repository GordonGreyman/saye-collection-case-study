import type { HTMLAttributes } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement>

export function Card({ className = '', style, children, ...props }: CardProps) {
  return (
    <div
      style={{
        background: '#111111',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 8,
        padding: '18px 20px',
        ...style,
      }}
      className={className}
      {...props}
    >
      {children}
    </div>
  )
}
