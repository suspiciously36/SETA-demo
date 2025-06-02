import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../../guards/auth/jwt.guard.js';
import { UserInterface } from '../users/interfaces/user.interface.js';
import { AddManagerReqDto } from './dtos/add-manager.req.dto.js';
import { AddMemberReqDto } from './dtos/add-member.req.dto.js';
import { AddMemberResDto } from './dtos/add-member.res.dto.js';
import { CreateTeamReqDto } from './dtos/create-team.req.dto.js';
import { CreateTeamResDto } from './dtos/create-team.res.dto.js';
import { UpdateTeamDto } from './dtos/update-team.dto.js';
import { TeamService } from './team.service.js';
import { TeamInterface } from './interfaces/team.interface.js';
import { CreateDto } from '../../common/dtos/create.dto.js';
import { OffsetPaginatedDto } from '../../common/dtos/offset-pagination/paginated.dto.js';
import { TeamResDto } from './dtos/team.res.dto.js';
import { TeamAssetsService } from './team-assets.service.js';
import { FoldersQueryReqDto } from '../users/dtos/folders-query.req.dto.js';
import { NotesQueryReqDto } from '../users/dtos/notes-query.req.dto.js';
import { AuthenticatedThrottlerGuard } from '../../guards/throttler/throttler.guard.js';

@Controller('teams')
export class TeamController {
  constructor(
    private readonly teamAssetsService: TeamAssetsService,
    private readonly teamService: TeamService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  getTeams(
    @Query() reqDto: TeamResDto,
    @CurrentUser() currentUser: UserInterface,
  ): Promise<OffsetPaginatedDto<any>> {
    return this.teamService.getTeams(reqDto, currentUser.id);
  }

  @Get(':teamId')
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  getTeamById(
    @Param('teamId') teamId: string,
    @CurrentUser() currentUser: UserInterface,
  ): Promise<TeamInterface> {
    return this.teamService.getTeamById(teamId, currentUser.id);
  }

  @Get(':teamId/assets')
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  async getTeamAssets(
    @Param('teamId') teamId: string,
    @CurrentUser() currentUser: UserInterface,
    @Query() foldersQueryReqDto: FoldersQueryReqDto,
    @Query() notesQueryReqDto: NotesQueryReqDto,
  ) {
    return this.teamAssetsService.getAssetsForTeam(
      teamId,
      currentUser.id,
      foldersQueryReqDto,
      notesQueryReqDto,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  async createTeam(
    @Body() dto: CreateTeamReqDto,
    @CurrentUser() currentUser: UserInterface,
  ): Promise<CreateDto<CreateTeamResDto>> {
    const result = await this.teamService.createTeam(dto, currentUser.id);
    return result;
  }

  @Post(':teamId/members')
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  async addMemberToTeam(
    @Param('teamId') teamId: string,
    @Body() dto: AddMemberReqDto,
    @CurrentUser() currentUser: UserInterface,
  ): Promise<CreateDto<AddMemberResDto>> {
    return this.teamService.addMember(teamId, dto, currentUser.id);
  }

  @Post(':teamId/managers')
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  async addManagerToTeam(
    @Param('teamId') teamId: string,
    @Body() dto: AddManagerReqDto,
    @CurrentUser() currentUser: UserInterface,
  ) {
    return this.teamService.addManager(teamId, dto, currentUser.id);
  }

  @Put(':teamId')
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  async updateTeam(
    @Param('teamId') teamId: string,
    @Body() dto: UpdateTeamDto,
    @CurrentUser() currentUser: UserInterface,
  ) {
    return this.teamService.updateTeam(teamId, dto, currentUser.id);
  }

  @Delete(':teamId/members/:memberId')
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMemberFromTeam(
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() currentUser: UserInterface,
  ) {
    await this.teamService.removeMember(teamId, memberId, currentUser.id);
  }

  @Delete(':teamId/managers/:managerId')
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeManagerFromTeam(
    @Param('teamId') teamId: string,
    @Param('managerId') managerId: string,
    @CurrentUser() currentUser: UserInterface,
  ) {
    await this.teamService.removeManager(teamId, managerId, currentUser.id);
  }

  @Delete(':teamId')
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTeam(
    @Param('teamId') teamId: string,
    @CurrentUser() currentUser: UserInterface,
  ) {
    await this.teamService.deleteTeam(teamId, currentUser.id);
  }
}
