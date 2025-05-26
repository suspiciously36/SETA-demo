import { Injectable } from '@nestjs/common';
import { gql, makeExtendSchemaPlugin, Plugin } from 'postgraphile';

import { AuthResolver } from './auth.resolver.js';
import { Request, Response } from 'express';

@Injectable()
export class AuthModulePlugin {
  constructor(private authResolver: AuthResolver) {}

  build(): Plugin {
    const authResolver = this.authResolver;
    return makeExtendSchemaPlugin(() => {
      return {
        typeDefs: gql`
          input _LoginInput {
            email: String!
            password: String!
          }

          type _LoginPayload {
            accessToken: String!
          }

          type _RefreshTokenPayload {
            accessToken: String!
          }

          type _LogoutPayload {
            success: Boolean!
          }

          extend type Mutation {
            _login(input: _LoginInput!): _LoginPayload
            _refreshToken: _RefreshTokenPayload
            _logout: _LogoutPayload
          }
        `,

        resolvers: {
          Mutation: {
            _login: async (
              _query: any,
              args: { input: { email: string; password: string } },
              context: { res: Response },
            ) => {
              const { email, password } = args.input;
              return authResolver.login(email, password, context.res);
            },

            _refreshToken: async (
              _query: any,
              args: any,
              context: {
                req: Request;
                res: Response;
              },
            ) => {
              const refreshToken = context.req.cookies?.refreshToken;

              if (!refreshToken) {
                throw new Error('No refresh token provided');
              }

              return authResolver.refreshToken(context.req, context.res);
            },

            _logout: async (
              _query: any,
              args: any,
              context: {
                req: Request;
                res: Response;
              },
            ) => {
              return authResolver.logout(context.req, context.res);
            },
          },
        },
      };
    });
  }
}
