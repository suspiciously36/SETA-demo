import { Plugin } from 'graphile-build';
import { AuthModulePlugin } from '../../graphql/auth/auth.module.plugin';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostgraphilePluginLoader {
  constructor(private readonly authModulePlugin: AuthModulePlugin) {}

  getPlugins(): Plugin[] {
    return [this.authModulePlugin.build()];
  }
}
