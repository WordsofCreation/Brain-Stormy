import { useMemo, useState } from "react";
import { Search, UsersRound } from "lucide-react";
import { Section } from "../components/Section";
import { ContactForm, type ContactFormState } from "../components/ContactForm";
import { ContactList } from "../components/ContactList";
import { sampleContacts, sampleProjects } from "../data/sampleData";
import { contactStorageKey, projectStorageKey } from "../data/storageKeys";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { Contact, Project } from "../types";

export function Contacts() {
  const [contacts, setContacts] = useLocalStorage<Contact[]>(
    contactStorageKey,
    sampleContacts,
  );
  const [projects] = useLocalStorage<Project[]>(
    projectStorageKey,
    sampleProjects,
  );
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");

  const taskTitleById = useMemo(
    () =>
      Object.fromEntries(
        projects.flatMap((project) =>
          project.tasks.map((task) => [task.id, task.title]),
        ),
      ),
    [projects],
  );

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return contacts.filter((contact) => {
      const matchesProject =
        projectFilter === "all" ||
        (projectFilter === "global"
          ? !contact.projectId
          : contact.projectId === projectFilter);
      const searchable = [
        contact.name,
        contact.role,
        contact.company,
        contact.email,
        contact.phone,
        contact.notes,
      ]
        .join(" ")
        .toLowerCase();
      return matchesProject && (!query || searchable.includes(query));
    });
  }, [contacts, projectFilter, search]);

  const saveContact = (
    form: ContactFormState,
    existingContact?: Contact | null,
  ) => {
    const now = new Date().toISOString();
    if (existingContact) {
      setContacts((currentContacts) =>
        currentContacts.map((contact) =>
          contact.id === existingContact.id
            ? { ...existingContact, ...form, updatedAt: now }
            : contact,
        ),
      );
      setEditingContact(null);
      return;
    }

    setContacts((currentContacts) => [
      {
        id: `contact-${crypto.randomUUID()}`,
        ...form,
        relatedTaskIds: form.relatedTaskIds ?? [],
        createdAt: now,
        updatedAt: now,
      },
      ...currentContacts,
    ]);
  };

  const deleteContact = (contact: Contact) => {
    const confirmed = window.confirm(
      `Delete “${contact.name}”? This removes the contact record but not projects or tasks.`,
    );
    if (!confirmed) return;
    setContacts((currentContacts) =>
      currentContacts.filter(
        (currentContact) => currentContact.id !== contact.id,
      ),
    );
  };

  return (
    <Section
      eyebrow="Relationships"
      title="Contacts"
      description="Manage project collaborators, vendors, clients, and experts, then link them to the exact tasks they support."
    >
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <ContactForm
          key={editingContact?.id ?? "new-contact"}
          contact={editingContact}
          onCancel={editingContact ? () => setEditingContact(null) : undefined}
          onSave={saveContact}
          projects={projects}
        />
        <div className="grid gap-4">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.08] p-4 shadow-glass backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet/15 text-violet">
                <UsersRound size={20} />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Contact directory
                </h2>
                <p className="text-sm text-silver/65">
                  Search all contacts or filter by project.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_0.8fr]">
              <label className="relative">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-silver/45"
                  size={17}
                />
                <input
                  className="min-h-11 w-full rounded-2xl border border-white/10 bg-navy/65 py-3 pl-11 pr-4 text-base text-white outline-none transition placeholder:text-silver/45 focus:border-violet/70 focus:ring-4 focus:ring-violet/15 sm:text-sm"
                  placeholder="Search contacts..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Search contacts"
                />
              </label>
              <select
                className="min-h-11 rounded-2xl border border-white/10 bg-navy/65 px-4 py-3 text-sm text-white outline-none transition focus:border-violet/70 focus:ring-4 focus:ring-violet/15"
                value={projectFilter}
                onChange={(event) => setProjectFilter(event.target.value)}
                aria-label="Filter contacts by project"
              >
                <option value="all">All contacts</option>
                <option value="global">Global contacts</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <ContactList
            contacts={filteredContacts}
            onDelete={deleteContact}
            onEdit={setEditingContact}
            projects={projects}
            taskTitleById={taskTitleById}
          />
        </div>
      </div>
    </Section>
  );
}
