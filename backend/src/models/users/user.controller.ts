import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../../guards/auth/jwt.guard.js';
import { CreateUserReqDto } from './dtos/create-user.req.dto.js';
import { UserInterface } from './interfaces/user.interface.js';
import { UserService } from './user.service.js';
import { ListUserReqDto } from './dtos/listUser.req.dto.js';
import { UserAssetsService } from './user-assets.service.js';
import { FoldersQueryReqDto } from './dtos/folders-query.req.dto.js';
import { NotesQueryReqDto } from './dtos/notes-query.req.dto.js';
import { AuthenticatedThrottlerGuard } from '../../guards/throttler/throttler.guard.js';

@Controller('users')
export class UserController {
  constructor(
    private readonly userAssetsService: UserAssetsService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  async getUsers(
    @Query() reqDto: ListUserReqDto,
    @CurrentUser() currentUser: UserInterface,
  ): Promise<any> {
    const users = await this.userService.getUsers(reqDto, currentUser.id);
    return users;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  async getUserById(@CurrentUser() currentUser: UserInterface) {
    return this.userService.getUserById(currentUser.id);
  }

  @Get(':userId/assets')
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  async getAssets(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: UserInterface,
    @Query() foldersQueryReqDto: FoldersQueryReqDto,
    @Query() notesQueryReqDto: NotesQueryReqDto,
  ) {
    return this.userAssetsService.getAssetsForUser(
      userId,
      currentUser.id,
      foldersQueryReqDto,
      notesQueryReqDto,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  async createUser(
    @Body() dto: CreateUserReqDto,
    @CurrentUser() currentUser: UserInterface,
  ) {
    return this.userService.createUser(dto, currentUser.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserInterface,
  ) {
    return this.userService.deleteUser(id, currentUser.id);
  }
}
