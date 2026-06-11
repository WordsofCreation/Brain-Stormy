import { Card } from '../components/Card'
import { Section } from '../components/Section'
import { sampleCalendarEvents } from '../data/sampleData'

export function Calendar() {
  return (
    <Section eyebrow="Execute" title="Calendar" description="A starter execution calendar for scheduling action steps from brainstorms and projects.">
      <Card>
        <div className="grid gap-3">
          {sampleCalendarEvents.map((event) => (
            <div className="grid gap-4 rounded-2xl border border-white/10 bg-navy/45 p-4 sm:grid-cols-[120px_1fr_120px] sm:items-center" key={event.id}>
              <span className="font-semibold text-white">{event.date}</span>
              <span className="text-silver">{event.title}</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-center text-xs text-violet">{event.type}</span>
            </div>
          ))}
        </div>
      </Card>
    </Section>
  )
}
