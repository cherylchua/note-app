import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

import { up, down } from './../db/migrations/20220217000647_create_users_and_notes_table';
import { Sqlite3Helper } from '../db/sqlite3';
import { CustomError } from '../utils/error';

import { CreateNoteRequest, DeleteNoteRequest, Note, UpdateNoteRequest } from '../entities/note';
import { NoteRepository } from './note';
import { UserRepository } from './user';
import { CreateUserRequest } from 'src/entities/user';

describe('NoteRepository', () => {
    let dbConnection: Knex;
    let noteRepository: NoteRepository;
    let userRepository: UserRepository;

    let userId: string;

    beforeAll(async () => {
        dbConnection = await Sqlite3Helper.initialiseConnection();
        userRepository = new UserRepository(dbConnection);
        noteRepository = new NoteRepository();

        await up(dbConnection);

        const mockCreateUserReq: CreateUserRequest = {
            first_name: 'FirstName',
            last_name: 'LastName',
            email: 'test@gmail.com'
        };

        const user = await userRepository.insertAndReturn(mockCreateUserReq);
        userId = user.id;
    });

    afterAll(async () => {
        await down(dbConnection);
        await Sqlite3Helper.closeConnection(dbConnection);
    });

    const mockCreateNoteReq: CreateNoteRequest = {
        title: 'Mock Title',
        content: `Oh, your sweet disposition
        And my wide-eyed gaze
        We're singing in the car, getting lost upstate
        Autumn leaves falling down like pieces into place
        And I can picture it after all these days
        And I know it's long gone and that magic's not here no more
        And I might be okay but I'm not fine at all
        'Cause there we are again on that little town street
        You almost ran the red 'cause you were lookin' over at me
        Wind in my hair, I was there
        I remember it all too well`
    };

    describe('insertAndReturn', () => {
        const is_archived = false;

        it('should call the insert function', async () => {
            const expectedFields = {
                user_id: userId,
                ...mockCreateNoteReq,
                is_archived
            };

            const res = await noteRepository.insertAndReturn(userId, mockCreateNoteReq, is_archived);

            expect(res).toEqual(expect.objectContaining(expectedFields));
            expect(res.id).toBeTruthy();
            expect(res.created_at).toBeTruthy();
            expect(res.updated_at).toBeTruthy();
        });

        it('should call the insert function even if title is null', async () => {
            const mockCreateNoteReqWithoutTitle = {
                content: mockCreateNoteReq.content
            };

            const expectedFields = {
                user_id: userId,
                ...mockCreateNoteReqWithoutTitle,
                is_archived
            };

            const res = await noteRepository.insertAndReturn(userId, mockCreateNoteReqWithoutTitle, is_archived);

            expect(res).toEqual(expect.objectContaining(expectedFields));
            expect(res.id).toBeTruthy();
            expect(res.title).toBeNull();
            expect(res.created_at).toBeTruthy();
            expect(res.updated_at).toBeTruthy();
        });
    });

    describe('updateNote', () => {
        it('should call the update function even if only one field is updated', async () => {
            const note = await noteRepository.insertAndReturn(userId, mockCreateNoteReq, false);
            const noteId = note.id;

            const mockUpdateNoteReq: UpdateNoteRequest = {
                user_id: userId,
                id: noteId,
                title: 'All Too Well'
            };

            const expectedFields = {
                ...mockUpdateNoteReq,
                content: mockCreateNoteReq.content,
                is_archived: false
            };

            await noteRepository.updateNote(mockUpdateNoteReq);

            const res = await noteRepository.getNoteById(noteId);

            expect(res).toEqual(expect.objectContaining(expectedFields));
            expect(res.created_at).toBeTruthy();
            expect(res.updated_at).toBeTruthy();
        });
    });

    describe('getNoteById', () => {
        it('should return a note if exists', async () => {
            const note = await noteRepository.insertAndReturn(userId, mockCreateNoteReq, false);

            const res = await noteRepository.getNoteById(note.id);

            const expectedFields = {
                user_id: userId,
                ...mockCreateNoteReq,
                is_archived: false
            };

            expect(res).toEqual(expect.objectContaining(expectedFields));
            expect(res.created_at).toBeTruthy();
            expect(res.updated_at).toBeTruthy();
        });

        it('should throw DATA_NOT_FOUND if note does not exist', async () => {
            const expectedError = {
                error_code: 'DATA_NOT_FOUND',
                message: `Note with id non existent note not found`,
                context: { id: 'non existent note' }
            };
            try {
                return await noteRepository.getNoteById('non existent note');
            } catch (err: any) {
                if (err && err.error_code && err.message) {
                    expect(err.error_code).toEqual(expectedError.error_code);
                    expect(err.message).toEqual(expectedError.message);
                }
            }
        });
    });

    describe('getNotes', () => {
        it('should get all unarchived notes for a user with limit', async () => {
            const mockGetNotesRequest = {
                user_id: userId,
                is_archived: false,
                limit: 3
            };

            const res = await noteRepository.getNotes(mockGetNotesRequest);

            expect(res.length).toEqual(3);
            expect(res[0].updated_at >= res[2].updated_at).toEqual(true);
        });

        it('should throw DATA_NOT_FOUND if no notes found', async () => {
            const mockGetNotesRequest = {
                user_id: 'non existent note',
                is_archived: false,
                limit: 3
            };

            const expectedError = {
                error_code: 'DATA_NOT_FOUND',
                message: `No notes found.`,
                context: mockGetNotesRequest
            };
            try {
                return await noteRepository.getNotes(mockGetNotesRequest);
            } catch (err: any) {
                if (err && err.error_code && err.message) {
                    expect(err.error_code).toEqual(expectedError.error_code);
                    expect(err.message).toEqual(expectedError.message);
                }
            }
        });
    });

    describe('deleteNote', () => {
        it('should call the delete function', async () => {
            const noteToDelete = await noteRepository.insertAndReturn(userId, mockCreateNoteReq, false);

            await noteRepository.deleteNote({ user_id: userId, id: noteToDelete.id });

            await expect(noteRepository.getNoteById(noteToDelete.id)).rejects.toThrow(CustomError);
        });
    });

    describe('archiveOrUnarchiveNote', () => {
        it('should call the update function', async () => {
            const insertedNote = await noteRepository.insertAndReturn(userId, mockCreateNoteReq, false);

            const mockArchiveNoteRequest = {
                user_id: userId,
                id: insertedNote.id,
                should_archive: true
            };

            const note = await noteRepository.archiveOrUnarchiveNote(mockArchiveNoteRequest);

            const res = await noteRepository.getNoteById(insertedNote.id);

            expect(res).toEqual(expect.objectContaining(mockCreateNoteReq));
            expect(res.is_archived).toEqual(true);
            expect(res.created_at).toBeTruthy();
            expect(res.updated_at).toBeTruthy();
        });
    });
});
