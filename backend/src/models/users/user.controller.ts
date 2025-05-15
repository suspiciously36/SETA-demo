import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserDto } from './dtos/create-user.dto.js';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUsers(): Promise<any[]> {
    console.log('Fetching users...');
    return this.userService.getUsers();
  }

  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    console.log('Creating User...');
    return this.userService.createUser(dto);
  }
}
