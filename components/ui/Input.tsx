import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm text-text-muted font-medium">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition ${className}`}
        {...props}
      />
      {error && <p className="text-red-400 text-xs mt-0.5">{error}</p>}
    </div>
  )
}
