import { PageOptionsDto } from '../../../common/dtos/offset-pagination/page-options.dto.js';

export class FoldersQueryReqDto extends PageOptionsDto {
  folders_limit: number;
  folders_page: number;
}
