import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FolderInput,
  Heart,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { Section } from '../components/Section'
import { sampleIdeas, sampleProjects } from '../data/sampleData'
import { useLocalStorage } from '../hooks/useLocalStorage'
import {
  ideaCategories,
  ideaPriorities,
  ideaStatuses,
  type Idea,
  type IdeaCategory,
  type IdeaPriority,
  type IdeaStatus,
} from '../types'

const storageKey = 'brain-stormy-ideas'
const allFilter = 'All'

type IdeaFormState = {
  title: string
  description: string
  category: IdeaCategory
  status: IdeaStatus
  priority: IdeaPriority
  tags: string
  projectId: string
}

const defaultFormState: IdeaFormState = {
  title: '',
  description: '',
  category: 'Product',
  status: 'Raw Idea',
  priority: 'Medium',
  tags: '',
  projectId: '',
}

const priorityStyles: Record<IdeaPriority, string> = {
  Low: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100',
  Medium: 'border-sky-300/20 bg-sky-300/10 text-sky-100',
  High: 'border-amber-300/20 bg-amber-300/10 text-amber-100',
  Urgent: 'border-rose-300/25 bg-rose-400/15 text-rose-100',
}

const statusStyles: Record<IdeaStatus, string> = {
  'Raw Idea': 'bg-white/10 text-silver',
  Reviewing: 'bg-violet/15 text-violet',
  Approved: 'bg-emerald-300/10 text-emerald-100',
  Parked: 'bg-amber-300/10 text-amber-100',
  Completed: 'bg-sky-300/10 text-sky-100',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

function splitTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 8)
}

type StoredIdea = Partial<Idea> & {
  note?: string
  tag?: string
}

function normalizeStoredIdea(idea: StoredIdea, index: number): Idea {
  const category = idea.category && (ideaCategories as readonly string[]).includes(idea.category) ? idea.category : 'Other'
  const status = idea.status && (ideaStatuses as readonly string[]).includes(idea.status) ? idea.status : 'Raw Idea'
  const priority = idea.priority && (ideaPriorities as readonly string[]).includes(idea.priority) ? idea.priority : 'Medium'
  const title = idea.title?.trim() || `Untitled idea ${index + 1}`
  const description = idea.description?.trim() || idea.note?.trim() || 'Captured quickly. Add more detail when you review this idea.'
  const tags = Array.isArray(idea.tags) && idea.tags.length > 0 ? idea.tags : idea.tag ? [idea.tag] : []

  return {
    id: idea.id || `idea-${index + 1}`,
    title,
    description,
    category: category as IdeaCategory,
    status: status as IdeaStatus,
    priority: priority as IdeaPriority,
    tags,
    createdAt: idea.createdAt || new Date().toISOString(),
    favorite: Boolean(idea.favorite),
    projectId: idea.projectId || undefined,
  }
}

function ideasNeedMigration(storedIdeas: StoredIdea[], normalizedIdeas: Idea[]) {
  return storedIdeas.some((idea, index) => JSON.stringify(idea) !== JSON.stringify(normalizedIdeas[index]))
}

function ideaToForm(idea: Idea): IdeaFormState {
  return {
    title: idea.title,
    description: idea.description,
    category: idea.category,
    status: idea.status,
    priority: idea.priority,
    tags: idea.tags.join(', '),
    projectId: idea.projectId ?? '',
  }
}

export function IdeaInbox() {
  const [storedIdeas, setIdeas] = useLocalStorage<StoredIdea[]>(storageKey, sampleIdeas)
  const ideas = useMemo(() => storedIdeas.map(normalizeStoredIdea), [storedIdeas])
  const [quickIdea, setQuickIdea] = useState(defaultFormState)
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null)
  const [editForm, setEditForm] = useState(defaultFormState)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<IdeaCategory | typeof allFilter>(allFilter)
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | typeof allFilter>(allFilter)
  const [priorityFilter, setPriorityFilter] = useState<IdeaPriority | typeof allFilter>(allFilter)

  useEffect(() => {
    if (ideasNeedMigration(storedIdeas, ideas)) {
      setIdeas(ideas)
    }
  }, [ideas, setIdeas, storedIdeas])

  const filteredIdeas = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return ideas
      .filter((idea) => (categoryFilter === allFilter ? true : idea.category === categoryFilter))
      .filter((idea) => (statusFilter === allFilter ? true : idea.status === statusFilter))
      .filter((idea) => (priorityFilter === allFilter ? true : idea.priority === priorityFilter))
      .filter((idea) => {
        if (!normalizedSearch) {
          return true
        }

        const searchable = [idea.title, idea.description, idea.category, idea.status, idea.priority, ...idea.tags].join(' ').toLowerCase()
        return searchable.includes(normalizedSearch)
      })
      .sort((a, b) => Number(b.favorite) - Number(a.favorite) || Date.parse(b.createdAt) - Date.parse(a.createdAt))
  }, [categoryFilter, ideas, priorityFilter, search, statusFilter])

  const resetFilters = () => {
    setSearch('')
    setCategoryFilter(allFilter)
    setStatusFilter(allFilter)
    setPriorityFilter(allFilter)
  }

  const addIdea = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!quickIdea.title.trim()) {
      return
    }

    const newIdea: Idea = {
      id: `idea-${crypto.randomUUID()}`,
      title: quickIdea.title.trim(),
      description: quickIdea.description.trim() || 'Captured quickly. Add more detail when you review this idea.',
      category: quickIdea.category,
      status: 'Raw Idea',
      priority: quickIdea.priority,
      tags: splitTags(quickIdea.tags),
      createdAt: new Date().toISOString(),
      favorite: false,
      projectId: quickIdea.projectId || undefined,
    }

    setIdeas((currentIdeas) => [newIdea, ...currentIdeas])
    setQuickIdea(defaultFormState)
  }

  const openEditPanel = (idea: Idea) => {
    setEditingIdea(idea)
    setEditForm(ideaToForm(idea))
  }

  const saveIdea = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!editingIdea || !editForm.title.trim()) {
      return
    }

    setIdeas((currentIdeas) =>
      currentIdeas.map((idea) =>
        idea.id === editingIdea.id
          ? {
              ...idea,
              title: editForm.title.trim(),
              description: editForm.description.trim() || 'Captured quickly. Add more detail when you review this idea.',
              category: editForm.category,
              status: editForm.status,
              priority: editForm.priority,
              tags: splitTags(editForm.tags),
              projectId: editForm.projectId || undefined,
            }
          : idea,
      ),
    )
    setEditingIdea(null)
  }

  const deleteIdea = (idea: Idea) => {
    const confirmed = window.confirm(`Delete “${idea.title}”? This cannot be undone.`)

    if (confirmed) {
      setIdeas((currentIdeas) => currentIdeas.filter((currentIdea) => currentIdea.id !== idea.id))
      if (editingIdea?.id === idea.id) {
        setEditingIdea(null)
      }
    }
  }

  const toggleFavorite = (ideaId: string) => {
    setIdeas((currentIdeas) => currentIdeas.map((idea) => (idea.id === ideaId ? { ...idea, favorite: !idea.favorite } : idea)))
  }

  return (
    <Section
      eyebrow="Capture"
      title="Idea Inbox"
      description="A fast, premium holding space for raw thoughts before they become projects, plans, or scheduled work."
    >
      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.45fr]">
        <motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          onSubmit={addIdea}
          className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-5 shadow-glass backdrop-blur-2xl sm:p-6"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-violet">Quick add</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Capture before it fades</h2>
            </div>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet/20 text-violet">
              <Sparkles size={21} />
            </span>
          </div>

          <div className="grid gap-3">
            <input
              aria-label="Idea title"
              className="rounded-2xl border border-white/10 bg-navy/55 px-4 py-3 text-base text-white outline-none transition placeholder:text-silver/45 focus:border-violet/70 focus:ring-4 focus:ring-violet/15"
              onChange={(event) => setQuickIdea((idea) => ({ ...idea, title: event.target.value }))}
              placeholder="Idea title..."
              value={quickIdea.title}
            />
            <textarea
              aria-label="Idea description"
              className="min-h-24 rounded-2xl border border-white/10 bg-navy/55 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-silver/45 focus:border-violet/70 focus:ring-4 focus:ring-violet/15"
              onChange={(event) => setQuickIdea((idea) => ({ ...idea, description: event.target.value }))}
              placeholder="Optional note, next thought, or why it matters..."
              value={quickIdea.description}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField
                label="Category"
                onChange={(value) => setQuickIdea((idea) => ({ ...idea, category: value as IdeaCategory }))}
                options={ideaCategories}
                value={quickIdea.category}
              />
              <SelectField
                label="Priority"
                onChange={(value) => setQuickIdea((idea) => ({ ...idea, priority: value as IdeaPriority }))}
                options={ideaPriorities}
                value={quickIdea.priority}
              />
            </div>
            <input
              aria-label="Idea tags"
              className="rounded-2xl border border-white/10 bg-navy/55 px-4 py-3 text-sm text-white outline-none transition placeholder:text-silver/45 focus:border-violet/70 focus:ring-4 focus:ring-violet/15"
              onChange={(event) => setQuickIdea((idea) => ({ ...idea, tags: event.target.value }))}
              placeholder="Tags separated by commas"
              value={quickIdea.tags}
            />
            <SelectField
              label="Move into project later"
              onChange={(value) => setQuickIdea((idea) => ({ ...idea, projectId: value }))}
              options={sampleProjects.map((project) => ({ label: project.title, value: project.id }))}
              placeholder="Keep in inbox"
              value={quickIdea.projectId}
            />
            <Button className="mt-1 w-full" type="submit">
              <Plus className="mr-2" size={18} /> Add idea
            </Button>
          </div>
        </motion.form>

        <div className="min-w-0">
          <div className="mb-4 rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-silver/45" size={18} />
                <input
                  aria-label="Search ideas"
                  className="w-full rounded-2xl border border-white/10 bg-navy/55 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-silver/45 focus:border-violet/70 focus:ring-4 focus:ring-violet/15"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search ideas, tags, status..."
                  value={search}
                />
              </label>
              <FilterSelect
                label="Category filter"
                onChange={(value) => setCategoryFilter(value as IdeaCategory | typeof allFilter)}
                options={ideaCategories}
                value={categoryFilter}
              />
              <FilterSelect
                label="Status filter"
                onChange={(value) => setStatusFilter(value as IdeaStatus | typeof allFilter)}
                options={ideaStatuses}
                value={statusFilter}
              />
              <FilterSelect
                label="Priority filter"
                onChange={(value) => setPriorityFilter(value as IdeaPriority | typeof allFilter)}
                options={ideaPriorities}
                value={priorityFilter}
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-silver/70">
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal size={16} /> {filteredIdeas.length} of {ideas.length} ideas showing
              </span>
              <button className="font-semibold text-violet transition hover:text-white" onClick={resetFilters} type="button">
                Clear filters
              </button>
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {filteredIdeas.length > 0 ? (
              <motion.div className="grid gap-4 md:grid-cols-2" layout>
                {filteredIdeas.map((idea, index) => (
                  <IdeaCard
                    idea={idea}
                    key={idea.id}
                    onDelete={() => deleteIdea(idea)}
                    onEdit={() => openEditPanel(idea)}
                    onFavorite={() => toggleFavorite(idea.id)}
                    projectName={sampleProjects.find((project) => project.id === idea.projectId)?.title}
                    staggerDelay={index * 0.045}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="rounded-[2rem] border border-dashed border-white/15 bg-white/[0.05] p-10 text-center shadow-glass"
              >
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet/15 text-violet">
                  <Search size={24} />
                </div>
                <h2 className="mt-5 text-2xl font-semibold">No ideas match this view</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-silver/70">
                  Try clearing filters or capture a fresh thought with the quick add form. The inbox is ready whenever inspiration returns.
                </p>
                <Button className="mt-6" onClick={resetFilters} type="button" variant="secondary">
                  Reset inbox view
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {editingIdea ? (
          <motion.div className="fixed inset-0 z-50 flex justify-end bg-navy/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 32 }}
              className="h-full w-full overflow-y-auto border-l border-white/10 bg-[#091424]/95 p-5 shadow-glass sm:max-w-xl sm:p-7"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-violet">Edit idea</p>
                  <h2 className="mt-2 text-2xl font-semibold">Refine the capture</h2>
                </div>
                <button className="rounded-2xl border border-white/10 bg-white/10 p-3 text-silver transition hover:text-white" onClick={() => setEditingIdea(null)} type="button">
                  <X size={19} />
                </button>
              </div>

              <form className="grid gap-4" onSubmit={saveIdea}>
                <input
                  aria-label="Edit idea title"
                  className="rounded-2xl border border-white/10 bg-navy/65 px-4 py-3 text-base text-white outline-none transition focus:border-violet/70 focus:ring-4 focus:ring-violet/15"
                  onChange={(event) => setEditForm((idea) => ({ ...idea, title: event.target.value }))}
                  value={editForm.title}
                />
                <textarea
                  aria-label="Edit idea description"
                  className="min-h-32 rounded-2xl border border-white/10 bg-navy/65 px-4 py-3 text-sm leading-6 text-white outline-none transition focus:border-violet/70 focus:ring-4 focus:ring-violet/15"
                  onChange={(event) => setEditForm((idea) => ({ ...idea, description: event.target.value }))}
                  value={editForm.description}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <SelectField label="Category" onChange={(value) => setEditForm((idea) => ({ ...idea, category: value as IdeaCategory }))} options={ideaCategories} value={editForm.category} />
                  <SelectField label="Status" onChange={(value) => setEditForm((idea) => ({ ...idea, status: value as IdeaStatus }))} options={ideaStatuses} value={editForm.status} />
                  <SelectField label="Priority" onChange={(value) => setEditForm((idea) => ({ ...idea, priority: value as IdeaPriority }))} options={ideaPriorities} value={editForm.priority} />
                  <SelectField
                    label="Project"
                    onChange={(value) => setEditForm((idea) => ({ ...idea, projectId: value }))}
                    options={sampleProjects.map((project) => ({ label: project.title, value: project.id }))}
                    placeholder="No project yet"
                    value={editForm.projectId}
                  />
                </div>
                <input
                  aria-label="Edit idea tags"
                  className="rounded-2xl border border-white/10 bg-navy/65 px-4 py-3 text-sm text-white outline-none transition focus:border-violet/70 focus:ring-4 focus:ring-violet/15"
                  onChange={(event) => setEditForm((idea) => ({ ...idea, tags: event.target.value }))}
                  value={editForm.tags}
                />
                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                  <Button className="flex-1" type="submit">
                    Save changes
                  </Button>
                  <Button className="flex-1" onClick={() => deleteIdea(editingIdea)} type="button" variant="secondary">
                    <Trash2 className="mr-2" size={17} /> Delete
                  </Button>
                </div>
              </form>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Section>
  )
}

type Option = string | { label: string; value: string }

type SelectFieldProps = {
  label: string
  onChange: (value: string) => void
  options: readonly Option[]
  placeholder?: string
  value: string
}

function SelectField({ label, onChange, options, placeholder, value }: SelectFieldProps) {
  return (
    <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-silver/55">
      {label}
      <select
        className="rounded-2xl border border-white/10 bg-navy/70 px-4 py-3 text-sm normal-case tracking-normal text-white outline-none transition focus:border-violet/70 focus:ring-4 focus:ring-violet/15"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value
          const optionLabel = typeof option === 'string' ? option : option.label
          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          )
        })}
      </select>
    </label>
  )
}

function FilterSelect({ label, onChange, options, value }: Omit<SelectFieldProps, 'placeholder'>) {
  return (
    <select
      aria-label={label}
      className="min-w-36 rounded-2xl border border-white/10 bg-navy/55 px-4 py-3 text-sm text-white outline-none transition focus:border-violet/70 focus:ring-4 focus:ring-violet/15"
      onChange={(event) => onChange(event.target.value)}
      value={value}
    >
      <option value={allFilter}>All</option>
      {options.map((option) => {
        const optionValue = typeof option === 'string' ? option : option.value
        const optionLabel = typeof option === 'string' ? option : option.label
        return (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        )
      })}
    </select>
  )
}

type IdeaCardProps = {
  idea: Idea
  onDelete: () => void
  onEdit: () => void
  onFavorite: () => void
  projectName?: string
  staggerDelay: number
}

function IdeaCard({ idea, onDelete, onEdit, onFavorite, projectName, staggerDelay }: IdeaCardProps) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -14, scale: 0.96 }}
      transition={{ duration: 0.45, delay: staggerDelay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-white/[0.12] to-white/[0.045] p-5 shadow-glass backdrop-blur-xl"
    >
      <div className="absolute -right-14 -top-14 h-32 w-32 rounded-full bg-violet/20 blur-3xl transition group-hover:bg-violet/30" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">{idea.category}</span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[idea.status]}`}>{idea.status}</span>
        </div>
        <button
          aria-label={idea.favorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`rounded-2xl border p-2 transition ${idea.favorite ? 'border-rose-300/30 bg-rose-400/15 text-rose-200' : 'border-white/10 bg-white/5 text-silver/60 hover:text-white'}`}
          onClick={onFavorite}
          type="button"
        >
          <Heart fill={idea.favorite ? 'currentColor' : 'none'} size={18} />
        </button>
      </div>

      <div className="relative mt-5">
        <h2 className="text-xl font-semibold tracking-tight text-white">{idea.title}</h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-silver/75">{idea.description}</p>
      </div>

      <div className="relative mt-5 flex flex-wrap gap-2">
        {idea.tags.length > 0 ? (
          idea.tags.map((tag) => (
            <span className="rounded-full border border-white/10 bg-navy/45 px-3 py-1 text-xs text-silver/80" key={tag}>
              #{tag}
            </span>
          ))
        ) : (
          <span className="rounded-full border border-dashed border-white/10 px-3 py-1 text-xs text-silver/50">No tags yet</span>
        )}
      </div>

      <div className="relative mt-5 grid gap-3 text-xs text-silver/65 sm:grid-cols-2">
        <span className={`inline-flex items-center justify-center rounded-2xl border px-3 py-2 font-semibold ${priorityStyles[idea.priority]}`}>
          {idea.priority} priority
        </span>
        <span className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/[0.06] px-3 py-2">
          <Clock3 size={14} /> {formatDate(idea.createdAt)}
        </span>
      </div>

      {projectName ? (
        <div className="relative mt-3 flex items-center gap-2 rounded-2xl border border-violet/20 bg-violet/10 px-3 py-2 text-xs font-semibold text-violet">
          <FolderInput size={14} /> Moving toward {projectName}
        </div>
      ) : (
        <div className="relative mt-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-silver/55">
          <ArrowUpRight size={14} /> Ready to move into a project later
        </div>
      )}

      <div className="relative mt-5 flex gap-2">
        <Button className="flex-1 px-4 py-2.5" onClick={onEdit} type="button" variant="secondary">
          <Pencil className="mr-2" size={16} /> Edit
        </Button>
        <button
          className="rounded-full border border-white/10 bg-white/5 px-4 text-silver transition hover:border-rose-300/30 hover:bg-rose-400/10 hover:text-rose-100"
          onClick={onDelete}
          type="button"
          aria-label={`Delete ${idea.title}`}
        >
          <Trash2 size={17} />
        </button>
      </div>

      {idea.status === 'Completed' ? (
        <div className="relative mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-100">
          <CheckCircle2 size={15} /> Completed idea
        </div>
      ) : null}
    </motion.article>
  )
}
