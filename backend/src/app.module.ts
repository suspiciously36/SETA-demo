import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { KnexModule } from 'nest-knexjs';
import { UserModule } from './models/users/user.module.js';
import { TeamModule } from './models/teams/team.module.js';
import { PostgraphileModule } from './postgraphile/postgraphile.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    KnexModule.forRoot({
      config: {
        client: 'pg',
        connection: {
          host: process.env.DATABASE_HOST || 'localhost',
          user: process.env.DATABASE_USERNAME || 'postgres',
          database: process.env.DATABASE_NAME || 'postgres',
          password: process.env.DATABASE_PASSWORD || 'password',
          port: Number(process.env.DATABASE_PORT) || 5432,
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
