import { useState, type FormEvent } from "react";
import type { Contact, Project } from "../types";
import { Button } from "./Button";

export type ContactFormState = Omit<Contact, "id" | "createdAt" | "updatedAt">;

const emptyForm: ContactFormState = {
  projectId: "",
  name: "",
  role: "",
  company: "",
  email: "",
  phone: "",
  notes: "",
  relatedTaskIds: [],
};

type Props = {
  contact?: Contact | null;
  projects: Project[];
  onCancel?: () => void;
  onSave: (contact: ContactFormState, existingContact?: Contact | null) => void;
};

export function ContactForm({ contact, onCancel, onSave, projects }: Props) {
  const [form, setForm] = useState<ContactFormState>(() =>
    contact
      ? {
          projectId: contact.projectId ?? "",
          name: contact.name,
          role: contact.role,
          company: contact.company,
          email: contact.email,
          phone: contact.phone,
          notes: contact.notes,
          relatedTaskIds: contact.relatedTaskIds,
        }
      : emptyForm,
  );
  const [error, setError] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Contact name is required.");
      return;
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("Enter a valid email address or leave email blank.");
      return;
    }
    onSave(
      {
        ...form,
        projectId: form.projectId || undefined,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      },
      contact,
    );
    if (!contact) setForm(emptyForm);
    setError("");
  };

  const inputClass =
    "min-h-11 rounded-2xl border border-white/10 bg-navy/65 px-4 py-3 text-base sm:text-sm text-white outline-none transition placeholder:text-silver/45 focus:border-violet/70 focus:ring-4 focus:ring-violet/15";

  return (
    <form
      className="rounded-[1.75rem] border border-white/10 bg-white/[0.08] p-4 shadow-glass backdrop-blur-xl sm:p-5"
      onSubmit={submit}
    >
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet">
          {contact ? "Edit contact" : "New contact"}
        </p>
        <h2 className="mt-1 text-xl font-semibold text-white">
          Project execution contact
        </h2>
      </div>
      <div className="grid gap-3">
        <input
          aria-label="Contact name"
          className={inputClass}
          placeholder="Name *"
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            aria-label="Role or title"
            className={inputClass}
            placeholder="Role / title"
            value={form.role}
            onChange={(event) =>
              setForm((current) => ({ ...current, role: event.target.value }))
            }
          />
          <input
            aria-label="Company"
            className={inputClass}
            placeholder="Company / organization"
            value={form.company}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                company: event.target.value,
              }))
            }
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            aria-label="Email"
            className={inputClass}
            placeholder="Email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
          />
          <input
            aria-label="Phone"
            className={inputClass}
            placeholder="Phone"
            value={form.phone}
            onChange={(event) =>
              setForm((current) => ({ ...current, phone: event.target.value }))
            }
          />
        </div>
        <select
          aria-label="Project association"
          className={inputClass}
          value={form.projectId ?? ""}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              projectId: event.target.value,
            }))
          }
        >
          <option value="">Global contact</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>
        <textarea
          aria-label="Contact notes"
          className={`${inputClass} min-h-24`}
          placeholder="Notes"
          value={form.notes}
          onChange={(event) =>
            setForm((current) => ({ ...current, notes: event.target.value }))
          }
        />
        {error ? (
          <p className="rounded-2xl border border-rose-300/25 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit">
            {contact ? "Save contact" : "Create contact"}
          </Button>
          {onCancel ? (
            <Button onClick={onCancel} type="button" variant="ghost">
              Cancel
            </Button>
          ) : null}
        </div>
      </div>
    </form>
  );
}
