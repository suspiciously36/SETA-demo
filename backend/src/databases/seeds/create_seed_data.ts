import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import type { Knex } from 'knex';
import * as bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('team_users').del();
  await knex('teams').del();
  await knex('users').del();

  const baseTime = new Date();

  // Inserts seed entries
  const users: Array<any> = [];

  // Root user
  users.push({
    id: uuidv4(),
    username: 'root',
    email: 'root@email.com',
    password: bcrypt.hashSync('root', 10),
    role: 'root',
    created_at: new Date(baseTime),
    updated_at: new Date(baseTime),
  });

  for (let i = 1; i <= 40; i++) {
    const createdAt = new Date(baseTime.getTime() + i * 1000); // each 1 second apart
    users.push({
      id: uuidv4(),
      username: faker.internet.username(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: i <= 10 ? 'manager' : 'member',
      created_at: createdAt,
      updated_at: createdAt,
    });
  }

  await knex('users').insert(users);

  const teams: Array<any> = [];
  for (let i = 1; i <= 40; i++) {
    const createdAt = new Date(baseTime.getTime() + (i + 100) * 1000); // start after users, 1 sec apart
    teams.push({
      id: uuidv4(),
      team_name: faker.company.name(),
      created_at: createdAt,
      updated_at: createdAt,
    });
  }

  await knex('teams').insert(teams);

  const teamUsers: Array<any> = [];

  teams.forEach((team, index) => {
    const mainManager = users[index];
    const timestamp = new Date(baseTime.getTime() + (index + 200) * 1000);

    teamUsers.push({
      user_id: mainManager.id,
      team_id: team.id,
      role: 'manager',
      is_main_manager: true,
      created_at: timestamp,
      updated_at: timestamp,
    });

    const additionalManagers = users[index + 1];
    if (additionalManagers) {
      teamUsers.push({
        user_id: additionalManagers.id,
        team_id: team.id,
        role: 'manager',
        is_main_manager: false,
        created_at: timestamp,
        updated_at: timestamp,
      });
    }

    const members = users.filter((user) => user.role === 'member');
    const existingUserIds = teamUsers
      .filter((tu) => tu.team_id === team.id)
      .map((tu) => tu.user_id);

    const availableMembers = members.filter(
      (member) => !existingUserIds.includes(member.id),
    );

    const memberSlice = faker.helpers.arrayElements(availableMembers, 7);
    memberSlice.forEach((member, mIndex) => {
      const memberTimestamp = new Date(
        baseTime.getTime() + (index + 200 + mIndex) * 1000,
      );
      teamUsers.push({
        team_id: team.id,
        user_id: member.id,
        role: 'member',
        is_main_manager: false,
        created_at: memberTimestamp,
        updated_at: memberTimestamp,
      });
    });
  });

  await knex('team_users').insert(teamUsers);
}
