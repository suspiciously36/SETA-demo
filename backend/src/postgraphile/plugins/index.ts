import { Injectable } from '@nestjs/common';
import { Plugin } from 'graphile-build';

import { AuthModulePlugin } from '../../graphql/auth/auth.module.plugin';

@Injectable()
export class PostgraphilePluginLoader {
  constructor(private readonly authModulePlugin: AuthModulePlugin) {}

  getPlugins(): Plugin[] {
    return [this.authModulePlugin.build()];
  }
}
