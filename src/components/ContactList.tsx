import { Edit3, Mail, Phone, Trash2 } from "lucide-react";
import type { Contact, Project } from "../types";

type Props = {
  contacts: Contact[];
  projects: Project[];
  taskTitleById?: Record<string, string>;
  onDelete: (contact: Contact) => void;
  onEdit: (contact: Contact) => void;
};

export function ContactList({
  contacts,
  onDelete,
  onEdit,
  projects,
  taskTitleById = {},
}: Props) {
  const projectById = Object.fromEntries(
    projects.map((project) => [project.id, project.title]),
  );

  if (contacts.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-white/10 p-6 text-center text-sm text-silver/60">
        No contacts match this view yet.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {contacts.map((contact) => (
        <article
          key={contact.id}
          className="rounded-[1.5rem] border border-white/10 bg-white/[0.065] p-4 shadow-glass"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {contact.name}
              </h3>
              <p className="text-sm text-silver/70">
                {[contact.role, contact.company].filter(Boolean).join(" · ") ||
                  "No role yet"}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                className="min-h-10 min-w-10 rounded-full text-silver/55 transition hover:bg-white/10 hover:text-white"
                onClick={() => onEdit(contact)}
                type="button"
                aria-label={`Edit ${contact.name}`}
              >
                <Edit3 size={16} />
              </button>
              <button
                className="min-h-10 min-w-10 rounded-full text-silver/55 transition hover:bg-white/10 hover:text-rose-100"
                onClick={() => onDelete(contact)}
                type="button"
                aria-label={`Delete ${contact.name}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-silver/70">
            <span className="rounded-full bg-navy/45 px-3 py-1">
              {contact.projectId
                ? (projectById[contact.projectId] ?? "Unknown project")
                : "Global"}
            </span>
            {contact.email ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-navy/45 px-3 py-1">
                <Mail size={13} /> {contact.email}
              </span>
            ) : null}
            {contact.phone ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-navy/45 px-3 py-1">
                <Phone size={13} /> {contact.phone}
              </span>
            ) : null}
          </div>
          {contact.relatedTaskIds.length > 0 ? (
            <p className="mt-3 text-xs text-silver/60">
              Linked tasks:{" "}
              {contact.relatedTaskIds
                .map((taskId) => taskTitleById[taskId] ?? taskId)
                .join(", ")}
            </p>
          ) : null}
          {contact.notes ? (
            <p className="mt-3 text-sm leading-6 text-silver/75">
              {contact.notes}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
