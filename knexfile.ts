import type { Knex } from 'knex';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const config: { [key: string]: Knex.Config } = {
    test: {
        client: 'better-sqlite3',
        connection: {
            filename: path.resolve(__dirname, 'test.db.sqlite3')
        },
        migrations: {
            directory: path.resolve(__dirname, './db/migrations'),
            tableName: 'knex_migrations'
        },
        useNullAsDefault: true
    },
    development: {
        client: 'better-sqlite3',
        connection: {
            filename: path.resolve(__dirname, 'db.sqlite3')
        },
        migrations: {
            directory: path.resolve(__dirname, 'src/db/migrations'),
            tableName: 'knex_migrations'
        },
        useNullAsDefault: true
    }
};

export default config;
