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
    name: 'Creative operating system',
    status: 'Planning',
    progress: 36,
    nextStep: 'Define core project templates',
  },
  {
    id: 'project-2',
    name: 'Q3 growth experiments',
    status: 'Active',
    progress: 58,
    nextStep: 'Schedule experiment review',
  },
  {
    id: 'project-3',
    name: 'Personal knowledge reset',
    status: 'Queued',
    progress: 14,
    nextStep: 'Sort captured references',
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
