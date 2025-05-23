import { TeamInterface } from '../../teams/interfaces/team.interface.js';
import { UserRole } from '../dtos/create-user.res.dto.js';

export interface UserInterface {
  id: string;
  username: string;
  password: string;
  email: string;
  role: UserRole;
  teams: TeamInterface[];
}
