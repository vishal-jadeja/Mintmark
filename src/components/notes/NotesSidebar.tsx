"use client"

import { useState, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useNotes, useFolders, useCreateFolder, useDeleteFolder } from "@/lib/queries/notes"

// ─── Folder color dot ─────────────────────────────────────────────────────────

const FOLDER_COLORS = [
  "#6b7280", // gray (default)
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
]

function ColorDot({ color }: { color: string | null }) {
  return (
    <span
      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
      style={{ background: color ?? "#6b7280" }}
    />
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

interface Props {
  selectedFolderId: string | null
  onSelectFolder: (id: string | null) => void
  selectedNoteId: string | null
  onSelectNote: (id: string) => void
  search: string
  onSearch: (q: string) => void
  onNewNote: () => void
  creatingNote: boolean
}

export function NotesSidebar({
  selectedFolderId,
  onSelectFolder,
  selectedNoteId,
  onSelectNote,
  search,
  onSearch,
  onNewNote,
  creatingNote,
}: Props) {
  const [newFolderName, setNewFolderName] = useState("")
  const [newFolderColor, setNewFolderColor] = useState<string | null>(null)
  const [showFolderForm, setShowFolderForm] = useState(false)
  const [confirmDeleteFolder, setConfirmDeleteFolder] = useState<string | null>(null)
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: folders = [], isLoading: foldersLoading } = useFolders()
  const { data: notes = [], isLoading: notesLoading } = useNotes({
    folder_id: selectedFolderId,
    search: search || undefined,
  })
  const createFolder = useCreateFolder()
  const deleteFolder = useDeleteFolder()

  // Get all notes count (for "All Notes" badge)
  const { data: allNotes = [] } = useNotes({})

  async function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault()
    if (!newFolderName.trim()) return
    await createFolder.mutateAsync({ name: newFolderName.trim(), color: newFolderColor })
    setNewFolderName("")
    setNewFolderColor(null)
    setShowFolderForm(false)
  }

  function handleDeleteFolderClick(folderId: string) {
    if (confirmDeleteFolder !== folderId) {
      setConfirmDeleteFolder(folderId)
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
      confirmTimerRef.current = setTimeout(() => setConfirmDeleteFolder(null), 3000)
      return
    }
    setConfirmDeleteFolder(null)
    deleteFolder.mutateAsync(folderId).then(() => {
      if (selectedFolderId === folderId) onSelectFolder(null)
    })
  }

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#e5e2e1",
  }

  const filteredNotes = search
    ? notes
    : notes

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <p className="font-heading text-sm font-semibold text-foreground mb-3">Notes</p>

        {/* Search */}
        <div className="relative">
          <svg
            viewBox="0 0 20 20"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 fill-current"
            style={{ color: "var(--muted-foreground)" }}
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search notes…"
            className="w-full rounded-lg pl-8 pr-3 py-2 font-body text-xs focus:outline-none transition-colors"
            style={inputStyle}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {/* All Notes */}
        <button
          onClick={() => onSelectFolder(null)}
          className="w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 mb-1 transition-colors text-left"
          style={{
            background: selectedFolderId === null && !search
              ? "rgba(230,195,100,0.10)"
              : "transparent",
          }}
        >
          <span
            className="font-body text-sm"
            style={{
              color: selectedFolderId === null && !search
                ? "var(--mm-gold-400, #e6c364)"
                : "var(--muted-foreground)",
            }}
          >
            All Notes
          </span>
          <span
            className="font-mono text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            {allNotes.length}
          </span>
        </button>

        {/* Folders header */}
        <div className="flex items-center justify-between px-3 mb-1 mt-3">
          <span className="font-body text-xs uppercase tracking-wider" style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>
            Folders
          </span>
          <button
            onClick={() => setShowFolderForm((v) => !v)}
            className="font-body text-xs transition-colors hover:text-foreground"
            style={{ color: "var(--muted-foreground)" }}
            title="New folder"
          >
            +
          </button>
        </div>

        {/* New folder form */}
        <AnimatePresence>
          {showFolderForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ overflow: "hidden" }}
              onSubmit={handleCreateFolder}
              className="px-1 mb-2"
            >
              <div className="rounded-lg p-2 flex flex-col gap-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <input
                  autoFocus
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                  className="w-full rounded px-2 py-1.5 font-body text-xs focus:outline-none"
                  style={inputStyle}
                />
                <div className="flex items-center gap-1.5">
                  {FOLDER_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewFolderColor(c === "#6b7280" ? null : c)}
                      className="w-4 h-4 rounded-full transition-transform"
                      style={{
                        background: c,
                        transform: (newFolderColor ?? "#6b7280") === c ? "scale(1.3)" : "scale(1)",
                        outline: (newFolderColor ?? "#6b7280") === c ? `2px solid ${c}` : "none",
                        outlineOffset: "2px",
                      }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={!newFolderName.trim() || createFolder.isPending}
                    className="rounded px-2 py-1 font-body text-xs font-medium text-neutral-950 transition-opacity disabled:opacity-40"
                    style={{ background: "var(--mm-gold-400, #e6c364)" }}
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFolderForm(false)}
                    className="font-body text-xs transition-colors hover:text-foreground"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Folder list */}
        {foldersLoading ? (
          <div className="px-3 py-1 space-y-1">
            {[1, 2].map((i) => (
              <div key={i} className="h-8 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
            ))}
          </div>
        ) : (
          <div className="space-y-0.5">
            {folders.map((folder) => (
              <div key={folder.id} className="group flex items-center gap-1">
                <button
                  onClick={() => onSelectFolder(folder.id)}
                  className="flex-1 flex items-center gap-2 rounded-lg px-3 py-2 transition-colors text-left min-w-0"
                  style={{
                    background: selectedFolderId === folder.id
                      ? "rgba(230,195,100,0.10)"
                      : "transparent",
                  }}
                >
                  <ColorDot color={folder.color} />
                  <span
                    className="font-body text-sm truncate flex-1"
                    style={{
                      color: selectedFolderId === folder.id
                        ? "var(--mm-gold-400, #e6c364)"
                        : "var(--muted-foreground)",
                    }}
                  >
                    {folder.name}
                  </span>
                  <span className="font-mono text-xs flex-shrink-0" style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>
                    {folder.note_count}
                  </span>
                </button>
                <button
                  onClick={() => handleDeleteFolderClick(folder.id)}
                  className="flex-shrink-0 px-1 opacity-0 group-hover:opacity-100 transition-opacity font-body text-xs"
                  style={{ color: confirmDeleteFolder === folder.id ? "#f87171" : "var(--muted-foreground)" }}
                  title={confirmDeleteFolder === folder.id ? "Confirm delete?" : "Delete folder"}
                >
                  {confirmDeleteFolder === folder.id ? "×?" : "×"}
                </button>
              </div>
            ))}
            {folders.length === 0 && !showFolderForm && (
              <p className="px-3 font-body text-xs" style={{ color: "var(--muted-foreground)", opacity: 0.5 }}>
                No folders yet
              </p>
            )}
          </div>
        )}

        {/* Notes list header */}
        <div className="flex items-center justify-between px-3 mb-1 mt-4">
          <span className="font-body text-xs uppercase tracking-wider" style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>
            {selectedFolderId
              ? folders.find((f) => f.id === selectedFolderId)?.name ?? "Folder"
              : search
              ? "Search results"
              : "All notes"}
          </span>
          <button
            onClick={onNewNote}
            disabled={creatingNote}
            className="font-body text-xs transition-colors hover:text-foreground disabled:opacity-40"
            style={{ color: "var(--muted-foreground)" }}
            title="New note"
          >
            +
          </button>
        </div>

        {/* Note list */}
        {notesLoading ? (
          <div className="px-1 space-y-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="px-3 py-2">
            <p className="font-body text-xs" style={{ color: "var(--muted-foreground)", opacity: 0.5 }}>
              {search ? "No matches" : "No notes yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {filteredNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className="w-full text-left rounded-lg px-3 py-2 transition-colors"
                style={{
                  background: selectedNoteId === note.id
                    ? "rgba(230,195,100,0.10)"
                    : "transparent",
                  border: selectedNoteId === note.id
                    ? "1px solid rgba(230,195,100,0.20)"
                    : "1px solid transparent",
                }}
              >
                <p
                  className="font-body text-sm font-medium truncate"
                  style={{
                    color: selectedNoteId === note.id
                      ? "var(--foreground)"
                      : "var(--muted-foreground)",
                  }}
                >
                  {note.title || <span style={{ opacity: 0.4 }}>Untitled</span>}
                </p>
                {note.body_preview && (
                  <p
                    className="font-body text-xs truncate mt-0.5"
                    style={{ color: "var(--muted-foreground)", opacity: 0.6 }}
                  >
                    {note.body_preview}
                  </p>
                )}
                <p
                  className="font-mono text-[10px] mt-1"
                  style={{ color: "var(--muted-foreground)", opacity: 0.4 }}
                >
                  {new Date(note.updated_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* New note button at the bottom */}
      <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button
          onClick={onNewNote}
          disabled={creatingNote}
          className="w-full rounded-lg py-2 font-heading text-xs font-bold text-neutral-950 transition-opacity disabled:opacity-40"
          style={{ background: "var(--mm-gold-400, #e6c364)" }}
        >
          {creatingNote ? "Creating…" : "New Note"}
        </button>
      </div>
    </div>
  )
}
