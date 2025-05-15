import { Injectable } from '@nestjs/common';
import { gql, makeExtendSchemaPlugin, Plugin } from 'postgraphile';
import { AuthResolver } from './auth.resolver.js';

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

          input _RefreshTokenInput {
            userId: String!
            refreshToken: String!
          }

          type _LoginPayload {
            accessToken: String!
            refreshToken: String!
          }

          type _RefreshTokenPayload {
            accessToken: String!
            refreshToken: String!
          }

          extend type Mutation {
            _login(input: _LoginInput!): _LoginPayload
            _refreshToken(input: _RefreshTokenInput!): _RefreshTokenPayload
          }
        `,

        resolvers: {
          Mutation: {
            _login: async (
              _query: any,
              args: { input: { email: string; password: string } },
            ) => {
              const { email, password } = args.input;
              return authResolver.login(email, password);
            },

            _refreshToken: async (
              _query: any,
              args: { input: { userId: string; refreshToken: string } },
            ) => {
              const { userId, refreshToken } = args.input;
              return authResolver.refreshToken(userId, refreshToken);
            },
          },
        },
      };
    });
  }
}
