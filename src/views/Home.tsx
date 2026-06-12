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
import { BrainHeroScene } from '../components/BrainHeroScene'
import { useMediaQuery } from '../hooks/useMediaQuery'
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


const boardIdeas = [
  { title: 'Positioning story', meta: 'Brand arc', x: '-32%', y: '-6%', speed: '1.25' },
  { title: 'Founder OS ritual', meta: 'Weekly cadence', x: '28%', y: '-18%', speed: '0.8' },
  { title: 'Research sprint', meta: 'Opportunity map', x: '-18%', y: '26%', speed: '1.05' },
  { title: 'Launch calendar', meta: 'Action plan', x: '34%', y: '22%', speed: '1.45' },
]

export function Home({ onNavigate }: HomeProps) {
  const pageRef = useRef<HTMLDivElement | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const isMobile = useMediaQuery('(max-width: 767px)')

  useEffect(() => {
    if (!pageRef.current || prefersReducedMotion || isMobile) {
      return
    }

    let mm: gsap.MatchMedia | undefined

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

      gsap.utils.toArray<HTMLElement>('.how-card').forEach((card, index) => {
        gsap.fromTo(
          card,
          { autoAlpha: 0, y: 46, scale: 0.94, filter: 'blur(10px)' },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.88,
            delay: index * 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '.how-section',
              start: 'top 68%',
              once: true,
            },
          },
        )
      })

      gsap.fromTo(
        '.final-cta-card',
        { autoAlpha: 0, y: 42, scale: 0.97, filter: 'blur(12px)' },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.final-cta-card',
            start: 'top 78%',
            once: true,
          },
        },
      )

      mm = gsap.matchMedia()

      mm.add('(min-width: 768px)', () => {
        gsap.to('.hero-copy', {
          yPercent: -18,
          autoAlpha: 0.25,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero-section',
            start: 'top top',
            end: 'bottom 48%',
            scrub: 0.8,
          },
        })

        gsap.to('.hero-title', {
          yPercent: -22,
          autoAlpha: 0,
          filter: 'blur(10px)',
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero-section',
            start: 'top top',
            end: 'bottom 62%',
            scrub: 0.9,
          },
        })

        gsap.to('.app-preview', {
          yPercent: 18,
          scale: 0.9,
          rotateX: -2,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero-section',
            start: 'top top',
            end: 'bottom 42%',
            scrub: 0.95,
          },
        })

        gsap.utils.toArray<HTMLElement>('.parallax-layer').forEach((layer) => {
          const depth = Number(layer.dataset.depth ?? 40)
          gsap.to(layer, {
            y: depth,
            ease: 'none',
            scrollTrigger: {
              trigger: '.home-shell',
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1.1,
            },
          })
        })

        gsap.utils.toArray<HTMLElement>('.use-case-card').forEach((card, index) => {
          const direction = index % 2 === 0 ? -1 : 1
          gsap.fromTo(
            card,
            { y: 36 * direction, autoAlpha: 0.62 },
            {
              y: -28 * direction,
              autoAlpha: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: '.use-cases-section',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2,
              },
            },
          )
        })

        const boardTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: '.board-story-section',
            start: 'top top+=86',
            end: '+=115%',
            pin: true,
            scrub: 0.85,
            anticipatePin: 1,
          },
        })

        boardTimeline
          .fromTo('.board-shell', { scale: 0.94, autoAlpha: 0.72 }, { scale: 1, autoAlpha: 1, duration: 0.24, ease: 'power2.out' })
          .fromTo(
            '.board-idea-card',
            { autoAlpha: 0, y: 92, scale: 0.86, filter: 'blur(12px)' },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              filter: 'blur(0px)',
              duration: 0.56,
              stagger: 0.12,
              ease: 'power3.out',
            },
            0.08,
          )
          .to('.board-idea-card', {
            y: (_, target) => -34 * Number((target as HTMLElement).dataset.speed ?? 1),
            x: (_, target) => 14 * Number((target as HTMLElement).dataset.speed ?? 1),
            duration: 0.48,
            stagger: 0.04,
            ease: 'none',
          })
      })
    }, pageRef)

    return () => {
      mm?.revert()
      context.revert()
      ScrollTrigger.refresh()
    }
  }, [isMobile, prefersReducedMotion])

  const titleLines = ['Brain', 'Stormy']

  return (
    <div ref={pageRef} className="home-shell relative -mt-8 overflow-hidden pb-10">
      <div className="storm-energy-bg parallax-layer" data-depth="120" aria-hidden="true" />
      <div className="premium-orb premium-orb-left parallax-layer" data-depth="70" aria-hidden="true" />
      <div className="premium-orb premium-orb-right parallax-layer" data-depth="-52" aria-hidden="true" />
      <section className="hero-section relative grid min-h-[calc(100svh-7rem)] items-center gap-10 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:py-20">
        <div className="hero-copy relative z-10 will-change-transform">
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: isMobile ? 10 : 18 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeOut }}
            className="hero-kicker mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-sm text-silver shadow-glass backdrop-blur-2xl"
          >
            <Zap size={15} className="text-violet" />
            Serious brainstorming for ideas, projects, goals, and execution.
          </motion.p>

          <h1 className="hero-title overflow-hidden text-5xl font-semibold leading-[0.85] tracking-[-0.075em] text-white will-change-transform sm:text-7xl lg:text-8xl xl:text-9xl">
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
            initial={prefersReducedMotion ? false : { opacity: 0, y: isMobile ? 12 : 28 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.82, delay: 0.42, ease: easeOut }}
            className="mt-5 max-w-2xl text-lg leading-9 text-silver/82 sm:text-2xl"
          >
            Capture the spark. Organize the storm. Schedule the execution.
          </motion.p>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: isMobile ? 12 : 28 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.62, ease: easeOut }}
            className="hero-actions mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row"
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
          initial={prefersReducedMotion ? false : { opacity: 0, y: isMobile ? 14 : 40, scale: isMobile ? 1 : 0.96 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          transition={prefersReducedMotion ? undefined : { duration: 0.95, delay: 0.28, ease: easeOut }}
          className="app-preview hero-brain-shell relative z-10 mx-auto w-full max-w-3xl will-change-transform max-sm:will-change-auto"
        >
          <div className="absolute -inset-8 rounded-[3rem] bg-cyan-400/10 blur-3xl" />
          <div className="relative min-h-[28rem] overflow-hidden rounded-[2.75rem] border border-white/15 bg-slate-950/40 shadow-[0_42px_140px_rgba(0,0,0,0.58)] backdrop-blur-2xl sm:min-h-[34rem] lg:min-h-[40rem]">
            <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/80 to-transparent" />
            <BrainHeroScene reducedMotion={prefersReducedMotion} />
          </div>
        </motion.div>

      </section>

      <section className="how-section landing-reveal section-transition relative py-16 sm:py-20">
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
                className="how-card group rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-glass backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-violet/35 hover:bg-white/[0.1]"
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

      <section className="board-story-section section-transition relative py-16 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div className="landing-reveal">
            <p className="text-sm font-semibold uppercase tracking-[0.36em] text-violet">Brainstorm Board</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-white sm:text-5xl">
              Watch scattered thoughts settle into a focused system.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-silver/72">
              The board holds still for a moment while idea cards slide into orbit, making the product feel deliberate rather than noisy.
            </p>
          </div>

          <div className="board-shell relative min-h-[34rem] overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.07] p-5 shadow-glass backdrop-blur-2xl sm:p-7">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(139,92,246,0.22),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent)]" />
            <div className="absolute inset-6 rounded-[2rem] border border-white/10" />
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-silver/55">Board preview</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Opportunity Map</h3>
              </div>
              <span className="rounded-full border border-white/10 bg-navy/60 px-3 py-1 text-xs text-silver/70">4 active clusters</span>
            </div>

            <div className="absolute left-1/2 top-1/2 grid h-36 w-36 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-violet/30 bg-navy/70 text-center shadow-glow">
              <span className="px-5 text-sm font-semibold leading-5 text-white">Focused next action</span>
            </div>

            {boardIdeas.map((idea) => (
              <article
                className="board-idea-card absolute w-48 rounded-3xl border border-white/10 bg-slate-950/72 p-4 shadow-glass backdrop-blur-xl will-change-transform"
                data-speed={idea.speed}
                key={idea.title}
                style={{ left: `calc(50% + ${idea.x})`, top: `calc(50% + ${idea.y})` }}
              >
                <span className="mb-4 block h-2 w-16 rounded-full bg-gradient-to-r from-violet to-sky-300" />
                <h4 className="font-semibold text-white">{idea.title}</h4>
                <p className="mt-2 text-sm text-silver/62">{idea.meta}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="use-cases-section landing-reveal section-transition relative py-16 sm:py-20">
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
          {useCases.map((item) => {
            const Icon = item.icon
            return (
              <article
                className="use-case-card flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.065] p-5 shadow-glass backdrop-blur-xl transition duration-300 hover:border-white/20 hover:bg-white/[0.095]"
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

      <section className="py-16 sm:py-20">
        <div className="final-cta-card relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.075] p-8 text-center shadow-glass backdrop-blur-2xl sm:p-12 lg:p-16">
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
