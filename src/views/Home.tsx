import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  ChevronRight,
  Compass,
  DraftingCompass,
  Flag,
  FolderKanban,
  Lightbulb,
  LineChart,
  PenTool,
  Rocket,
  Sparkles,
  Target,
  Workflow,
  Zap,
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Button } from '../components/Button'
import type { ViewId } from '../types'

gsap.registerPlugin(ScrollTrigger)

type HomeProps = {
  onNavigate: (view: ViewId) => void
}

const easeOut = [0.22, 1, 0.36, 1] as const

const howItWorks = [
  {
    icon: Lightbulb,
    title: 'Capture Ideas',
    text: 'Drop every spark into a calm inbox before momentum disappears.',
  },
  {
    icon: Workflow,
    title: 'Sort the Storm',
    text: 'Cluster related thoughts into clear themes, priorities, and next moves.',
  },
  {
    icon: FolderKanban,
    title: 'Build Projects',
    text: 'Promote promising concepts into structured projects with real outcomes.',
  },
  {
    icon: CalendarCheck,
    title: 'Schedule Action',
    text: 'Turn decisions into calendar blocks so execution has a place to land.',
  },
  {
    icon: LineChart,
    title: 'Track Momentum',
    text: 'Keep goals, projects, and activity visible as your work compounds.',
  },
]

const useCases = [
  { label: 'Business ideas', icon: BadgeCheck },
  { label: 'Creative projects', icon: PenTool },
  { label: 'Personal goals', icon: Target },
  { label: 'Content planning', icon: Compass },
  { label: 'Startup concepts', icon: Rocket },
  { label: 'Product ideas', icon: DraftingCompass },
  { label: 'Writing projects', icon: Sparkles },
  { label: 'Life planning', icon: Flag },
]

const previewIdeas = [
  { title: 'AI research sprint', status: 'Idea', tone: 'from-violet/90 to-fuchsia-300/80' },
  { title: 'Launch narrative', status: 'Project', tone: 'from-sky-300/90 to-violet/80' },
  { title: 'Weekly focus ritual', status: 'Goal', tone: 'from-silver to-violet/70' },
]

const previewSchedule = [
  { time: '09:00', item: 'Map opportunity clusters' },
  { time: '11:30', item: 'Draft project milestones' },
  { time: '15:00', item: 'Review momentum dashboard' },
]

export function Home({ onNavigate }: HomeProps) {
  const pageRef = useRef<HTMLDivElement | null>(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!pageRef.current || prefersReducedMotion) {
      return
    }

    const context = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>('.landing-reveal')

      sections.forEach((section) => {
        gsap.fromTo(
          section,
          { autoAlpha: 0, y: 56, filter: 'blur(14px)' },
          {
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1.05,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 82%',
              once: true,
            },
          },
        )
      })

      gsap.utils.toArray<HTMLElement>('.stagger-card').forEach((card) => {
        const delay = Number(card.dataset.stagger ?? 0)
        gsap.fromTo(
          card,
          { autoAlpha: 0, y: 34, scale: 0.96 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.78,
            delay,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              once: true,
            },
          },
        )
      })
    }, pageRef)

    return () => context.revert()
  }, [prefersReducedMotion])

  const titleLines = ['Brain', 'Stormy']

  return (
    <div ref={pageRef} className="relative -mt-8 overflow-hidden pb-10">
      <div className="storm-energy-bg" aria-hidden="true" />
      <section className="relative grid min-h-[calc(100vh-5rem)] items-center gap-12 py-12 lg:grid-cols-[0.92fr_1.08fr] lg:py-20">
        <div className="relative z-10">
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeOut }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-sm text-silver shadow-glass backdrop-blur-2xl"
          >
            <Zap size={15} className="text-violet" />
            Serious brainstorming for ideas, projects, goals, and execution.
          </motion.p>

          <h1 className="overflow-hidden text-6xl font-semibold leading-[0.85] tracking-[-0.075em] text-white sm:text-7xl lg:text-8xl xl:text-9xl">
            {titleLines.map((line, index) => (
              <span className="block overflow-hidden pb-3" key={line}>
                <motion.span
                  className="block"
                  initial={prefersReducedMotion ? false : { y: '110%', opacity: 0 }}
                  animate={prefersReducedMotion ? undefined : { y: 0, opacity: 1 }}
                  transition={{ duration: 0.95, delay: index * 0.16, ease: easeOut }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.82, delay: 0.42, ease: easeOut }}
            className="mt-5 max-w-2xl text-xl leading-9 text-silver/82 sm:text-2xl"
          >
            Capture the spark. Organize the storm. Schedule the execution.
          </motion.p>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.62, ease: easeOut }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Button onClick={() => onNavigate('inbox')} className="px-6 py-4 text-base">
              Open Idea Inbox <ArrowRight className="ml-2" size={18} />
            </Button>
            <Button onClick={() => onNavigate('board')} variant="secondary" className="px-6 py-4 text-base">
              View Brainstorm Board
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 40, rotateX: 6 }}
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  opacity: 1,
                  y: [0, -14, 0],
                  rotateX: 0,
                }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  opacity: { duration: 0.9, delay: 0.35, ease: easeOut },
                  rotateX: { duration: 0.9, delay: 0.35, ease: easeOut },
                  y: { duration: 7, delay: 1.2, repeat: Infinity, ease: 'easeInOut' },
                }
          }
          className="relative z-10 mx-auto w-full max-w-2xl"
        >
          <div className="absolute -inset-8 rounded-[3rem] bg-violet/20 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2.35rem] border border-white/15 bg-slate-950/60 p-3 shadow-[0_38px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
            <div className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))] p-4 sm:p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.36em] text-silver/55">Live workspace</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Storm Control</h2>
                </div>
                <div className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-100">
                  Momentum +42%
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="space-y-3">
                  {previewIdeas.map((idea, index) => (
                    <motion.div
                      key={idea.title}
                      animate={prefersReducedMotion ? undefined : { x: [0, 8, 0] }}
                      transition={{ duration: 5.5, delay: index * 0.35, repeat: Infinity, ease: 'easeInOut' }}
                      className="rounded-3xl border border-white/10 bg-navy/65 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className={`mt-1 h-3 w-3 rounded-full bg-gradient-to-br ${idea.tone} shadow-glow`} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-white">{idea.title}</p>
                          <p className="mt-1 text-sm text-silver/60">{idea.status} captured and prioritized</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="font-semibold text-white">Execution calendar</p>
                    <CalendarCheck size={18} className="text-violet" />
                  </div>
                  <div className="space-y-3">
                    {previewSchedule.map((slot) => (
                      <div key={slot.time} className="grid grid-cols-[3.4rem_1fr] gap-3 rounded-2xl bg-navy/55 p-3">
                        <span className="text-sm font-semibold text-violet">{slot.time}</span>
                        <span className="text-sm text-silver/80">{slot.item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-2xl border border-violet/25 bg-violet/10 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Sparkles size={16} className="text-violet" />
                      Next best action
                    </div>
                    <p className="mt-2 text-sm leading-6 text-silver/72">Convert the strongest cluster into a focused project brief.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="landing-reveal relative py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.36em] text-violet">How It Works</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-white sm:text-5xl">
            From first spark to scheduled progress.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {howItWorks.map((item, index) => {
            const Icon = item.icon
            return (
              <article
                className="stagger-card group rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-glass backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-violet/35 hover:bg-white/[0.1]"
                data-stagger={index * 0.08}
                key={item.title}
              >
                <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-navy/70 text-violet shadow-glow">
                  <Icon size={24} />
                </div>
                <p className="text-sm font-semibold text-silver/50">0{index + 1}</p>
                <h3 className="mt-3 text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 leading-7 text-silver/72">{item.text}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="landing-reveal relative py-16 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.36em] text-violet">Use It For Anything</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-white sm:text-5xl">
              One command center for every kind of ambition.
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-silver/72 lg:ml-auto">
            Brain Stormy stays flexible without feeling generic: capture raw thinking, sort it into systems, then make time for the work that matters.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map((item, index) => {
            const Icon = item.icon
            return (
              <article
                className="stagger-card flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.065] p-5 shadow-glass backdrop-blur-xl transition duration-300 hover:border-white/20 hover:bg-white/[0.095]"
                data-stagger={index * 0.045}
                key={item.label}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet/15 text-violet">
                  <Icon size={21} />
                </span>
                <span className="font-semibold text-white">{item.label}</span>
              </article>
            )
          })}
        </div>
      </section>

      <section className="landing-reveal py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.075] p-8 text-center shadow-glass backdrop-blur-2xl sm:p-12 lg:p-16">
          <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          <div className="absolute -bottom-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-violet/25 blur-3xl" />
          <div className="relative mx-auto max-w-4xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-navy/55 px-4 py-2 text-sm text-silver/75">
              <Sparkles size={15} className="text-violet" />
              Ready when inspiration strikes
            </p>
            <h2 className="text-4xl font-semibold tracking-[-0.05em] text-white sm:text-6xl">
              Turn scattered ideas into scheduled action.
            </h2>
            <Button onClick={() => onNavigate('inbox')} className="mt-9 px-7 py-4 text-base">
              Enter Brain Stormy <ChevronRight className="ml-2" size={18} />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
