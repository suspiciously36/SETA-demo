import { ApiProperty } from '@nestjs/swagger';

export class CreateDto<TData> {
  @ApiProperty({ type: Object })
  readonly data: TData;

  @ApiProperty({ type: String })
  message: string | undefined;

  statusCode: number;

  @ApiProperty({ type: String })
  timestamp: string;

  constructor(data: TData, statusCode: number, message?: string) {
    this.data = data;
    this.message = message;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
}
