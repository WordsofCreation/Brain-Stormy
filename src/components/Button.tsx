import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import type { HTMLMotionProps } from 'framer-motion'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = HTMLMotionProps<'button'> & {
  children: ReactNode
  variant?: ButtonVariant
}

const variants: Record<ButtonVariant, string> = {
  primary: 'storm-button--primary',
  secondary: 'storm-button--secondary',
  ghost: 'storm-button--ghost',
}

export function Button({ children, className = '', variant = 'primary', ...props }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.035, rotateX: 4, rotateY: -4 }}
      whileTap={{ y: 1, scale: 0.965 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      className={`storm-button storm-interactive inline-flex min-h-11 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition sm:min-h-0 ${variants[variant]} ${className}`}
      {...props}
    >
      <span className="storm-button__shine" aria-hidden="true" />
      <span className="relative z-10 inline-flex items-center justify-center">{children}</span>
    </motion.button>
  )
}
