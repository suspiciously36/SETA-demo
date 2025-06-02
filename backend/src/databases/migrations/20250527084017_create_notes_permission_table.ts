import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('note_permission', (table) => {
    table.uuid('note_id').primary();
    table.uuid('owner_id').notNullable().primary();
    table.string('access_level').notNullable(); // e.g., 'read', 'write', 'admin'
    table.string('shared_at').notNullable();
    table.timestamps(true, true);

    table
      .foreign('note_id')
      .references('id')
      .inTable('notes')
      .onDelete('CASCADE');

    table
      .foreign('owner_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table.index(['note_id', 'owner_id'], 'idx_note_permission_note_owner');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('note_permission');
}
