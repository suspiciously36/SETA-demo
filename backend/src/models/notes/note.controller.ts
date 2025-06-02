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
import { PageOptionsDto } from '../../common/dtos/offset-pagination/page-options.dto.js';
import { JwtAuthGuard } from '../../guards/auth/jwt.guard.js';
import { UserInterface } from '../users/interfaces/user.interface.js';
import { CreateNoteReqDto } from './dtos/create-note.req.dto.js';
import { ShareNoteReqDto } from './dtos/share-note.req.dto.js';
import { UpdateNoteReqDto } from './dtos/update-note.req.dto.js';
import { NoteService } from './note.service.js';
import { AuthenticatedThrottlerGuard } from '../../guards/throttler/throttler.guard.js';

@Controller()
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Get('notes')
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  async getAllNotes(
    @CurrentUser() currentUser: UserInterface,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.noteService.getAllNotes(currentUser.id, pageOptionsDto);
  }

  @Get('notes/:noteId')
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  async getNoteById(
    @Param('noteId') noteId: string,
    @CurrentUser() currentUser: UserInterface,
  ) {
    return this.noteService.getNoteById(noteId, currentUser.id);
  }

  @Post('folders/:folderId/notes')
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  async createNoteInFolder(
    @Param('folderId') folderId: string,
    @Body() reqDto: CreateNoteReqDto,
    @CurrentUser() currentUser: UserInterface,
  ) {
    return this.noteService.createNote(folderId, reqDto, currentUser.id);
  }

  @Post('notes/:noteId/share')
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  async shareNote(
    @Param('noteId') noteId: string,
    @Body() shareDto: ShareNoteReqDto,
    @CurrentUser() currentUser: UserInterface,
  ) {
    return this.noteService.shareNote(noteId, shareDto, currentUser.id);
  }

  @Put('notes/:noteId')
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  async updateNote(
    @Param('noteId') noteId: string,
    @Body() reqDto: UpdateNoteReqDto,
    @CurrentUser() currentUser: UserInterface,
  ) {
    return this.noteService.updateNote(noteId, reqDto, currentUser.id);
  }

  @Delete('notes/:noteId')
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  async deleteNote(
    @Param('noteId') noteId: string,
    @CurrentUser() currentUser: UserInterface,
  ) {
    return this.noteService.deleteNote(noteId, currentUser.id);
  }

  @Delete('notes/:noteId/share/:sharedUserId')
  @UseGuards(JwtAuthGuard, AuthenticatedThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  async revokeNoteShare(
    @Param('noteId') noteId: string,
    @Param('sharedUserId') sharedUserId: string,
    @CurrentUser() currentUser: UserInterface,
  ) {
    return this.noteService.revokeNoteShare(
      noteId,
      sharedUserId,
      currentUser.id,
    );
  }
}
