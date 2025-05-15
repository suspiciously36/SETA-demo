import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserInterface } from '../users/interfaces/user.interface.js';
import { AuthPayload } from './token.interface.js';
import { InjectConnection } from 'nest-knexjs';
import { Knex } from 'knex';

@Injectable()
export class TokenService {
  constructor(
    @InjectConnection() private readonly knex: Knex,
    private readonly jwtService: JwtService,
  ) {}

  createAccessToken(user: UserInterface): string {
    const payload: AuthPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    });

    return accessToken;
  }

  createRefreshToken(user: UserInterface): string {
    const refreshTokenPayload: AuthPayload = {
      sub: user.id,
      email: user.email,
    };

    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    });

    return refreshToken;
  }

  async invalidateOldToken(token: string): Promise<void> {
    await this.knex('tokens').where({ token }).update({ is_revoked: true });
  }
}
