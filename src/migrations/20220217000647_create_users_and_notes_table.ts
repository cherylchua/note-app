import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTableIfNotExists('users', table => {
        table.uuid('id').primary()
        table.string('first_name').notNullable()
        table.string('last_name').notNullable()
        table.string('email').notNullable()
        table.timestamps(true, true, false) // creates created_at and updated_at columns
    })

    await knex.schema.createTableIfNotExists('notes', table => {
        table.uuid('id').primary()
        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE')
        table.string('title')
        table.text('content')
        table.boolean('is_archived').notNullable()
        table.timestamps(true, true, false) // creates created_at and updated_at columns
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('notes');
    await knex.schema.dropTableIfExists('users');
}

