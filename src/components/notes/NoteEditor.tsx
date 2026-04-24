"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useNote, useUpdateNote, useDeleteNote } from "@/lib/queries/notes"

// ─── Preview renderer ─────────────────────────────────────────────────────────

function MarkdownPreview({ markdown }: { markdown: string }) {
  const [html, setHtml] = useState("")

  useEffect(() => {
    if (!markdown.trim()) {
      setHtml("")
      return
    }
    import("marked").then(({ marked }) => {
      const result = marked(markdown)
      if (typeof result === "string") {
        setHtml(result)
      } else {
        result.then(setHtml)
      }
    })
  }, [markdown])

  if (!html) {
    return (
      <p className="font-body text-sm" style={{ color: "var(--muted-foreground)", opacity: 0.4 }}>
        Nothing to preview yet.
      </p>
    )
  }

  return (
    <div
      className="prose-notes"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onNewNote, creating }: { onNewNote: () => void; creating: boolean }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
      <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none" style={{ opacity: 0.2 }}>
        <rect x="8" y="4" width="32" height="40" rx="3" stroke="currentColor" strokeWidth="2" />
        <path d="M16 14h16M16 20h16M16 26h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div className="text-center">
        <p className="font-heading text-sm font-semibold text-foreground">No note selected</p>
        <p className="mt-1 font-body text-sm" style={{ color: "var(--muted-foreground)" }}>
          Select a note from the sidebar or create a new one.
        </p>
      </div>
      <button
        onClick={onNewNote}
        disabled={creating}
        className="rounded-lg px-5 py-2.5 font-heading text-sm font-bold text-neutral-950 transition-opacity disabled:opacity-40"
        style={{ background: "var(--mm-gold-400, #e6c364)" }}
      >
        {creating ? "Creating…" : "New Note"}
      </button>
    </div>
  )
}

// ─── Editor ───────────────────────────────────────────────────────────────────

interface Props {
  noteId: string | null
  onNoteDeleted: () => void
  onNewNote: () => void
  creatingNote: boolean
}

export function NoteEditor({ noteId, onNoteDeleted, onNewNote, creatingNote }: Props) {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [mode, setMode] = useState<"edit" | "preview">("edit")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: note, isLoading } = useNote(noteId)
  const updateNote = useUpdateNote()
  const deleteNote = useDeleteNote()

  // Seed local state when note loads
  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setBody(note.body)
      setSaved(false)
      setError(null)
    }
  }, [note?.id])  // eslint-disable-line react-hooks/exhaustive-deps

  const isDirty =
    note !== undefined && (title !== note.title || body !== note.body)

  const handleSave = useCallback(async () => {
    if (!noteId || saving) return
    setError(null)
    setSaving(true)
    try {
      await updateNote.mutateAsync({ id: noteId, title, body })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.")
    } finally {
      setSaving(false)
    }
  }, [noteId, title, body, saving, updateNote])

  // Ctrl/Cmd + S to save
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        if (isDirty) handleSave()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isDirty, handleSave])

  function handleDeleteClick() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
      deleteTimerRef.current = setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    setConfirmDelete(false)
    if (noteId) {
      deleteNote.mutateAsync(noteId).then(() => onNoteDeleted())
    }
  }

  if (!noteId) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <EmptyState onNewNote={onNewNote} creating={creatingNote} />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col p-6 gap-4">
        <div className="h-8 w-48 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
        <div className="flex-1 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.03)" }} />
      </div>
    )
  }

  const inputStyle: React.CSSProperties = {
    background: "transparent",
    color: "#e5e2e1",
    outline: "none",
    resize: "none",
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div
        className="flex items-center gap-3 px-6 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Edit / Preview toggle */}
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <button
            onClick={() => setMode("edit")}
            className="px-3 py-1.5 font-body text-xs transition-colors"
            style={{
              background: mode === "edit" ? "rgba(255,255,255,0.08)" : "transparent",
              color: mode === "edit" ? "var(--foreground)" : "var(--muted-foreground)",
            }}
          >
            Edit
          </button>
          <button
            onClick={() => setMode("preview")}
            className="px-3 py-1.5 font-body text-xs transition-colors"
            style={{
              background: mode === "preview" ? "rgba(255,255,255,0.08)" : "transparent",
              color: mode === "preview" ? "var(--foreground)" : "var(--muted-foreground)",
            }}
          >
            Preview
          </button>
        </div>

        <div className="flex-1" />

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!isDirty || saving}
          className="rounded-lg px-3 py-1.5 font-heading text-xs font-bold text-neutral-950 transition-opacity disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          style={{ background: "var(--mm-gold-400, #e6c364)" }}
        >
          {saving ? <span className="animate-pulse">Saving…</span> : "Save"}
        </button>

        <AnimatePresence>
          {saved && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 font-body text-xs"
              style={{ color: "#4ade80" }}
            >
              <svg viewBox="0 0 10 8" className="w-2.5 h-2.5" fill="none">
                <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Saved
            </motion.span>
          )}
        </AnimatePresence>

        {/* Save hint */}
        {isDirty && !saving && !saved && (
          <span className="font-body text-xs hidden md:inline" style={{ color: "var(--muted-foreground)", opacity: 0.5 }}>
            ⌘S to save
          </span>
        )}

        {/* Delete button */}
        <button
          onClick={handleDeleteClick}
          disabled={deleteNote.isPending}
          className="font-body text-xs transition-colors disabled:opacity-40"
          style={{ color: confirmDelete ? "#f87171" : "var(--muted-foreground)" }}
        >
          {confirmDelete ? "Confirm delete?" : "Delete"}
        </button>
      </div>

      {/* Title */}
      <div className="px-6 pt-5 flex-shrink-0">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className="w-full font-heading text-2xl font-semibold placeholder:opacity-30"
          style={{ ...inputStyle, color: "var(--foreground)" }}
        />
      </div>

      {/* Body / Preview */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {mode === "edit" ? (
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={"Write in markdown…\n\n# Heading\n**bold** _italic_ `code`\n\n- list item"}
            className="w-full h-full font-mono text-sm leading-relaxed placeholder:opacity-30 min-h-[300px]"
            style={{ ...inputStyle, color: "#c9c5c0" }}
          />
        ) : (
          <MarkdownPreview markdown={body} />
        )}
      </div>

      {error && (
        <div className="px-6 pb-4 flex-shrink-0">
          <p className="font-body text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}
