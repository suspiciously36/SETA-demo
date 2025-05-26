import { Module } from '@nestjs/common';

import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';
import { TeamPolicyService } from '../teams/team-policy.service.js';

@Module({
  controllers: [UserController],
  providers: [UserService, TeamPolicyService],
  exports: [UserService],
})
export class UserModule {}
