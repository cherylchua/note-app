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
    getNotes(getNotesRequest: GetNotesRequest): Promise<Note[] | []>;
    updateNote(updateNoteRequest: UpdateNoteRequest): Promise<Note>;
    deleteNote(deleteNoteRequest: DeleteNoteRequest): Promise<DeleteNoteResponse>;
    archiveOrUnarchiveNote(archiveOrUnarchiveNoteRequest: ArchiveOrUnarchiveNoteRequest): Promise<Note>;
}

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

    async getNotes(getNotesRequest: GetNotesRequest): Promise<Note[] | []> {
        try {
            return await this.noteRepository.getNotes({
                user_id: getNotesRequest.user_id,
                is_archived: getNotesRequest.hasOwnProperty('is_archived') ? getNotesRequest.is_archived : false,
                limit: getNotesRequest.hasOwnProperty('limit') ? getNotesRequest.limit : 10
            });
        } catch (err) {
            if (err instanceof CustomError && err.error_code === ErrorCodes.DATA_NOT_FOUND) {
                return [];
            }

            throw err;
        }
    }

    async updateNote(updateNoteRequest: UpdateNoteRequest): Promise<Note> {
        if (!updateNoteRequest.title && !updateNoteRequest.content) {
            throw new CustomError(ErrorCodes.API_VALIDATION_ERROR, 'Title or Content must contain data.', {
                updateNoteRequest
            });
        }

        await this.noteRepository.updateNote(updateNoteRequest);

        return await this.noteRepository.getNoteByIdAndUserId(updateNoteRequest.id, updateNoteRequest.user_id);
    }

    async deleteNote(deleteNoteRequest: DeleteNoteRequest): Promise<DeleteNoteResponse> {
        const noteToDelete = await this.noteRepository.getNoteByIdAndUserId(
            deleteNoteRequest.id,
            deleteNoteRequest.user_id
        );

        await this.noteRepository.deleteNote(deleteNoteRequest);

        return {
            message: 'Successfully deleted',
            deleted_resource: noteToDelete
        };
    }

    async archiveOrUnarchiveNote(archiveOrUnarchiveNoteRequest: ArchiveOrUnarchiveNoteRequest): Promise<Note> {
        await this.noteRepository.archiveOrUnarchiveNote(archiveOrUnarchiveNoteRequest);

        return await this.noteRepository.getNoteByIdAndUserId(
            archiveOrUnarchiveNoteRequest.id,
            archiveOrUnarchiveNoteRequest.user_id
        );
    }
}
