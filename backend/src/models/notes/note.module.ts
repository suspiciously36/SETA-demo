import { Module } from '@nestjs/common';
import { NoteController } from './note.controller.js';
import { NoteService } from './note.service.js';

@Module({
  imports: [],
  controllers: [NoteController],
  providers: [NoteService],
  exports: [NoteService],
})
export class NoteModule {}
