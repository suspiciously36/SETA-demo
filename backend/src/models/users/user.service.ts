import { ConflictException, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { CreateUserDto } from './dtos/create-user.dto.js';
import { UserInterface } from './interfaces/user.interface.js';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(@InjectConnection() private readonly knex: Knex) {}

  async getUsers(): Promise<any[]> {
    const users = await this.knex.table('users');
    return users;
  }

  async createUser(dto: CreateUserDto) {
    const isEmailExist: UserInterface | undefined =
      await this.knex<UserInterface>('users')
        .where({
          email: dto.email,
        })
        .first();

    if (isEmailExist) {
      throw new ConflictException('Email already in use');
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

    return {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }
}
