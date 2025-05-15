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
  UseGuards,
} from '@nestjs/common';
import { TeamService } from './team.service.js';
import { CreateTeamReqDto } from './dtos/create-team.req.dto.js';
import { AddMemberReqDto } from './dtos/add-member.req.dto.js';
import { AddManagerReqDto } from './dtos/add-manager.req.dto.js';
import { UpdateTeamDto } from './dtos/update-team.dto.js';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../../guards/auth/jwt.guard.js';
import { UserInterface } from '../users/interfaces/user.interface.js';
import { CreateDto } from '../../common/dto/create.dto.js';
import { AddMemberResDto } from './dtos/add-member.res.dto.js';
import { CreateTeamResDto } from './dtos/create-team.res.dto.js';

@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  getTeams(): Promise<any[]> {
    console.log('Fetching teams...');
    return this.teamService.getTeams();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createTeam(
    @Body() dto: CreateTeamReqDto,
    @CurrentUser() currentUser: UserInterface,
  ): Promise<CreateDto<CreateTeamResDto>> {
    console.log('Creating team...');
    const result = await this.teamService.createTeam(dto, currentUser.id);
    console.log('Team created:', result);
    return result;
  }

  @Post(':teamId/members')
  @UseGuards(JwtAuthGuard)
  async addMemberToTeam(
    @Param('teamId') teamId: string,
    @Body() dto: AddMemberReqDto,
    @CurrentUser() currentUser: UserInterface,
  ): Promise<CreateDto<AddMemberResDto>> {
    console.log('Adding Member...');
    return this.teamService.addMember(teamId, dto, currentUser.id);
  }

  @Post(':teamId/managers')
  @UseGuards(JwtAuthGuard)
  async addManagerToTeam(
    @Param('teamId') teamId: string,
    @Body() dto: AddManagerReqDto,
    @CurrentUser() currentUser: UserInterface,
  ) {
    console.log('Adding Manager...');
    return this.teamService.addManager(teamId, dto, currentUser.id);
  }

  @Put(':teamId')
  @UseGuards(JwtAuthGuard)
  async updateTeam(
    @Param('teamId') teamId: string,
    @Body() dto: UpdateTeamDto,
    @CurrentUser() currentUser: UserInterface,
  ) {
    console.log('Updating Team...');
    return this.teamService.updateTeam(teamId, dto, currentUser.id);
  }

  @Delete(':teamId/members/:memberId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMemberFromTeam(
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() currentUser: UserInterface,
  ) {
    console.log('Removing Member...');
    await this.teamService.removeMember(teamId, memberId, currentUser.id);
  }

  @Delete(':teamId/managers/:managerId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeManagerFromTeam(
    @Param('teamId') teamId: string,
    @Param('managerId') managerId: string,
    @CurrentUser() currentUser: UserInterface,
  ) {
    console.log('Removing Manager...');
    await this.teamService.removeManager(teamId, managerId, currentUser.id);
  }
}
