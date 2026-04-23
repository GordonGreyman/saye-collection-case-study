import type { Metadata } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import { ToastProvider } from '@/components/ui/ToastProvider'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Saye Collective',
  description: 'Discovery Engine for Artists, Curators, and Institutions',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="font-body bg-bg text-text-primary antialiased min-h-screen">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
