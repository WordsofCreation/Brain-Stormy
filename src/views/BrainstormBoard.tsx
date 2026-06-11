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
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
        {sampleBoardColumns.map((column, index) => (
          <Card className="min-w-0" key={column.id} delay={index * 0.06}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet sm:text-sm sm:tracking-[0.25em]">{column.title}</p>
                <p className="mt-3 text-sm leading-6 text-silver/72">{column.description}</p>
              </div>
              <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs text-silver">{column.ideas.length}</span>
            </div>
            <div className="mt-5 grid gap-3 sm:mt-6">
              {column.ideas.map((idea) => (
                <div className="rounded-2xl border border-white/10 bg-navy/50 p-4 text-base leading-6 text-silver shadow-[0_12px_34px_rgba(0,0,0,0.18)] sm:text-sm" key={idea}>
                  {idea}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </Section>
  )
}
