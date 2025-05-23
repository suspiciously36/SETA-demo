import { Module } from '@nestjs/common';

import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from '../../guards/auth/jwt.guard.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { TokenModule } from '../../models/tokens/token.module.js';
import { AuthModulePlugin } from './auth.module.plugin.js';
import { AuthResolver } from './auth.resolver.js';

@Module({
  imports: [TokenModule, PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [AuthModulePlugin, AuthResolver, JwtStrategy, JwtAuthGuard],
  exports: [AuthModulePlugin, AuthResolver, JwtStrategy, JwtAuthGuard],
})
export class AuthModule {}
