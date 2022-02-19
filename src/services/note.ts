import {
    ArchiveOrUnarchiveNoteRequest,
    CreateNoteRequest,
    DeleteNoteRequest,
    DeleteNoteResponse,
    GetNotesRequest,
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
