import type { LucideIcon } from 'lucide-react'

export type ViewId = 'home' | 'inbox' | 'board' | 'projects' | 'calendar' | 'goals'

export type NavigationItem = {
  id: ViewId
  label: string
  icon: LucideIcon
}

export const ideaCategories = [
  'Business',
  'Creative',
  'Personal',
  'Product',
  'Content',
  'Writing',
  'Learning',
  'Finance',
  'Health',
  'Travel',
  'Home',
  'Other',
] as const

export const ideaStatuses = ['Raw Idea', 'Reviewing', 'Approved', 'Parked', 'Completed'] as const

export const ideaPriorities = ['Low', 'Medium', 'High', 'Urgent'] as const

export const projectCategories = [
  'Business',
  'Creative',
  'Personal',
  'Product',
  'Content',
  'Writing',
  'Learning',
  'Finance',
  'Health',
  'Home',
  'Other',
] as const

export const projectStatuses = ['Planning', 'Active', 'Waiting', 'Scheduled', 'Completed'] as const

export const projectPriorities = ['Low', 'Medium', 'High', 'Urgent'] as const

export type IdeaCategory = (typeof ideaCategories)[number]
export type IdeaStatus = (typeof ideaStatuses)[number]
export type IdeaPriority = (typeof ideaPriorities)[number]
export type ProjectCategory = (typeof projectCategories)[number]
export type ProjectStatus = (typeof projectStatuses)[number]
export type ProjectPriority = (typeof projectPriorities)[number]

export type Idea = {
  id: string
  title: string
  description: string
  category: IdeaCategory
  status: IdeaStatus
  priority: IdeaPriority
  tags: string[]
  createdAt: string
  favorite: boolean
  projectId?: string
}

export type BoardColumn = {
  id: string
  title: string
  description: string
  ideas: string[]
}

export type ProjectTask = {
  id: string
  title: string
  completed: boolean
  dueDate?: string
  notes?: string
}

export type Project = {
  id: string
  title: string
  description: string
  category: ProjectCategory
  status: ProjectStatus
  priority: ProjectPriority
  targetDate: string
  ideaIds: string[]
  tasks: ProjectTask[]
  createdAt: string
  notes: string
}

export type CalendarEvent = {
  id: string
  date: string
  title: string
  type: string
}

export type Goal = {
  id: string
  title: string
  metric: string
  confidence: number
}
