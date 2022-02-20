import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { SqliteError } from 'better-sqlite3';

import { Sqlite3Helper } from '../db/sqlite3';
import {
    ArchiveOrUnarchiveNoteRequest,
    CreateNoteRequest,
    DeleteNoteRequest,
    GetNotesRequest,
    Note,
    UpdateNoteRequest
} from '../entities/note';
import { CustomError, ErrorCodes, SqliteErrorCode } from '../utils/error';

interface INoteRepository {
    insertAndReturn(user_id: string, createNoteRequest: CreateNoteRequest, is_archived: boolean): Promise<Note>;
    getNoteByIdAndUserId(id: string, userId: string): Promise<Note>;
    getNotes(getNotesRequest: GetNotesRequest): Promise<Note[]>;
    updateNote(updateNoteRequest: UpdateNoteRequest): Promise<void>;
    deleteNote(deleteNoteRequest: DeleteNoteRequest): Promise<void>;
    archiveOrUnarchiveNote(archiveOrUnarchiveNoteRequest: ArchiveOrUnarchiveNoteRequest): Promise<void>;
}
export class NoteRepository implements INoteRepository {
    private dbConnection: Knex;

    constructor() {
        this.dbConnection = Sqlite3Helper.initialiseConnection();
    }

    async insertAndReturn(user_id: string, createNoteRequest: CreateNoteRequest, is_archived: boolean): Promise<Note> {
        try {
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
        } catch (err) {
            if (err instanceof SqliteError && err.code === SqliteErrorCode.SQLITE_CONSTRAINT_FOREIGNKEY) {
                throw new CustomError(ErrorCodes.DATA_NOT_FOUND, `User ${user_id} does not exist`, { user_id });
            }
            throw err;
        }
    }

    async getNoteByIdAndUserId(id: string, userId: string): Promise<Note> {
        const result = await this.dbConnection('notes').where({
            id: id,
            user_id: userId
        });

        if (!result[0]) {
            throw new CustomError(ErrorCodes.DATA_NOT_FOUND, `Note with id ${id} not found`, { id });
        }

        return this.mapSqliteToResourceData(result[0]) as Note;
    }

    async updateNote(updateNoteRequest: UpdateNoteRequest): Promise<void> {
        const res = await this.dbConnection('notes')
            .where({
                user_id: updateNoteRequest.user_id,
                id: updateNoteRequest.id
            })
            .update(updateNoteRequest);

        if (!res) {
            throw new CustomError(
                ErrorCodes.DATA_NOT_FOUND,
                `Note with user_id:${updateNoteRequest.user_id} and id:${updateNoteRequest.id} not found`,
                {
                    updateNoteRequest
                }
            );
        }

        return;
    }

    async getNotes(getNotesRequest: GetNotesRequest): Promise<Note[]> {
        const result = await this.dbConnection('notes')
            .where({
                user_id: getNotesRequest.user_id,
                is_archived: getNotesRequest.is_archived
            })
            .orderBy('updated_at', 'desc')
            .limit(getNotesRequest.limit as number);

        if (result.length === 0) {
            throw new CustomError(ErrorCodes.DATA_NOT_FOUND, `No notes found.`, { getNotesRequest });
        }

        return result.map((notes) => this.mapSqliteToResourceData(notes)) as Note[];
    }

    async deleteNote(deleteNoteRequest: DeleteNoteRequest): Promise<void> {
        const res = await this.dbConnection('notes')
            .where({
                user_id: deleteNoteRequest.user_id,
                id: deleteNoteRequest.id
            })
            .delete();

        if (!res) {
            throw new CustomError(
                ErrorCodes.DATA_NOT_FOUND,
                `Note with user_id:${deleteNoteRequest.user_id} and id:${deleteNoteRequest.id} not found`,
                { deleteNoteRequest }
            );
        }

        return;
    }

    async archiveOrUnarchiveNote(archiveOrUnarchiveNoteRequest: ArchiveOrUnarchiveNoteRequest): Promise<void> {
        return await this.dbConnection('notes')
            .where({
                user_id: archiveOrUnarchiveNoteRequest.user_id,
                id: archiveOrUnarchiveNoteRequest.id
            })
            .update({
                is_archived: archiveOrUnarchiveNoteRequest.should_archive
            });
    }

    mapSqliteToResourceData(rawNoteFromSqlite: any): Note {
        return {
            ...rawNoteFromSqlite,
            is_archived: rawNoteFromSqlite.is_archived === 0 ? false : true
        };
    }
}
