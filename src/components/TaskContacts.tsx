import { Link2, X } from "lucide-react";
import type { Contact, ProjectTask } from "../types";

type Props = {
  contacts: Contact[];
  task: ProjectTask;
  onAttach: (contactId: string) => void;
  onDetach: (contactId: string) => void;
};

export function TaskContacts({ contacts, onAttach, onDetach, task }: Props) {
  const attached = contacts.filter(
    (contact) =>
      task.contactIds.includes(contact.id) ||
      contact.relatedTaskIds.includes(task.id),
  );
  const available = contacts.filter(
    (contact) =>
      !attached.some((attachedContact) => attachedContact.id === contact.id),
  );

  return (
    <section className="grid gap-4">
      <div>
        <h3 className="text-lg font-semibold text-white">Attached contacts</h3>
        <p className="text-sm text-silver/65">
          Connect people to this specific task without deleting or duplicating
          contacts.
        </p>
      </div>
      <div className="grid gap-3">
        {attached.length > 0 ? (
          attached.map((contact) => (
            <article
              key={contact.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.065] p-4"
            >
              <div>
                <h4 className="font-semibold text-white">{contact.name}</h4>
                <p className="text-sm text-silver/70">
                  {[contact.role, contact.company]
                    .filter(Boolean)
                    .join(" · ") || "No role yet"}
                </p>
                <p className="mt-1 text-xs text-silver/55">
                  {[contact.email, contact.phone].filter(Boolean).join(" · ")}
                </p>
              </div>
              <button
                className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm text-silver/65 transition hover:bg-white/10 hover:text-rose-100"
                onClick={() => onDetach(contact.id)}
                type="button"
              >
                <X size={15} /> Remove
              </button>
            </article>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-silver/55">
            No contacts attached yet.
          </p>
        )}
      </div>
      <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-silver/55">
        Attach contact
        <select
          className="min-h-11 rounded-2xl border border-white/10 bg-navy/65 px-4 py-3 text-sm normal-case tracking-normal text-white outline-none transition focus:border-violet/70 focus:ring-4 focus:ring-violet/15"
          onChange={(event) => onAttach(event.target.value)}
          value=""
          aria-label="Attach contact to task"
        >
          <option value="">Choose a contact...</option>
          {available.map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.name} {contact.role ? `— ${contact.role}` : ""}
            </option>
          ))}
        </select>
      </label>
      <p className="inline-flex items-center gap-2 text-xs text-silver/55">
        <Link2 size={14} /> Removing a contact here only unlinks it from this
        task.
      </p>
    </section>
  );
}
