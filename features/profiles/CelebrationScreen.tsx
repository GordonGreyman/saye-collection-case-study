'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface CelebrationScreenProps {
  name: string
}

export function CelebrationScreen({ name }: CelebrationScreenProps) {
  const router = useRouter()

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push('/discover')
    }, 2500)

    return () => clearTimeout(timeout)
  }, [router])

  return (
    <section className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-5xl font-heading text-text-primary">Welcome to Saye,</h2>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut', delay: 0.15 }}
        className="text-5xl font-heading text-accent mt-3"
      >
        {name}
      </motion.p>
      <p className="text-text-muted mt-4">Your identity is live.</p>
    </section>
  )
}
