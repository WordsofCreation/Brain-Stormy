import { Card } from '../components/Card'
import { Section } from '../components/Section'
import { sampleProjects } from '../data/sampleData'

export function Projects() {
  return (
    <Section eyebrow="Build" title="Projects" description="Promote mature ideas into active workstreams with progress, status, and a visible next step.">
      <div className="grid gap-4 lg:grid-cols-3">
        {sampleProjects.map((project, index) => (
          <Card key={project.id} delay={index * 0.08}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{project.name}</h2>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-silver">{project.status}</span>
            </div>
            <div className="mt-6 h-2 rounded-full bg-white/10">
              <div className="h-2 rounded-full bg-gradient-to-r from-violet to-silver" style={{ width: `${project.progress}%` }} />
            </div>
            <p className="mt-4 text-sm text-silver/70">{project.progress}% complete</p>
            <p className="mt-4 rounded-2xl bg-white/[0.06] p-4 text-sm text-silver">Next: {project.nextStep}</p>
          </Card>
        ))}
      </div>
    </Section>
  )
}
