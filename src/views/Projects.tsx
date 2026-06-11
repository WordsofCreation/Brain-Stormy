import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  ClipboardList,
  Edit3,
  Flag,
  FolderKanban,
  Lightbulb,
  Link2,
  Plus,
  Sparkles,
  Target,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { Section } from '../components/Section'
import { sampleCalendarItems, sampleIdeas, sampleProjects } from '../data/sampleData'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useMediaQuery } from '../hooks/useMediaQuery'
import {
  projectCategories,
  projectPriorities,
  projectStatuses,
  type CalendarItem,
  type Idea,
  type Project,
  type ProjectCategory,
  type ProjectPriority,
  type ProjectStatus,
  type ProjectTask,
} from '../types'

const projectStorageKey = 'brain-stormy-projects'
const ideaStorageKey = 'brain-stormy-ideas'
const calendarStorageKey = 'brain-stormy-calendar-items'

const emptyProjectForm: ProjectFormState = {
  title: '',
  description: '',
  category: 'Product',
  status: 'Planning',
  priority: 'Medium',
  targetDate: '',
  ideaIds: [],
  notes: '',
}

const emptyTaskForm: TaskFormState = {
  title: '',
  dueDate: '',
  notes: '',
}

const statusStyles: Record<ProjectStatus, string> = {
  Planning: 'border-sky-300/20 bg-sky-300/10 text-sky-100',
  Active: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100',
  Waiting: 'border-amber-300/20 bg-amber-300/10 text-amber-100',
  Scheduled: 'border-violet/30 bg-violet/15 text-violet',
  Completed: 'border-white/20 bg-white/15 text-white',
}

const priorityStyles: Record<ProjectPriority, string> = {
  Low: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100',
  Medium: 'border-sky-300/20 bg-sky-300/10 text-sky-100',
  High: 'border-amber-300/20 bg-amber-300/10 text-amber-100',
  Urgent: 'border-rose-300/25 bg-rose-400/15 text-rose-100',
}

type ProjectFormState = {
  title: string
  description: string
  category: ProjectCategory
  status: ProjectStatus
  priority: ProjectPriority
  targetDate: string
  ideaIds: string[]
  notes: string
}

type TaskFormState = {
  title: string
  dueDate: string
  notes: string
}

type StoredProject = Partial<Project> & {
  name?: string
  progress?: number
  nextStep?: string
}

function getTomorrowKey() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`
}

function formatDate(value: string) {
  if (!value) {
    return 'No target date'
  }

  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
}

function calculateProgress(tasks: ProjectTask[]) {
  if (tasks.length === 0) {
    return 0
  }

  return Math.round((tasks.filter((task) => task.completed).length / tasks.length) * 100)
}

function normalizeStoredProject(project: StoredProject, index: number): Project {
  const category = project.category && (projectCategories as readonly string[]).includes(project.category) ? project.category : 'Other'
  const status = project.status && (projectStatuses as readonly string[]).includes(project.status) ? project.status : 'Planning'
  const priority = project.priority && (projectPriorities as readonly string[]).includes(project.priority) ? project.priority : 'Medium'
  const title = project.title?.trim() || project.name?.trim() || `Untitled project ${index + 1}`
  const tasks = Array.isArray(project.tasks) ? project.tasks.map(normalizeTask).filter((task) => task.title.trim()) : []
  const ideaIds = Array.isArray(project.ideaIds) ? [...new Set(project.ideaIds.filter(Boolean))] : []

  return {
    id: project.id || `project-${index + 1}`,
    title,
    description: project.description?.trim() || 'Turn this promising idea into a structured plan with action steps.',
    category: category as ProjectCategory,
    status: status as ProjectStatus,
    priority: priority as ProjectPriority,
    targetDate: project.targetDate || '',
    ideaIds,
    tasks,
    createdAt: project.createdAt || new Date().toISOString(),
    notes: project.notes?.trim() || project.nextStep?.trim() || '',
  }
}

function normalizeTask(task: Partial<ProjectTask>): ProjectTask {
  return {
    id: task.id || `task-${crypto.randomUUID()}`,
    title: task.title?.trim() || '',
    completed: Boolean(task.completed),
    dueDate: task.dueDate || undefined,
    notes: task.notes?.trim() || undefined,
  }
}

function projectsNeedMigration(storedProjects: StoredProject[], normalizedProjects: Project[]) {
  return storedProjects.some((project, index) => JSON.stringify(project) !== JSON.stringify(normalizedProjects[index]))
}

function projectToForm(project: Project): ProjectFormState {
  return {
    title: project.title,
    description: project.description,
    category: project.category,
    status: project.status,
    priority: project.priority,
    targetDate: project.targetDate,
    ideaIds: project.ideaIds,
    notes: project.notes,
  }
}

function buildProjectFromForm(form: ProjectFormState, existingProject?: Project): Project {
  return {
    id: existingProject?.id ?? `project-${crypto.randomUUID()}`,
    title: form.title.trim(),
    description: form.description.trim() || 'Turn this promising idea into a structured plan with action steps.',
    category: form.category,
    status: form.status,
    priority: form.priority,
    targetDate: form.targetDate,
    ideaIds: form.ideaIds,
    tasks: existingProject?.tasks ?? [],
    createdAt: existingProject?.createdAt ?? new Date().toISOString(),
    notes: form.notes.trim(),
  }
}

export function Projects() {
  const [storedProjects, setProjects] = useLocalStorage<Project[]>(projectStorageKey, sampleProjects)
  const [ideas] = useLocalStorage<Idea[]>(ideaStorageKey, sampleIdeas)
  const [, setCalendarItems] = useLocalStorage<CalendarItem[]>(calendarStorageKey, sampleCalendarItems)
  const projects = useMemo(() => storedProjects.map(normalizeStoredProject), [storedProjects])
  const [projectForm, setProjectForm] = useState<ProjectFormState>(emptyProjectForm)
  const [activeProjectId, setActiveProjectId] = useState('')
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [taskForm, setTaskForm] = useState<TaskFormState>(emptyTaskForm)
  const isMobile = useMediaQuery('(max-width: 767px)')

  useEffect(() => {
    if (projectsNeedMigration(storedProjects, projects)) {
      setProjects(projects)
    }
  }, [projects, setProjects, storedProjects])


  const activeProject = projects.find((project) => project.id === activeProjectId) ?? null
  const editingProject = editingProjectId ? projects.find((project) => project.id === editingProjectId) ?? null : null
  const availableIdeas = useMemo(() => ideas.filter((idea) => !projectForm.ideaIds.includes(idea.id)), [ideas, projectForm.ideaIds])

  const projectStats = useMemo(() => {
    const taskCount = projects.reduce((count, project) => count + project.tasks.length, 0)
    const completedTasks = projects.reduce((count, project) => count + project.tasks.filter((task) => task.completed).length, 0)
    const averageProgress = projects.length > 0 ? Math.round(projects.reduce((total, project) => total + calculateProgress(project.tasks), 0) / projects.length) : 0

    return { taskCount, completedTasks, averageProgress }
  }, [projects])

  const saveProject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!projectForm.title.trim()) {
      return
    }

    if (editingProject) {
      const updatedProject = buildProjectFromForm(projectForm, editingProject)
      setProjects((currentProjects) => currentProjects.map((project) => (project.id === editingProject.id ? updatedProject : project)))
      setActiveProjectId(updatedProject.id)
      setEditingProjectId(null)
    } else {
      const newProject = buildProjectFromForm(projectForm)
      setProjects((currentProjects) => [newProject, ...currentProjects])
      setActiveProjectId(newProject.id)
    }

    setProjectForm(emptyProjectForm)
  }

  const startEditingProject = (project: Project) => {
    setEditingProjectId(project.id)
    setProjectForm(projectToForm(project))
    setActiveProjectId(project.id)
  }

  const cancelProjectEdit = () => {
    setEditingProjectId(null)
    setProjectForm(emptyProjectForm)
  }

  const deleteProject = (project: Project) => {
    const confirmed = window.confirm(`Delete “${project.title}”? Attached ideas and tasks will remain in storage only as their original ideas.`)

    if (!confirmed) {
      return
    }

    setProjects((currentProjects) => currentProjects.filter((currentProject) => currentProject.id !== project.id))
    if (activeProjectId === project.id) {
      setActiveProjectId(projects.find((currentProject) => currentProject.id !== project.id)?.id ?? '')
    }
    if (editingProjectId === project.id) {
      cancelProjectEdit()
    }
  }

  const addTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!activeProject || !taskForm.title.trim()) {
      return
    }

    const newTask: ProjectTask = {
      id: `task-${crypto.randomUUID()}`,
      title: taskForm.title.trim(),
      completed: false,
      dueDate: taskForm.dueDate || undefined,
      notes: taskForm.notes.trim() || undefined,
    }

    setProjects((currentProjects) =>
      currentProjects.map((project) => (project.id === activeProject.id ? { ...project, tasks: [...project.tasks, newTask] } : project)),
    )
    setTaskForm(emptyTaskForm)
  }

  const toggleTask = (projectId: string, taskId: string) => {
    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              tasks: project.tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)),
            }
          : project,
      ),
    )
  }

  const deleteTask = (projectId: string, taskId: string) => {
    setProjects((currentProjects) =>
      currentProjects.map((project) => (project.id === projectId ? { ...project, tasks: project.tasks.filter((task) => task.id !== taskId) } : project)),
    )
  }


  const scheduleTask = (project: Project, task: ProjectTask) => {
    const scheduledItem: CalendarItem = {
      id: `calendar-${crypto.randomUUID()}`,
      title: task.title,
      description: task.notes || `Scheduled task for ${project.title}.`,
      date: task.dueDate || getTomorrowKey(),
      time: '10:00',
      type: 'Project Task',
      status: 'Scheduled',
      relatedProjectId: project.id,
      relatedTaskId: task.id,
      priority: project.priority,
      createdAt: new Date().toISOString(),
    }

    setCalendarItems((currentItems) => [scheduledItem, ...currentItems])
  }

  const attachIdea = (ideaId: string) => {
    if (!ideaId || projectForm.ideaIds.includes(ideaId)) {
      return
    }

    setProjectForm((form) => ({ ...form, ideaIds: [...form.ideaIds, ideaId] }))
  }

  const detachIdea = (ideaId: string) => {
    setProjectForm((form) => ({ ...form, ideaIds: form.ideaIds.filter((currentIdeaId) => currentIdeaId !== ideaId) }))
  }

  return (
    <Section
      eyebrow="Build"
      title="Projects"
      description="Promote promising ideas into structured plans with owners, target dates, action steps, and visible momentum."
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.5fr]">
        <motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="rounded-[1.75rem] border border-white/10 bg-white/[0.08] p-4 shadow-glass backdrop-blur-2xl sm:rounded-[2rem] sm:p-6"
          onSubmit={saveProject}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-violet">{editingProject ? 'Edit project' : 'Create project'}</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">{editingProject ? 'Refine the plan' : 'Shape the next plan'}</h2>
            </div>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet/20 text-violet">
              <FolderKanban size={21} />
            </span>
          </div>

          <div className="grid gap-3">
            <input
              aria-label="Project title"
              className="rounded-2xl border border-white/10 bg-navy/55 px-4 py-3 text-base text-white outline-none transition placeholder:text-silver/45 focus:border-violet/70 focus:ring-4 focus:ring-violet/15"
              onChange={(event) => setProjectForm((form) => ({ ...form, title: event.target.value }))}
              placeholder="Project title..."
              value={projectForm.title}
            />
            <textarea
              aria-label="Project description"
              className="min-h-20 rounded-2xl border border-white/10 bg-navy/55 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-silver/45 focus:border-violet/70 focus:ring-4 focus:ring-violet/15"
              onChange={(event) => setProjectForm((form) => ({ ...form, description: event.target.value }))}
              placeholder="What outcome should this project create?"
              value={projectForm.description}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField label="Category" onChange={(value) => setProjectForm((form) => ({ ...form, category: value as ProjectCategory }))} options={projectCategories} value={projectForm.category} />
              <SelectField label="Status" onChange={(value) => setProjectForm((form) => ({ ...form, status: value as ProjectStatus }))} options={projectStatuses} value={projectForm.status} />
              <SelectField label="Priority" onChange={(value) => setProjectForm((form) => ({ ...form, priority: value as ProjectPriority }))} options={projectPriorities} value={projectForm.priority} />
              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-silver/55">
                Target date
                <input
                  className="rounded-2xl border border-white/10 bg-navy/70 px-4 py-3 text-sm normal-case tracking-normal text-white outline-none transition focus:border-violet/70 focus:ring-4 focus:ring-violet/15"
                  onChange={(event) => setProjectForm((form) => ({ ...form, targetDate: event.target.value }))}
                  type="date"
                  value={projectForm.targetDate}
                />
              </label>
            </div>
            <textarea
              aria-label="Project notes"
              className="min-h-20 rounded-2xl border border-white/10 bg-navy/55 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-silver/45 focus:border-violet/70 focus:ring-4 focus:ring-violet/15"
              onChange={(event) => setProjectForm((form) => ({ ...form, notes: event.target.value }))}
              placeholder="Notes, constraints, or success criteria..."
              value={projectForm.notes}
            />
          </div>

          <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.055] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Attached ideas</p>
                <p className="mt-1 text-xs text-silver/60">Connect inbox ideas using project.ideaIds.</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-silver">{projectForm.ideaIds.length}</span>
            </div>

            <div className="mt-4 grid gap-2">
              {projectForm.ideaIds.length > 0 ? (
                projectForm.ideaIds.map((ideaId) => {
                  const idea = ideas.find((currentIdea) => currentIdea.id === ideaId)
                  return (
                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-navy/55 px-3 py-2 text-sm" key={ideaId}>
                      <span className="line-clamp-1 text-silver">{idea?.title ?? 'Missing idea'}</span>
                      <button className="text-silver/60 transition hover:text-rose-100" onClick={() => detachIdea(ideaId)} type="button">
                        <X size={16} />
                      </button>
                    </div>
                  )
                })
              ) : (
                <p className="rounded-2xl border border-dashed border-white/10 px-3 py-3 text-sm text-silver/55">No ideas attached yet.</p>
              )}
            </div>

            <select
              aria-label="Attach idea"
              className="mt-3 w-full rounded-2xl border border-white/10 bg-navy/70 px-4 py-3 text-sm text-white outline-none transition focus:border-violet/70 focus:ring-4 focus:ring-violet/15"
              onChange={(event) => attachIdea(event.target.value)}
              value=""
            >
              <option value="">Attach an idea...</option>
              {availableIdeas.map((idea) => (
                <option key={idea.id} value={idea.id}>
                  {idea.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1" type="submit">
              <Plus className="mr-2" size={17} /> {editingProject ? 'Save project' : 'Create project'}
            </Button>
            {editingProject ? (
              <Button className="flex-1" onClick={cancelProjectEdit} type="button" variant="secondary">
                Cancel edit
              </Button>
            ) : null}
          </div>
        </motion.form>

        <div className="grid gap-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard icon={FolderKanban} label="Projects" value={projects.length.toString()} />
            <MetricCard icon={CheckCircle2} label="Tasks done" value={`${projectStats.completedTasks}/${projectStats.taskCount}`} />
            <MetricCard icon={Target} label="Avg progress" value={`${projectStats.averageProgress}%`} />
          </div>

          <AnimatePresence mode="popLayout">
            {projects.length > 0 ? (
              <motion.div className="grid gap-4 lg:grid-cols-2" layout>
                {projects.map((project, index) => (
                  <ProjectCard
                    ideaCount={project.ideaIds.length}
                    isActive={project.id === activeProjectId}
                    key={project.id}
                    onDelete={() => deleteProject(project)}
                    onEdit={() => startEditingProject(project)}
                    onOpen={() => setActiveProjectId(project.id)}
                    project={project}
                    staggerDelay={isMobile ? 0 : index * 0.055}
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
                  <Sparkles size={24} />
                </div>
                <h2 className="mt-5 text-2xl font-semibold">No projects yet</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-silver/70">
                  Create the first project to convert your best ideas into tasks, dates, and progress you can see.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {activeProject ? (
          <ProjectDetailDrawer
            ideas={ideas.filter((idea) => activeProject.ideaIds.includes(idea.id))}
            onAddTask={addTask}
            onClose={() => setActiveProjectId('')}
            onDeleteTask={(taskId) => deleteTask(activeProject.id, taskId)}
            onEdit={() => startEditingProject(activeProject)}
            onTaskFormChange={setTaskForm}
            onToggleTask={(taskId) => toggleTask(activeProject.id, taskId)}
            onScheduleTask={(task) => scheduleTask(activeProject, task)}
            project={activeProject}
            taskForm={taskForm}
          />
        ) : null}
      </AnimatePresence>
    </Section>
  )
}

type SelectFieldProps = {
  label: string
  onChange: (value: string) => void
  options: readonly string[]
  value: string
}

function SelectField({ label, onChange, options, value }: SelectFieldProps) {
  return (
    <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-silver/55">
      {label}
      <select
        className="rounded-2xl border border-white/10 bg-navy/70 px-4 py-3 text-sm normal-case tracking-normal text-white outline-none transition focus:border-violet/70 focus:ring-4 focus:ring-violet/15"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

type MetricCardProps = {
  icon: typeof FolderKanban
  label: string
  value: string
}

function MetricCard({ icon: Icon, label, value }: MetricCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 shadow-glass backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between text-silver/60">
        <span className="text-xs font-semibold uppercase tracking-[0.2em]">{label}</span>
        <Icon size={17} />
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}

type ProjectCardProps = {
  ideaCount: number
  isActive: boolean
  onDelete: () => void
  onEdit: () => void
  onOpen: () => void
  project: Project
  staggerDelay: number
}

function ProjectCard({ ideaCount, isActive, onDelete, onEdit, onOpen, project, staggerDelay }: ProjectCardProps) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const progress = calculateProgress(project.tasks)
  const completedTasks = project.tasks.filter((task) => task.completed).length

  return (
    <motion.article
      layout
      initial={isMobile ? { opacity: 0, y: 10 } : { opacity: 0, y: 24, scale: 0.97 }}
      animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, scale: 1 }}
      exit={isMobile ? { opacity: 0, y: -8 } : { opacity: 0, y: -14, scale: 0.96 }}
      transition={{ duration: isMobile ? 0.22 : 0.45, delay: staggerDelay, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative overflow-hidden rounded-[1.75rem] border p-5 shadow-glass backdrop-blur-xl transition ${
        isActive ? 'border-violet/45 bg-violet/10' : 'border-white/10 bg-gradient-to-br from-white/[0.12] to-white/[0.045]'
      }`}
    >
      <div className="absolute -right-14 -top-14 h-32 w-32 rounded-full bg-violet/20 blur-3xl transition group-hover:bg-violet/30" />
      <div className="relative flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">{project.category}</span>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[project.status]}`}>{project.status}</span>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${priorityStyles[project.priority]}`}>{project.priority}</span>
      </div>

      <button className="relative mt-5 block text-left" onClick={onOpen} type="button">
        <h2 className="text-xl font-semibold tracking-tight text-white">{project.title}</h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-silver/75">{project.description}</p>
      </button>

      <div className="relative mt-5">
        <div className="mb-2 flex items-center justify-between text-xs text-silver/65">
          <span>{completedTasks} of {project.tasks.length} steps complete</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.85, delay: staggerDelay + 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-violet to-silver"
          />
        </div>
      </div>

      <div className="relative mt-5 grid gap-3 text-xs text-silver/70 sm:grid-cols-2">
        <span className="inline-flex items-center gap-2 rounded-2xl bg-white/[0.06] px-3 py-2">
          <CalendarDays size={14} /> {formatDate(project.targetDate)}
        </span>
        <span className="inline-flex items-center gap-2 rounded-2xl bg-white/[0.06] px-3 py-2">
          <Lightbulb size={14} /> {ideaCount} attached ideas
        </span>
      </div>

      <div className="relative mt-5 grid grid-cols-[1fr_auto_auto] gap-2">
        <Button className="flex-1 px-4 py-2.5" onClick={onOpen} type="button" variant="secondary">
          View details
        </Button>
        <button className="min-h-11 rounded-full border border-white/10 bg-white/5 px-4 text-silver transition hover:text-white" onClick={onEdit} type="button" aria-label={`Edit ${project.title}`}>
          <Edit3 size={17} />
        </button>
        <button
          className="min-h-11 rounded-full border border-white/10 bg-white/5 px-4 text-silver transition hover:border-rose-300/30 hover:bg-rose-400/10 hover:text-rose-100"
          onClick={onDelete}
          type="button"
          aria-label={`Delete ${project.title}`}
        >
          <Trash2 size={17} />
        </button>
      </div>
    </motion.article>
  )
}

type ProjectDetailDrawerProps = {
  ideas: Idea[]
  onAddTask: (event: FormEvent<HTMLFormElement>) => void
  onClose: () => void
  onDeleteTask: (taskId: string) => void
  onEdit: () => void
  onTaskFormChange: (value: TaskFormState | ((current: TaskFormState) => TaskFormState)) => void
  onToggleTask: (taskId: string) => void
  onScheduleTask: (task: ProjectTask) => void
  project: Project
  taskForm: TaskFormState
}

function ProjectDetailDrawer({ ideas, onAddTask, onClose, onDeleteTask, onEdit, onScheduleTask, onTaskFormChange, onToggleTask, project, taskForm }: ProjectDetailDrawerProps) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const progress = calculateProgress(project.tasks)

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-end bg-navy/70 backdrop-blur-sm sm:items-stretch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.aside
        initial={isMobile ? { y: '100%' } : { x: '100%' }}
        animate={isMobile ? { y: 0 } : { x: 0 }}
        exit={isMobile ? { y: '100%' } : { x: '100%' }}
        transition={{ type: 'spring', stiffness: isMobile ? 320 : 280, damping: 32 }}
        className="max-h-[92svh] w-full overflow-y-auto rounded-t-[2rem] border border-white/10 bg-[#091424]/95 p-5 shadow-glass sm:h-full sm:max-h-none sm:max-w-2xl sm:rounded-none sm:border-l sm:p-7"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-violet">Project details</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{project.title}</h2>
          </div>
          <button className="rounded-2xl border border-white/10 bg-white/10 p-3 text-silver transition hover:text-white" onClick={onClose} type="button" aria-label="Close project details">
            <X size={19} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">{project.category}</span>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[project.status]}`}>{project.status}</span>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${priorityStyles[project.priority]}`}>{project.priority} priority</span>
        </div>

        <p className="mt-5 text-sm leading-7 text-silver/78">{project.description}</p>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.06] p-4">
          <div className="mb-2 flex items-center justify-between text-sm text-silver/70">
            <span className="inline-flex items-center gap-2"><Target size={16} /> Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="h-full rounded-full bg-gradient-to-r from-violet to-silver" />
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <InfoTile icon={CalendarDays} label="Target date" value={formatDate(project.targetDate)} />
          <InfoTile icon={Flag} label="Created" value={formatDate(project.createdAt.slice(0, 10))} />
        </div>

        {project.notes ? (
          <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.05] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-silver/55">Notes</p>
            <p className="mt-2 text-sm leading-6 text-silver/78">{project.notes}</p>
          </div>
        ) : null}

        <div className="mt-7 rounded-3xl border border-white/10 bg-white/[0.055] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Attached ideas</p>
              <p className="mt-1 text-xs text-silver/60">Ideas connected through this project’s ideaIds.</p>
            </div>
            <Link2 className="text-silver/55" size={18} />
          </div>
          <div className="mt-4 grid gap-3">
            {ideas.length > 0 ? (
              ideas.map((idea) => (
                <div className="rounded-2xl border border-white/10 bg-navy/45 p-3" key={idea.id}>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-white/10 px-2.5 py-1 font-semibold text-white">{idea.category}</span>
                    <span className="rounded-full bg-violet/15 px-2.5 py-1 font-semibold text-violet">{idea.priority}</span>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-white">{idea.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-silver/65">{idea.description}</p>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-white/10 px-3 py-3 text-sm text-silver/55">No ideas attached to this project yet.</p>
            )}
          </div>
        </div>

        <form className="mt-7 rounded-3xl border border-white/10 bg-white/[0.055] p-4" onSubmit={onAddTask}>
          <div className="mb-4 flex items-center gap-2">
            <ClipboardList className="text-violet" size={18} />
            <h3 className="text-lg font-semibold">Add action step</h3>
          </div>
          <div className="grid gap-3">
            <input
              aria-label="Task title"
              className="min-h-11 rounded-2xl border border-white/10 bg-navy/65 px-4 py-3 text-base sm:text-sm text-white outline-none transition placeholder:text-silver/45 focus:border-violet/70 focus:ring-4 focus:ring-violet/15"
              onChange={(event) => onTaskFormChange((form) => ({ ...form, title: event.target.value }))}
              placeholder="Next action step..."
              value={taskForm.title}
            />
            <div className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
              <input
                aria-label="Task due date"
                className="min-h-11 rounded-2xl border border-white/10 bg-navy/65 px-4 py-3 text-base sm:text-sm text-white outline-none transition focus:border-violet/70 focus:ring-4 focus:ring-violet/15"
                onChange={(event) => onTaskFormChange((form) => ({ ...form, dueDate: event.target.value }))}
                type="date"
                value={taskForm.dueDate}
              />
              <input
                aria-label="Task notes"
                className="min-h-11 rounded-2xl border border-white/10 bg-navy/65 px-4 py-3 text-base sm:text-sm text-white outline-none transition placeholder:text-silver/45 focus:border-violet/70 focus:ring-4 focus:ring-violet/15"
                onChange={(event) => onTaskFormChange((form) => ({ ...form, notes: event.target.value }))}
                placeholder="Optional notes..."
                value={taskForm.notes}
              />
            </div>
            <Button className="w-full" type="submit">
              <Plus className="mr-2" size={17} /> Add step
            </Button>
          </div>
        </form>

        <div className="mt-7">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Task checklist</h3>
            <Button onClick={onEdit} type="button" variant="ghost" className="px-4 py-2">
              <Edit3 className="mr-2" size={16} /> Edit project
            </Button>
          </div>
          <div className="grid gap-3">
            <AnimatePresence mode="popLayout">
              {project.tasks.length > 0 ? (
                project.tasks.map((task) => (
                  <TaskItem key={task.id} onDelete={() => onDeleteTask(task.id)} onSchedule={() => onScheduleTask(task)} onToggle={() => onToggleTask(task.id)} task={task} />
                ))
              ) : (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-2xl border border-dashed border-white/10 px-3 py-4 text-sm text-silver/55"
                >
                  No action steps yet. Add the first one above to start tracking progress.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </motion.div>
  )
}

type InfoTileProps = {
  icon: typeof CalendarDays
  label: string
  value: string
}

function InfoTile({ icon: Icon, label, value }: InfoTileProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-silver/55">
        <Icon size={15} /> {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  )
}

type TaskItemProps = {
  onDelete: () => void
  onToggle: () => void
  onSchedule: () => void
  task: ProjectTask
}

function TaskItem({ onDelete, onSchedule, onToggle, task }: TaskItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: task.completed ? 0.99 : 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.96 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className={`rounded-2xl border p-3 transition ${task.completed ? 'border-emerald-300/20 bg-emerald-300/10' : 'border-white/10 bg-white/[0.055]'}`}
    >
      <div className="flex items-start gap-3">
        <button
          className={`mt-0.5 rounded-full transition ${task.completed ? 'text-emerald-100' : 'text-silver/55 hover:text-white'}`}
          onClick={onToggle}
          type="button"
          aria-label={task.completed ? `Mark ${task.title} incomplete` : `Complete ${task.title}`}
        >
          {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
        </button>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold ${task.completed ? 'text-emerald-50 line-through decoration-emerald-200/70' : 'text-white'}`}>{task.title}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-silver/60">
            {task.dueDate ? <span className="rounded-full bg-navy/45 px-2.5 py-1">Due {formatDate(task.dueDate)}</span> : null}
            {task.notes ? <span className="rounded-full bg-navy/45 px-2.5 py-1">{task.notes}</span> : null}
          </div>
        </div>
        <motion.span initial={false} animate={{ scale: task.completed ? 1 : 0.85, opacity: task.completed ? 1 : 0 }} className="text-emerald-100">
          <Check size={16} />
        </motion.span>
        <button className="min-h-10 min-w-10 rounded-full text-silver/45 transition hover:bg-white/10 hover:text-violet" onClick={onSchedule} type="button" aria-label={`Schedule ${task.title}`}>
          <CalendarDays size={16} />
        </button>
        <button className="min-h-10 min-w-10 rounded-full text-silver/45 transition hover:bg-white/10 hover:text-rose-100" onClick={onDelete} type="button" aria-label={`Delete ${task.title}`}>
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  )
}
