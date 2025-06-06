import type { FrontendPageOptionsDto } from "../store/reducers/teamAssetsReducer.ts";
import type { UserAssets } from "../store/reducers/userAssetsReducer.ts";
import apiClient from "./apiClient.ts";

const USERS_ENDPOINT = '/users';
const USER_ASSETS_ENDPOINT = '/assets';

export const fetchUserAssets = async (userId: string, foldersPageOptions: FrontendPageOptionsDto, notesPageOptions: FrontendPageOptionsDto): Promise<UserAssets> => {
    try {
        const response = await apiClient.get<UserAssets>(`${USERS_ENDPOINT}/${userId}${USER_ASSETS_ENDPOINT}`, {
            params: {
                folderPage: foldersPageOptions.currentPage,
                folderLimit: foldersPageOptions.limit,

                notePage: notesPageOptions.currentPage,
                noteLimit: notesPageOptions.limit,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user assets:', error);
        if (error instanceof Error) {
            throw new Error(error.message || 'Failed to fetch user assets.');
        }
        throw new Error('An unknown error occurred while fetching user assets.');
    }
}
