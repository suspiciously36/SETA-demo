import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Drop the old check constraint if it exists
  await knex.raw(`
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
  `);

  // Add the updated constraint
  await knex.raw(`
    ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('manager', 'member', 'root'));
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
  `);

  await knex.raw(`
    ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('manager', 'member'));
  `);
}
