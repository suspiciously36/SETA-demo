import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
        CREATE INDEX IF NOT EXISTS folder_permissions_owner_id_foreign ON folder_permissions(owner_id);
        `);

  await knex.schema.raw(`
        CREATE INDEX IF NOT EXISTS folders_user_id_foreign ON folders(user_id);
        `);

  await knex.schema.raw(`
        CREATE INDEX IF NOT EXISTS notes_folder_id_foreign ON notes(folder_id);
        `);

  await knex.schema.raw(`
        CREATE INDEX IF NOT EXISTS note_permissions_owner_id_foreign ON note_permissions(owner_id)
        `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw(`
        DROP INDEX IF EXISTS folder_permissions_owner_id_foreign;
      `);

  await knex.schema.raw(`
        DROP INDEX IF EXISTS folders_user_id_foreign;
      `);

  await knex.schema.raw(`
        DROP INDEX IF EXISTS notes_folder_id_foreign;
        `);

  await knex.schema.raw(`
        DROP INDEX IF EXISTS note_permissions_owner_id_foreign
        `);
}
