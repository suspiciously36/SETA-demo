import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { createMiddleware } from './postgraphile/postgraphile.middleware.js';
import { ExpressAdapter } from '@nestjs/platform-express';
import { PostgraphilePluginLoader } from './postgraphile/plugins/index.js';
import setupSwagger from './utils/setup-swagger.js';

async function bootstrap() {
  const expressApp = express();
  const router = express.Router();

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  const pluginService = app.get(PostgraphilePluginLoader);

  const postgraphileMiddleware = createMiddleware(
    'postgresql://postgres:password@localhost:5432/postgres',
    ...pluginService.getPlugins(),
  );

  router.use((req, res, next) => {
    req.body = undefined;
    next();
  });

  router.get('/graphiql', postgraphileMiddleware);
  router.post('/graphql', postgraphileMiddleware);

  expressApp.use(router);

  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
