import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    if ((await knex.schema.hasTable('users')) && (await knex.schema.hasTable('notes'))) {
        return;
    }

    await knex.schema.createTable('users', (table) => {
        table.uuid('id').primary();
        table.string('first_name').notNullable();
        table.string('last_name').notNullable();
        table.string('email').unique().notNullable();
        table.timestamps(true, true, false); // creates created_at and updated_at columns
    });

    await knex.schema.createTable('notes', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.string('title');
        table.text('content');
        table.boolean('is_archived').notNullable();
        table.timestamps(true, true, false); // creates created_at and updated_at columns
    });

    console.log(`Users and Notes tables created`);
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('notes');
    await knex.schema.dropTableIfExists('users');
}
