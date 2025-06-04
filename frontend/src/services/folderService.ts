import type { CreateFolderDto, Folder, UpdateFolderDto } from "../types/folder.types.ts"
import type { ApiResponseDto } from "../types/team.types.ts"
import apiClient from "./apiClient.ts"
import type { PaginationInfo } from "../store/reducers/teamReducer.ts"

const FOLDERS_ENDPOINT = '/folders'

export interface PaginatedFolderResponse {
    data: Folder[]; 
    pagination: PaginationInfo; 
}

export const getAllUserFolders = async (page: number, limit: number): Promise<PaginatedFolderResponse> => {
    try {
        const response = await apiClient.get<PaginatedFolderResponse>(FOLDERS_ENDPOINT, {params: {
            page: page,
            limit: limit
            }
        });
        return response.data
    } catch (error) {
         console.error('Error fetching folders:', error);
    if (error instanceof Error) {
      throw new Error(error.message || 'Failed to fetch folders.');
    }
    throw new Error('An unknown error occurred while fetching folders.');
    }
}

export const createNewFolder = async (folderData: CreateFolderDto): Promise<Folder> => {
    try {
        const response = await apiClient.post<ApiResponseDto<Folder>>(FOLDERS_ENDPOINT, folderData)
        return response.data.data
    } catch (error) {
         console.error('Error creating folders:', error);
    if (error instanceof Error) {
      throw new Error(error.message || 'Failed to create folders.');
    }
    throw new Error('An unknown error occurred while creating folders.');
    }
} 

export const updateExistingFolder = async (folderId: string, folderData: UpdateFolderDto) => {
    try {
        const response = await apiClient.put(`${FOLDERS_ENDPOINT}/${folderId}`, folderData)
        return response.data
    } catch (error) {
         console.error('Error updating folder:', error);
    if (error instanceof Error) {
      throw new Error(error.message || 'Failed to update folder.');
    }
    throw new Error('An unknown error occurred while updating folder.');
    }
}

export const deleteExistingFolder = async (folderId: string) => {
    try {
        const response = await apiClient.delete(`${FOLDERS_ENDPOINT}/${folderId}`)
        return response.data
    } catch (error) {
         console.error('Error deleting folder:', error);
    if (error instanceof Error) {
      throw new Error(error.message || 'Failed to delete folder.');
    }
    throw new Error('An unknown error occurred while deleting folder.');
    }
}

