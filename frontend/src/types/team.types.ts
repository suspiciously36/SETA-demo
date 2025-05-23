export interface Team {
    id: string;
    team_name: string;
    // team_managers: number;
    // team_members: number;
    created_at?: string;
    updated_at?: string; 
  }
  
export type TeamUserRole = 'manager' | 'member';
  
export interface TeamUser {
    id: string;
    team_id: string;
    user_id: string;
    is_main_manager: boolean;
    role: TeamUserRole;
    createdAt: string; 
    updatedAt: string; 
  }

export interface TeamMemberInput {
  memberId: string;
  memberName: string;
}

export interface TeamManagerInput {
  managerId: string;
  managerName: string;
}

export interface CreateTeamReqDto {
  teamName: string;
  managers: TeamManagerInput[];
  members: TeamMemberInput[];
}

export interface UpdateTeamManagerDto {
  userId: string;
  isMain: boolean;
}

export interface UpdateTeamDto {
  teamName?: string; 
  managers: UpdateTeamManagerDto[]; 
  members: string[]; 
}

export interface DetailedTeam extends Team { 
  managers: Array<{
    userId: string;
    username: string; 
    email?: string;   
    avatarUrl?: string; 
    isMain: boolean;
    totalManagers: number;
  }>;
  members: Array<{
    userId: string;
    username: string;
    email?: string;
    avatarUrl?: string;
    totalMembers: number;
  }>;
}

export interface UpdateTeamSuccessResponseData {
    id: string;
    team_name?: string; 
    total_managers: number;
    total_members: number;
}

export interface ApiResponseDto<TData> {
  data: TData;
  message?: string;
  statusCode: number; // Should be HttpStatus from @nestjs/common
  timestamp: string;
}
