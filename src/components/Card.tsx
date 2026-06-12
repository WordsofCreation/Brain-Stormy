import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
  delay?: number
}

export function Card({ children, className = '', delay = 0 }: CardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`storm-card rounded-[1.75rem] border border-white/10 bg-white/[0.07] p-4 shadow-glass sm:rounded-3xl sm:p-6 backdrop-blur-xl ${className}`}
    >
      {children}
    </motion.article>
  )
}
