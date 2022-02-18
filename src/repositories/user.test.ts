import knex, { Knex } from "knex"

import config from "./../../knexfile"
import {up, down} from "./../db/migrations/20220217000647_create_users_and_notes_table"
import { CustomError } from "src/utils/error"

import { CreateUserRequest } from "src/entities/user"
import { UserRepository } from "./user"


describe('UserRepository', () => {
    let dbConnection: Knex;
    let userRepository: UserRepository;

    const mockCreateUserReq: CreateUserRequest = {
        first_name: 'FirstName',
        last_name: 'LastName',
        email: 'test@gmail.com'
    }

    beforeAll(async() => {
        dbConnection = knex(config[`${process.env.NODE_ENV}`]); 
        userRepository = new UserRepository(dbConnection);
        await up(dbConnection);
    })

    afterAll(async() => {
        await down(dbConnection);
        dbConnection.destroy();
    })
        
    describe('insertAndReturn', () => {
        it('should call the insert function', async () => {            
            const res = await userRepository.insertAndReturn(mockCreateUserReq);

            expect(res).toEqual(expect.objectContaining(mockCreateUserReq));
            expect(res.id).toBeTruthy();
            expect(res.created_at).toBeTruthy();
            expect(res.updated_at).toBeTruthy();
        })

        it('should throw CustomError if SqliteError is thrown', async () => {
            try {
                await userRepository.insertAndReturn(mockCreateUserReq);
            } catch (err) {
                expect(err).toBeInstanceOf(CustomError);
            }

        });
    })
})

