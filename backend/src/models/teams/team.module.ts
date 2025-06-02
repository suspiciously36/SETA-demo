import { Module } from '@nestjs/common';

import { TeamController } from './team.controller.js';
import { TeamService } from './team.service.js';
import { TeamPolicyService } from './team-policy.service.js';
import { TeamAssetsService } from './team-assets.service.js';
import { FolderService } from '../folders/folder.service.js';
import { NoteService } from '../notes/note.service.js';

@Module({
  imports: [],
  controllers: [TeamController],
  providers: [
    TeamService,
    TeamPolicyService,
    TeamAssetsService,
    FolderService,
    NoteService,
  ],
  exports: [TeamService, TeamPolicyService],
})
export class TeamModule {}
