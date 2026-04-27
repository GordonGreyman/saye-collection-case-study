'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
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

const containerStyle: CSSProperties = {
  position: 'fixed',
  top: 16,
  right: 16,
  zIndex: 2147483647,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  pointerEvents: 'none',
  maxWidth: 'min(420px, calc(100vw - 32px))',
}

const baseToastStyle: CSSProperties = {
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.16)',
  boxShadow: '0 18px 60px rgba(0,0,0,0.42)',
  backdropFilter: 'blur(14px)',
  color: '#f2f2f2',
  fontFamily: 'var(--font-heading)',
  fontSize: 14,
  lineHeight: 1.45,
  padding: '10px 14px',
  minWidth: 220,
}

const toneStyles: Record<ToastTone, CSSProperties> = {
  success: {
    background: 'rgba(12, 54, 36, 0.94)',
    borderColor: 'rgba(74, 222, 128, 0.45)',
    color: '#dcfce7',
  },
  error: {
    background: 'rgba(69, 18, 28, 0.94)',
    borderColor: 'rgba(248, 113, 113, 0.5)',
    color: '#fee2e2',
  },
  info: {
    background: 'rgba(18, 18, 22, 0.94)',
    borderColor: 'rgba(155, 127, 248, 0.36)',
    color: '#f2f2f2',
  },
}

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
      <div style={containerStyle}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{ ...baseToastStyle, ...toneStyles[toast.tone] }}
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
