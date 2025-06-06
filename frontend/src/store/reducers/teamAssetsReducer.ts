import type { Folder } from "../../types/folder.types.ts";
import type { Note } from "../../types/note.types.ts";
import { CLEAR_TEAM_ASSETS, FETCH_TEAM_ASSETS_FAILURE, FETCH_TEAM_ASSETS_REQUEST, FETCH_TEAM_ASSETS_SUCCESS, SET_TEAM_ASSETS_FOLDER_PAGE, SET_TEAM_ASSETS_NOTE_PAGE } from "../actions/actionTypes.ts";

export interface FrontendOffsetPaginationDto {
  currentPage: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
}

export interface FrontendOffsetPaginatedDto<T> {
  data: T[];
  pagination: FrontendOffsetPaginationDto;
}

export interface FrontendPageOptionsDto {
  currentPage: number;
  limit: number;
}

export interface TeamAssets {
    teamId: string;
    folders: FrontendOffsetPaginatedDto<Folder>;
    notes: FrontendOffsetPaginatedDto<Note>;
}

export interface TeamAssetsState {
    currentTeamId: string | null;
    assets: TeamAssets | null;
    loading: boolean;
    error: string | null;
    currentFolderPage: number;
    currentNotePage: number;
    foldersLimit: number;
    notesLimit: number;
}

export const initialState: TeamAssetsState = {
    currentTeamId: null,
    assets: null,
    loading: false,
    error: null,
    currentFolderPage: 1,
    currentNotePage: 1,
    foldersLimit: 10,
    notesLimit: 10,
};

interface FetchTeamAssetsRequest {
    type: typeof FETCH_TEAM_ASSETS_REQUEST;
    payload: {
        teamId: string;
    };
}

interface FetchTeamAssetsSuccess {
    type: typeof FETCH_TEAM_ASSETS_SUCCESS;
    payload: {
        teamId: string;
        data: TeamAssets
    };
}

interface FetchTeamAssetsFailure {
    type: typeof FETCH_TEAM_ASSETS_FAILURE;
    payload: {
        teamId: string;
        error: string;
    };
}

interface ClearTeamAssets {
    type: typeof CLEAR_TEAM_ASSETS;
}

interface SetTeamAssetsFolderPage {
    type: typeof SET_TEAM_ASSETS_FOLDER_PAGE;
    payload: number;
}

interface SetTeamAssetsNotePage {
    type: typeof SET_TEAM_ASSETS_NOTE_PAGE;
    payload: number;
}

export type TeamAssetsActionTypes =
    | FetchTeamAssetsRequest
    | FetchTeamAssetsSuccess
    | FetchTeamAssetsFailure
    | ClearTeamAssets
    | SetTeamAssetsFolderPage
    | SetTeamAssetsNotePage;

const teamAssetsReducer = (state: TeamAssetsState = initialState, action: TeamAssetsActionTypes): TeamAssetsState => {
     switch (action.type) {
        case FETCH_TEAM_ASSETS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
                currentTeamId: action.payload.teamId,
            };
        case FETCH_TEAM_ASSETS_SUCCESS:
            if (state.currentTeamId === action.payload.teamId) {
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
        case FETCH_TEAM_ASSETS_FAILURE:
            if (state.currentTeamId === action.payload.teamId) {
                return {
                    ...state,
                    loading: false,
                    error: action.payload.error,
                    assets: null,
                };
            }
            return state;
        case CLEAR_TEAM_ASSETS:
            return {
                ...initialState,
                foldersLimit: state.foldersLimit, 
                notesLimit: state.notesLimit,
            };
        case SET_TEAM_ASSETS_FOLDER_PAGE:
            return {
                ...state,
                currentFolderPage: action.payload,
            };
        case SET_TEAM_ASSETS_NOTE_PAGE:
            return {
                ...state,
                currentNotePage: action.payload,
            };
        default:
            return state;
    }
}

export default teamAssetsReducer;
