import { Module } from '@nestjs/common';

import { AuthModule } from '../graphql/auth/auth.module.js';
import { AuthModulePlugin } from '../graphql/auth/auth.module.plugin.js';
import { AuthResolver } from '../graphql/auth/auth.resolver.js';
import { TokenModule } from '../models/tokens/token.module.js';
import { PostgraphilePluginLoader } from './plugins/index.js';

@Module({
  imports: [AuthModule, TokenModule],
  providers: [AuthResolver, AuthModulePlugin, PostgraphilePluginLoader],
})
export class PostgraphileModule {}
