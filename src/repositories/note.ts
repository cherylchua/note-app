import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { Sqlite3Helper } from 'src/db/sqlite3';
import {
    ArchiveOrUnarchiveNoteRequest,
    CreateNoteRequest,
    DeleteNoteRequest,
    GetNotesRequest,
    Note,
    UpdateNoteRequest
} from 'src/entities/note';

interface INoteRepository {
    insertAndReturn(user_id: string, createNoteRequest: CreateNoteRequest, is_archived: boolean): Promise<Note>;
    getNoteById(id: string): Promise<Note>;
    getNotes(getNotesRequest: GetNotesRequest): Promise<Note[]>;
    updateNote(updateNoteRequest: UpdateNoteRequest): Promise<Note>;
    deleteNote(deleteNoteRequest: DeleteNoteRequest): Promise<void>;
    archiveOrUnarchiveNote(archiveOrUnarchiveNoteRequest: ArchiveOrUnarchiveNoteRequest): Promise<void>;
}
export class NoteRepository implements INoteRepository {
    private dbConnection: Knex;

    constructor() {
        this.dbConnection = Sqlite3Helper.initialiseConnection();
    }

    async insertAndReturn(user_id: string, createNoteRequest: CreateNoteRequest, is_archived: boolean): Promise<Note> {
        const result = await this.dbConnection('notes')
            .insert({
                id: uuidv4(),
                user_id,
                title: createNoteRequest.title,
                content: createNoteRequest.content,
                is_archived
            })
            .returning('*');

        return this.mapSqliteToResourceData(result[0]) as Note;
    }

    async getNoteById(id: string): Promise<Note> {
        const result = await this.dbConnection('notes').where('id', id);

        return this.mapSqliteToResourceData(result[0]) as Note;
    }

    async updateNote(updateNoteRequest: UpdateNoteRequest): Promise<Note> {
        await this.dbConnection('notes')
            .where({
                user_id: updateNoteRequest.user_id,
                id: updateNoteRequest.id
            })
            .update(updateNoteRequest);

        return await this.getNoteById(updateNoteRequest.id);
    }

    getNotes(getNotesRequest: GetNotesRequest): Promise<Note[]> {
        throw new Error('Method not implemented.');
    }

    deleteNote(deleteNoteRequest: DeleteNoteRequest): Promise<void> {
        throw new Error('Method not implemented.');
    }

    archiveOrUnarchiveNote(archiveOrUnarchiveNoteRequest: ArchiveOrUnarchiveNoteRequest): Promise<void> {
        throw new Error('Method not implemented.');
    }

    mapSqliteToResourceData(rawNoteFromSqlite: any): Note {
        return {
            ...rawNoteFromSqlite,
            is_archived: rawNoteFromSqlite.is_archived === 0 ? false : true
        };
    }
}
