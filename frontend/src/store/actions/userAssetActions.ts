import type { FrontendPageOptionsDto } from "../reducers/teamAssetsReducer.ts";
import { CLEAR_USER_ASSETS, FETCH_USER_ASSETS_FAILURE, FETCH_USER_ASSETS_REQUEST, FETCH_USER_ASSETS_SUCCESS, SET_USER_ASSETS_FOLDER_PAGE, SET_USER_ASSETS_NOTE_PAGE } from "./actionTypes.ts";
import { fetchUserAssets as fetchUserAssetsService } from "../../services/userAssetsService.ts";
import type { AppDispatch, AppThunk, RootState } from "../index.ts";

export const fetchUserAssetsRequest = (userId: string) => ({
    type: FETCH_USER_ASSETS_REQUEST,
    payload: { userId },
} as const);

export const fetchUserAssetsSuccess = (userId: string, data: any) => ({
    type: FETCH_USER_ASSETS_SUCCESS,
    payload: { userId, data },
} as const);

export const fetchUserAssetsFailure = (userId: string, error: string) => ({
    type: FETCH_USER_ASSETS_FAILURE,
    payload: { userId, error },
} as const);

export const clearUserAssets = () => ({
    type: CLEAR_USER_ASSETS,
} as const);

export const setUserAssetsFolderPage = (page: number) => ({
    type: SET_USER_ASSETS_FOLDER_PAGE,
    payload: page,
} as const);

export const setUserAssetsNotePage = (page: number) => ({
    type: SET_USER_ASSETS_NOTE_PAGE,
    payload: page,
} as const);

export const fetchUserAssets = (userId: string, folderPage: number, notePage: number): AppThunk => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchUserAssetsRequest(userId));

    const { foldersLimit, notesLimit } = getState().userAssets;

    const foldersPageOptions: FrontendPageOptionsDto = { currentPage: folderPage, limit: foldersLimit };
    const notesPageOptions: FrontendPageOptionsDto = { currentPage: notePage, limit: notesLimit };

    try {
        const assets = await fetchUserAssetsService(userId, foldersPageOptions, notesPageOptions);
        dispatch(fetchUserAssetsSuccess(userId, assets));
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while fetching user assets.';
        dispatch(fetchUserAssetsFailure(userId, errorMessage));
        throw error; 
    }
};
