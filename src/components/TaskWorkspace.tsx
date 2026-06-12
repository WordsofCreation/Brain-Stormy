import { motion } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  StickyNote,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import type {
  Contact,
  Project,
  ProjectTask,
  StickyNote as StickyNoteType,
} from "../types";
import { Button } from "./Button";
import { StickyNoteBoard } from "./StickyNoteBoard";
import { TaskContacts } from "./TaskContacts";

type TabId = "details" | "notes" | "contacts";

type Props = {
  contacts: Contact[];
  onAttachContact: (contactId: string) => void;
  onClose: () => void;
  onDetachContact: (contactId: string) => void;
  onNotesChange: (notes: StickyNoteType[]) => void;
  onToggle: () => void;
  project: Project;
  task: ProjectTask;
};

export function TaskWorkspace({
  contacts,
  onAttachContact,
  onClose,
  onDetachContact,
  onNotesChange,
  onToggle,
  project,
  task,
}: Props) {
  const [tab, setTab] = useState<TabId>("details");
  const attachedCount = contacts.filter(
    (contact) =>
      task.contactIds.includes(contact.id) ||
      contact.relatedTaskIds.includes(task.id),
  ).length;
  const tabs: Array<{ id: TabId; label: string; icon: typeof Circle }> = [
    { id: "details", label: "Details", icon: Circle },
    {
      id: "notes",
      label: `Notes (${task.stickyNotes.length})`,
      icon: StickyNote,
    },
    { id: "contacts", label: `Contacts (${attachedCount})`, icon: UserRound },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[70] overflow-y-auto bg-navy/80 p-3 backdrop-blur-xl sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-workspace-title"
    >
      <motion.div
        className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-navy/95 p-4 shadow-glass sm:p-6"
        initial={{ y: 24, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 18, scale: 0.98 }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet">
              {project.title}
            </p>
            <h2
              id="task-workspace-title"
              className="mt-2 text-2xl font-semibold text-white"
            >
              {task.title}
            </h2>
          </div>
          <button
            className="min-h-11 min-w-11 rounded-full border border-white/10 text-silver transition hover:bg-white/10 hover:text-white"
            onClick={onClose}
            type="button"
            aria-label="Close task workspace"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 border-b border-white/10 pb-4">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${tab === id ? "bg-white text-navy" : "bg-white/[0.06] text-silver hover:bg-white/10 hover:text-white"}`}
              onClick={() => setTab(id)}
              type="button"
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
        <div className="mt-5">
          {tab === "details" ? (
            <section className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
              <div className="flex flex-wrap gap-2 text-sm text-silver/70">
                {task.dueDate ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-navy/60 px-3 py-1">
                    <CalendarDays size={15} /> Due {task.dueDate}
                  </span>
                ) : (
                  <span className="rounded-full bg-navy/60 px-3 py-1">
                    No due date
                  </span>
                )}
                <span className="rounded-full bg-navy/60 px-3 py-1">
                  {task.completed ? "Completed" : "Open"}
                </span>
              </div>
              {task.notes ? (
                <p className="text-sm leading-6 text-silver/75">{task.notes}</p>
              ) : (
                <p className="text-sm text-silver/55">No detail notes yet.</p>
              )}
              <Button onClick={onToggle} type="button" variant="secondary">
                {task.completed ? (
                  <CheckCircle2 className="mr-2" size={16} />
                ) : (
                  <Circle className="mr-2" size={16} />
                )}{" "}
                {task.completed ? "Mark incomplete" : "Mark complete"}
              </Button>
            </section>
          ) : null}
          {tab === "notes" ? (
            <StickyNoteBoard
              notes={task.stickyNotes}
              onChange={onNotesChange}
              taskId={task.id}
            />
          ) : null}
          {tab === "contacts" ? (
            <TaskContacts
              contacts={contacts}
              onAttach={onAttachContact}
              onDetach={onDetachContact}
              task={task}
            />
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}
