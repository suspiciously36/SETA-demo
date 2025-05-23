import { postgraphile, PostGraphileOptions } from 'postgraphile';
import { Plugin } from 'graphile-build';
import { Request, Response } from 'express';

export function createMiddleware(
  databaseUrl: string,
  ...plugins: Plugin[] // Accepts all custom plugins
) {
  const options: PostGraphileOptions = {
    watchPg: true,
    graphiql: true,
    enhanceGraphiql: true,
    enableCors: false,
    dynamicJson: true,
    ignoreRBAC: false,
    ignoreIndexes: false,
    appendPlugins: plugins, // Attach your plugins
    exportGqlSchemaPath: 'schema.graphql',
    subscriptions: true,
    simpleCollections: 'both',
    setofFunctionsContainNulls: false,
    allowExplain: () => true, // Allow EXPLAIN for debugging
    legacyRelations: 'omit',

    additionalGraphQLContextFromRequest: async (
      req: Request,
      res: Response,
    ) => {
      return {
        req,
        res,
      };
    },
  };

  return postgraphile(databaseUrl, 'public', options);
}
