export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  is_archived: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteRequest {
  title?: string;
  content?: string;
}

export interface GetNotesRequest {
  user_id: string;
  is_archived?: boolean;
  limit?: number;
}

export interface UpdateNoteRequest {
  user_id: string;
  note_id: string;
  title?: string;
  content?: string;
}

export interface DeleteNoteRequest {
  user_id: string;
  note_id: string;
}

export interface DeleteNoteResponse {
  message: string;
  deleted_resource: Note;
}

export interface ArchiveOrUnarchiveNoteRequest {
  user_id: string;
  note_id: string;
  should_archive: boolean;
}
