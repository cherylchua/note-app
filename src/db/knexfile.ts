import type { Knex } from "knex";
import path from 'path';

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "better-sqlite3",
    connection: {
      filename: path.resolve(__dirname, "./database/db.sqlite3")
    },
    migrations: {
        tableName: 'knex_migrations'
      },
    useNullAsDefault: true
  }
};

export default config;
