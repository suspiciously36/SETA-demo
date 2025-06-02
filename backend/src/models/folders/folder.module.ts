import { Module } from '@nestjs/common';
import { FolderController } from './folder.controller.js';
import { FolderService } from './folder.service.js';

@Module({
  imports: [],
  controllers: [FolderController],
  providers: [FolderService],
  exports: [FolderService],
})
export class FolderModule {}
