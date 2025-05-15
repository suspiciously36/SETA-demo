import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, context) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    if (user?.password) {
      delete user.password;
    }

    context.switchToHttp().getRequest().user = user;
    return user;
  }
}
