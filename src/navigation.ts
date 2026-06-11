import { CalendarDays, FolderKanban, Goal, Home, Lightbulb, PanelTop } from 'lucide-react'
import type { NavigationItem } from './types'

export const navigationItems: NavigationItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'inbox', label: 'Inbox', icon: Lightbulb },
  { id: 'board', label: 'Board', icon: PanelTop },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'goals', label: 'Dashboard', icon: Goal },
]
