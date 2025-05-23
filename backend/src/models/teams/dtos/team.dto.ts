import { PageOptionsDto } from '../../../common/dtos/offset-pagination/page-options.dto.js';

export class TeamResDto extends PageOptionsDto {
  id: string;
  name: string;
  total_managers: number;
  total_members: number;
  created_at?: string;
  updated_at?: string;
}
