import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

interface WelcomeScreenProps {
  onStart: () => void
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4"
    >
      <h1 className="text-6xl font-heading tracking-widest text-text-primary">SAYE</h1>
      <p className="text-text-muted mt-4 max-w-xl">
        A discovery engine for artists, curators, and institutions.
      </p>
      <Button onClick={onStart} className="mt-8" type="button">
        Build Your Identity
      </Button>
    </motion.section>
  )
}
