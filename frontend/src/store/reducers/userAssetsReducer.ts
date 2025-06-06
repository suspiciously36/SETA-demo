import type { Folder } from "../../types/folder.types.ts";
import type { Note } from "../../types/note.types.ts";
import { CLEAR_USER_ASSETS, FETCH_USER_ASSETS_FAILURE, FETCH_USER_ASSETS_REQUEST, FETCH_USER_ASSETS_SUCCESS, SET_USER_ASSETS_FOLDER_PAGE, SET_USER_ASSETS_NOTE_PAGE } from "../actions/actionTypes.ts";
import type { FrontendOffsetPaginatedDto } from "./teamAssetsReducer.ts";

export interface UserAssets {
    userId: string;
    folders: FrontendOffsetPaginatedDto<Folder>;
    notes: FrontendOffsetPaginatedDto<Note>;
}

export interface UserAssetsState {
    currentUserId: string | null;
    assets: UserAssets | null;
    loading: boolean;
    error: string | null;
    currentFolderPage: number;
    currentNotePage: number;
    foldersLimit: number;
    notesLimit: number;
}

export const initialState: UserAssetsState = {
    currentUserId: null,
    assets: null,
    loading: false,
    error: null,
    currentFolderPage: 1,
    currentNotePage: 1,
    foldersLimit: 10,
    notesLimit: 10,
};

interface FetchUserAssetsRequest {
    type: typeof FETCH_USER_ASSETS_REQUEST;
    payload: {
        userId: string;
    };
}

interface FetchUserAssetsSuccess {
    type: typeof FETCH_USER_ASSETS_SUCCESS;
    payload: {
        userId: string;
        data: UserAssets;
    };
}

interface FetchUserAssetsFailure {
    type: typeof FETCH_USER_ASSETS_FAILURE;
    payload: {
        userId: string;
        error: string;
    };
}

interface ClearUserAssets {
    type: typeof CLEAR_USER_ASSETS;
}

interface SetUserAssetsFolderPage {
    type: typeof SET_USER_ASSETS_FOLDER_PAGE;
    payload: number;
}

interface SetUserAssetsNotePage {
    type: typeof SET_USER_ASSETS_NOTE_PAGE;
    payload: number;
}

export type UserAssetsActionTypes =
    | FetchUserAssetsRequest
    | FetchUserAssetsSuccess
    | FetchUserAssetsFailure
    | ClearUserAssets
    | SetUserAssetsFolderPage
    | SetUserAssetsNotePage;


const userAssetsReducer = (
    state: UserAssetsState = initialState,
    action: UserAssetsActionTypes
): UserAssetsState => {
    switch (action.type) {
        case FETCH_USER_ASSETS_REQUEST:
            return {
                ...state,
                currentUserId: action.payload.userId,
                loading: true,
                error: null,
            };
        case FETCH_USER_ASSETS_SUCCESS:
            if (state.currentUserId === action.payload.userId) {
                const { data } = action.payload; 

                const foldersPagination = data?.folders?.pagination;
                const notesPagination = data?.notes?.pagination;

                return {
                    ...state,
                    loading: false,
                    assets: data, 
                    error: null,
                    currentFolderPage: foldersPagination?.currentPage ?? state.currentFolderPage,
                    currentNotePage: notesPagination?.currentPage ?? state.currentNotePage,
                    foldersLimit: foldersPagination?.limit ?? state.foldersLimit,
                    notesLimit: notesPagination?.limit ?? state.notesLimit,
                };
            }
            return state;
        case FETCH_USER_ASSETS_FAILURE:
            if (state.currentUserId === action.payload.userId) {
                return {
                    ...state,
                    loading: false,
                    error: action.payload.error,
                    assets: null,
                };
            }
            return state;
        case CLEAR_USER_ASSETS:
            return {
                            ...initialState,
                            foldersLimit: state.foldersLimit, 
                            notesLimit: state.notesLimit,
                        };
        case SET_USER_ASSETS_FOLDER_PAGE:
            return {
                ...state,
                currentFolderPage: action.payload,
            };
        case SET_USER_ASSETS_NOTE_PAGE:
            return {
                ...state,
                currentNotePage: action.payload,
            };
        default:
            return state;
    }
}

export default userAssetsReducer;
