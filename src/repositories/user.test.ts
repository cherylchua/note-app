import { Knex } from 'knex';

import { up, down } from './../db/migrations/20220217000647_create_users_and_notes_table';
import { Sqlite3Helper } from '../db/sqlite3';
import { CustomError } from '../utils/error';

import { CreateUserRequest } from '../entities/user';
import { UserRepository } from './user';

describe('UserRepository', () => {
    let dbConnection: Knex;
    let userRepository: UserRepository;

    const mockCreateUserReq: CreateUserRequest = {
        first_name: 'FirstName',
        last_name: 'LastName',
        email: 'test@gmail.com'
    };

    beforeAll(async () => {
        userRepository = new UserRepository();
        dbConnection = Sqlite3Helper.dbConnection;
        await down(dbConnection);
        await up(dbConnection);
    });

    afterAll(async () => {
        await down(dbConnection);
        await Sqlite3Helper.closeConnection();
    });

    describe('insertAndReturn', () => {
        it('should call the insert function', async () => {
            const res = await userRepository.insertAndReturn(mockCreateUserReq);

            expect(res).toEqual(expect.objectContaining(mockCreateUserReq));
            expect(res.id).toBeTruthy();
            expect(res.created_at).toBeTruthy();
            expect(res.updated_at).toBeTruthy();
        });

        it('should throw CustomError if SqliteError is thrown', async () => {
            try {
                return await userRepository.insertAndReturn(mockCreateUserReq);
            } catch (err) {
                console.log(err);
                expect(err).toBeInstanceOf(CustomError);
            }
        });
    });
});
