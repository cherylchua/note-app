import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

import { up, down } from './../db/migrations/20220217000647_create_users_and_notes_table';
import { Sqlite3Helper } from '../db/sqlite3';
import { CustomError } from '../utils/error';

import { CreateNoteRequest, Note, UpdateNoteRequest } from '../entities/note';
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

            const res = await noteRepository.updateNote(mockUpdateNoteReq);

            expect(res).toEqual(expect.objectContaining(expectedFields));
            expect(res.created_at).toBeTruthy();
            expect(res.updated_at).toBeTruthy();
        });
    });

    // describe('deleteNote', () => {
    //     it('should call the delete function', async () => {
    //         const note = await noteRepository.deleteNote();
    //         const noteId = note.id;

    //         const mockUpdateNoteReq: UpdateNoteRequest = {
    //             user_id: userId,
    //             id: noteId,
    //             title: 'All Too Well'
    //         };

    //         const expectedFields = {
    //             ...mockUpdateNoteReq,
    //             content: mockCreateNoteReq.content,
    //             is_archived: false
    //         }

    //         const res = await noteRepository.updateNote(mockUpdateNoteReq);

    //         expect(res).toEqual(expect.objectContaining(expectedFields));
    //         expect(res.created_at).toBeTruthy();
    //         expect(res.updated_at).toBeTruthy();
    //     });
    // });
});
