import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';

import { TeamUserInterface } from './interfaces/team-user.interface.js';
import { UserRole } from '../users/dtos/create-user.res.dto.js';
import { UserInterface } from '../users/interfaces/user.interface.js';

@Injectable()
export class TeamPolicyService {
  constructor(@InjectConnection() private readonly knex: Knex) {}

  async isRootUser(userId: string): Promise<boolean> {
    const user = await this.knex<UserInterface>('users')
      .where({ id: userId, role: UserRole.ROOT })
      .first();

    return !!user;
  }

  async isMainManager(teamId: string, userId: string): Promise<boolean> {
    const isRootUser = await this.isRootUser(userId);

    if (isRootUser) {
      return true;
    }

    const result = await this.knex<TeamUserInterface>('team_users')
      .where({
        team_id: teamId,
        user_id: userId,
        is_main_manager: true,
      })
      .first();

    return !!result;
  }

  async isManagerOfATeam(teamId: string, userId: string): Promise<boolean> {
    const isRootUser = await this.isRootUser(userId);
    if (isRootUser) {
      return true;
    }
    const result = await this.knex<TeamUserInterface>('team_users')
      .where({
        team_id: teamId,
        user_id: userId,
        role: 'manager',
      })
      .first();
    return !!result;
  }

  async isManager(userId: string): Promise<boolean> {
    const isRootUser = await this.isRootUser(userId);

    if (isRootUser) {
      return true;
    }

    const result = await this.knex<TeamUserInterface>('users')
      .where({
        id: userId,
        role: 'manager',
      })
      .first();

    return !!result;
  }

  async isUserInTeam(teamId: string, userId: string): Promise<boolean> {
    const result = await this.knex<TeamUserInterface>('team_users')
      .where({
        team_id: teamId,
        user_id: userId,
      })
      .first();

    return !!result;
  }

  async isTargetMainManager(teamId: string, userId: string): Promise<boolean> {
    return this.isMainManager(teamId, userId);
  }
}
