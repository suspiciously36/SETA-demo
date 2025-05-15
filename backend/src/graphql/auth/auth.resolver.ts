import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Knex } from 'knex';
import * as bcrypt from 'bcryptjs';
import { InjectConnection } from 'nest-knexjs';
import { UserInterface } from '../../models/users/interfaces/user.interface.js';
import { LoginResDto } from '../dtos/login.res.dto.js';
import { TokenService } from '../../models/tokens/token.service.js';
import { TokenPayload } from '../../models/tokens/token.interface.js';

@Injectable()
export class AuthResolver {
  constructor(
    private readonly tokenService: TokenService,
    @InjectConnection() private readonly knex: Knex,
  ) {}

  async login(email: string, password: string): Promise<LoginResDto> {
    const user = await this.verifyUser(email, password);

    const accessToken = this.tokenService.createAccessToken(user);

    const refreshToken = this.tokenService.createRefreshToken(user);
    await this.saveRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async verifyUser(email: string, password: string) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await this.validatePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    return user;
  }

  async getUserByEmail(email: string) {
    const result = await this.knex<UserInterface>('users')
      .where({ email })
      .first();
    if (!result) {
      throw new NotFoundException('User not found');
    }
    return result;
  }

  async validatePassword(password: string, storedPassword: string) {
    const result = await bcrypt.compare(password, storedPassword);
    return result;
  }

  async saveRefreshToken(userId: string, refreshToken: string) {
    await this.knex('tokens')
      .where({ id: userId })
      .insert({ user_id: userId, token: refreshToken });
  }

  async refreshToken(userId: string, oldRefreshToken: string) {
    const storedToken = await this.knex<TokenPayload>('tokens')
      .where({ token: oldRefreshToken, is_revoked: false })
      .first();

    if (!storedToken) {
      throw new UnauthorizedException('Token is invalid or expired');
    }

    await this.tokenService.invalidateOldToken(storedToken.token);

    const user = await this.knex<UserInterface>('users')
      .where({ id: userId })
      .first();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newAccessToken = this.tokenService.createAccessToken(user);

    const newRefreshToken = this.tokenService.createRefreshToken(user);
    await this.saveRefreshToken(user.id, newRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
