import { Sqlite3Helper } from 'src/db/sqlite3';
import { UpdateNoteRequest } from 'src/entities/note';
import { NoteRepository } from 'src/repositories/note';
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

        mockNoteRepository.getNoteById = jest.fn().mockImplementation(() => {
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
            expect(mockNoteRepository.getNoteById).toBeCalledTimes(1);
            expect(mockNoteRepository.getNoteById).toBeCalledWith(mockUpdateNoteRequest.id);
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
            expect(mockNoteRepository.getNoteById).toBeCalledTimes(1);
            expect(mockNoteRepository.getNoteById).toBeCalledWith(mockUpdateNoteRequest.id);
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
        it('should delete note if it belongs to the correct user and return deleted note', () => {});

        it('should throw DATA_NOT_FOUND error if note id does not exist', () => {});
    });

    describe('archiveOrUnarchiveNote', () => {
        it('should archive note if it belongs to the correct user and return archived note', () => {});

        it('should throw DATA_NOT_FOUND error if note id does not exist', () => {});
    });

    describe('getNotes', () => {
        it('should get all notes if it belongs to the correct user ordered by latest updated', () => {});

        it('should get all notes with default limit if limit is not specified', () => {});

        it('should get all unarchived notes by default if is_archived is not specified', () => {});

        it('should return empty array if no notes found', () => {});
    });
});
