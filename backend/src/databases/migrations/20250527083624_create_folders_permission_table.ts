import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('folder_permission', (table) => {
    table.uuid('folder_id').primary();
    table.uuid('owner_id').notNullable().primary();
    table.string('access_level').notNullable(); // e.g., 'read', 'write', 'admin'
    table.string('shared_at').notNullable();
    table.timestamps(true, true);

    table
      .foreign('folder_id')
      .references('id')
      .inTable('folders')
      .onDelete('CASCADE');

    table
      .foreign('owner_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table.index(
      ['folder_id', 'owner_id'],
      'idx_folder_permission_folder_owner',
    );
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('folder_permission');
}
