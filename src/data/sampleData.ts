import type { BoardColumn, CalendarEvent, Goal, Idea, Project } from '../types'

export const sampleIdeas: Idea[] = [
  {
    id: 'idea-1',
    title: 'AI-assisted weekly review ritual',
    description: 'A guided Friday flow that turns loose notes, links, and reflections into a cleaner plan for the next week.',
    category: 'Product',
    status: 'Reviewing',
    priority: 'High',
    tags: ['automation', 'planning', 'focus'],
    createdAt: '2026-06-03T10:15:00.000Z',
    favorite: true,
  },
  {
    id: 'idea-2',
    title: 'Personal knowledge reset weekend',
    description: 'Block a short weekend sprint to archive stale notes, tag useful references, and create a lightweight learning index.',
    category: 'Learning',
    status: 'Raw Idea',
    priority: 'Medium',
    tags: ['notes', 'learning', 'systems'],
    createdAt: '2026-06-04T16:40:00.000Z',
    favorite: false,
  },
  {
    id: 'idea-3',
    title: 'Quarterly finances command center',
    description: 'Create one dashboard for subscriptions, savings targets, upcoming bills, and quick monthly review prompts.',
    category: 'Finance',
    status: 'Approved',
    priority: 'Urgent',
    tags: ['dashboard', 'money', 'habits'],
    createdAt: '2026-06-05T08:20:00.000Z',
    favorite: true,
    projectId: 'project-2',
  },
  {
    id: 'idea-4',
    title: 'Tiny home studio refresh',
    description: 'Improve lighting, cable management, and recording backdrop so creative work feels easier to start.',
    category: 'Home',
    status: 'Parked',
    priority: 'Low',
    tags: ['workspace', 'creative', 'setup'],
    createdAt: '2026-06-06T13:05:00.000Z',
    favorite: false,
  },
  {
    id: 'idea-5',
    title: 'Evergreen article outline library',
    description: 'Build reusable outlines for essays, product updates, launch notes, and reflective posts.',
    category: 'Writing',
    status: 'Raw Idea',
    priority: 'Medium',
    tags: ['content', 'templates', 'publishing'],
    createdAt: '2026-06-07T18:30:00.000Z',
    favorite: false,
  },
]


export const sampleBoardColumns: BoardColumn[] = [
  {
    id: 'capture',
    title: 'Capture',
    description: 'Unfiltered sparks and quick notes.',
    ideas: ['Voice-note import', 'Inbox triage shortcut', 'Ambient thought timer'],
  },
  {
    id: 'shape',
    title: 'Shape',
    description: 'Structure promising concepts.',
    ideas: ['Goal ladder', 'Theme clustering', 'Decision matrix'],
  },
  {
    id: 'execute',
    title: 'Execute',
    description: 'Convert clarity into calendar momentum.',
    ideas: ['Monday launch block', 'Deep work sprint', 'Follow-up checklist'],
  },
]

export const sampleProjects: Project[] = [
  {
    id: 'project-1',
    title: 'Creative operating system',
    description: 'Turn scattered creative workflows into reusable templates for idea capture, production, and review.',
    category: 'Creative',
    status: 'Planning',
    priority: 'High',
    targetDate: '2026-07-18',
    ideaIds: ['idea-1', 'idea-5'],
    tasks: [
      { id: 'task-1-1', title: 'Define core project templates', completed: true, dueDate: '2026-06-14' },
      { id: 'task-1-2', title: 'Map publishing and review rituals', completed: false, dueDate: '2026-06-28' },
      { id: 'task-1-3', title: 'Create first dashboard prototype', completed: false, dueDate: '2026-07-10' },
    ],
    createdAt: '2026-06-02T09:00:00.000Z',
    notes: 'Keep the system lightweight enough to use during busy weeks.',
  },
  {
    id: 'project-2',
    title: 'Quarterly finances command center',
    description: 'Create one calm place to monitor subscriptions, savings targets, bills, and monthly finance reviews.',
    category: 'Finance',
    status: 'Active',
    priority: 'Urgent',
    targetDate: '2026-06-30',
    ideaIds: ['idea-3'],
    tasks: [
      { id: 'task-2-1', title: 'List recurring subscriptions', completed: true, dueDate: '2026-06-08' },
      { id: 'task-2-2', title: 'Design command center layout', completed: true, dueDate: '2026-06-12' },
      { id: 'task-2-3', title: 'Add monthly review prompts', completed: false, dueDate: '2026-06-20' },
      { id: 'task-2-4', title: 'Schedule first review block', completed: false, dueDate: '2026-06-27' },
    ],
    createdAt: '2026-06-05T08:20:00.000Z',
    notes: 'Start with visibility before automating any calculations.',
  },
  {
    id: 'project-3',
    title: 'Personal knowledge reset',
    description: 'Archive stale notes, tag useful references, and create a lightweight learning index for the next quarter.',
    category: 'Learning',
    status: 'Scheduled',
    priority: 'Medium',
    targetDate: '2026-08-03',
    ideaIds: ['idea-2'],
    tasks: [
      { id: 'task-3-1', title: 'Sort captured references', completed: false, dueDate: '2026-07-12' },
      { id: 'task-3-2', title: 'Create learning index categories', completed: false, dueDate: '2026-07-19' },
      { id: 'task-3-3', title: 'Archive stale notes', completed: false, dueDate: '2026-07-26' },
    ],
    createdAt: '2026-06-04T16:40:00.000Z',
    notes: 'Best handled as a short weekend sprint.',
  },
]


export const sampleCalendarEvents: CalendarEvent[] = [
  { id: 'event-1', date: 'Mon 09:00', title: 'Idea inbox sweep', type: 'Review' },
  { id: 'event-2', date: 'Tue 14:30', title: 'Storm map synthesis', type: 'Focus' },
  { id: 'event-3', date: 'Thu 11:00', title: 'Project milestone review', type: 'Execution' },
  { id: 'event-4', date: 'Fri 15:00', title: 'Weekly goal dashboard', type: 'Reflection' },
]

export const sampleGoals: Goal[] = [
  {
    id: 'goal-1',
    title: 'Turn 12 raw ideas into 3 active projects',
    metric: '7 ideas shaped',
    confidence: 72,
  },
  {
    id: 'goal-2',
    title: 'Protect four deep work sessions this week',
    metric: '2 sessions scheduled',
    confidence: 64,
  },
  {
    id: 'goal-3',
    title: 'Publish a refined product direction brief',
    metric: 'Outline complete',
    confidence: 81,
  },
]
