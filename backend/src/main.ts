import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import * as cors from 'cors';
import { AppModule } from './app.module';
import { PostgraphilePluginLoader } from './postgraphile/plugins/index.js';
import { createMiddleware } from './postgraphile/postgraphile.middleware.js';
import setupSwagger from './utils/setup-swagger.js';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const expressApp = express();

  const corsOptions = {
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Access-Control-Allow-Methods',
      'Access-Control-Request-Headers',
      'Set-Cookie',
    ],
    credentials: true,
  };

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );
  app.enableCors(corsOptions);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.use(cookieParser());

  const pluginService = app.get(PostgraphilePluginLoader);

  const postgraphileMiddleware = createMiddleware(
    'postgresql://postgres:password@localhost:5432/postgres',
    ...pluginService.getPlugins(),
  );

  const router = express.Router();

  router.use((req, res, next) => {
    req.body = undefined;
    next();
  });

  router.get('/graphiql', postgraphileMiddleware);
  router.post('/graphql', postgraphileMiddleware);

  expressApp.use(router);

  setupSwagger(app);

  await app.listen(process.env.APP_PORT ?? 3000);

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
