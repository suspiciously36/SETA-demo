import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
        CREATE INDEX IF NOT EXISTS team_users_team_id_idx ON team_users(team_id);
      `);

  await knex.schema.raw(`
        CREATE INDEX IF NOT EXISTS tokens_user_id_idx ON tokens(user_id);
      `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw(`
        DROP INDEX IF EXISTS team_users_team_id_idx;
      `);

  await knex.schema.raw(`
        DROP INDEX IF EXISTS tokens_user_id_idx;
      `);
}
