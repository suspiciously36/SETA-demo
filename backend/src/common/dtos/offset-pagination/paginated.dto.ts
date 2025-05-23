import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { OffsetPaginationDto } from './offset-pagination.dto';

export class OffsetPaginatedDto<TData> {
  @ApiProperty({ type: [Object] })
  @Expose()
  readonly data: TData[];

  @ApiProperty()
  @Expose()
  pagination: OffsetPaginationDto;

  @ApiProperty({ type: String })
  @Expose()
  timestamp = new Date().toISOString();

  constructor(data: TData[], meta: OffsetPaginationDto) {
    this.data = data;
    this.pagination = meta;
  }
}
