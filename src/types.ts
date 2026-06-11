import type { LucideIcon } from 'lucide-react'

export type ViewId = 'home' | 'inbox' | 'board' | 'projects' | 'calendar' | 'goals'

export type NavigationItem = {
  id: ViewId
  label: string
  icon: LucideIcon
}

export type Idea = {
  id: string
  title: string
  note: string
  tag: string
  priority: 'Low' | 'Medium' | 'High'
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
