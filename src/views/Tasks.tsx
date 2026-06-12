import { AnimatePresence } from "framer-motion";
import { CalendarDays, CheckCircle2, Circle, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../components/Button";
import { Section } from "../components/Section";
import { TaskWorkspace } from "../components/TaskWorkspace";
import { sampleContacts, sampleProjects } from "../data/sampleData";
import { contactStorageKey, projectStorageKey } from "../data/storageKeys";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { Contact, Project, ProjectTask, StickyNote } from "../types";

type SelectedTask = { project: Project; task: ProjectTask };

function normalizeTask(task: ProjectTask): ProjectTask {
  return {
    ...task,
    stickyNotes: Array.isArray(task.stickyNotes) ? task.stickyNotes : [],
    contactIds: Array.isArray(task.contactIds) ? task.contactIds : [],
  };
}

function normalizeProject(project: Project): Project {
  return {
    ...project,
    tasks: Array.isArray(project.tasks) ? project.tasks.map(normalizeTask) : [],
  };
}

export function Tasks() {
  const [projects, setProjects] = useLocalStorage<Project[]>(
    projectStorageKey,
    sampleProjects,
  );
  const [contacts, setContacts] = useLocalStorage<Contact[]>(
    contactStorageKey,
    sampleContacts,
  );
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [selected, setSelected] = useState<SelectedTask | null>(null);

  const normalizedProjects = useMemo(
    () => projects.map(normalizeProject),
    [projects],
  );

  const taskRows = useMemo(
    () =>
      normalizedProjects.flatMap((project) =>
        project.tasks.map((task) => ({ project, task })),
      ),
    [normalizedProjects],
  );

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return taskRows.filter(({ project, task }) => {
      const matchesProject =
        projectFilter === "all" || project.id === projectFilter;
      const searchable = [project.title, task.title, task.notes]
        .join(" ")
        .toLowerCase();
      return matchesProject && (!query || searchable.includes(query));
    });
  }, [projectFilter, search, taskRows]);

  const updateTask = (
    projectId: string,
    taskId: string,
    updater: (task: ProjectTask) => ProjectTask,
  ) => {
    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              tasks: project.tasks.map((task) =>
                task.id === taskId ? updater(normalizeTask(task)) : task,
              ),
            }
          : project,
      ),
    );
    setSelected((current) =>
      current && current.project.id === projectId && current.task.id === taskId
        ? { ...current, task: updater(current.task) }
        : current,
    );
  };

  const attachContactToTask = (
    projectId: string,
    taskId: string,
    contactId: string,
  ) => {
    if (!contactId) return;
    updateTask(projectId, taskId, (task) => ({
      ...task,
      contactIds: [...new Set([...task.contactIds, contactId])],
    }));
    setContacts((currentContacts) =>
      currentContacts.map((contact) =>
        contact.id === contactId
          ? {
              ...contact,
              projectId: contact.projectId || projectId,
              relatedTaskIds: [...new Set([...contact.relatedTaskIds, taskId])],
              updatedAt: new Date().toISOString(),
            }
          : contact,
      ),
    );
  };

  const detachContactFromTask = (
    projectId: string,
    taskId: string,
    contactId: string,
  ) => {
    updateTask(projectId, taskId, (task) => ({
      ...task,
      contactIds: task.contactIds.filter(
        (currentContactId) => currentContactId !== contactId,
      ),
    }));
    setContacts((currentContacts) =>
      currentContacts.map((contact) =>
        contact.id === contactId
          ? {
              ...contact,
              relatedTaskIds: contact.relatedTaskIds.filter(
                (currentTaskId) => currentTaskId !== taskId,
              ),
              updatedAt: new Date().toISOString(),
            }
          : contact,
      ),
    );
  };

  const openTask = (projectId: string, taskId: string) => {
    const project = normalizedProjects.find(
      (currentProject) => currentProject.id === projectId,
    );
    const task = project?.tasks.find(
      (currentTask) => currentTask.id === taskId,
    );
    if (project && task) setSelected({ project, task });
  };

  return (
    <Section
      eyebrow="Execution"
      title="Tasks"
      description="See every project task in one place, filter by project, and open a task workspace for notes and contacts."
    >
      <div className="grid gap-4">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.08] p-4 shadow-glass backdrop-blur-xl">
          <div className="grid gap-3 sm:grid-cols-[1fr_0.75fr]">
            <label className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-silver/45"
                size={17}
              />
              <input
                className="min-h-11 w-full rounded-2xl border border-white/10 bg-navy/65 py-3 pl-11 pr-4 text-base text-white outline-none transition placeholder:text-silver/45 focus:border-violet/70 focus:ring-4 focus:ring-violet/15 sm:text-sm"
                placeholder="Search tasks..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search tasks"
              />
            </label>
            <select
              className="min-h-11 rounded-2xl border border-white/10 bg-navy/65 px-4 py-3 text-sm text-white outline-none transition focus:border-violet/70 focus:ring-4 focus:ring-violet/15"
              value={projectFilter}
              onChange={(event) => setProjectFilter(event.target.value)}
              aria-label="Filter tasks by project"
            >
              <option value="all">All projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3">
          {filteredRows.length > 0 ? (
            filteredRows.map(({ project, task }) => (
              <article
                key={`${project.id}-${task.id}`}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.065] p-4 shadow-glass"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet">
                      {project.title}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-white">
                      {task.title}
                    </h2>
                  </div>
                  <Button
                    onClick={() => openTask(project.id, task.id)}
                    type="button"
                    variant="secondary"
                  >
                    Open task
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-silver/65">
                  <span className="inline-flex items-center gap-1 rounded-full bg-navy/45 px-3 py-1">
                    {task.completed ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <Circle size={13} />
                    )}{" "}
                    {task.completed ? "Complete" : "Open"}
                  </span>
                  {task.dueDate ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-navy/45 px-3 py-1">
                      <CalendarDays size={13} /> {task.dueDate}
                    </span>
                  ) : null}
                  <span className="rounded-full bg-navy/45 px-3 py-1">
                    {task.stickyNotes.length} sticky notes
                  </span>
                  <span className="rounded-full bg-navy/45 px-3 py-1">
                    {task.contactIds.length} contacts
                  </span>
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-sm text-silver/60">
              No tasks match this filter.
            </p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selected ? (
          <TaskWorkspace
            contacts={contacts.filter(
              (contact) =>
                !contact.projectId ||
                contact.projectId === selected.project.id ||
                contact.relatedTaskIds.includes(selected.task.id) ||
                selected.task.contactIds.includes(contact.id),
            )}
            onAttachContact={(contactId) =>
              attachContactToTask(
                selected.project.id,
                selected.task.id,
                contactId,
              )
            }
            onClose={() => setSelected(null)}
            onDetachContact={(contactId) =>
              detachContactFromTask(
                selected.project.id,
                selected.task.id,
                contactId,
              )
            }
            onNotesChange={(stickyNotes: StickyNote[]) =>
              updateTask(selected.project.id, selected.task.id, (task) => ({
                ...task,
                stickyNotes,
              }))
            }
            onToggle={() =>
              updateTask(selected.project.id, selected.task.id, (task) => ({
                ...task,
                completed: !task.completed,
              }))
            }
            project={selected.project}
            task={selected.task}
          />
        ) : null}
      </AnimatePresence>
    </Section>
  );
}
