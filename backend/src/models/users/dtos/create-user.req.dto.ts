import { UserRole } from './create-user.res.dto.js';

export class CreateUserReqDto {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}
