'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type ToastTone = 'success' | 'error' | 'info'

type Toast = {
  id: string
  title: string
  tone: ToastTone
}

type ToastContextValue = {
  showToast: (title: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((title: string, tone: ToastTone = 'info') => {
    const id = crypto.randomUUID()
    setToasts(current => [...current, { id, title, tone }])

    window.setTimeout(() => {
      setToasts(current => current.filter(toast => toast.id !== id))
    }, 2600)
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-2 rounded-lg border text-sm shadow-lg backdrop-blur-sm ${
              toast.tone === 'success'
                ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-100'
                : toast.tone === 'error'
                  ? 'bg-red-500/15 border-red-400/30 text-red-100'
                  : 'bg-surface/90 border-white/20 text-text-primary'
            }`}
            role="status"
            aria-live="polite"
          >
            {toast.title}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used inside ToastProvider.')
  }
  return ctx
}
