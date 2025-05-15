import { Exclude } from 'class-transformer';

export class LoginResDto {
  accessToken: string;

  refreshToken: string;
}
