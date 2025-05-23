import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KnexModule } from 'nest-knexjs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TeamModule } from './models/teams/team.module.js';
import { UserModule } from './models/users/user.module.js';
import { PostgraphileModule } from './postgraphile/postgraphile.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    KnexModule.forRoot({
      config: {
        client: 'pg',
        connection: {
          host: process.env.DB_HOST || 'localhost',
          user: process.env.DB_USERNAME || 'postgres',
          database: process.env.DB_NAME || 'postgres',
          password: process.env.DB_PASSWORD || 'password',
          port: Number(process.env.DB_PORT) || 5432,
        },
      },
    }),
    UserModule,
    TeamModule,
    PostgraphileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
