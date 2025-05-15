export enum UserRole {
  MANAGER = 'manager',
  MEMBER = 'member',
}

export class CreateUserDto {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}
