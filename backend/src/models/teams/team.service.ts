import {
  ConflictException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { v4 as uuidv4 } from 'uuid';

import { CreateTeamReqDto } from './dtos/create-team.req.dto.js';
import { AddMemberReqDto } from './dtos/add-member.req.dto.js';
import { AddManagerReqDto } from './dtos/add-manager.req.dto.js';
import { TeamPolicyService } from './team-policy.service.js';
import { UpdateTeamDto } from './dtos/update-team.dto.js';
import { AddManagerResDto } from './dtos/add-manager.res.dto.js';
import { AddMemberResDto } from './dtos/add-member.res.dto.js';
import { CreateDto } from '../../common/dto/create.dto.js';
import { plainToInstance } from 'class-transformer';
import { CreateTeamResDto } from './dtos/create-team.res.dto.js';
import { UserInterface } from '../users/interfaces/user.interface.js';

@Injectable()
export class TeamService {
  constructor(
    @InjectConnection() private readonly knex: Knex,
    private readonly teamPolicyService: TeamPolicyService,
  ) {}

  async getTeams(): Promise<any[]> {
    const teams = await this.knex.table('teams');
    return teams;
  }

  async getUsernameByCurrentUserId(currentUserId: string): Promise<string> {
    const user = await this.knex<UserInterface>('users')
      .where({ id: currentUserId })
      .first();

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user.username;
  }

  async createTeam(
    dto: CreateTeamReqDto,
    currentUserId: string,
  ): Promise<CreateDto<CreateTeamResDto>> {
    const teamId = uuidv4();
    const username = await this.getUsernameByCurrentUserId(currentUserId);

    await this.knex.transaction(async (trx) => {
      await trx('teams').insert({
        id: teamId,
        team_name: dto.teamName,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const uniqueManagerIds = Array.from(
        new Set([
          currentUserId,
          ...dto.managers.map((manager) => manager.managerId),
        ]),
      );

      const memberIds = dto.members.map((member) => member.memberId);

      const teamManagers = uniqueManagerIds.map((userId) => ({
        team_id: teamId,
        user_id: userId,
        role: 'manager',
        is_main_manager: currentUserId === userId,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      const teamMembers = memberIds.map((userId) => ({
        team_id: teamId,
        user_id: userId,
        role: 'member',
        is_main_manager: false,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      await trx('team_users').insert([...teamManagers, ...teamMembers]);
    });

    return new CreateDto(
      plainToInstance(CreateTeamResDto, {
        teamId,
        teamName: dto.teamName,
        managers: [
          {
            managerId: currentUserId,
            managerName: username,
          },
          ...dto.managers.map((manager) => ({
            managerId: manager.managerId,
            managerName: manager.managerName,
          })),
        ],
        members: [
          ...dto.members.map((member) => ({
            memberId: member.memberId,
            memberName: member.memberName,
          })),
        ],
      }),
      HttpStatus.CREATED,
      'Team created successfully',
    );
  }

  async updateTeam(teamId: string, dto: UpdateTeamDto, currentUserId: string) {
    return this.knex.transaction(async (trx) => {
      const isMainManager = await this.teamPolicyService.isMainManager(
        teamId,
        currentUserId,
      );

      if (!isMainManager) {
        throw new UnauthorizedException(
          'Only main manager can update the team',
        );
      }

      if (dto.teamName) {
        await trx('teams')
          .where({ id: teamId })
          .update({ team_name: dto.teamName, updated_at: new Date() });
      }

      await trx('team_users').where({ team_id: teamId }).del();

      const teamMembersUpdate: Array<any> = [];

      dto.managers.forEach(({ userId, isMain }) => {
        teamMembersUpdate.push({
          user_id: userId,
          team_id: teamId,
          role: 'manager',
          is_main_manager: isMain,
          created_at: new Date(),
          updated_at: new Date(),
        });
      });

      dto.members.forEach((userId) => {
        teamMembersUpdate.push({
          user_id: userId,
          team_id: teamId,
          role: 'member',
          is_main_manager: false,
          created_at: new Date(),
          updated_at: new Date(),
        });
      });

      console.log(teamMembersUpdate);

      await trx('team_users').insert(teamMembersUpdate);
    });
  }

  async addMember(
    teamId: string,
    dto: AddMemberReqDto,
    currentUserId: string,
  ): Promise<CreateDto<AddMemberResDto>> {
    const isManager = await this.teamPolicyService.isManager(
      teamId,
      currentUserId,
    );

    if (!isManager) {
      throw new UnauthorizedException(
        'Only manager of this team can add members',
      );
    }

    const isMemberExistedInTeam = await this.teamPolicyService.isUserInTeam(
      teamId,
      dto.memberId,
    );

    if (isMemberExistedInTeam) {
      throw new ConflictException('Member already exists in team');
    }

    await this.knex('team_users').insert({
      user_id: dto.memberId,
      team_id: teamId,
      role: 'member',
      is_main_manager: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return new CreateDto(
      plainToInstance(AddMemberResDto, dto),
      HttpStatus.CREATED,
      'Member added',
    );
  }

  async removeMember(teamId: string, memberId: string, currentUserId: string) {
    const isManager = await this.teamPolicyService.isManager(
      teamId,
      currentUserId,
    );

    if (!isManager) {
      throw new UnauthorizedException(
        'Only manager of this team can remove member',
      );
    }

    const isMainManager = await this.teamPolicyService.isMainManager(
      teamId,
      memberId,
    );

    if (isMainManager) {
      throw new UnauthorizedException(
        'Cannot remove the main manager of the team',
      );
    }

    const isMemberExistedInTeam = await this.teamPolicyService.isUserInTeam(
      teamId,
      memberId,
    );

    if (!isMemberExistedInTeam) {
      throw new ConflictException('Member does not exist in team');
    }

    await this.knex('team_users')
      .where({
        team_id: teamId,
        user_id: memberId,
      })
      .del();
  }

  async addManager(
    teamId: string,
    dto: AddManagerReqDto,
    currentUserId: string,
  ): Promise<CreateDto<AddManagerResDto>> {
    const isMainManager = await this.teamPolicyService.isMainManager(
      teamId,
      currentUserId,
    );

    if (!isMainManager) {
      throw new UnauthorizedException(
        'Only main manager of this team can add manager',
      );
    }

    const isManagerExistedInTeam = await this.teamPolicyService.isUserInTeam(
      teamId,
      dto.managerId,
    );

    if (isManagerExistedInTeam) {
      throw new ConflictException('Manager already exists in team');
    }

    await this.knex('team_users').insert({
      user_id: dto.managerId,
      team_id: teamId,
      role: 'manager',
      is_main_manager: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return new CreateDto(
      plainToInstance(AddManagerResDto, dto),
      HttpStatus.CREATED,
      'Manager added',
    );
  }

  async removeManager(
    teamId: string,
    managerId: string,
    currentUserId: string,
  ) {
    const isMainManager = await this.teamPolicyService.isMainManager(
      teamId,
      currentUserId,
    );

    if (!isMainManager) {
      throw new UnauthorizedException(
        'Only main manager of this team can remove manager',
      );
    }

    const isTargetMainManager =
      await this.teamPolicyService.isTargetMainManager(teamId, managerId);

    if (isTargetMainManager) {
      throw new UnauthorizedException(
        'Cannot remove the main manager of the team',
      );
    }

    const isManagerExistedInTeam = await this.teamPolicyService.isUserInTeam(
      teamId,
      managerId,
    );

    if (!isManagerExistedInTeam) {
      throw new ConflictException('Manager does not exist in team');
    }

    await this.knex('team_users')
      .where({
        team_id: teamId,
        user_id: managerId,
      })
      .del();
  }
}
