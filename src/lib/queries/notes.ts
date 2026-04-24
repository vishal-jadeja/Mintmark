import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import api from "@/lib/axios"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NoteListItem {
  id: string
  title: string
  body_preview: string
  tags: string[]
  folder_id: string | null
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  title: string
  body: string
  tags: string[]
  folder_id: string | null
  created_at: string
  updated_at: string
}

export interface Folder {
  id: string
  name: string
  color: string | null
  note_count: number
  created_at: string
}

export interface CreateNoteInput {
  title: string
  body: string
  folder_id?: string | null
  tags?: string[]
}

export interface UpdateNoteInput {
  id: string
  title?: string
  body?: string
  folder_id?: string | null
  tags?: string[]
}

export interface CreateFolderInput {
  name: string
  color?: string | null
}

// ─── Query helpers ────────────────────────────────────────────────────────────

function notesKey(params?: { folder_id?: string | null; search?: string }) {
  return ["notes", params?.folder_id ?? null, params?.search ?? ""]
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useNotes(params?: { folder_id?: string | null; search?: string }) {
  return useQuery<NoteListItem[]>({
    queryKey: notesKey(params),
    queryFn: async () => {
      const search = new URLSearchParams()
      if (params?.folder_id) search.set("folder_id", params.folder_id)
      if (params?.search) search.set("search", params.search)
      const qs = search.toString() ? `?${search.toString()}` : ""
      const { data } = await api.get<{ notes: NoteListItem[] }>(`/api/notes${qs}`)
      return data.notes
    },
  })
}

export function useNote(id: string | null) {
  return useQuery<Note>({
    queryKey: ["note", id],
    queryFn: async () => {
      const { data } = await api.get<{ note: Note }>(`/api/notes/${id}`)
      return data.note
    },
    enabled: !!id,
  })
}

export function useFolders() {
  return useQuery<Folder[]>({
    queryKey: ["folders"],
    queryFn: async () => {
      const { data } = await api.get<{ folders: Folder[] }>("/api/folders")
      return data.folders
    },
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateNote() {
  const qc = useQueryClient()
  return useMutation<Note, Error, CreateNoteInput>({
    mutationFn: async (payload) => {
      try {
        const { data } = await api.post<{ note: Note }>("/api/notes", payload)
        return data.note
      } catch (err) {
        if (isAxiosError(err)) {
          throw new Error(
            (err.response?.data as { error?: string })?.error ?? "Failed to create note."
          )
        }
        throw err
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] })
    },
  })
}

export function useUpdateNote() {
  const qc = useQueryClient()
  return useMutation<Note, Error, UpdateNoteInput>({
    mutationFn: async ({ id, ...patch }) => {
      try {
        const { data } = await api.patch<{ note: Note }>(`/api/notes/${id}`, patch)
        return data.note
      } catch (err) {
        if (isAxiosError(err)) {
          throw new Error(
            (err.response?.data as { error?: string })?.error ?? "Failed to update note."
          )
        }
        throw err
      }
    },
    onSuccess: (note) => {
      qc.invalidateQueries({ queryKey: ["notes"] })
      qc.setQueryData(["note", note.id], note)
    },
  })
}

export function useDeleteNote() {
  const qc = useQueryClient()
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (id) => {
      try {
        const { data } = await api.delete<{ success: boolean }>(`/api/notes/${id}`)
        return data
      } catch (err) {
        if (isAxiosError(err)) {
          throw new Error(
            (err.response?.data as { error?: string })?.error ?? "Failed to delete note."
          )
        }
        throw err
      }
    },
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["notes"] })
      qc.removeQueries({ queryKey: ["note", id] })
    },
  })
}

export function useCreateFolder() {
  const qc = useQueryClient()
  return useMutation<Folder, Error, CreateFolderInput>({
    mutationFn: async (payload) => {
      try {
        const { data } = await api.post<{ folder: Folder }>("/api/folders", payload)
        return data.folder
      } catch (err) {
        if (isAxiosError(err)) {
          throw new Error(
            (err.response?.data as { error?: string })?.error ?? "Failed to create folder."
          )
        }
        throw err
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["folders"] })
    },
  })
}

export function useDeleteFolder() {
  const qc = useQueryClient()
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (id) => {
      try {
        const { data } = await api.delete<{ success: boolean }>(`/api/folders/${id}`)
        return data
      } catch (err) {
        if (isAxiosError(err)) {
          throw new Error(
            (err.response?.data as { error?: string })?.error ?? "Failed to delete folder."
          )
        }
        throw err
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["folders"] })
      qc.invalidateQueries({ queryKey: ["notes"] })
    },
  })
}
