import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock3,
  Filter,
  Link2,
  Plus,
  Sparkles,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Section } from '../components/Section'
import { sampleCalendarItems, sampleIdeas, sampleProjects } from '../data/sampleData'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useMediaQuery } from '../hooks/useMediaQuery'
import {
  calendarItemStatuses,
  calendarItemTypes,
  projectPriorities,
  type CalendarItem,
  type CalendarItemStatus,
  type CalendarItemType,
  type Idea,
  type Project,
  type ProjectPriority,
} from '../types'

const calendarStorageKey = 'brain-stormy-calendar-items'
const ideaStorageKey = 'brain-stormy-ideas'
const projectStorageKey = 'brain-stormy-projects'
const allFilter = 'All'
const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const typeStyles: Record<CalendarItemType, string> = {
  'Idea Review': 'border-violet/30 bg-violet/15 text-violet',
  'Deep Work': 'border-sky-300/25 bg-sky-300/10 text-sky-100',
  Research: 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100',
  Planning: 'border-indigo-300/25 bg-indigo-300/10 text-indigo-100',
  'Project Task': 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100',
  Deadline: 'border-rose-300/30 bg-rose-400/15 text-rose-100',
  Meeting: 'border-amber-300/25 bg-amber-300/10 text-amber-100',
  Personal: 'border-fuchsia-300/25 bg-fuchsia-300/10 text-fuchsia-100',
  'Creative Work': 'border-purple-300/25 bg-purple-300/10 text-purple-100',
  Admin: 'border-silver/20 bg-silver/10 text-silver',
  Other: 'border-white/15 bg-white/10 text-white',
}

const statusStyles: Record<CalendarItemStatus, string> = {
  Scheduled: 'bg-white/10 text-silver',
  'In Progress': 'bg-violet/15 text-violet',
  Completed: 'bg-emerald-300/10 text-emerald-100',
  Missed: 'bg-rose-400/15 text-rose-100',
}

const priorityStyles: Record<ProjectPriority, string> = {
  Low: 'text-emerald-100',
  Medium: 'text-sky-100',
  High: 'text-amber-100',
  Urgent: 'text-rose-100',
}

type CalendarFormState = {
  title: string
  description: string
  date: string
  time: string
  type: CalendarItemType
  status: CalendarItemStatus
  relatedIdeaId: string
  relatedProjectId: string
  relatedTaskId: string
  priority: ProjectPriority
}

type StoredCalendarItem = Partial<CalendarItem> & { type?: string; status?: string; priority?: string }

type CalendarDay = {
  date: Date
  dateKey: string
  isCurrentMonth: boolean
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function formatShortDate(dateKey: string) {
  return new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(parseDateKey(dateKey))
}

function formatMonthTitle(date: Date) {
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(date)
}

function buildMonthDays(monthDate: Date): CalendarDay[] {
  const firstOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const gridStart = addDays(firstOfMonth, -firstOfMonth.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index)
    return {
      date,
      dateKey: toDateKey(date),
      isCurrentMonth: date.getMonth() === monthDate.getMonth(),
    }
  })
}

function emptyForm(date: string): CalendarFormState {
  return {
    title: '',
    description: '',
    date,
    time: '',
    type: 'Deep Work',
    status: 'Scheduled',
    relatedIdeaId: '',
    relatedProjectId: '',
    relatedTaskId: '',
    priority: 'Medium',
  }
}

function normalizeCalendarItem(item: StoredCalendarItem, index: number): CalendarItem {
  const type = item.type && (calendarItemTypes as readonly string[]).includes(item.type) ? (item.type as CalendarItemType) : 'Other'
  const status = item.status && (calendarItemStatuses as readonly string[]).includes(item.status) ? (item.status as CalendarItemStatus) : 'Scheduled'
  const priority = item.priority && (projectPriorities as readonly string[]).includes(item.priority) ? (item.priority as ProjectPriority) : 'Medium'
  const fallbackDate = toDateKey(new Date())

  return {
    id: item.id || `calendar-${index + 1}`,
    title: item.title?.trim() || `Calendar item ${index + 1}`,
    description: item.description?.trim() || 'Scheduled execution block.',
    date: item.date || fallbackDate,
    time: item.time || undefined,
    type,
    status,
    relatedIdeaId: item.relatedIdeaId || undefined,
    relatedProjectId: item.relatedProjectId || undefined,
    relatedTaskId: item.relatedTaskId || undefined,
    priority,
    createdAt: item.createdAt || new Date().toISOString(),
  }
}

function calendarItemsNeedMigration(storedItems: StoredCalendarItem[], normalizedItems: CalendarItem[]) {
  return storedItems.some((item, index) => JSON.stringify(item) !== JSON.stringify(normalizedItems[index]))
}

function sortCalendarItems(items: CalendarItem[]) {
  return [...items].sort((a, b) => `${a.date}T${a.time || '23:59'}`.localeCompare(`${b.date}T${b.time || '23:59'}`))
}

function isOverdue(item: CalendarItem, todayKey: string) {
  return item.date < todayKey && item.status !== 'Completed'
}

export function Calendar() {
  const todayKey = toDateKey(new Date())
  const [storedItems, setItems] = useLocalStorage<StoredCalendarItem[]>(calendarStorageKey, sampleCalendarItems)
  const [ideas] = useLocalStorage<Idea[]>(ideaStorageKey, sampleIdeas)
  const [projects] = useLocalStorage<Project[]>(projectStorageKey, sampleProjects)
  const items = useMemo(() => storedItems.map(normalizeCalendarItem), [storedItems])
  const today = parseDateKey(todayKey)
  const [visibleMonth, setVisibleMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(todayKey)
  const [typeFilter, setTypeFilter] = useState<CalendarItemType | typeof allFilter>(allFilter)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState<CalendarFormState>(emptyForm(todayKey))
  const isMobile = useMediaQuery('(max-width: 767px)')

  useEffect(() => {
    if (calendarItemsNeedMigration(storedItems, items)) {
      setItems(items)
    }
  }, [items, setItems, storedItems])

  const filteredItems = useMemo(
    () => sortCalendarItems(typeFilter === allFilter ? items : items.filter((item) => item.type === typeFilter)),
    [items, typeFilter],
  )
  const monthDays = useMemo(() => buildMonthDays(visibleMonth), [visibleMonth])
  const selectedItems = filteredItems.filter((item) => item.date === selectedDate)
  const upcomingItems = filteredItems.filter((item) => item.date >= todayKey && item.date <= toDateKey(addDays(today, 7)) && item.status !== 'Completed').slice(0, 7)
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(today, index))
  const weeklyItems = filteredItems.filter((item) => item.date >= todayKey && item.date <= toDateKey(addDays(today, 6)))
  const activeProjectTasks = projects.find((project) => project.id === form.relatedProjectId)?.tasks ?? []

  const openAddModal = (date = selectedDate) => {
    setForm(emptyForm(date))
    setSelectedDate(date)
    setIsModalOpen(true)
  }

  const saveCalendarItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.title.trim() || !form.date) {
      return
    }

    const newItem: CalendarItem = {
      id: `calendar-${crypto.randomUUID()}`,
      title: form.title.trim(),
      description: form.description.trim() || 'Scheduled execution block.',
      date: form.date,
      time: form.time || undefined,
      type: form.type,
      status: form.status,
      relatedIdeaId: form.relatedIdeaId || undefined,
      relatedProjectId: form.relatedProjectId || undefined,
      relatedTaskId: form.relatedTaskId || undefined,
      priority: form.priority,
      createdAt: new Date().toISOString(),
    }

    setItems((currentItems) => [newItem, ...currentItems])
    setSelectedDate(form.date)
    setIsModalOpen(false)
  }

  const toggleComplete = (itemId: string) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, status: item.status === 'Completed' ? 'Scheduled' : 'Completed' } : item,
      ),
    )
  }

  const moveMonth = (offset: number) => {
    setVisibleMonth((currentMonth) => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1))
  }

  return (
    <Section
      eyebrow="Execute"
      title="Calendar"
      description="Turn ideas and projects into scheduled execution with monthly planning, weekly actions, and focused upcoming commitments."
    >
      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.8fr]">
        <div className="grid gap-6">
          <Card className="overflow-hidden p-0">
            <div className="border-b border-white/10 bg-white/[0.045] p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.28em] text-violet">
                    <CalendarClock size={17} /> Monthly plan
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{formatMonthTitle(visibleMonth)}</h2>
                </div>
                <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-center">
                  <label className="relative">
                    <Filter className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-silver/45" size={16} />
                    <select
                      aria-label="Filter calendar by type"
                      className="min-h-11 w-full rounded-2xl border border-white/10 bg-navy/70 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-violet/70 focus:ring-4 focus:ring-violet/15"
                      onChange={(event) => setTypeFilter(event.target.value as CalendarItemType | typeof allFilter)}
                      value={typeFilter}
                    >
                      <option value={allFilter}>All types</option>
                      {calendarItemTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="flex min-h-11 justify-between rounded-full border border-white/10 bg-navy/55 p-1">
                    <button className="rounded-full p-2 text-silver transition hover:bg-white/10 hover:text-white" onClick={() => moveMonth(-1)} type="button" aria-label="Previous month">
                      <ArrowLeft size={18} />
                    </button>
                    <button className="rounded-full px-4 py-2 text-sm font-semibold text-violet transition hover:bg-white/10 hover:text-white" onClick={() => setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1))} type="button">
                      Today
                    </button>
                    <button className="rounded-full p-2 text-silver transition hover:bg-white/10 hover:text-white" onClick={() => moveMonth(1)} type="button" aria-label="Next month">
                      <ArrowRight size={18} />
                    </button>
                  </div>
                  <Button className="w-full sm:w-auto" onClick={() => openAddModal()} type="button">
                    <Plus className="mr-2" size={17} /> Add item
                  </Button>
                </div>
              </div>
            </div>

            <motion.div
              key={visibleMonth.toISOString()}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, ease: 'easeOut' }}
              className="hidden p-4 sm:block sm:p-5"
            >
              <div className="mb-3 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-silver/50">
                {dayLabels.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {monthDays.map((day, index) => {
                  const dayItems = filteredItems.filter((item) => item.date === day.dateKey)
                  const isToday = day.dateKey === todayKey
                  const isSelected = day.dateKey === selectedDate

                  return (
                    <motion.button
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.012, ease: 'easeOut' }}
                      className={`min-h-32 rounded-3xl border p-3 text-left transition ${
                        isSelected
                          ? 'border-violet/70 bg-violet/15 shadow-glow'
                          : isToday
                            ? 'border-silver/50 bg-white/[0.11] shadow-[0_0_30px_rgba(216,222,233,0.14)]'
                            : 'border-white/10 bg-navy/45 hover:border-violet/40 hover:bg-white/[0.075]'
                      } ${day.isCurrentMonth ? 'opacity-100' : 'opacity-45'}`}
                      key={day.dateKey}
                      onClick={() => setSelectedDate(day.dateKey)}
                      onDoubleClick={() => openAddModal(day.dateKey)}
                      type="button"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-semibold ${isToday ? 'bg-silver text-navy' : 'bg-white/10 text-white'}`}>
                          {day.date.getDate()}
                        </span>
                        {dayItems.length > 0 ? <span className="rounded-full bg-white/10 px-2 py-1 text-[0.65rem] text-silver">{dayItems.length}</span> : null}
                      </div>
                      <div className="mt-3 grid gap-1.5">
                        {dayItems.slice(0, 3).map((item) => (
                          <span
                            className={`truncate rounded-xl border px-2 py-1 text-[0.68rem] font-semibold ${typeStyles[item.type]} ${isOverdue(item, todayKey) ? 'ring-1 ring-rose-300/40' : ''}`}
                            key={item.id}
                          >
                            {item.time ? `${item.time} · ` : ''}
                            {item.title}
                          </span>
                        ))}
                        {dayItems.length > 3 ? <span className="text-[0.68rem] text-silver/55">+{dayItems.length - 3} more</span> : null}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>

            <div className="grid gap-4 p-4 sm:hidden">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">This week</h3>
                  <p className="mt-1 text-sm text-silver/65">A thumb-friendly action list for the next 7 days.</p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-silver">{weeklyItems.length} items</span>
              </div>
              <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" aria-label="Select a day this week">
                {weekDays.map((date) => {
                  const dateKey = toDateKey(date)
                  const dayItems = filteredItems.filter((item) => item.date === dateKey)
                  const isSelected = dateKey === selectedDate

                  return (
                    <button
                      className={`min-w-[4.6rem] rounded-2xl border px-3 py-3 text-center transition ${isSelected ? 'border-violet/60 bg-violet/15 text-white shadow-glow' : 'border-white/10 bg-navy/45 text-silver hover:text-white'}`}
                      key={dateKey}
                      onClick={() => setSelectedDate(dateKey)}
                      type="button"
                    >
                      <span className="block text-xs font-semibold uppercase tracking-[0.18em]">{dayLabels[date.getDay()]}</span>
                      <span className="mt-1 block text-lg font-semibold">{date.getDate()}</span>
                      <span className="mt-1 block text-[0.68rem] text-silver/60">{dayItems.length} item{dayItems.length === 1 ? '' : 's'}</span>
                    </button>
                  )
                })}
              </div>
              {weeklyItems.length > 0 ? weeklyItems.map((item) => <CalendarItemRow item={item} key={item.id} onToggleComplete={() => toggleComplete(item.id)} todayKey={todayKey} />) : <EmptyState text="No actions scheduled in the next 7 days." />}
            </div>
          </Card>

          <Card>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-violet">Selected date</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{formatShortDate(selectedDate)}</h2>
              </div>
              <Button onClick={() => openAddModal(selectedDate)} type="button" variant="secondary">
                <Plus className="mr-2" size={17} /> Add to this date
              </Button>
            </div>
            <div className="grid gap-3">
              {selectedItems.length > 0 ? selectedItems.map((item) => <CalendarItemRow item={item} key={item.id} onToggleComplete={() => toggleComplete(item.id)} todayKey={todayKey} ideas={ideas} projects={projects} />) : <EmptyState text="No items on this date. Add an execution block or deadline." />}
            </div>
          </Card>
        </div>

        <motion.aside initial={isMobile ? { opacity: 0, y: 12 } : { opacity: 0, x: 22 }} animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }} transition={{ duration: isMobile ? 0.24 : 0.45, ease: 'easeOut' }} className="grid content-start gap-6">
          <Card className="bg-gradient-to-br from-violet/15 via-white/[0.07] to-sky-300/10">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet/20 text-violet">
                <Sparkles size={21} />
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-violet">Upcoming</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">Next 7 days</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              <AnimatePresence mode="popLayout">
                {upcomingItems.length > 0 ? upcomingItems.map((item, index) => <UpcomingItem index={index} item={item} key={item.id} todayKey={todayKey} />) : <EmptyState text="No upcoming actions. Protect time for your next priority." />}
              </AnimatePresence>
            </div>
          </Card>

          <Card>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-violet">Weekly action list</p>
            <div className="mt-5 grid gap-3">
              {weeklyItems.length > 0 ? weeklyItems.map((item) => <CalendarItemRow compact item={item} key={item.id} onToggleComplete={() => toggleComplete(item.id)} todayKey={todayKey} />) : <EmptyState text="The week is open. Add a focused action to begin." />}
            </div>
          </Card>
        </motion.aside>
      </div>

      <AnimatePresence>
        {isModalOpen ? (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/75 p-0 backdrop-blur-sm sm:grid sm:place-items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.form
              initial={isMobile ? { y: '100%' } : { opacity: 0, y: 28, scale: 0.96 }}
              animate={isMobile ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
              exit={isMobile ? { y: '100%' } : { opacity: 0, y: 18, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: isMobile ? 320 : 260, damping: 30 }}
              className="max-h-[92svh] w-full max-w-3xl overflow-y-auto rounded-t-[2rem] border border-white/10 bg-[#091424]/95 p-5 shadow-glass sm:max-h-[92vh] sm:rounded-[2rem] sm:p-7"
              onSubmit={saveCalendarItem}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-violet">Add calendar item</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Schedule execution</h2>
                </div>
                <button className="rounded-2xl border border-white/10 bg-white/10 p-3 text-silver transition hover:text-white" onClick={() => setIsModalOpen(false)} type="button">
                  <X size={19} />
                </button>
              </div>

              <div className="grid gap-4">
                <input className="min-h-11 rounded-2xl border border-white/10 bg-navy/65 px-4 py-3 text-base text-white outline-none transition placeholder:text-silver/45 focus:border-violet/70 focus:ring-4 focus:ring-violet/15" onChange={(event) => setForm((currentForm) => ({ ...currentForm, title: event.target.value }))} placeholder="Calendar item title..." value={form.title} />
                <textarea className="min-h-24 rounded-2xl border border-white/10 bg-navy/65 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-silver/45 focus:border-violet/70 focus:ring-4 focus:ring-violet/15" onChange={(event) => setForm((currentForm) => ({ ...currentForm, description: event.target.value }))} placeholder="Why does this belong on the calendar?" value={form.description} />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <InputField label="Date" onChange={(value) => setForm((currentForm) => ({ ...currentForm, date: value }))} type="date" value={form.date} />
                  <InputField label="Time" onChange={(value) => setForm((currentForm) => ({ ...currentForm, time: value }))} type="time" value={form.time} />
                  <SelectField label="Type" onChange={(value) => setForm((currentForm) => ({ ...currentForm, type: value as CalendarItemType }))} options={calendarItemTypes} value={form.type} />
                  <SelectField label="Priority" onChange={(value) => setForm((currentForm) => ({ ...currentForm, priority: value as ProjectPriority }))} options={projectPriorities} value={form.priority} />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <SelectField label="Status" onChange={(value) => setForm((currentForm) => ({ ...currentForm, status: value as CalendarItemStatus }))} options={calendarItemStatuses} value={form.status} />
                  <SelectField label="Idea link" onChange={(value) => setForm((currentForm) => ({ ...currentForm, relatedIdeaId: value }))} options={ideas.map((idea) => ({ label: idea.title, value: idea.id }))} placeholder="No idea" value={form.relatedIdeaId} />
                  <SelectField label="Project link" onChange={(value) => setForm((currentForm) => ({ ...currentForm, relatedProjectId: value, relatedTaskId: '' }))} options={projects.map((project) => ({ label: project.title, value: project.id }))} placeholder="No project" value={form.relatedProjectId} />
                </div>
                <SelectField label="Task link" onChange={(value) => setForm((currentForm) => ({ ...currentForm, relatedTaskId: value, type: value ? 'Project Task' : currentForm.type }))} options={activeProjectTasks.map((task) => ({ label: task.title, value: task.id }))} placeholder={form.relatedProjectId ? 'No task' : 'Choose a project first'} value={form.relatedTaskId} />
                <Button className="w-full" type="submit">
                  <Plus className="mr-2" size={17} /> Schedule item
                </Button>
              </div>
            </motion.form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Section>
  )
}

type CalendarItemRowProps = {
  compact?: boolean
  ideas?: Idea[]
  item: CalendarItem
  onToggleComplete: () => void
  projects?: Project[]
  todayKey: string
}

function CalendarItemRow({ compact = false, ideas = [], item, onToggleComplete, projects = [], todayKey }: CalendarItemRowProps) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const idea = ideas.find((currentIdea) => currentIdea.id === item.relatedIdeaId)
  const project = projects.find((currentProject) => currentProject.id === item.relatedProjectId)
  const task = project?.tasks.find((currentTask) => currentTask.id === item.relatedTaskId)
  const overdue = isOverdue(item, todayKey)

  return (
    <motion.div layout initial={isMobile ? { opacity: 0, y: 8 } : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className={`rounded-3xl border p-4 ${overdue ? 'border-rose-300/30 bg-rose-400/10' : 'border-white/10 bg-white/[0.055]'} ${item.status === 'Completed' ? 'opacity-70' : ''}`}>
      <div className="flex items-start gap-3">
        <button className="mt-0.5 min-h-10 min-w-10 rounded-full text-silver/60 transition hover:text-white" onClick={onToggleComplete} type="button" aria-label={`Toggle ${item.title} complete`}>
          {item.status === 'Completed' ? <CheckCircle2 className="text-emerald-100" size={22} /> : <Circle size={22} />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold ${typeStyles[item.type]}`}>{item.type}</span>
            <span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ${statusStyles[item.status]}`}>{item.status}</span>
            {overdue ? <span className="rounded-full bg-rose-400/15 px-2.5 py-1 text-[0.68rem] font-semibold text-rose-100">Overdue</span> : null}
          </div>
          <h3 className={`mt-3 font-semibold ${compact ? 'text-sm' : 'text-base'} ${item.status === 'Completed' ? 'text-silver line-through decoration-silver/60' : 'text-white'}`}>{item.title}</h3>
          {!compact ? <p className="mt-2 text-sm leading-6 text-silver/70">{item.description}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-silver/60">
            <span className="rounded-full bg-navy/45 px-2.5 py-1">{formatShortDate(item.date)}</span>
            {item.time ? <span className="inline-flex items-center gap-1 rounded-full bg-navy/45 px-2.5 py-1"><Clock3 size={13} /> {item.time}</span> : null}
            <span className={`rounded-full bg-navy/45 px-2.5 py-1 ${priorityStyles[item.priority]}`}>{item.priority}</span>
            {idea ? <span className="inline-flex items-center gap-1 rounded-full bg-violet/10 px-2.5 py-1 text-violet"><Link2 size={13} /> Idea: {idea.title}</span> : null}
            {project ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-300/10 px-2.5 py-1 text-emerald-100"><Link2 size={13} /> Project: {project.title}</span> : null}
            {task ? <span className="rounded-full bg-white/10 px-2.5 py-1">Task: {task.title}</span> : null}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

type UpcomingItemProps = {
  index: number
  item: CalendarItem
  todayKey: string
}

function UpcomingItem({ index, item, todayKey }: UpcomingItemProps) {
  const isMobile = useMediaQuery('(max-width: 767px)')

  return (
    <motion.div
      initial={isMobile ? { opacity: 0, y: 8 } : { opacity: 0, x: 24 }}
      animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }}
      exit={isMobile ? { opacity: 0, y: -8 } : { opacity: 0, x: -16 }}
      transition={{ duration: isMobile ? 0.2 : 0.3, delay: isMobile ? 0 : index * 0.045, ease: 'easeOut' }}
      className={`rounded-2xl border p-3 ${isOverdue(item, todayKey) ? 'border-rose-300/30 bg-rose-400/10' : 'border-white/10 bg-navy/45'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{item.title}</p>
          <p className="mt-1 text-xs text-silver/60">{formatShortDate(item.date)}{item.time ? ` · ${item.time}` : ''}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2 py-1 text-[0.65rem] font-semibold ${typeStyles[item.type]}`}>{item.type}</span>
      </div>
    </motion.div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-3xl border border-dashed border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-silver/60">{text}</p>
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
      <select className="min-h-11 rounded-2xl border border-white/10 bg-navy/70 px-4 py-3 text-sm normal-case tracking-normal text-white outline-none transition focus:border-violet/70 focus:ring-4 focus:ring-violet/15" onChange={(event) => onChange(event.target.value)} value={value}>
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value
          const optionLabel = typeof option === 'string' ? option : option.label
          return <option key={optionValue} value={optionValue}>{optionLabel}</option>
        })}
      </select>
    </label>
  )
}

type InputFieldProps = {
  label: string
  onChange: (value: string) => void
  type: 'date' | 'time'
  value: string
}

function InputField({ label, onChange, type, value }: InputFieldProps) {
  return (
    <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-silver/55">
      {label}
      <input className="min-h-11 rounded-2xl border border-white/10 bg-navy/70 px-4 py-3 text-sm normal-case tracking-normal text-white outline-none transition focus:border-violet/70 focus:ring-4 focus:ring-violet/15" onChange={(event) => onChange(event.target.value)} type={type} value={value} />
    </label>
  )
}
