import apiClient from './apiClient';
import { Team, type ApiResponseDto, type CreateTeamReqDto, type DetailedTeam, type UpdateTeamDto, type UpdateTeamSuccessResponseData } from '../types/team.types';
import axios from 'axios';
import type { PaginationInfo } from '../store/reducers/teamReducer.ts';

const TEAMS_ENDPOINT = '/teams'; 

export interface PaginatedTeamsResponse {
    data: Team[]; 
    pagination: PaginationInfo; 
}

// Fetch all teams
export const getAllTeams = async (page: number, limit: number): Promise<PaginatedTeamsResponse> => {
  try {
    const response = await apiClient.get<PaginatedTeamsResponse>(TEAMS_ENDPOINT, {params: {
      page: page,
      limit: limit
    }});
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error('Error fetching teams:', error);
    if (error instanceof Error) {
      throw new Error(error.message || 'Failed to fetch teams.');
    }
    throw new Error('An unknown error occurred while fetching teams.');
  }
};

export const getTeamById = async (teamId: string): Promise<DetailedTeam> => {
  try {
      const response = await apiClient.get<DetailedTeam>(`${TEAMS_ENDPOINT}/${teamId}`);
      return response.data;
  } catch (error) {
      console.error(`Error fetching team ${teamId}:`, error);
      let errorMessage = `Failed to fetch team details for ${teamId}.`;
      if (axios.isAxiosError(error) && error.response?.data?.message) {
          errorMessage = typeof error.response.data.message === 'string' ? error.response.data.message : JSON.stringify(error.response.data.message);
      } else if (error instanceof Error) errorMessage = error.message;
      throw new Error(errorMessage);
  }
};

// Create a new team
export const createNewTeam = async (teamData: CreateTeamReqDto): Promise<Team> => {
  try {
    const response = await apiClient.post<DetailedTeam>(TEAMS_ENDPOINT, teamData);
    return response.data.data; 
  } catch (error) {
    console.error('Error creating team:', error);
    let errorMessage = 'Failed to create team.';
    if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
};

// Update an existing team
export const updateExistingTeam = async (teamId: string, teamData: UpdateTeamDto): Promise<UpdateTeamSuccessResponseData> => {
    try {
        const response = await apiClient.put<ApiResponseDto<UpdateTeamSuccessResponseData>>(`${TEAMS_ENDPOINT}/${teamId}`, teamData);
        if (response.data && response.data.data && response.data.data.id) {
            return response.data.data; 
        } else {
            throw new Error("Invalid data structure in update team response.");
        }
    } catch (error) {
        console.error(`Error updating team ${teamId}:`, error);
        let errorMessage = `Failed to update team ${teamId}.`;
        if (axios.isAxiosError(error) && error.response?.data) {
            const errorData = error.response.data as any; 
            errorMessage = errorData.message || JSON.stringify(errorData);
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }
        throw new Error(errorMessage);
    }
};


export const deleteTeamById = async (teamId: string): Promise<void> => {
  try {
    await apiClient.delete(`${TEAMS_ENDPOINT}/${teamId}`);
  } catch (error) {
    console.error(`Error deleting team ${teamId}:`, error);
    let errorMessage = `Failed to delete team ${teamId}.`;
    if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = typeof error.response.data.message === 'string' ? error.response.data.message : JSON.stringify(error.response.data.message);
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
};


