import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type SectionProps = {
  eyebrow?: string
  title: string
  description?: string
  children: ReactNode
}

export function Section({ eyebrow, title, description, children }: SectionProps) {
  return (
    <section className="relative py-10 lg:py-14">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mb-8 max-w-3xl"
      >
        {eyebrow ? <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-violet">{eyebrow}</p> : null}
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">{title}</h1>
        {description ? <p className="mt-4 text-base leading-7 text-silver/80 sm:text-lg">{description}</p> : null}
      </motion.div>
      {children}
    </section>
  )
}
