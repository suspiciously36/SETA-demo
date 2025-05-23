import { ApiProperty } from '@nestjs/swagger';

export class AddMemberReqDto {
  @ApiProperty({ type: String })
  memberId: string;

  memberName: string;
}
