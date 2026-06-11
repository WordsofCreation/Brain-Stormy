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

export type IdeaCategory = (typeof ideaCategories)[number]
export type IdeaStatus = (typeof ideaStatuses)[number]
export type IdeaPriority = (typeof ideaPriorities)[number]

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

export type Project = {
  id: string
  name: string
  status: string
  progress: number
  nextStep: string
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
