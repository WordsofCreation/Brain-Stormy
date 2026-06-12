import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import type { StickyNote, StickyNoteColor } from "../types";
import { stickyNoteColors } from "../types";
import { Button } from "./Button";

type Props = {
  notes: StickyNote[];
  taskId: string;
  onChange: (notes: StickyNote[]) => void;
};

const colorClasses: Record<StickyNoteColor, string> = {
  yellow: "bg-amber-200 text-amber-950",
  pink: "bg-pink-200 text-pink-950",
  blue: "bg-sky-200 text-sky-950",
  green: "bg-emerald-200 text-emerald-950",
  purple: "bg-violet-200 text-violet-950",
  orange: "bg-orange-200 text-orange-950",
  gray: "bg-slate-200 text-slate-950",
};

export function StickyNoteBoard({ notes, onChange, taskId }: Props) {
  const addNote = () => {
    const now = new Date().toISOString();
    const offset = notes.length * 18;
    onChange([
      ...notes,
      {
        id: `note-${crypto.randomUUID()}`,
        taskId,
        content: "New idea...",
        color: "yellow",
        x: 24 + (offset % 180),
        y: 24 + (offset % 120),
        width: 210,
        height: 170,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  };

  const updateNote = (noteId: string, patch: Partial<StickyNote>) => {
    const now = new Date().toISOString();
    onChange(
      notes.map((note) =>
        note.id === noteId ? { ...note, ...patch, updatedAt: now } : note,
      ),
    );
  };

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Sticky note board
          </h3>
          <p className="text-sm text-silver/65">
            Drag notes around this task-specific brainstorming wall. Positions
            and colors save with the task.
          </p>
        </div>
        <Button onClick={addNote} type="button">
          <Plus className="mr-2" size={16} /> Add sticky
        </Button>
      </div>
      <div
        className="relative min-h-[28rem] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(154,123,255,0.18),transparent_34%),linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:auto,32px_32px,32px_32px] p-4 shadow-inner sm:min-h-[34rem]"
        aria-label="Sticky note board"
      >
        {notes.length === 0 ? (
          <div className="grid h-72 place-items-center rounded-3xl border border-dashed border-white/15 text-center text-sm text-silver/60">
            <p>
              No sticky notes yet. Add one to capture a reminder, question, or
              next idea.
            </p>
          </div>
        ) : null}
        {notes.map((note) => (
          <motion.article
            key={note.id}
            drag
            dragMomentum={false}
            onDragEnd={(_, info) =>
              updateNote(note.id, {
                x: Math.max(0, note.x + info.offset.x),
                y: Math.max(0, note.y + info.offset.y),
              })
            }
            className={`absolute flex cursor-grab flex-col rounded-2xl p-3 shadow-xl shadow-black/20 active:cursor-grabbing ${colorClasses[note.color]}`}
            style={{
              left: note.x,
              top: note.y,
              width: note.width,
              minHeight: note.height,
            }}
            tabIndex={0}
            aria-label="Draggable sticky note"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <select
                className="rounded-full bg-white/55 px-2 py-1 text-xs font-semibold outline-none"
                value={note.color}
                onChange={(event) =>
                  updateNote(note.id, {
                    color: event.target.value as StickyNoteColor,
                  })
                }
                aria-label="Sticky note color"
              >
                {stickyNoteColors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
              <button
                className="rounded-full p-1 transition hover:bg-black/10"
                onClick={() =>
                  onChange(
                    notes.filter((currentNote) => currentNote.id !== note.id),
                  )
                }
                type="button"
                aria-label="Delete sticky note"
              >
                <Trash2 size={15} />
              </button>
            </div>
            <textarea
              className="min-h-28 flex-1 resize-none bg-transparent text-sm font-medium leading-5 outline-none placeholder:text-black/40"
              value={note.content}
              onChange={(event) =>
                updateNote(note.id, { content: event.target.value })
              }
              placeholder="Write a note..."
            />
          </motion.article>
        ))}
      </div>
    </section>
  );
}
