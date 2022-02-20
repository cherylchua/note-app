import { Sqlite3Helper } from 'src/db/sqlite3';
import { ArchiveOrUnarchiveNoteRequest, GetNotesRequest, UpdateNoteRequest } from 'src/entities/note';
import { NoteRepository } from 'src/repositories/note';
import { CustomError } from 'src/utils/error';
import { NoteService } from './note';

describe('NoteService', () => {
    let mockNoteRepository: NoteRepository;
    let mockNoteService: NoteService;

    jest.mock('../repositories/note');
    const MockNoteRepository = NoteRepository as jest.Mocked<typeof NoteRepository>;
    mockNoteRepository = new MockNoteRepository();

    mockNoteService = new NoteService(mockNoteRepository);

    const userId = 'bb5d6afb-e56c-47ef-ad61-e0e07ecd17e4';

    const mockNoteRepositoryResponse = {
        id: '91cbb5d8-0484-46de-bf82-aaebdeb06c26',
        user_id: '6df2b054-a306-42cd-bd8d-d3de76461db8',
        title: 'Some Title',
        content: `Cause we're young and we're reckless
        We'll take this way too far
        It'll leave you breathless
        Or with a nasty scar`,
        is_archived: false,
        created_at: '2022-02-19 18:21:00',
        updated_at: '2022-02-19 18:21:00'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await Sqlite3Helper.closeConnection();
    });

    describe('createNote', () => {
        const mockCreateNoteRequest = {
            content: 'No title only content'
        };

        mockNoteRepository.insertAndReturn = jest.fn().mockImplementation(() => {
            return mockNoteRepositoryResponse;
        });

        it('should insert and return a new note', async () => {
            const res = await mockNoteService.createNote(userId, mockCreateNoteRequest);

            expect(mockNoteRepository.insertAndReturn).toBeCalledTimes(1);
            expect(mockNoteRepository.insertAndReturn).toBeCalledWith(userId, mockCreateNoteRequest, false);
            expect(res).toEqual(mockNoteRepositoryResponse);
        });

        it('should throw API_VALIDATION_ERROR if both title and content are empty', async () => {
            try {
                await mockNoteService.createNote(userId, mockCreateNoteRequest);
            } catch (err: any) {
                expect(mockNoteRepository.insertAndReturn).not.toBeCalled();
                expect(err.error_code).toEqual('API_VALIDATION_ERROR');
                expect(err.message).toEqual('Title or Content must contain data.');
            }
        });
    });

    describe('updateNote', () => {
        mockNoteRepository.updateNote = jest.fn().mockImplementation(() => {
            return 1;
        });

        mockNoteRepository.getNoteByIdAndUserId = jest.fn().mockImplementation(() => {
            return mockNoteRepositoryResponse;
        });

        it('should update note if it belongs to the correct user and return updated note', async () => {
            const mockUpdateNoteRequest: UpdateNoteRequest = {
                user_id: userId,
                id: mockNoteRepositoryResponse.id,
                title: 'New Title',
                content: 'Some new content'
            };

            const res = await mockNoteService.updateNote(mockUpdateNoteRequest);

            expect(mockNoteRepository.updateNote).toBeCalledTimes(1);
            expect(mockNoteRepository.updateNote).toBeCalledWith(mockUpdateNoteRequest);
            expect(mockNoteRepository.getNoteByIdAndUserId).toBeCalledTimes(1);
            expect(mockNoteRepository.getNoteByIdAndUserId).toBeCalledWith(
                mockUpdateNoteRequest.id,
                mockUpdateNoteRequest.user_id
            );
            expect(res).toEqual(mockNoteRepositoryResponse);
        });

        it('should be able to only update title without changing content', async () => {
            const mockUpdateNoteRequest: UpdateNoteRequest = {
                user_id: userId,
                id: mockNoteRepositoryResponse.id,
                title: 'New Title'
            };

            const res = await mockNoteService.updateNote(mockUpdateNoteRequest);

            expect(mockNoteRepository.updateNote).toBeCalledTimes(1);
            expect(mockNoteRepository.updateNote).toBeCalledWith(mockUpdateNoteRequest);
            expect(mockNoteRepository.getNoteByIdAndUserId).toBeCalledTimes(1);
            expect(mockNoteRepository.getNoteByIdAndUserId).toBeCalledWith(
                mockUpdateNoteRequest.id,
                mockUpdateNoteRequest.user_id
            );
        });

        it('should throw DATA_NOT_FOUND error if note id does not exist', async () => {
            mockNoteRepository.updateNote = jest.fn().mockImplementation(() => {
                return 0;
            });

            const mockUpdateNoteRequest: UpdateNoteRequest = {
                user_id: userId,
                id: mockNoteRepositoryResponse.id,
                title: 'New Title'
            };

            try {
                await mockNoteService.updateNote(mockUpdateNoteRequest);
            } catch (err: any) {
                expect(err.error_code).toEqual('DATA_NOT_FOUND');
                expect(err.message).toEqual(`Note with id ${mockUpdateNoteRequest.id} not found`);
            }
        });

        it('should throw API_VALIDATION_ERROR if both title and content are empty', async () => {
            const mockUpdateNoteRequest: UpdateNoteRequest = {
                user_id: userId,
                id: mockNoteRepositoryResponse.id
            };

            try {
                await mockNoteService.updateNote(mockUpdateNoteRequest);
            } catch (err: any) {
                expect(mockNoteRepository.updateNote).not.toBeCalled();
                expect(err.error_code).toEqual('API_VALIDATION_ERROR');
                expect(err.message).toEqual('Title or Content must contain data.');
            }
        });
    });

    describe('deleteNote', () => {
        const mockDeleteNoteRequest = {
            user_id: userId,
            id: '07534193-0137-4923-96e4-073ace5b2f99'
        };

        it('should delete note if it belongs to the correct user and return deleted note', async () => {
            mockNoteRepository.deleteNote = jest.fn().mockImplementation(() => {
                return 1;
            });

            mockNoteRepository.getNoteByIdAndUserId = jest.fn().mockImplementation(() => {
                return mockNoteRepositoryResponse;
            });

            const expectedResponse = {
                message: 'Successfully deleted',
                deleted_resource: mockNoteRepositoryResponse
            };

            const res = await mockNoteService.deleteNote(mockDeleteNoteRequest);

            expect(res).toEqual(expectedResponse);
            expect(mockNoteRepository.deleteNote).toBeCalledWith(mockDeleteNoteRequest);
            expect(mockNoteRepository.getNoteByIdAndUserId).toBeCalledWith(
                mockDeleteNoteRequest.id,
                mockDeleteNoteRequest.user_id
            );
            expect(mockNoteRepository.deleteNote).toBeCalledTimes(1);
            expect(mockNoteRepository.getNoteByIdAndUserId).toBeCalledTimes(1);
        });

        it('should throw DATA_NOT_FOUND error if note does not exist', async () => {
            mockNoteRepository.deleteNote = jest.fn().mockImplementation(() => {
                return 0;
            });

            try {
                await mockNoteService.deleteNote(mockDeleteNoteRequest);
            } catch (err: any) {
                expect(err.error_code).toEqual('DATA_NOT_FOUND');
                expect(err.message).toEqual(
                    `Note with user_id:${mockDeleteNoteRequest.user_id} and id:${mockDeleteNoteRequest.id} not found`
                );
            }
        });
    });

    describe('archiveOrUnarchiveNote', () => {
        const mockRequest: ArchiveOrUnarchiveNoteRequest = {
            user_id: userId,
            id: '07534193-0137-4923-96e4-073ace5b2f99',
            should_archive: true
        };

        it('should archive note if it belongs to the correct user and return archived note', async () => {
            mockNoteRepository.archiveOrUnarchiveNote = jest.fn().mockImplementation(() => {
                return 1;
            });

            mockNoteRepository.getNoteByIdAndUserId = jest.fn().mockImplementation(() => {
                return mockNoteRepositoryResponse;
            });

            const res = await mockNoteService.archiveOrUnarchiveNote(mockRequest);

            expect(mockNoteRepository.archiveOrUnarchiveNote).toBeCalledTimes(1);
            expect(mockNoteRepository.archiveOrUnarchiveNote).toBeCalledWith(mockRequest);
            expect(mockNoteRepository.getNoteByIdAndUserId).toBeCalledTimes(1);
            expect(mockNoteRepository.getNoteByIdAndUserId).toBeCalledWith(mockRequest.id, mockRequest.user_id);
            expect(res).toEqual(mockNoteRepositoryResponse);
        });

        it('should throw DATA_NOT_FOUND error if note id does not exist', async () => {
            mockNoteRepository.archiveOrUnarchiveNote = jest.fn().mockImplementation(() => {
                return 0;
            });

            try {
                await mockNoteService.archiveOrUnarchiveNote(mockRequest);
            } catch (err: any) {
                expect(err.error_code).toEqual('DATA_NOT_FOUND');
                expect(err.message).toEqual(
                    `Note with user_id:${mockRequest.user_id} and id:${mockRequest.id} not found`
                );
            }
        });
    });

    describe('getNotes', () => {
        mockNoteRepository.getNotes = jest.fn();

        it('should get all notes if it belongs to the correct user', async () => {
            const mockGetNotesRequest: GetNotesRequest = {
                user_id: userId,
                is_archived: false,
                limit: 15
            };

            await mockNoteService.getNotes(mockGetNotesRequest);

            expect(mockNoteRepository.getNotes).toBeCalledTimes(1);
            expect(mockNoteRepository.getNotes).toBeCalledWith(mockGetNotesRequest);
        });

        it('should get all notes with default limit and unarchived if they are not specified', async () => {
            const expectedGetNotesRequest: GetNotesRequest = {
                user_id: userId,
                limit: 10,
                is_archived: false
            };

            await mockNoteService.getNotes({ user_id: userId });

            expect(mockNoteRepository.getNotes).toBeCalledTimes(1);
            expect(mockNoteRepository.getNotes).toBeCalledWith(expectedGetNotesRequest);
        });

        it('should return empty array if no notes found', async () => {
            const mockGetNotesRequest: GetNotesRequest = {
                user_id: userId,
                is_archived: false,
                limit: 15
            };

            mockNoteRepository.getNotes = jest.fn().mockImplementation(() => {
                throw new CustomError('DATA_NOT_FOUND', 'No notes found', { mockGetNotesRequest });
            });

            const res = await mockNoteService.getNotes(mockGetNotesRequest);

            expect(mockNoteRepository.getNotes).toBeCalledTimes(1);
            expect(mockNoteRepository.getNotes).toBeCalledWith(mockGetNotesRequest);
            expect(res).toEqual([]);
        });
    });
});
