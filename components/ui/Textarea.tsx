import { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm text-text-muted font-medium">
          {label}
        </label>
      )}
      <textarea
        id={id}
        aria-invalid={Boolean(error)}
        className={`w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition resize-none min-h-[100px] ${className}`}
        {...props}
      />
      {error && <p className="text-red-400 text-xs mt-0.5">{error}</p>}
    </div>
  )
}
