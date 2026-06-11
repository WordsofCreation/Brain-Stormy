import { Card } from '../components/Card'
import { Section } from '../components/Section'
import { sampleBoardColumns } from '../data/sampleData'

export function BrainstormBoard() {
  return (
    <Section
      eyebrow="Structure"
      title="Brainstorm Board"
      description="Organize scattered ideas into lanes that move from raw capture to shaped decisions and calendar-ready actions."
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {sampleBoardColumns.map((column, index) => (
          <Card key={column.id} delay={index * 0.1}>
            <p className="text-sm uppercase tracking-[0.25em] text-violet">{column.title}</p>
            <p className="mt-3 text-sm text-silver/70">{column.description}</p>
            <div className="mt-6 space-y-3">
              {column.ideas.map((idea) => (
                <div className="rounded-2xl border border-white/10 bg-navy/50 p-4 text-sm text-silver" key={idea}>{idea}</div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </Section>
  )
}
