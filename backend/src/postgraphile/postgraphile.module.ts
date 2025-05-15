import { Module } from '@nestjs/common';
import { AuthModule } from '../graphql/auth/auth.module.js';
import { PostgraphileController } from './postgraphile.controller.js';
import { AuthResolver } from '../graphql/auth/auth.resolver.js';
import { AuthModulePlugin } from '../graphql/auth/auth.module.plugin.js';
import { PostgraphilePluginLoader } from './plugins/index.js';
import { TokenModule } from '../models/tokens/token.module.js';

@Module({
  imports: [AuthModule, TokenModule],
  providers: [AuthResolver, AuthModulePlugin, PostgraphilePluginLoader],
  controllers: [PostgraphileController],
})
export class PostgraphileModule {}
