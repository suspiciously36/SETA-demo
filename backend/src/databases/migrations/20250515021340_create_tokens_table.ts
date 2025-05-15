import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('tokens', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.string('token');
    table.boolean('is_revoked').defaultTo(false);
    table.uuid('user_id').notNullable();
    table.string('expired_at');
    table.timestamps(true, true);

    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tokens');
}
