import { Sqlite3Helper } from "src/db/sqlite3";
import { CreateUserRequest } from "src/entities/user";
import { UserRepository } from "../repositories/user"
import { UserService } from "./user";

describe('UserService', () => {
    let mockUserRepository: UserRepository;
    let mockUserService: UserService;

    beforeAll(() => {
        jest.mock('../repositories/user');
        const MockUserRepository = UserRepository as jest.Mocked<typeof UserRepository>;
        mockUserRepository = new MockUserRepository(Sqlite3Helper.initialiseConnection());
        
        mockUserService = new UserService(mockUserRepository)
    });

    describe('createUser', () => {
        it('should call repository to insertAndReturn', async () => {
            mockUserRepository.insertAndReturn = jest.fn();
            
            const mockCreateUserReq: CreateUserRequest = {
                first_name: 'FirstName',
                last_name: 'LastName',
                email: 'test@gmail.com'
            }
            
            await mockUserService.createUser(mockCreateUserReq);

            expect(mockUserRepository.insertAndReturn).toHaveBeenCalledWith(mockCreateUserReq);

        })
    })
})