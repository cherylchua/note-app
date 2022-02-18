import type { Knex } from "knex";
import path from 'path';

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
    test: {
        client: "better-sqlite3",
        connection: {
          filename: path.resolve('./', "test.db.sqlite3")
        },
        migrations: {
            directory: path.resolve('./', "src/db/migrations"),
            tableName: 'knex_migrations'
          },
        useNullAsDefault: true
      },
    development: {
        client: "better-sqlite3",
        connection: {
            filename: path.resolve('./', "db.sqlite3")
        },
        migrations: {
            directory: path.resolve('./', "src/db/migrations"),
            tableName: 'knex_migrations'
            },
        useNullAsDefault: true
    }
};

export default config;