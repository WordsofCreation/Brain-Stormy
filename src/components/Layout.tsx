import { AnimatePresence, motion } from 'framer-motion'
import { Brain, CalendarDays, FolderKanban, Goal, Home, Lightbulb, Menu, PanelTop, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { NavigationItem, ViewId } from '../types'

export const navigationItems: NavigationItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'inbox', label: 'Idea Inbox', icon: Lightbulb },
  { id: 'board', label: 'Brainstorm Board', icon: PanelTop },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'goals', label: 'Goal Dashboard', icon: Goal },
]

type LayoutProps = {
  activeView: ViewId
  children: ReactNode
  onNavigate: (view: ViewId) => void
}

export function Layout({ activeView, children, onNavigate }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navigate = (view: ViewId) => {
    onNavigate(view)
    setMobileOpen(false)
  }

  return (
    <div className="min-h-screen overflow-hidden bg-navy bg-storm-radial text-white">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-35" />
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-navy/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button className="flex items-center gap-3" onClick={() => navigate('home')} type="button">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-navy shadow-glow">
              <Brain size={23} />
            </span>
            <span className="text-left">
              <span className="block text-lg font-bold tracking-tight">Brain Stormy</span>
              <span className="block text-xs uppercase tracking-[0.28em] text-silver/65">Think · Shape · Schedule</span>
            </span>
          </button>

          <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] p-1 lg:flex">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const active = item.id === activeView
              return (
                <button
                  className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${active ? 'text-navy' : 'text-silver hover:text-white'}`}
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  type="button"
                >
                  {active ? <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-white" /> : null}
                  <Icon className="relative" size={16} />
                  <span className="relative">{item.label}</span>
                </button>
              )
            })}
          </nav>

          <button
            className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white lg:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            type="button"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen ? (
            <motion.nav
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mx-4 mb-4 grid gap-2 rounded-3xl border border-white/10 bg-navy/95 p-3 shadow-glass lg:hidden"
            >
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                      item.id === activeView ? 'bg-white text-navy' : 'text-silver hover:bg-white/10 hover:text-white'
                    }`}
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    type="button"
                  >
                    <Icon size={17} />
                    {item.label}
                  </button>
                )
              })}
            </motion.nav>
          ) : null}
        </AnimatePresence>
      </header>

      <main className="relative z-10 mx-auto min-h-screen max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
