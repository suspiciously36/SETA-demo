import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('team_users').del();
  await knex('teams').del();
  await knex('users').del();

  // Inserts seed entries
  const users: Array<any> = [];
  for (let i = 1; i <= 10; i++) {
    users.push({
      id: uuidv4(),
      username: faker.internet.username(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: i <= 5 ? 'manager' : 'member',
      created_at: new Date(),
      updated_at: new Date(),
    });
  }
  await knex('users').insert(users);

  const teams: Array<any> = [];
  for (let i = 1; i <= 5; i++) {
    teams.push({
      id: uuidv4(),
      team_name: faker.company.name(),
      created_at: new Date(),
      updated_at: new Date(),
    });
  }
  await knex('teams').insert(teams);

  const teamUsers: Array<any> = [];

  teams.forEach((team, index) => {
    const mainManager = users[index];
    teamUsers.push({
      user_id: mainManager.id,
      team_id: team.id,
      role: 'manager',
      is_main_manager: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const additionalManagers = users[index + 1];
    if (additionalManagers) {
      teamUsers.push({
        user_id: additionalManagers.id,
        team_id: team.id,
        role: 'manager',
        is_main_manager: false,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    const members = users.filter((user) => user.role === 'member');
    const memberSlice = faker.helpers.arrayElements(members, 3);
    memberSlice.forEach((member) => {
      teamUsers.push({
        team_id: team.id,
        user_id: member.id,
        role: 'member',
        is_main_manager: false,
        created_at: new Date(),
        updated_at: new Date(),
      });
    });
  });

  await knex('team_users').insert(teamUsers);
}
