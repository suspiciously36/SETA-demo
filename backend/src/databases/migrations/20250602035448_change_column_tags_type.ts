import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('notes', (table) => {
    table.dropColumn('tags');
  });
  await knex.schema.alterTable('notes', (table) => {
    table.jsonb('tags').defaultTo('[]');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('notes', (table) => {
    table.dropColumn('tags');
  });
  await knex.schema.alterTable('notes', (table) => {
    table.text('tags').defaultTo('[]');
  });
}
