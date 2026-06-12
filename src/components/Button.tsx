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
      whileHover={{ y: -3, scale: 1.025 }}
      whileTap={{ scale: 0.97 }}
      className={`storm-button inline-flex min-h-11 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition sm:min-h-0 ${variants[variant]} ${className}`}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center justify-center">{children}</span>
    </motion.button>
  )
}
