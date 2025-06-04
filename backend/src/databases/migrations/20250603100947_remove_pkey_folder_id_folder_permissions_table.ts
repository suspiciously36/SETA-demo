import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('folder_permissions', (table) => {
    table.dropPrimary('folder_permission_pkey');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('folder_permissions', (table) => {
    table.primary(['folder_id', 'user_id']);
  });
}
