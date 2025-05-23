import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class PageOptionsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly limit: number = 10;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly page?: number = 1;

  readonly orderBy?: string;

  get offset(): number {
    return this.page ? (this.page - 1) * this.limit : 0;
  }
}
