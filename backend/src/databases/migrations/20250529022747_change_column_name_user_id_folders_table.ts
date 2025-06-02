import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('folders', (table) => {
    table.renameColumn('user_id', 'owner_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('folders', (table) => {
    table.renameColumn('owner_id', 'user_id');
  });
}
