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

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUsers(
    @Query() reqDto: ListUserReqDto,
    @CurrentUser() currentUser: UserInterface,
  ): Promise<any> {
    console.log('Fetching users...');
    const users = await this.userService.getUsers(reqDto, currentUser.id);
    return users;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@CurrentUser() currentUser: UserInterface) {
    console.log('Fetching user by ID...');
    return this.userService.getUserById(currentUser.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createUser(
    @Body() dto: CreateUserReqDto,
    @CurrentUser() currentUser: UserInterface,
  ) {
    console.log('Creating User...');
    return this.userService.createUser(dto, currentUser.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserInterface,
  ) {
    console.log('Deleting User...');
    return this.userService.deleteUser(id, currentUser.id);
  }
}
