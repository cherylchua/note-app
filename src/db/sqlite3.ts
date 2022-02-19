import knex, { Knex } from 'knex';
import config from '../../knexfile';

export class Sqlite3Helper {
    public static config: Knex.Config;
    static dbConnection: Knex<any, unknown[]>;

    public static initialiseConnection(): Knex {
        this.dbConnection = knex(config[`${process.env.NODE_ENV}`]);

        return Sqlite3Helper.dbConnection;
    }

    public static async closeConnection(): Promise<void> {
        await Sqlite3Helper.dbConnection.destroy();
    }
}
