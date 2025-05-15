import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('team_users', (table) => {
    table.uuid('user_id').notNullable();
    table.uuid('team_id').notNullable();
    table.primary(['user_id', 'team_id']);
    table.enum('role', ['manager', 'member']).notNullable();
    table.boolean('is_main_manager').defaultTo(false);
    table.timestamps(true, true);

    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table
      .foreign('team_id')
      .references('id')
      .inTable('teams')
      .onDelete('CASCADE');
  });

  await knex.raw(
    `CREATE UNIQUE INDEX one_main_manager_per_team
     ON team_users (team_id)
     WHERE is_main_manager = true;`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('team_users');
}
