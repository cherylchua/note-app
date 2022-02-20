import {
    CreateNoteRequest,
    DeleteNoteRequest,
    DeleteNoteResponse,
    GetNotesRequest,
    ArchiveOrUnarchiveNoteRequest,
    Note,
    UpdateNoteRequest
} from '../entities/note';
import { NoteRepository } from '../repositories/note';
import { CustomError, ErrorCodes } from '../utils/error';

export interface INoteService {
    createNote(userId: string, createNoteRequest: CreateNoteRequest): Promise<Note>;
    getNotes(getNotesRequest: GetNotesRequest): Promise<Note[]>;
    updateNote(updateNoteRequest: UpdateNoteRequest): Promise<Note>;
    deleteNote(deleteNoteRequest: DeleteNoteRequest): Promise<DeleteNoteResponse>;
    archiveOrUnarchiveNote(archiveOrUnarchiveNoteRequest: ArchiveOrUnarchiveNoteRequest): Promise<Note>;
}

// user shouldn't be able to update another user's note
// user shouldn't be able to delete another user's note
// user shouldn't be able to get another user's note
// user shouldn't be able to archive/ unarchive user's note

export class NoteService implements INoteService {
    private noteRepository: NoteRepository;

    constructor(noteRepository: NoteRepository) {
        this.noteRepository = noteRepository;
    }

    async createNote(userId: string, createNoteRequest: CreateNoteRequest): Promise<Note> {
        if (!createNoteRequest.title && !createNoteRequest.content) {
            throw new CustomError(ErrorCodes.API_VALIDATION_ERROR, 'Title or Content must contain data.', {
                createNoteRequest
            });
        }

        return await this.noteRepository.insertAndReturn(userId, createNoteRequest, false);
    }

    async getNotes(getNotesRequest: GetNotesRequest): Promise<Note[]> {
        throw new Error('Method not implemented.');
    }

    async updateNote(updateNoteRequest: UpdateNoteRequest): Promise<Note> {
        if (!updateNoteRequest.title && !updateNoteRequest.content) {
            throw new CustomError(ErrorCodes.API_VALIDATION_ERROR, 'Title or Content must contain data.', {
                updateNoteRequest
            });
        }

        await this.noteRepository.updateNote(updateNoteRequest);

        return await this.noteRepository.getNoteById(updateNoteRequest.id);
    }

    async deleteNote(deleteNoteRequest: DeleteNoteRequest): Promise<DeleteNoteResponse> {
        throw new Error('Method not implemented.');
    }

    async archiveOrUnarchiveNote(archiveOrUnarchiveNoteRequest: ArchiveOrUnarchiveNoteRequest): Promise<Note> {
        throw new Error('Method not implemented.');
    }
}
