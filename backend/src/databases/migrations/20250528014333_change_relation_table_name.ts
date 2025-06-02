import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.renameTable('folder_permission', 'folder_permissions');
  await knex.schema.renameTable('note_permission', 'note_permissions');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.renameTable('folder_permissions', 'folder_permission');
  await knex.schema.renameTable('note_permissions', 'note_permission');
}
