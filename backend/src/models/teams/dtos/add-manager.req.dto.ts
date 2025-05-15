import { ApiProperty } from '@nestjs/swagger';

export class AddManagerReqDto {
  @ApiProperty({ type: String })
  managerId: string;
}
