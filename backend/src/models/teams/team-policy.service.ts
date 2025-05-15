import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { TeamUserInterface } from './interfaces/team-user.interface.js';

@Injectable()
export class TeamPolicyService {
  constructor(@InjectConnection() private readonly knex: Knex) {}

  async isMainManager(teamId: string, userId: string): Promise<boolean> {
    const result = await this.knex<TeamUserInterface>('team_users')
      .where({
        team_id: teamId,
        user_id: userId,
        is_main_manager: true,
      })
      .first();

    return !!result;
  }

  async isManager(teamId: string, userId: string): Promise<boolean> {
    const result = await this.knex<TeamUserInterface>('team_users')
      .where({
        team_id: teamId,
        user_id: userId,
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
