import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('folder_permissions', (table) => {
    table.dropUnique(['folder_id', 'owner_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('folder_permissions', (table) => {
    table.unique(['folder_id', 'owner_id']);
  });
}
