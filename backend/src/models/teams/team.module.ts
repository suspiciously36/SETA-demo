import { Module } from '@nestjs/common';

import { TeamController } from './team.controller.js';
import { TeamService } from './team.service.js';
import { TeamPolicyService } from './team-policy.service.js';

@Module({
  imports: [],
  controllers: [TeamController],
  providers: [TeamService, TeamPolicyService],
  exports: [TeamService, TeamPolicyService],
})
export class TeamModule {}
