import { ApiProperty } from '@nestjs/swagger';

export class AddManagerResDto {
  @ApiProperty({ type: String })
  managerId: string;

  @ApiProperty({ type: String })
  managerName: string;
}
