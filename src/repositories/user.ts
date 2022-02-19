import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserRequest, User } from './../entities/user';
import { SqliteError } from 'better-sqlite3';
import { CustomError, SqliteErrorCode } from './../utils/error';

export interface IUserRepository {
  insertAndReturn(insertUserRequest: CreateUserRequest): Promise<User>;
}

export class UserRepository implements IUserRepository {
  private dbConnection: Knex;

  constructor(dbConnection: Knex) {
    this.dbConnection = dbConnection;
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
