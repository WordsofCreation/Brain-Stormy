import type { BoardColumn, CalendarEvent, Goal, Idea, Project } from '../types'

export const sampleIdeas: Idea[] = [
  {
    id: 'idea-1',
    title: 'AI-assisted weekly review ritual',
    note: 'A guided Friday flow that turns loose thoughts into next-week priorities.',
    tag: 'Workflow',
    priority: 'High',
  },
  {
    id: 'idea-2',
    title: 'Storm map visualization',
    note: 'Cluster related ideas into a spatial map with focus zones and action lanes.',
    tag: 'Product',
    priority: 'Medium',
  },
  {
    id: 'idea-3',
    title: 'One-tap calendar commitment',
    note: 'Promote an action card directly into a calendar block with a deadline.',
    tag: 'Execution',
    priority: 'High',
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
