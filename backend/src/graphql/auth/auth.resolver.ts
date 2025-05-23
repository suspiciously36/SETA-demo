import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';

import { TokenPayload } from '../../models/tokens/token.interface.js';
import { TokenService } from '../../models/tokens/token.service.js';
import { UserInterface } from '../../models/users/interfaces/user.interface.js';
import { LoginResDto } from '../dtos/login.res.dto.js';
import { Request, Response } from 'express';

@Injectable()
export class AuthResolver {
  constructor(
    private readonly tokenService: TokenService,
    @InjectConnection() private readonly knex: Knex,
  ) {}

  async login(
    email: string,
    password: string,
    res: Response,
  ): Promise<LoginResDto> {
    const user = await this.verifyUser(email, password);

    const accessToken = this.tokenService.createAccessToken(user);

    const refreshToken = this.tokenService.createRefreshToken(user);

    await this.saveRefreshToken(user.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
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

  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const oldRefreshToken = req.cookies?.refreshToken;

    const storedToken = await this.knex<TokenPayload>('tokens')
      .where({ token: oldRefreshToken, is_revoked: false })
      .first();

    if (!storedToken) {
      throw new UnauthorizedException('Token is invalid or expired');
    }

    await this.tokenService.invalidateOldToken(storedToken.token);

    const userIdFromToken = await this.knex<TokenPayload>('tokens')
      .where({ token: oldRefreshToken })
      .select('user_id')
      .first();

    if (!userIdFromToken) {
      throw new UnauthorizedException('User not found');
    }

    const user = await this.knex<UserInterface>('users')
      .where({ id: userIdFromToken.user_id })
      .first();

    console.log(user);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newAccessToken = this.tokenService.createAccessToken(user);

    const newRefreshToken = this.tokenService.createRefreshToken(user);
    await this.saveRefreshToken(user.id, newRefreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: newAccessToken };
  }
}
