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

export type TeamUserRoleInTeam = 'manager' | 'member'; 

export interface TeamUser { 
  id: string; 
  team_id: string;
  user_id: string;
  is_main_manager?: boolean;
  role: TeamUserRoleInTeam;
  createdAt: string; 
  updatedAt: string; 
  team_name?: string; 
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


