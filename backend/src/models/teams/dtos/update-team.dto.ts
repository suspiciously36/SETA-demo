import { IsOptional, IsString } from 'class-validator';

export class UpdateTeamDto {
  @IsOptional()
  @IsString()
  teamName?: string;

  managers: { userId: string; isMain: boolean }[];
  members: string[];
}
