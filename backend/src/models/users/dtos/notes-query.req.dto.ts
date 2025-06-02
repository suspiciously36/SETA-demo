import { PageOptionsDto } from '../../../common/dtos/offset-pagination/page-options.dto.js';

export class NotesQueryReqDto extends PageOptionsDto {
  notes_limit: number;
  notes_page: number;
}
