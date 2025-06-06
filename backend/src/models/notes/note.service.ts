import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { CreateDto } from '../../common/dtos/create.dto.js';
import { OffsetPaginationDto } from '../../common/dtos/offset-pagination/offset-pagination.dto.js';
import { PageOptionsDto } from '../../common/dtos/offset-pagination/page-options.dto.js';
import { OffsetPaginatedDto } from '../../common/dtos/offset-pagination/paginated.dto.js';
import { FolderDetailResDto } from '../folders/dtos/folder-detail.res.dto.js';
import { AccessLevel } from '../folders/dtos/share-folder.req.dto.js';
import { CreateNoteReqDto } from './dtos/create-note.req.dto.js';
import { CreateNoteResDto } from './dtos/create-note.res.dto.js';
import { NoteDetailResDto } from './dtos/note-detail.res.dto.js';
import { ShareNoteReqDto } from './dtos/share-note.req.dto.js';
import { UpdateNoteReqDto } from './dtos/update-note.req.dto.js';

@Injectable()
export class NoteService {
  constructor(@InjectConnection() private readonly knex: Knex) {}

  private async getNoteWithAccessDetails(
    noteId: string,
    currentUserId: string,
  ): Promise<{
    note: NoteDetailResDto | null;
    folder: FolderDetailResDto | null;
    effectiveAccessLevel: AccessLevel | 'owner' | 'none';
  }> {
    const note = await this.knex('notes').where({ id: noteId }).first();
    if (!note) {
      return { note: null, folder: null, effectiveAccessLevel: 'none' };
    }

    const folder = await this.knex('folders')
      .where({ id: note.folder_id })
      .first();
    if (!folder) {
      console.error(`Orphaned Note: This note does not belong to any folder`);
      return { note: note, folder: null, effectiveAccessLevel: 'none' };
    }

    if (folder.owner_id === currentUserId) {
      return {
        note: note,
        folder,
        effectiveAccessLevel: 'owner',
      };
    }

    const folderPermission = await this.knex('folder_permissions')
      .where({
        folder_id: folder.id,
        user_id: currentUserId,
      })
      .first();

    if (folderPermission) {
      return {
        note: note,
        folder,
        effectiveAccessLevel: folderPermission.access_level,
      };
    }

    const notePermission = await this.knex('note_permissions')
      .where({
        note_id: noteId,
        user_id: currentUserId,
      })
      .first();

    if (notePermission) {
      return {
        note: note,
        folder,
        effectiveAccessLevel: notePermission.access_level,
      };
    }

    return {
      note: note,
      folder,
      effectiveAccessLevel: 'none',
    };
  }

  async getAllNotes(
    currentUserId: string,
    pageOptionsDto: PageOptionsDto,
  ): Promise<OffsetPaginatedDto<NoteDetailResDto>> {
    const { limit, offset } = pageOptionsDto;

    const notesInOwnedFoldersQuery = this.knex('notes')
      .join('folders', 'notes.folder_id', 'folders.id')
      .where('folders.owner_id', currentUserId);

    const notesInSharedFoldersQuery = this.knex('notes')
      .join(
        'folder_permissions',
        'notes.folder_id',
        'folder_permissions.folder_id',
      )
      .where('folder_permissions.user_id', currentUserId);

    const directlySharedNotesQuery = this.knex('notes')
      .join('note_permissions', 'notes.id', 'note_permissions.note_id')
      .where('note_permissions.user_id', currentUserId);

    const allNotesInOwnedFoldersQuery =
      notesInOwnedFoldersQuery.select('notes.*');

    const allNotesInSharedFoldersQuery =
      notesInSharedFoldersQuery.select('notes.*');

    const allDirectlySharedNotesQuery =
      directlySharedNotesQuery.select('notes.*');

    const allAccessibleNotesUnion = [
      allNotesInOwnedFoldersQuery,
      allNotesInSharedFoldersQuery,
      allDirectlySharedNotesQuery,
    ];

    const results = await this.knex
      .union(allAccessibleNotesUnion, false)
      .limit(limit)
      .offset(offset)
      .orderBy('updated_at', 'desc');

    const notesInOwnedFoldersIdsQuery =
      notesInOwnedFoldersQuery.select('notes.id');

    const notesInSharedFoldersIdsQuery =
      notesInSharedFoldersQuery.select('notes.id');

    const directlySharedNotesIdQuery =
      directlySharedNotesQuery.select('notes.id');

    const allAccessibleNoteIdsUnion = [
      notesInOwnedFoldersIdsQuery,
      notesInSharedFoldersIdsQuery,
      directlySharedNotesIdQuery,
    ];

    const countSubquery = this.knex
      .union(allAccessibleNoteIdsUnion, false)
      .as('all_accessible_note_ids');

    const totalResult = await this.knex
      .count('* as total')
      .from(countSubquery)
      .first();

    const totalRecords = Number(totalResult?.total || 0);

    const paginationMeta = new OffsetPaginationDto(
      totalRecords,
      pageOptionsDto,
    );

    return new OffsetPaginatedDto(results, paginationMeta);
  }

  async createNote(
    folderId: string,
    reqDto: CreateNoteReqDto,
    currentUserId: string,
  ): Promise<CreateDto<CreateNoteResDto>> {
    const { title, body, tags } = reqDto;
    const newNote = {
      title,
      body,
      tags: JSON.stringify(tags),
      folder_id: folderId,
    };

    const folder = await this.knex('folders').where({ id: folderId }).first();

    if (!folder) {
      throw new NotFoundException(`Folder with ID ${folderId} not found`);
    }

    // Allow if owner, or if user has write access in folder_permissions
    let hasWriteAccess = false;
    if (folder.owner_id === currentUserId) {
      hasWriteAccess = true;
    } else {
      const folderPermission = await this.knex('folder_permissions')
        .where({
          folder_id: folderId,
          user_id: currentUserId,
          access_level: 'write',
        })
        .first();
      if (folderPermission) {
        hasWriteAccess = true;
      }
    }

    if (!hasWriteAccess) {
      throw new ForbiddenException(
        `You do not have permission to create a note in this folder`,
      );
    }

    const [result] = await this.knex('notes').insert(newNote).returning('*');

    return new CreateDto(
      result,
      HttpStatus.CREATED,
      'New Note created successfully.',
    );
  }

  async getNoteById(
    noteId: string,
    currentUserId: string,
  ): Promise<NoteDetailResDto> {
    const { note, effectiveAccessLevel } = await this.getNoteWithAccessDetails(
      noteId,
      currentUserId,
    );

    if (!note) {
      throw new NotFoundException(`Note with ID ${noteId} not found`);
    }

    if (effectiveAccessLevel === 'none') {
      throw new ForbiddenException(
        'You do not have permission to access this note',
      );
    }

    return note;
  }

  async updateNote(
    noteId: string,
    reqDto: UpdateNoteReqDto,
    currentUserId: string,
  ) {
    const { note, effectiveAccessLevel } = await this.getNoteWithAccessDetails(
      noteId,
      currentUserId,
    );

    if (!note) {
      throw new NotFoundException(`Note with ID ${noteId} not found.`);
    }

    if (effectiveAccessLevel !== 'owner' && effectiveAccessLevel !== 'write') {
      throw new ForbiddenException(
        'You do not have permission to update this note.',
      );
    }

    const existingNote = await this.knex('notes').where({ id: noteId }).first();
    if (!existingNote) {
      throw new NotFoundException(`Note with ${noteId} not found`);
    }

    const { title, body, tags } = reqDto;
    const updatedNote = {
      title,
      body,
      tags,
      updated_at: new Date(),
    };

    const [result] = await this.knex('notes')
      .where({ id: noteId })
      .update(updatedNote)
      .returning('*');

    if (!result) {
      throw new NotFoundException(`Note with ID ${noteId} not found`);
    }

    return result as NoteDetailResDto;
  }

  async deleteNote(noteId: string, currentUserId: string) {
    const { note, folder } = await this.getNoteWithAccessDetails(
      noteId,
      currentUserId,
    );

    if (!note) {
      throw new NotFoundException(`Note not found`);
    }

    if (!folder || folder.owner_id !== currentUserId) {
      throw new ForbiddenException(
        `You do not have permission to delete this note`,
      );
    }

    const result = await this.knex('notes').where({ id: noteId }).del();

    if (result === 0) {
      throw new NotFoundException(`Note with ID ${noteId} not found`);
    }

    return { message: 'Note deleted successfully' };
  }

  async shareNote(
    noteId: string,
    shareDto: ShareNoteReqDto,
    currentUserId: string,
  ): Promise<{ message: string }> {
    const { userIdToShareWith, accessLevel } = shareDto;

    const note = await this.knex('notes').where({ id: noteId }).first();
    if (!note) {
      throw new NotFoundException(`Note with ID ${noteId} not found.`);
    }

    const folder = await this.knex('folders')
      .where({ id: note.folder_id })
      .first();
    if (!folder) {
      throw new InternalServerErrorException(
        `Parent folder for note ${noteId} not found.`,
      );
    }

    if (folder.owner_id !== currentUserId) {
      throw new ForbiddenException(
        'You do not have permission to share this note.',
      );
    }

    if (userIdToShareWith === currentUserId) {
      throw new BadRequestException(
        'You cannot share a note with yourself in this manner.',
      );
    }

    const userToShareWithExists = await this.knex('users')
      .where({ id: userIdToShareWith })
      .first();
    if (!userToShareWithExists) {
      throw new NotFoundException(
        `User with ID ${userIdToShareWith} to share with not found.`,
      );
    }

    const permissionData = {
      note_id: noteId,
      user_id: userIdToShareWith,
      access_level: accessLevel,
      shared_at: new Date(),
    };

    try {
      await this.knex('note_permissions')
        .insert(permissionData)
        .onConflict(['note_id', 'user_id'])
        .merge({
          access_level: accessLevel,
          shared_at: new Date(),
        });

      return { message: 'Note shared successfully.' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Could not share note.',
        error.message,
      );
    }
  }

  async revokeNoteShare(
    noteId: string,
    userIdToRevoke: string,
    currentUserId: string,
  ): Promise<{ message: string }> {
    const note = await this.knex('notes').where({ id: noteId }).first();
    if (!note) {
      throw new NotFoundException(`Note with ID ${noteId} not found.`);
    }

    const folder = await this.knex('folders')
      .where({ id: note.folder_id })
      .first();
    if (!folder) {
      throw new InternalServerErrorException(
        `Parent folder for note ${noteId} not found.`,
      );
    }

    if (folder.owner_id !== currentUserId) {
      throw new ForbiddenException(
        'You do not have permission to manage sharing for this note.',
      );
    }

    const result = await this.knex('note_permissions')
      .where({
        note_id: noteId,
        user_id: userIdToRevoke,
      })
      .del();

    if (result === 0) {
      console.warn(
        `No direct share found for note ${noteId} and user ${userIdToRevoke} to revoke.`,
      );
    }

    return { message: 'Shared note revoked' };
  }
}
