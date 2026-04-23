'use client'
import { motion, type HTMLMotionProps } from 'framer-motion'

type Variant = 'primary' | 'ghost'

type ButtonProps = HTMLMotionProps<'button'> & {
  variant?: Variant
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base =
    'px-6 py-3 rounded-lg font-semibold text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed'
  const variants: Record<Variant, string> = {
    primary: 'bg-accent text-white hover:bg-purple-700',
    ghost: 'border border-accent text-accent hover:bg-accent hover:text-white',
  }

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
