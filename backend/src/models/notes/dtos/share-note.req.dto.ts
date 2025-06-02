import { IsNotEmpty, IsString, IsIn, IsUUID } from 'class-validator';

export type AccessLevel = 'read' | 'write';

export class ShareNoteReqDto {
  @IsNotEmpty()
  @IsUUID()
  userIdToShareWith: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['read', 'write'])
  accessLevel: AccessLevel;
}
