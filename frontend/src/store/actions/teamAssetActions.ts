import type { AppDispatch, AppThunk, RootState } from "../index.ts";
import type { FrontendPageOptionsDto, TeamAssets } from "../reducers/teamAssetsReducer.ts";
import { CLEAR_TEAM_ASSETS, FETCH_TEAM_ASSETS_FAILURE, FETCH_TEAM_ASSETS_REQUEST, FETCH_TEAM_ASSETS_SUCCESS, SET_TEAM_ASSETS_FOLDER_PAGE, SET_TEAM_ASSETS_NOTE_PAGE } from "./actionTypes.ts";
import { fetchTeamAssets as fetchTeamAssetsService } from "../../services/teamAssetsService.ts";

export const fetchTeamAssetsRequest = (teamId: string) => ({
    type: FETCH_TEAM_ASSETS_REQUEST,
    payload: { teamId },
} as const);

export const fetchTeamAssetsSuccess = (teamId: string, data: TeamAssets) => ({
    type: FETCH_TEAM_ASSETS_SUCCESS,
    payload: { teamId, data },
} as const);

export const fetchTeamAssetsFailure = (teamId: string, error: string) => ({
    type: FETCH_TEAM_ASSETS_FAILURE,
    payload: { teamId, error },
} as const);

export const clearTeamAssets = () => ({
    type: CLEAR_TEAM_ASSETS,
} as const);

export const setTeamAssetsFolderPage = (page: number) => ({
    type: SET_TEAM_ASSETS_FOLDER_PAGE,
    payload: page,
} as const);

export const setTeamAssetsNotePage = (page: number) => ({
    type: SET_TEAM_ASSETS_NOTE_PAGE,
    payload: page,
} as const);

export const fetchTeamAssets = (teamId: string, folderPage: number, notePage: number): AppThunk => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchTeamAssetsRequest(teamId));

    const { foldersLimit, notesLimit } = getState().teamAssets;

    const foldersPageOptions: FrontendPageOptionsDto = { currentPage: folderPage, limit: foldersLimit };
    const notesPageOptions: FrontendPageOptionsDto = { currentPage: notePage, limit: notesLimit };
    try {
        const assets = await fetchTeamAssetsService(teamId, foldersPageOptions, notesPageOptions);
        dispatch(fetchTeamAssetsSuccess(teamId, assets));
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while fetching team assets.';
        dispatch(fetchTeamAssetsFailure(teamId, errorMessage));
        throw error; 
    }
}
