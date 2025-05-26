import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthResolver } from '../auth.resolver.js';
import { AuthPayload } from '../../../models/tokens/token.interface.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly authResolver: AuthResolver) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: any) => {
          const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.AUTH_JWT_SECRET!,
    });
  }

  async validate(payload: AuthPayload) {
    const user = await this.authResolver.getUserByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
