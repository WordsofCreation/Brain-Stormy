import { AnimatePresence, motion } from 'framer-motion'
import { Layout } from './components/Layout'
import { BrainstormBoard } from './views/BrainstormBoard'
import { Calendar } from './views/Calendar'
import { GoalDashboard } from './views/GoalDashboard'
import { Home } from './views/Home'
import { IdeaInbox } from './views/IdeaInbox'
import { Projects } from './views/Projects'
import type { ViewId } from './types'
import { useLocalStorage } from './hooks/useLocalStorage'

const viewLabels: Record<ViewId, string> = {
  home: 'Home',
  inbox: 'Idea Inbox',
  board: 'Brainstorm Board',
  projects: 'Projects',
  calendar: 'Calendar',
  goals: 'Goal Dashboard',
}

function renderView(activeView: ViewId, onNavigate: (view: ViewId) => void) {
  switch (activeView) {
    case 'home':
      return <Home onNavigate={onNavigate} />
    case 'inbox':
      return <IdeaInbox />
    case 'board':
      return <BrainstormBoard />
    case 'projects':
      return <Projects />
    case 'calendar':
      return <Calendar />
    case 'goals':
      return <GoalDashboard />
    default:
      return <Home onNavigate={onNavigate} />
  }
}

export default function App() {
  const [activeView, setActiveView] = useLocalStorage<ViewId>('brain-stormy-active-view', 'home')

  return (
    <Layout activeView={activeView} onNavigate={setActiveView}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          aria-label={viewLabels[activeView]}
        >
          {renderView(activeView, setActiveView)}
        </motion.div>
      </AnimatePresence>
    </Layout>
  )
}
