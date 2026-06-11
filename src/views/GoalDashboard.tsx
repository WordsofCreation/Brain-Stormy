import { Card } from '../components/Card'
import { Section } from '../components/Section'
import { sampleGoals } from '../data/sampleData'

export function GoalDashboard() {
  return (
    <Section eyebrow="Focus" title="Goal Dashboard" description="Track the high-level outcomes that connect captured ideas, organized projects, and scheduled execution.">
      <div className="grid gap-4 lg:grid-cols-3">
        {sampleGoals.map((goal, index) => (
          <Card key={goal.id} delay={index * 0.08}>
            <p className="text-sm text-violet">{goal.metric}</p>
            <h2 className="mt-3 text-xl font-semibold leading-7">{goal.title}</h2>
            <div className="mt-6 flex items-end justify-between">
              <span className="text-4xl font-semibold">{goal.confidence}%</span>
              <span className="text-sm text-silver/65">confidence</span>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  )
}
