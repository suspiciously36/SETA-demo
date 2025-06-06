import type { FrontendPageOptionsDto, TeamAssets } from "../store/reducers/teamAssetsReducer.ts";
import apiClient from "./apiClient.ts";

const TEAMS_ENDPOINT = 'teams';
const TEAM_ASSETS_ENDPOINT = 'assets';

export const fetchTeamAssets = async (teamId: string, foldersPageOptions: FrontendPageOptionsDto, notesPageOptions: FrontendPageOptionsDto): Promise<TeamAssets> => {
    try {
        const response = await apiClient.get<TeamAssets>(`${TEAMS_ENDPOINT}/${teamId}/${TEAM_ASSETS_ENDPOINT}`, {
            params: {
                folderPage: foldersPageOptions.currentPage,
                folderLimit: foldersPageOptions.limit,

                notePage: notesPageOptions.currentPage,
                noteLimit: notesPageOptions.limit,
            },
        });
        console.log('Fetched team assets:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching team assets:', error);
        if (error instanceof Error) {
            throw new Error(error.message || 'Failed to fetch team assets.');
        }
        throw new Error('An unknown error occurred while fetching team assets.');
    }
}

