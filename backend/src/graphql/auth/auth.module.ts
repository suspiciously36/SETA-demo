import { Module } from '@nestjs/common';
import { AuthModulePlugin } from './auth.module.plugin.js';
import { AuthResolver } from './auth.resolver.js';
import { TokenModule } from '../../models/tokens/token.module.js';
import { JwtStrategy } from '../../models/teams/strategies/jwt.strategy.js';
import { JwtAuthGuard } from '../../guards/auth/jwt.guard.js';

@Module({
  imports: [TokenModule],
  providers: [AuthModulePlugin, AuthResolver, JwtStrategy, JwtAuthGuard],
  exports: [AuthModulePlugin, AuthResolver],
})
export class AuthModule {}
