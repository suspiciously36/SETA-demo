import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('folder_permissions', (table) => {
    table.renameColumn('owner_id', 'user_id');
  });

  await knex.schema.alterTable('note_permissions', (table) => {
    table.renameColumn('owner_id', 'user_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('folder_permissions', (table) => {
    table.renameColumn('user_id', 'owner_id');
  });

  await knex.schema.alterTable('note_permissions', (table) => {
    table.renameColumn('user_id', 'owner_id');
  });
}
