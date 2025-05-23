import apiClient from './apiClient';
import { DetailedUser, type CreateUserDto } from '../types/user.types'; 
import axios from 'axios'; 
import type { PaginationInfo } from '../store/reducers/userListReducer.ts';

const USERS_ENDPOINT = '/users'; 

export interface PaginatedUsersResponse {
    data: DetailedUser[]; 
    pagination: PaginationInfo; 
}

export const getAllUsers = async (page: number, limit: number): Promise<PaginatedUsersResponse> => {
  try {
    const response = await apiClient.get<PaginatedUsersResponse>(USERS_ENDPOINT, {params: {
      page: page,
      limit: limit
    }});
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    let errorMessage = 'Failed to fetch users.';
    if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = typeof error.response.data.message === 'string' ? error.response.data.message : JSON.stringify(error.response.data.message);
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
};

export const createNewUser = async (userData: CreateUserDto): Promise<DetailedUser> => {
  try {
    const response = await apiClient.post<DetailedUser>(USERS_ENDPOINT, userData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating user:', error);
    let errorMessage = 'Failed to create user.';
     if (axios.isAxiosError(error) && error.response?.data) {
        if (Array.isArray(error.response.data.message)) {
            errorMessage = error.response.data.message.join(', ');
        } else if (typeof error.response.data.message === 'string') {
            errorMessage = error.response.data.message;
        } else {
            errorMessage = JSON.stringify(error.response.data);
        }
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
};

export const deleteUserById = async (userId: string): Promise<void> => {
  try {
    await apiClient.delete(`${USERS_ENDPOINT}/${userId}`)
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    let errorMessage = `Failed to delete user ${userId}.`;
    if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = typeof error.response.data.message === 'string' ? error.response.data.message : JSON.stringify(error.response.data.message);
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
}
