import { HTMLAttributes } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement>

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`bg-surface border border-white/5 rounded-xl p-6 hover:shadow-[0_0_24px_rgba(157,0,255,0.15)] transition-shadow duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
