import type { SharedUser } from "../store/reducers/folderShareReducer.ts";
import apiClient from "./apiClient.ts";

export interface ShareFolderPayload {
  userIdToShareWith: string;
  accessLevel: "read" | "write";
}

export const shareFolderWithUser = async (folderId: string, payload: ShareFolderPayload) => {
  try {
    const res = await apiClient.post(`/folders/${folderId}/share`, payload);
    return res.data;
  } catch (error) {
    console.error('Error sharing folder:', error);
    if (error instanceof Error) {
      throw new Error(error.message || 'Failed to share folder.');
    }
    throw new Error('An unknown error occurred while sharing folder.');
  }
};

export const revokeFolderShare = async (folderId: string, userId: string) => {
  try {
    const res = await apiClient.delete(`/folders/${folderId}/share/${userId}`);
    return res.data;
  } catch (error) {
    console.error('Error revoking folder share:', error);
    if (error instanceof Error) {
      throw new Error(error.message || 'Failed to revoke folder share.');
    }
    throw new Error('An unknown error occurred while revoking folder share.');
  }
};

export const fetchSharedUsers = async (folderId: string): Promise<SharedUser[]> => {
  try {
    const res = await apiClient.get(`/folders/${folderId}/shared`);
    return res.data;
  } catch (error) {
    console.error('Error fetching shared users:', error);
    if (error instanceof Error) {
      throw new Error(error.message || 'Failed to fetch shared users.');
    }
    throw new Error('An unknown error occurred while fetching shared users.');
  }
};
