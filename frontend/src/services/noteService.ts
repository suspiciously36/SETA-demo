import type { PaginationInfo } from "../store/reducers/teamReducer.ts";
import type { CreateNoteDto, DetailedNote, Note, UpdateNoteDto } from "../types/note.types.ts";
import type { ApiResponseDto } from "../types/team.types.ts";
import apiClient from "./apiClient.ts";

const NOTES_ENDPOINT = '/notes'
const FOLDERS_ENDPOINT = '/folders'

export interface PaginatedNoteResponse {
    data: Note[]; 
    pagination: PaginationInfo; 
}

export const getAllUserNotes = async (page: number, limit: number): Promise<PaginatedNoteResponse> => {
    try {
        const response = await apiClient.get(NOTES_ENDPOINT, {params: {
            page: page,
            limit: limit
        }})
        return response.data
    } catch (error) {
         console.error('Error fetching notes:', error);
    if (error instanceof Error) {
      throw new Error(error.message || 'Failed to fetch notes.');
    }
    throw new Error('An unknown error occurred while fetching notes.');
    }
}

export const createNewNote = async (folderId: string, noteData: CreateNoteDto): Promise<Note> => {
    try {
        const response = await apiClient.post<ApiResponseDto<Note>>(`${FOLDERS_ENDPOINT}/${folderId}${NOTES_ENDPOINT}`, noteData);
        return response.data.data
    } catch (error) {
         console.error('Error creating notes:', error);
    if (error instanceof Error) {
      throw new Error(error.message || 'Failed to create notes.');
    }
    throw new Error('An unknown error occurred while creating notes.');
    }
}

export const updateExistingNote = async (noteId: string, noteData: UpdateNoteDto) => {
    try {
        const response = await apiClient.put(`${NOTES_ENDPOINT}/${noteId}`, noteData)
        return response.data
    } catch (error) {
         console.error('Error updating note:', error);
    if (error instanceof Error) {
      throw new Error(error.message || 'Failed to update note.');
    }
    throw new Error('An unknown error occurred while updating note.');
    }
}

export const deleteExistingNote = async (noteId: string) => {
    try {
        const response = await apiClient.delete(`${NOTES_ENDPOINT}/${noteId}`)
        return response.data
    } catch (error) {
         console.error('Error deleting note:', error);
    if (error instanceof Error) {
      throw new Error(error.message || 'Failed to delete note.');
    }
    throw new Error('An unknown error occurred while deleting note.');
    }
}

export const fetchNoteDetailsService = async (noteId: string): Promise<DetailedNote> => {
  try {
    const response = await apiClient.get<DetailedNote>(`${NOTES_ENDPOINT}/${noteId}`);
    return response.data;
  }
  catch (error) {
    console.error('Error fetching note details:', error);
    if (error instanceof Error) {
      throw new Error(error.message || 'Failed to fetch note details.');
    }
    throw new Error('An unknown error occurred while fetching note details.');
  }
};

