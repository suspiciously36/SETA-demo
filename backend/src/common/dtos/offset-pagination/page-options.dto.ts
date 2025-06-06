import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class PageOptionsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  orderBy?: string;

  get offset(): number {
    return this.page ? (this.page - 1) * this.limit : 0;
  }
}
