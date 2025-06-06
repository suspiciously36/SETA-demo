import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PageOptionsDto } from '../../common/dtos/offset-pagination/page-options.dto.js';
import { FolderService } from '../folders/folder.service.js';
import { NoteService } from '../notes/note.service.js';
import { TeamPolicyService } from './team-policy.service.js';
import { TeamService } from './team.service.js';
import { OffsetPaginatedDto } from '../../common/dtos/offset-pagination/paginated.dto.js';
import { OffsetPaginationDto } from '../../common/dtos/offset-pagination/offset-pagination.dto.js';

@Injectable()
export class TeamAssetsService {
  constructor(
    private readonly teamService: TeamService,
    private readonly teamPolicyService: TeamPolicyService,
    private readonly folderService: FolderService,
    private readonly noteService: NoteService,
  ) {}
  async getAssetsForTeam(
    teamId: string,
    currentUserId: string,
    foldersPageOptions: PageOptionsDto,
    notesPageOptions: PageOptionsDto,
  ) {
    const doesTeamExist = await this.teamService.doesTeamExist(teamId);
    if (!doesTeamExist) throw new NotFoundException('Team not found');

    const isManager = await this.teamPolicyService.isManagerOfATeam(
      teamId,
      currentUserId,
    );
    if (!isManager)
      throw new ForbiddenException(
        'You do not have permission to view assets for this team',
      );

    const members = await this.teamService.getAllTeamMembers(teamId);
    if (!members || members.length === 0) {
      return { teamId, folders: [], notes: [] };
    }

    const memberUserIds = members.map((member) => member.user_id);

    const allFoldersMap = new Map<string, any>();
    const allNotesMap = new Map<string, any>();

    for (const memberId of memberUserIds) {
      const memberFolders = await this.folderService.getAllFolders(
        memberId,
        { ...foldersPageOptions, limit: 999, offset: 0 }, // fetch all
      );
      memberFolders.data.forEach((folder) => {
        if (!allFoldersMap.has(folder.id)) {
          allFoldersMap.set(folder.id, folder);
        }
      });

      const memberNotes = await this.noteService.getAllNotes(
        memberId,
        { ...notesPageOptions, limit: 999, offset: 0 }, // fetch all
      );
      memberNotes.data.forEach((note) => {
        if (!allNotesMap.has(note.id)) {
          allNotesMap.set(note.id, note);
        }
      });
    }

    const finalFoldersArray = Array.from(allFoldersMap.values());
    const finalNotesArray = Array.from(allNotesMap.values());

    const paginatedFinalFoldersData = finalFoldersArray.slice(
      foldersPageOptions.offset,
      foldersPageOptions.offset + foldersPageOptions.limit,
    );
    const foldersPaginationMeta = new OffsetPaginationDto(
      finalFoldersArray.length,
      foldersPageOptions,
    );

    const paginatedFinalNotesData = finalNotesArray.slice(
      notesPageOptions.offset,
      notesPageOptions.offset + notesPageOptions.limit,
    );
    const notesPaginationMeta = new OffsetPaginationDto(
      finalNotesArray.length,
      notesPageOptions,
    );

    return {
      teamId,
      folders: new OffsetPaginatedDto(
        paginatedFinalFoldersData,
        foldersPaginationMeta,
      ),
      notes: new OffsetPaginatedDto(
        paginatedFinalNotesData,
        notesPaginationMeta,
      ),
    };
  }
}
