import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Clock3, FolderKanban, Lightbulb, Sparkles } from 'lucide-react'
import { Card } from '../components/Card'
import { Section } from '../components/Section'
import { sampleIdeas } from '../data/sampleData'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { ideaCategories, ideaPriorities, ideaStatuses, type Idea, type IdeaCategory, type IdeaPriority, type IdeaStatus } from '../types'

const ideaStorageKey = 'brain-stormy-ideas'

type StoredIdea = Partial<Idea> & {
  note?: string
  tag?: string
}

type BoardColumn = {
  id: string
  title: string
  description: string
  statuses: IdeaStatus[]
  icon: typeof Lightbulb
}

const boardColumns: BoardColumn[] = [
  {
    id: 'capture',
    title: 'Capture',
    description: 'Raw sparks that still need shape, language, or proof.',
    statuses: ['Raw Idea'],
    icon: Lightbulb,
  },
  {
    id: 'shape',
    title: 'Shape',
    description: 'Ideas under review, parked for later, or ready for a decision.',
    statuses: ['Reviewing', 'Parked'],
    icon: Sparkles,
  },
  {
    id: 'execute',
    title: 'Execute',
    description: 'Approved or completed ideas with a path toward real work.',
    statuses: ['Approved', 'Completed'],
    icon: FolderKanban,
  },
]

const priorityStyles: Record<IdeaPriority, string> = {
  Low: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100',
  Medium: 'border-electric/20 bg-electric/10 text-mint',
  High: 'border-amber-300/20 bg-amber-300/10 text-amber-100',
  Urgent: 'border-rose-300/25 bg-rose-400/15 text-rose-100',
}

function isOneOf<T extends readonly string[]>(value: unknown, options: T): value is T[number] {
  return typeof value === 'string' && options.includes(value)
}

function normalizeIdea(idea: StoredIdea, index: number): Idea {
  const category = isOneOf(idea.category, ideaCategories) ? idea.category : 'Other'
  const status = isOneOf(idea.status, ideaStatuses) ? idea.status : 'Raw Idea'
  const priority = isOneOf(idea.priority, ideaPriorities) ? idea.priority : 'Medium'
  const tags = Array.isArray(idea.tags) && idea.tags.length > 0 ? idea.tags.filter(Boolean).slice(0, 8) : idea.tag ? [idea.tag] : []

  return {
    id: idea.id || `idea-${index + 1}`,
    title: idea.title?.trim() || `Untitled idea ${index + 1}`,
    description: idea.description?.trim() || idea.note?.trim() || 'Captured quickly. Add more detail when you review this idea.',
    category: category as IdeaCategory,
    status: status as IdeaStatus,
    priority: priority as IdeaPriority,
    tags,
    createdAt: idea.createdAt || new Date().toISOString(),
    favorite: Boolean(idea.favorite),
    projectId: idea.projectId || undefined,
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value))
}

export function BrainstormBoard() {
  const [storedIdeas] = useLocalStorage<StoredIdea[]>(ideaStorageKey, sampleIdeas)
  const ideas = storedIdeas.map((idea, index) => normalizeIdea(idea ?? {}, index))
  const isMobile = useMediaQuery('(max-width: 767px)')

  return (
    <Section
      eyebrow="Structure"
      title="Brainstorm Board"
      description="A live board that turns your inbox into a calm decision pipeline from capture to execution."
    >
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
        {boardColumns.map((column, columnIndex) => {
          const Icon = column.icon
          const columnIdeas = ideas
            .filter((idea) => column.statuses.includes(idea.status))
            .sort((a, b) => Number(b.favorite) - Number(a.favorite) || Date.parse(b.createdAt) - Date.parse(a.createdAt))

          return (
            <Card className="min-w-0 p-4 sm:p-5" key={column.id} delay={columnIndex * 0.06}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-violet sm:text-sm sm:tracking-[0.25em]">
                    <Icon size={16} /> {column.title}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-silver/72">{column.description}</p>
                </div>
                <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs text-silver">{columnIdeas.length}</span>
              </div>

              <div className="mt-5 grid gap-3 sm:mt-6">
                {columnIdeas.length > 0 ? (
                  columnIdeas.map((idea, index) => (
                    <motion.article
                      initial={isMobile ? { opacity: 0, y: 8 } : { opacity: 0, y: 16, scale: 0.98 }}
                      animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: isMobile ? 0.2 : 0.32, delay: isMobile ? 0 : index * 0.035, ease: 'easeOut' }}
                      className="rounded-3xl border border-white/10 bg-navy/50 p-4 shadow-[0_12px_34px_rgba(0,0,0,0.18)]"
                      key={idea.id}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="text-base font-semibold leading-6 text-white">{idea.title}</h2>
                        {idea.status === 'Completed' ? <CheckCircle2 className="shrink-0 text-emerald-100" size={17} /> : null}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-silver/70">{idea.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-white/10 px-2.5 py-1 font-semibold text-white">{idea.category}</span>
                        <span className={`rounded-full border px-2.5 py-1 font-semibold ${priorityStyles[idea.priority]}`}>{idea.priority}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-1 text-silver/60">
                          <Clock3 size={12} /> {formatDate(idea.createdAt)}
                        </span>
                      </div>
                      {idea.projectId ? (
                        <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet">
                          Project-linked <ArrowRight size={13} />
                        </p>
                      ) : null}
                    </motion.article>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-white/12 bg-white/[0.035] p-5 text-sm leading-6 text-silver/65">
                    No ideas in this lane yet. When an idea changes status, this column updates automatically.
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </Section>
  )
}
