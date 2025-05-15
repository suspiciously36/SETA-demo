import { Controller, Get, Next, Post, Req, Res } from '@nestjs/common';
import { HttpRequestHandler } from 'postgraphile';
import type { Request, Response } from 'express';
import { createMiddleware } from './postgraphile.middleware.js';
import { AuthModulePlugin } from '../graphql/auth/auth.module.plugin.js';

@Controller()
export class PostgraphileController {
  // postgraphile: HttpRequestHandler;
  // constructor(private authModulePlugin: AuthModulePlugin) {
  //   const databaseUrl =
  //     'postgresql://postgres:password@localhost:5432/postgres';
  //   console.log('Initializing PostGraphile Middleware...');
  //   this.postgraphile = createMiddleware(
  //     databaseUrl,
  //     this.authModulePlugin.build(),
  //   );
  //   console.log(
  //     'PostGraphile Middleware Initialized:',
  //     this.postgraphile ? 'Success' : 'Failed',
  //   );
  // }
  // @Get('graphiql')
  // graphiql(@Req() request: Request, @Res() response: Response, @Next() next) {
  //   return this.postgraphile(request, response, next);
  // }
  // @Post('graphql')
  // graphql(@Req() request: Request, @Res() response: Response, @Next() next) {
  //   return this.postgraphile(request, response, next);
  // }
}
