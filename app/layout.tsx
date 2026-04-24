import type { Metadata } from 'next'
import { Space_Grotesk, DM_Mono } from 'next/font/google'
import { ToastProvider } from '@/components/ui/ToastProvider'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Saye Collective',
  description: 'Discovery Engine for Artists, Curators, and Institutions',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmMono.variable}`}>
      <body className="bg-bg text-text-primary antialiased min-h-screen" style={{ fontFamily: 'var(--font-heading)' }}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
