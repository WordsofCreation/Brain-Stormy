import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import type { HTMLMotionProps } from 'framer-motion'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = HTMLMotionProps<'button'> & {
  children: ReactNode
  variant?: ButtonVariant
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-white text-navy shadow-glow hover:bg-silver',
  secondary: 'border border-white/15 bg-white/10 text-white hover:bg-white/15',
  ghost: 'text-silver hover:bg-white/10 hover:text-white',
}

export function Button({ children, className = '', variant = 'primary', ...props }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
