import knex, { Knex } from "knex";
import config from '../../knexfile';

export class Sqlite3Helper {
    public static config: Knex.Config;

    public static async initialiseConnection(): Promise<Knex> {
        const dbConnection = await knex(config[`${process.env.NODE_ENV}`])

        return dbConnection;
    }

    public static async closeConnection(dbConnection: Knex): Promise<void> {
        await dbConnection.destroy();
    }
}