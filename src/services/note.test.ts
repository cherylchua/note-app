import { Sqlite3Helper } from 'src/db/sqlite3';
import { NoteRepository } from 'src/repositories/note';
import { NoteService } from './note';

describe('NoteService', () => {
    let mockNoteRepository: NoteRepository;
    let mockNoteService: NoteService;

    const userId = 'bb5d6afb-e56c-47ef-ad61-e0e07ecd17e4';

    beforeAll(() => {
        jest.mock('../repositories/note');
        const MockNoteRepository = NoteRepository as jest.Mocked<typeof NoteRepository>;
        mockNoteRepository = new MockNoteRepository();
        mockNoteService = new NoteService(mockNoteRepository);
    });

    afterAll(async () => {
        await Sqlite3Helper.closeConnection();
    });

    describe('createNote', () => {
        const mockCreateNoteRequest = {
            content: 'No title only content'
        };

        it('should insert and return a new note', async () => {
            mockNoteRepository.insertAndReturn = jest.fn();

            const res = await mockNoteService.createNote(userId, mockCreateNoteRequest);

            expect(mockNoteRepository.insertAndReturn).toBeCalledTimes(1);
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
});
