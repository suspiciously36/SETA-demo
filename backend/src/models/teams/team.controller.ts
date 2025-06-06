import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
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
import { AuthenticatedThrottlerGuard } from '../../guards/throttler/throttler.guard.js';
import { PageOptionsDto } from '../../common/dtos/offset-pagination/page-options.dto.js';

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
    // Folder Pagination
    @Query('folderPage', new DefaultValuePipe(1), ParseIntPipe)
    folderPage: number,
    @Query('folderLimit', new DefaultValuePipe(15), ParseIntPipe)
    folderLimit: number,
    // Note Pagination
    @Query('notePage', new DefaultValuePipe(1), ParseIntPipe) notePage: number,
    @Query('noteLimit', new DefaultValuePipe(15), ParseIntPipe)
    noteLimit: number,
  ) {
    const foldersPageOptions: PageOptionsDto = {
      page: folderPage,
      limit: folderLimit,
      offset: (folderPage - 1) * folderLimit,
    };
    const notesPageOptions: PageOptionsDto = {
      page: notePage,
      limit: noteLimit,
      offset: (notePage - 1) * noteLimit,
    };

    return this.teamAssetsService.getAssetsForTeam(
      teamId,
      currentUser.id,
      foldersPageOptions,
      notesPageOptions,
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
