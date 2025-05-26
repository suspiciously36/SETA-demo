import {
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { v4 as uuidv4 } from 'uuid';

import { plainToInstance } from 'class-transformer';
import { CreateDto } from '../../common/dtos/create.dto.js';
import { CreateUserReqDto } from './dtos/create-user.req.dto.js';
import { CreateUserResDto, UserRole } from './dtos/create-user.res.dto.js';
import { UserInterface } from './interfaces/user.interface.js';
import { ListUserReqDto } from './dtos/listUser.req.dto.js';
import { OffsetPaginationDto } from '../../common/dtos/offset-pagination/offset-pagination.dto.js';
import { OffsetPaginatedDto } from '../../common/dtos/offset-pagination/paginated.dto.js';
import { TeamInterface } from '../teams/interfaces/team.interface.js';
import { TeamPolicyService } from '../teams/team-policy.service.js';

@Injectable()
export class UserService {
  constructor(
    private readonly teamPolicyService: TeamPolicyService,
    @InjectConnection() private readonly knex: Knex,
  ) {}

  async getUsers(
    reqDto: ListUserReqDto,
    currentUserId: string,
  ): Promise<OffsetPaginatedDto<UserInterface>> {
    const { limit, offset } = reqDto;

    const users = await this.knex<UserInterface>('users')
      .select('id', 'username', 'email', 'role', 'password')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const userIds = users.map((u) => u.id);

    const teams = await this.knex('team_users as tu')
      .leftJoin('teams as t', 'tu.team_id', 't.id')
      .whereIn('tu.user_id', userIds)
      .select(
        'tu.user_id',
        't.id as id',
        't.team_name as name',
        't.created_at',
        't.updated_at',
      );

    const teamMap = new Map<string, TeamInterface[]>();
    for (const team of teams) {
      if (!teamMap.has(team.user_id)) teamMap.set(team.user_id, []);
      teamMap.get(team.user_id)!.push({
        id: team.id,
        name: team.name,
        created_at: team.created_at,
        updated_at: team.updated_at,
      });
    }

    const result = users.map((user) => ({
      ...user,
      teams: teamMap.get(user.id) || [],
    }));

    const totalRow = await this.knex('users').count('id as count').first();
    const total = Number(totalRow?.count || 0);

    return new OffsetPaginatedDto(
      result,
      new OffsetPaginationDto(total, {
        page: reqDto.page,
        limit: reqDto.limit,
        offset: reqDto.offset,
      }),
    );
  }

  async getUserById(userId: string): Promise<UserInterface> {
    const user = await this.knex<UserInterface>('users')
      .where({ id: userId })
      .first();
    if (!user) {
      throw new ConflictException('User not found');
    }
    return user;
  }

  async isRootUser(userId: string): Promise<boolean> {
    const user = await this.knex<UserInterface>('users')
      .where({ id: userId })
      .first();

    if (!user) {
      throw new ConflictException('User not found');
    }

    return user.role === UserRole.ROOT;
  }

  async createUser(dto: CreateUserReqDto, currentUserId: string) {
    const isManager = await this.teamPolicyService.isManager(currentUserId);

    if (!isManager) {
      throw new ConflictException(
        'Only root user / manager can create new users',
      );
    }

    const isUserExist = await this.knex<UserInterface>('users')
      .where({
        email: dto.email,
      })
      .orWhere({ username: dto.username })
      .first();

    if (isUserExist) {
      throw new ConflictException('Email/Username already in use');
    }

    const user = {
      id: uuidv4(),
      email: dto.email,
      password: await bcrypt.hash(dto.password, 10),
      role: dto.role,
      username: dto.username,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await this.knex('users').insert(user);

    return new CreateDto(
      plainToInstance(CreateUserResDto, {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: new Date(),
        updatedAt: new Date(),
        teams: null,
      }),
      HttpStatus.CREATED,
      'User created successfully',
    );
  }

  async deleteUser(userId: string, currentUserId: string): Promise<void> {
    const isRoot = await this.isRootUser(userId);
    if (isRoot) throw new ForbiddenException('Cannot delete root user');

    const isUserExist = await this.knex<UserInterface>('users')
      .where({
        id: userId,
      })
      .first();

    if (!isUserExist) throw new NotFoundException('User not found');

    await this.knex('users').where({ id: userId }).del();
  }
}
