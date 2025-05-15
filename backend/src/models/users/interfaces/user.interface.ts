import { UserRole } from '../dtos/create-user.dto.js';

export interface UserInterface {
  id: string;
  username: string;
  password: string;
  email: string;
  role: UserRole;
  refresh_token?: string;
}
