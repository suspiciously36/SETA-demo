import type { TeamUser } from "./team.types.ts";

export interface UserInterface {
    id: string;
    username: string;
    password: string;
    email: string;
    role: UserRole;
}

export enum UserRole {
  ROOT = 'root',
  MANAGER = 'manager',
  MEMBER = 'member'
}

export type UserProfile = Omit<UserInterface, 'password'>

export type TeamUserRoleInTeam = 'manager' | 'member'; // Role within a specific team

export interface TeamUser { // As defined in your team.types.ts or similar
  id: string; // ID of the team-user link
  team_id: string;
  user_id: string; // Should match DetailedUser.id
  is_main_manager?: boolean; // Optional as per some DTOs
  role: TeamUserRoleInTeam; // Role of the user within that specific team
  createdAt: string; // Or Date
  updatedAt: string; // Or Date
  // If this TeamUser object from your API also includes team_name, that would simplify things.
  // Otherwise, we'll map team_id to team_name using the teams list from Redux.
  team_name?: string; // OPTIONAL: if your backend provides this directly in the user's team list
}

export interface UserAssociatedTeamInfo {
    id: string;
    name: string; 
    created_at: string; 
    updated_at: string; 
  }

export interface DetailedUser {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
    teams?: UserAssociatedTeamInfo[];
}

export interface CreateUserDto {
  username: string;
  password: string;
  email: string;
  role: UserRole;
}


