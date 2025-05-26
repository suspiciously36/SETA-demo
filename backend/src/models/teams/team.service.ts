import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
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
import { plainToInstance } from 'class-transformer';
import { CreateTeamResDto } from './dtos/create-team.res.dto.js';
import { UserInterface } from '../users/interfaces/user.interface.js';
import { UserRole } from '../users/dtos/create-user.res.dto.js';
import { TeamInterface } from './interfaces/team.interface.js';
import { CreateDto } from '../../common/dtos/create.dto.js';
import { OffsetPaginatedDto } from '../../common/dtos/offset-pagination/paginated.dto.js';
import { TeamResDto } from './dtos/team.res.dto.js';
import { OffsetPaginationDto } from '../../common/dtos/offset-pagination/offset-pagination.dto.js';

@Injectable()
export class TeamService {
  constructor(
    @InjectConnection() private readonly knex: Knex,
    private readonly teamPolicyService: TeamPolicyService,
  ) {}

  async getTeams(
    reqDto: TeamResDto,
    currentUserId: string,
  ): Promise<OffsetPaginatedDto<any>> {
    const { limit, offset } = reqDto;

    // Get paginated teams
    const teams = await this.knex('teams')
      .orderBy('created_at', 'desc')
      .offset(offset)
      .limit(limit);

    // For each team, count managers and members
    const teamData = await Promise.all(
      teams.map(async (team) => {
        const counts = await this.knex('team_users')
          .where('team_id', team.id)
          .select('role')
          .groupBy('role')
          .count('* as count');

        const countMap = {
          total_managers: 0,
          total_members: 0,
        };

        counts.forEach((row) => {
          if (row.role === 'manager')
            countMap.total_managers = Number(row.count);
          if (row.role === 'member') countMap.total_members = Number(row.count);
        });

        return {
          ...team,
          ...countMap,
        };
      }),
    );

    // Get total number of teams
    const totalRow = await this.knex('teams').count('id as count').first();
    const total = Number(totalRow?.count || 0);

    return new OffsetPaginatedDto(
      teamData,
      new OffsetPaginationDto(total, {
        page: reqDto.page,
        limit: reqDto.limit,
        offset: reqDto.offset,
      }),
    );
  }

  async getTeamById(teamId: string, currentUserId: string) {
    const team = await this.knex<TeamInterface>('teams')
      .where({ id: teamId })
      .first();

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const teamUsers = await this.knex('team_users')
      .join('users', 'team_users.user_id', 'users.id')
      .where('team_users.team_id', teamId)
      .select(
        'team_users.user_id as userId',
        'users.username',
        'users.email',
        'team_users.role',
        'team_users.is_main_manager as isMain',
      );

    const managersInTeam = teamUsers.filter((u) => u.role === 'manager');
    const managers = managersInTeam.map((u) => ({
      userId: u.userId,
      username: u.username,
      email: u.email,
      isMain: u.isMain,
      totalManagers: managersInTeam.length,
    }));

    const membersInTeam = teamUsers.filter((u) => u.role === 'member');
    const members = membersInTeam.map((u) => ({
      userId: u.userId,
      username: u.username,
      email: u.email,
      totalMembers: membersInTeam.length,
    }));

    return {
      ...team,
      managers,
      members,
    };
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
      const isTeamNameExist = await this.knex('teams')
        .where({ team_name: dto.teamName })
        .first();
      if (isTeamNameExist) {
        throw new ConflictException('Team Name is already taken');
      }

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
      {
        id: teamId,
        team_name: dto.teamName,
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
        total_managers: dto.managers.length + 1, // +1 for the initial manager is the creating one
        total_members: dto.members.length,
      },
      HttpStatus.CREATED,
      'Team created successfully',
    );
  }

  async updateTeam(
    teamId: string,
    dto: UpdateTeamDto,
    currentUserId: string,
  ): Promise<CreateDto<any>> {
    await this.knex.transaction(async (trx) => {
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

      await trx('team_users').insert(teamMembersUpdate);
    });

    return new CreateDto(
      {
        id: teamId,
        team_name: dto.teamName,
        total_managers: dto.managers.length,
        total_members: dto.members.length,
      },
      HttpStatus.CREATED,
      'Team edited successfully',
    );
  }

  async deleteTeam(teamId: string, currentUserId: string) {
    const isMainManager = await this.teamPolicyService.isMainManager(
      teamId,
      currentUserId,
    );
    if (!isMainManager) {
      throw new UnauthorizedException('Only main manager can delete the team');
    }

    const isTeamExisted = await this.knex<TeamInterface>('teams')
      .where({ id: teamId })
      .first();
    if (!isTeamExisted) {
      throw new ConflictException('Team does not exist');
    }

    await this.knex.transaction(async (trx) => {
      await trx('team_users').where({ team_id: teamId }).del();
      await trx('teams').where({ id: teamId }).del();
    });
  }

  async addMember(
    teamId: string,
    dto: AddMemberReqDto,
    currentUserId: string,
  ): Promise<CreateDto<AddMemberResDto>> {
    const isManagerOfATeam = await this.teamPolicyService.isManagerOfATeam(
      teamId,
      currentUserId,
    );

    if (!isManagerOfATeam) {
      throw new UnauthorizedException(
        'Only manager of this team can add members',
      );
    }

    await this.addUserToTeam(teamId, dto.memberId, UserRole.MEMBER);

    return new CreateDto(
      plainToInstance(AddMemberResDto, dto),
      HttpStatus.CREATED,
      'Member added',
    );
  }

  async removeMember(teamId: string, memberId: string, currentUserId: string) {
    const isManagerOfATeam = await this.teamPolicyService.isManagerOfATeam(
      teamId,
      currentUserId,
    );

    if (!isManagerOfATeam) {
      throw new UnauthorizedException(
        'Only manager of this team can remove member',
      );
    }

    const isManager = await this.teamPolicyService.isManager(memberId);
    if (isManager) {
      throw new ConflictException('User is a manager');
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

    await this.removeUserFromTeam(teamId, memberId);
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

    const isManager = await this.teamPolicyService.isManager(dto.managerId);
    if (!isManager) {
      throw new ConflictException('User is not a manager');
    }

    await this.addUserToTeam(teamId, dto.managerId, UserRole.MANAGER);

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

    await this.removeUserFromTeam(teamId, managerId);
  }

  private async removeUserFromTeam(teamId: string, userId: string) {
    const isUserExistedInTeam = await this.teamPolicyService.isUserInTeam(
      teamId,
      userId,
    );

    if (!isUserExistedInTeam) {
      throw new ConflictException('User does not exist in team');
    }

    await this.knex('team_users')
      .where({
        team_id: teamId,
        user_id: userId,
      })
      .del();
  }

  private async addUserToTeam(teamId: string, userId: string, role: UserRole) {
    const isUserExistedInTeam = await this.teamPolicyService.isUserInTeam(
      teamId,
      userId,
    );

    if (isUserExistedInTeam) {
      throw new ConflictException('User already exists in team');
    }

    await this.knex('team_users').insert({
      user_id: userId,
      team_id: teamId,
      role: role,
      is_main_manager: false,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }
}
