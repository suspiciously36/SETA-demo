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
import { CreateFolderReqDto } from './dtos/create-folder.req.dto.js';
import { CreateFolderResDto } from './dtos/create-folder.res.dto.js';
import { FolderDetailResDto } from './dtos/folder-detail.res.dto.js';
import { UpdateFolderReqDto } from './dtos/update-folder.req.dto.js';

import { v4 as uuidv4 } from 'uuid';
import { OffsetPaginationDto } from '../../common/dtos/offset-pagination/offset-pagination.dto.js';
import { PageOptionsDto } from '../../common/dtos/offset-pagination/page-options.dto.js';
import { OffsetPaginatedDto } from '../../common/dtos/offset-pagination/paginated.dto.js';
import { AccessLevel, ShareFolderReqDto } from './dtos/share-folder.req.dto.js';

@Injectable()
export class FolderService {
  constructor(@InjectConnection() private readonly knex: Knex) {}

  // In FolderService

  async getAllFolders(
    currentUserId: string,
    pageOptionsDto: PageOptionsDto,
  ): Promise<
    OffsetPaginatedDto<
      FolderDetailResDto & { accessLevel: AccessLevel | 'owner' }
    >
  > {
    const { limit, offset } = pageOptionsDto;

    const columns = [
      'folders.id',
      'folders.owner_id',
      'folders.name',
      'folders.description',
      'folders.created_at',
      'folders.updated_at',
    ];

    const ownedFoldersQuery = this.knex('folders')
      .where('folders.owner_id', currentUserId)
      .select(...columns, this.knex.raw("'owner' as access_level"));

    const sharedFoldersQuery = this.knex('folders')
      .join('folder_permissions', 'folders.id', 'folder_permissions.folder_id')
      .where('folder_permissions.user_id', currentUserId)
      .select(...columns, 'folder_permissions.access_level as access_level');

    const results = await this.knex
      .union([ownedFoldersQuery, sharedFoldersQuery], false)
      .limit(limit)
      .offset(offset)
      .orderBy('updated_at', 'desc');

    const ownedFoldersIdQuery = this.knex('folders')
      .where('folders.owner_id', currentUserId)
      .select('folders.id');

    const sharedFoldersIdQuery = this.knex('folders')
      .join('folder_permissions', 'folders.id', 'folder_permissions.folder_id')
      .where('folder_permissions.user_id', currentUserId)
      .select('folders.id');

    const countSubquery = this.knex
      .union([ownedFoldersIdQuery, sharedFoldersIdQuery], false)
      .as('all_accessible_folder_ids');

    const totalResult = await this.knex
      .count('* as total')
      .from(countSubquery)
      .first();
    const totalRecords = Number(totalResult?.total || 0);

    // Create pagination metadata
    const paginationMeta = new OffsetPaginationDto(
      totalRecords,
      pageOptionsDto,
    );

    return new OffsetPaginatedDto(results, paginationMeta);
  }

  async createFolder(
    reqDto: CreateFolderReqDto,
    currentUserId: string,
  ): Promise<CreateDto<CreateFolderResDto>> {
    const { name, description } = reqDto;
    const folderId = uuidv4();

    const newFolder = {
      id: folderId,
      name,
      description,
      owner_id: currentUserId,
    };

    const [createdFolderRecord] = await this.knex('folders')
      .insert(newFolder)
      .returning('*');

    if (!createdFolderRecord) {
      throw new InternalServerErrorException('Failed to create folder record.');
    }

    const responseWithAccessLevel = {
      ...newFolder,
      access_level: 'owner' as const,
    };

    return new CreateDto(
      responseWithAccessLevel,
      HttpStatus.CREATED,
      'New Folder created successfully.',
    );
  }

  async getFolderById(
    folderId: string,
    currentUserId: string,
  ): Promise<FolderDetailResDto & { access_level?: AccessLevel | 'owner' }> {
    const folder = await this.knex<FolderDetailResDto>('folders')
      .where({ id: folderId })
      .first();
    if (!folder) {
      throw new NotFoundException(`Folder with ID ${folderId} not found`);
    }

    if (folder.owner_id === currentUserId) {
      return { ...folder, access_level: 'owner' };
    }

    const permission = await this.knex('folder_permissions')
      .where({
        folder_id: folderId,
        user_id: currentUserId,
      })
      .first();

    if (permission) {
      return { ...folder, access_level: permission.access_level };
    }

    throw new NotFoundException(
      `Folder with ID ${folderId} not found for user ${currentUserId}`,
    );
  }

  async updateFolder(
    folderId: string,
    reqDto: UpdateFolderReqDto,
    currentUserId: string,
  ) {
    const { name, description } = reqDto;
    const updatedFolder = {
      name,
      description,
      updated_at: new Date(),
    };

    const folder: FolderDetailResDto = await this.knex('folders')
      .where({ id: folderId })
      .first();

    if (!folder) {
      throw new NotFoundException(`Folder with ID ${folderId} not found`);
    }

    if (folder.owner_id !== currentUserId) {
      throw new ForbiddenException(
        'You do not have permission to update this folder.',
      );
    }

    await this.knex('folders').where({ id: folderId }).update(updatedFolder);

    return { message: `Folder with ID ${folderId} updated successfully` };
  }

  async deleteFolder(folderId: string, currentUserId: string) {
    const folder = await this.knex('folders').where({ id: folderId }).first();
    if (!folder) {
      throw new NotFoundException(`Folder with ID ${folderId} not found`);
    }
    if (folder.owner_id !== currentUserId) {
      throw new ForbiddenException(
        'You do not have permission to delete this folder.',
      );
    }

    await this.knex('folders').where({ id: folderId }).del();

    return { message: `Folder with ID ${folderId} deleted successfully` }; // Return a success message
  }

  async shareFolder(
    folderId: string,
    shareDto: ShareFolderReqDto,
    currentUserId: string,
  ) {
    const { userIdToShareWith, accessLevel } = shareDto;

    const folder = await this.knex('folders').where({ id: folderId }).first();
    if (!folder) {
      throw new NotFoundException(`Folder with ${folderId} not found.`);
    }

    if (folder.owner_id !== currentUserId) {
      throw new ForbiddenException(
        'You do not have permission to share this folder.',
      );
    }

    if (userIdToShareWith === currentUserId) {
      throw new BadRequestException(`You cannot share a folder with yourself.`);
    }

    const isUserToShareWithExist = await this.knex('users')
      .where({ id: userIdToShareWith })
      .first();

    if (!isUserToShareWithExist) {
      throw new NotFoundException("User you want to share this doesn't exist.");
    }

    const permissionData = {
      folder_id: folderId,
      user_id: userIdToShareWith,
      access_level: accessLevel,
      shared_at: new Date(),
    };

    try {
      await this.knex('folder_permissions')
        .insert(permissionData)
        .onConflict(['folder_id', 'user_id'])
        .merge({
          access_level: accessLevel,
          shared_at: new Date(),
        });
    } catch (error) {
      throw new InternalServerErrorException(
        'Could not share folder.',
        error.message,
      );
    }
  }

  async revokeFolderShare(
    folderId: string,
    userIdToRevoke: string,
    currentUserId: string,
  ): Promise<void> {
    const folder = await this.knex('folders').where({ id: folderId }).first();
    if (!folder) {
      throw new NotFoundException(`Folder with ${folderId} not found.`);
    }

    if (folder.owner_id !== currentUserId) {
      throw new ForbiddenException(
        'You do not have permission to manage sharing for this folder.',
      );
    }

    const result = await this.knex('folder_permissions')
      .where({
        folder_id: folderId,
        user_id: userIdToRevoke,
      })
      .del();

    if (result === 0) {
      console.warn(
        `No share found for folder ${folderId} and user ${userIdToRevoke} to revoke, or already revoked.`,
      );
    }
  }
}
