import { motion } from 'framer-motion'
import type { ProfileRole } from '@/lib/types'

interface RoleCardProps {
  role: ProfileRole
  tagline: string
  selected: boolean
  onSelect: (role: ProfileRole) => void
}

export function RoleCard({ role, tagline, selected, onSelect }: RoleCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.01 }}
      onClick={() => onSelect(role)}
      className={`w-full text-left rounded-xl p-6 border transition ${
        selected
          ? 'border-accent bg-accent/10'
          : 'border-white/10 hover:border-accent hover:shadow-[0_0_24px_rgba(157,0,255,0.2)]'
      }`}
    >
      <p className="text-4xl font-heading text-text-primary">{role}</p>
      <p className="text-sm text-text-muted mt-1">{tagline}</p>
    </motion.button>
  )
}
