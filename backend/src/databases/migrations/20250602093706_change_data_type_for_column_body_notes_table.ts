import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('notes', (table) => {
    table.text('body').alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('notes', (table) => {
    table.string('body').alter();
  });
}
