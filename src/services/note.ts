import {
    CreateNoteRequest,
    DeleteNoteRequest,
    DeleteNoteResponse,
    GetNotesRequest,
    ArchiveOrUnarchiveNoteRequest,
    Note,
    UpdateNoteRequest
} from 'src/entities/note';

export interface INoteService {
    createNote(createNoteRequest: CreateNoteRequest): Promise<Note>;
    getNotes(getNotesRequest: GetNotesRequest): Promise<Note[]>;
    updateNote(updateNoteRequest: UpdateNoteRequest): Promise<Note>;
    deleteNote(deleteNoteRequest: DeleteNoteRequest): Promise<DeleteNoteResponse>;
    archiveOrUnarchiveNote(archiveOrUnarchiveNoteRequest: ArchiveOrUnarchiveNoteRequest): Promise<Note>;
}

// user shouldn't be able to update another user's note
// user shouldn't be able to delete another user's note
// user shouldn't be able to get another user's note
// user shouldn't be able to archive/ unarchive user's note
