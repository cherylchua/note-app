import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { SqliteError } from 'better-sqlite3';

import { Sqlite3Helper } from '../db/sqlite3';
import { CustomError, SqliteErrorCode } from './../utils/error';

import { CreateUserRequest, User } from './../entities/user';

export interface IUserRepository {
    insertAndReturn(insertUserRequest: CreateUserRequest): Promise<User>;
}

export class UserRepository implements IUserRepository {
    private dbConnection: Knex;

    constructor() {
        this.dbConnection = Sqlite3Helper.initialiseConnection();
    }

    async insertAndReturn(insertUserRequest: CreateUserRequest): Promise<User> {
        try {
            const result = await this.dbConnection('users')
                .insert({
                    id: uuidv4(),
                    ...insertUserRequest
                })
                .returning('*');

            return result[0] as User;
        } catch (err) {
            if (err instanceof SqliteError && err.code === SqliteErrorCode.SQLITE_CONSTRAINT_UNIQUE) {
                throw new CustomError('DUPLICATE_ERROR', 'Email field must be unique', { context: insertUserRequest });
            }
            throw err;
        }
    }
}
