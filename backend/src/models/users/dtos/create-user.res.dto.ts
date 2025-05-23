export enum UserRole {
  MANAGER = 'manager',
  MEMBER = 'member',
  ROOT = 'root',
}

export class CreateUserResDto {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}
