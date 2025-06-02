import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('notes', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.string('title').notNullable();
    table.string('body');
    table.text('tags').defaultTo('[]'); // JSON array stored as text
    table.uuid('folder_id').notNullable();
    table.timestamps(true, true);

    table
      .foreign('folder_id')
      .references('id')
      .inTable('folders')
      .onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('notes');
}
