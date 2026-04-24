"use client"

import { useState } from "react"
import { NotesSidebar } from "./NotesSidebar"
import { NoteEditor } from "./NoteEditor"
import { useCreateNote } from "@/lib/queries/notes"

export function NotesClient() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const createNote = useCreateNote()

  async function handleNewNote() {
    const note = await createNote.mutateAsync({
      title: "",
      body: "",
      folder_id: selectedFolderId,
    })
    setSelectedNoteId(note.id)
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-full" style={{ background: "var(--background)" }}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={[
          "fixed inset-y-0 left-0 z-40 w-64 flex-shrink-0 flex flex-col",
          "md:static md:z-auto md:translate-x-0",
          "transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
        style={{
          background: "rgba(255,255,255,0.02)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <NotesSidebar
          selectedFolderId={selectedFolderId}
          onSelectFolder={(id) => {
            setSelectedFolderId(id)
            setSelectedNoteId(null)
          }}
          selectedNoteId={selectedNoteId}
          onSelectNote={(id) => {
            setSelectedNoteId(id)
            setSidebarOpen(false)
          }}
          search={search}
          onSearch={setSearch}
          onNewNote={handleNewNote}
          creatingNote={createNote.isPending}
        />
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header bar */}
        <div
          className="flex items-center gap-3 px-4 py-3 md:hidden flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md transition-colors hover:bg-white/5"
            aria-label="Open sidebar"
          >
            <svg viewBox="0 0 20 20" className="w-5 h-5 fill-current text-muted-foreground">
              <path
                fillRule="evenodd"
                d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <span className="font-heading text-sm font-semibold text-foreground">Notes</span>
        </div>

        <NoteEditor
          key={selectedNoteId ?? "empty"}
          noteId={selectedNoteId}
          onNoteDeleted={() => setSelectedNoteId(null)}
          onNewNote={handleNewNote}
          creatingNote={createNote.isPending}
        />
      </div>
    </div>
  )
}
