import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { CreateDto } from '../../common/dtos/create.dto.js';
import { PageOptionsDto } from '../../common/dtos/offset-pagination/page-options.dto.js';
import { JwtAuthGuard } from '../../guards/auth/jwt.guard.js';
import { UserInterface } from '../users/interfaces/user.interface.js';
import { CreateFolderReqDto } from './dtos/create-folder.req.dto.js';
import { CreateFolderResDto } from './dtos/create-folder.res.dto.js';
import { ShareFolderReqDto } from './dtos/share-folder.req.dto.js';
import { UpdateFolderReqDto } from './dtos/update-folder.req.dto.js';
import { FolderService } from './folder.service.js';
import { AuthenticatedThrottlerGuard } from '../../guards/throttler/throttler.guard.js';

@Controller('folders')
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Get()
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  async getAllFolders(
    @CurrentUser() currentUser: UserInterface,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    const folders = await this.folderService.getAllFolders(
      currentUser.id,
      pageOptionsDto,
    );
    return folders;
  }

  @Get(':folderId/shared')
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  async getSharedFolders(
    @Param('folderId') folderId: string,
    @CurrentUser() currentUser: UserInterface,
  ) {
    const sharedFolders =
      await this.folderService.getUsersThatAreSharedByFolderId(
        folderId,
        currentUser.id,
      );
    return sharedFolders;
  }

  @Get(':folderId')
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  async getFolderById(
    @Param('folderId') folderId: string,
    @CurrentUser() currentUser: UserInterface,
  ) {
    return this.folderService.getFolderById(folderId, currentUser.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  async createFolder(
    @Body() reqDto: CreateFolderReqDto,
    @CurrentUser() currentUser: UserInterface,
  ): Promise<CreateDto<CreateFolderResDto>> {
    return this.folderService.createFolder(reqDto, currentUser.id);
  }

  @Put(':folderId')
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  async updateFolder(
    @Body() reqDto: UpdateFolderReqDto,
    @Param('folderId') folderId: string,
    @CurrentUser() currentUser: UserInterface,
  ) {
    return this.folderService.updateFolder(folderId, reqDto, currentUser.id);
  }

  @Delete(':folderId')
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  async deleteFolder(
    @Param('folderId') folderId: string,
    @CurrentUser() currentUser: UserInterface,
  ) {
    return this.folderService.deleteFolder(folderId, currentUser.id);
  }

  @Post(':folderId/share')
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  async shareFolder(
    @Param('folderId') folderId: string,
    @Body() shareDto: ShareFolderReqDto,
    @CurrentUser() currentUser: UserInterface,
  ) {
    await this.folderService.shareFolder(folderId, shareDto, currentUser.id);
  }

  @Delete(':folderId/share/:sharedUserId')
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeFolderShare(
    @Param('folderId') folderId: string,
    @Param('sharedUserId') sharedUserId: string,
    @CurrentUser() currentUser: UserInterface,
  ) {
    await this.folderService.revokeFolderShare(
      folderId,
      sharedUserId,
      currentUser.id,
    );
  }
}
