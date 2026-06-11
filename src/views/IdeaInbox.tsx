import { Plus } from 'lucide-react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Section } from '../components/Section'
import { sampleIdeas } from '../data/sampleData'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { Idea } from '../types'

export function IdeaInbox() {
  const [ideas] = useLocalStorage<Idea[]>('brain-stormy-ideas', sampleIdeas)

  return (
    <Section
      eyebrow="Capture"
      title="Idea Inbox"
      description="A calm holding space for raw thoughts, quick notes, and sparks that can become goals or projects later."
    >
      <div className="mb-6 flex justify-end">
        <Button variant="secondary"><Plus className="mr-2" size={17} /> New idea</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {ideas.map((idea, index) => (
          <Card key={idea.id} delay={index * 0.08}>
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-violet/15 px-3 py-1 text-xs font-semibold text-violet">{idea.tag}</span>
              <span className="text-xs text-silver/60">{idea.priority}</span>
            </div>
            <h2 className="text-xl font-semibold">{idea.title}</h2>
            <p className="mt-3 text-sm leading-6 text-silver/75">{idea.note}</p>
          </Card>
        ))}
      </div>
    </Section>
  )
}
