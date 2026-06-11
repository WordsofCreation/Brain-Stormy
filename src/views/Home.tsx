import { motion } from 'framer-motion'
import { ArrowRight, CalendarCheck, Layers3, Sparkles } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import type { ViewId } from '../types'

gsap.registerPlugin(ScrollTrigger)

type HomeProps = {
  onNavigate: (view: ViewId) => void
}

const storyCards = [
  { icon: Sparkles, title: 'Capture fast', text: 'Collect loose sparks before they disappear.' },
  { icon: Layers3, title: 'Organize clearly', text: 'Shape brainstorms into boards, goals, and projects.' },
  { icon: CalendarCheck, title: 'Execute calmly', text: 'Convert next steps into calendar commitments.' },
]

export function Home({ onNavigate }: HomeProps) {
  const storyRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!storyRef.current) {
      return
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        '.story-card',
        { opacity: 0.35, y: 40 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: storyRef.current,
            start: 'top 78%',
            end: 'bottom 55%',
            scrub: 0.8,
          },
        },
      )
    }, storyRef)

    return () => context.revert()
  }, [])

  return (
    <div>
      <section className="grid min-h-[72vh] items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className="mb-5 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-silver backdrop-blur-xl">
            Standalone creative productivity for ideas, goals, projects, and calendar execution.
          </p>
          <h1 className="text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
            Turn a storm of ideas into focused momentum.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-silver/82">
            Brain Stormy gives teams and solo creators a refined workspace to capture thoughts, structure brainstorms,
            define goals, and schedule concrete action steps—without any connection to food, cookies, bakeries, restaurants,
            or unrelated businesses.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => onNavigate('inbox')}>
              Open Idea Inbox <ArrowRight className="ml-2" size={17} />
            </Button>
            <Button onClick={() => onNavigate('board')} variant="secondary">
              Explore Board
            </Button>
          </div>
        </motion.div>

        <Card className="relative overflow-hidden p-0" delay={0.15}>
          <div className="absolute inset-0 bg-gradient-to-br from-violet/25 via-transparent to-sky-400/20" />
          <div className="relative p-6 sm:p-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-silver/60">Live workspace</p>
                <h2 className="mt-2 text-2xl font-semibold">Storm Control</h2>
              </div>
              <div className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-200">Synced locally</div>
            </div>
            <div className="space-y-4">
              {['Idea captured', 'Clustered into project', 'Action scheduled'].map((item, index) => (
                <motion.div
                  animate={{ x: [0, 8, 0] }}
                  transition={{ duration: 5, delay: index * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="rounded-2xl border border-white/10 bg-navy/55 p-4"
                  key={item}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item}</span>
                    <span className="text-sm text-violet">0{index + 1}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-gradient-to-r from-violet to-white" style={{ width: `${48 + index * 18}%` }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section ref={storyRef} className="grid gap-4 py-12 md:grid-cols-3">
        {storyCards.map((item) => {
          const Icon = item.icon
          return (
            <Card className="story-card" key={item.title}>
              <Icon className="mb-5 text-violet" size={28} />
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-silver/75">{item.text}</p>
            </Card>
          )
        })}
      </section>
    </div>
  )
}
