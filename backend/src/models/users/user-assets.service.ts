import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service.js';
import { FolderService } from '../folders/folder.service.js';
import { NoteService } from '../notes/note.service.js';
import { PageOptionsDto } from '../../common/dtos/offset-pagination/page-options.dto.js';
import { UserRole } from './dtos/create-user.res.dto.js';

@Injectable()
export class UserAssetsService {
  constructor(
    private readonly userService: UserService,
    private readonly folderService: FolderService,
    private readonly noteService: NoteService,
  ) {}
  async getAssetsForUser(
    targetUserId: string,
    currentUserId: string,
    foldersPageOptions: PageOptionsDto,
    notesPageOptions: PageOptionsDto,
  ) {
    const doesTargetUserExist =
      await this.userService.doesUserExist(targetUserId);
    if (!doesTargetUserExist) {
      throw new NotFoundException(`User with ID ${targetUserId} not found. `);
    }

    // --- Allow root user to bypass all permission checks ---
    const currentUser = await this.userService.getUserById(currentUserId);
    const isRoot = currentUser?.role === UserRole.ROOT;

    const isSelf = targetUserId === currentUserId;
    const isManagerOf = await this.userService.isManagerOf(
      targetUserId,
      currentUserId,
    );

    if (!isRoot && !isSelf && !isManagerOf) {
      throw new ForbiddenException(
        'You do not have permission to view assets for this user',
      );
    }

    const folders = await this.folderService.getAllFolders(
      targetUserId,
      foldersPageOptions,
    );
    const notes = await this.noteService.getAllNotes(
      targetUserId,
      notesPageOptions,
    );

    return {
      userId: targetUserId,
      folders,
      notes,
    };
  }
}
