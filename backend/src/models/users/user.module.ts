import { Module } from '@nestjs/common';

import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';
import { TeamPolicyService } from '../teams/team-policy.service.js';
import { UserAssetsService } from './user-assets.service.js';
import { FolderService } from '../folders/folder.service.js';
import { NoteService } from '../notes/note.service.js';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    TeamPolicyService,
    UserAssetsService,
    FolderService,
    NoteService,
  ],
  exports: [UserService],
})
export class UserModule {}
