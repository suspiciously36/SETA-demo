import type { PaginatedFolderResponse } from "../../services/folderService.ts";
import type { Folder } from "../../types/folder.types.ts";
import { CREATE_FOLDERS_FAILURE, CREATE_FOLDERS_REQUEST, CREATE_FOLDERS_SUCCESS, DELETE_FOLDER_FAILURE, DELETE_FOLDER_REQUEST, DELETE_FOLDER_SUCCESS, FETCH_FOLDERS_FAILURE, FETCH_FOLDERS_REQUEST, FETCH_FOLDERS_SUCCESS, UPDATE_FOLDER_FAILURE, UPDATE_FOLDER_REQUEST, UPDATE_FOLDER_SUCCESS } from "../actions/actionTypes.ts";
import type { PaginationInfo } from "./teamReducer.ts";

export interface FolderState {
    folders: Folder[];
    loading: boolean;
    error: string | null;
    creatingLoading: boolean;
    creatingError: string | null;
    updatingLoading: boolean;
    updatingError: string | null;
    deletingLoading: boolean;
    deletingError: string | null;

    pagination: PaginationInfo | null
}

const initialState: FolderState = {
    folders: [],
    loading: false,
    error: null,
    creatingLoading: false,
    creatingError: null,
    updatingLoading: false,
    updatingError: null,
    deletingLoading: false,
    deletingError: null,

    pagination: null
}

interface FetchFoldersRequestAction { type: typeof FETCH_FOLDERS_REQUEST; }
interface FetchFoldersSuccessAction { type: typeof FETCH_FOLDERS_SUCCESS; payload: PaginatedFolderResponse }
interface FetchFoldersFailureAction { type: typeof FETCH_FOLDERS_FAILURE; payload: string; }

interface CreateFoldersRequestAction { type: typeof CREATE_FOLDERS_REQUEST; }
interface CreateFoldersSuccessAction { type: typeof CREATE_FOLDERS_SUCCESS; payload: Folder; }
interface CreateFoldersFailureAction { type: typeof CREATE_FOLDERS_FAILURE; payload: string; }

interface UpdateFoldersRequestAction { type: typeof UPDATE_FOLDER_REQUEST }
interface UpdateFoldersSuccessAction { type: typeof UPDATE_FOLDER_SUCCESS; payload: Folder; }
interface UpdateFoldersFailureAction { type: typeof UPDATE_FOLDER_FAILURE; payload: string; }

interface DeleteFolderRequestAction { type: typeof DELETE_FOLDER_REQUEST; }
interface DeleteFolderSuccessAction { type: typeof DELETE_FOLDER_SUCCESS; payload: Folder; }
interface DeleteFolderFailureAction { type: typeof DELETE_FOLDER_FAILURE; payload: string; }

export type FolderActionTypes = FetchFoldersRequestAction 
| FetchFoldersSuccessAction 
| FetchFoldersFailureAction 
| CreateFoldersRequestAction 
| CreateFoldersSuccessAction 
| CreateFoldersFailureAction 
| UpdateFoldersRequestAction 
| UpdateFoldersSuccessAction 
| UpdateFoldersFailureAction
| DeleteFolderRequestAction
| DeleteFolderSuccessAction
| DeleteFolderFailureAction

const folderReducer = (state: FolderState = initialState, action: FolderActionTypes): FolderState => {
    switch (action.type) {
        case FETCH_FOLDERS_REQUEST:
            return { ...state, loading: true, error: null }
        case FETCH_FOLDERS_SUCCESS:
            return { ...state, loading: false, error: null, folders: action.payload.folders, pagination: { ...action.payload.pagination, totalPages: Math.ceil(action.payload.pagination.totalRecords / action.payload.pagination.limit) } }
        case FETCH_FOLDERS_FAILURE:
            return { ...state, loading: false, error: action.payload, folders: [] }
        
        case CREATE_FOLDERS_REQUEST:
            return { ...state, loading: true, error: null }
        case CREATE_FOLDERS_SUCCESS:
            return { ...state, creatingLoading: false, creatingError: null, folders: [action.payload, ...state.folders]}
        case CREATE_FOLDERS_FAILURE:
            return { ...state, creatingLoading: false, creatingError: action.payload }
        
        case UPDATE_FOLDER_REQUEST:
            return { ...state, updatingLoading: true, error: null }
        case UPDATE_FOLDER_SUCCESS:
            return { ...state, updatingLoading: false, updatingError: null, folders: state.folders.map(folder =>
                    folder.id === action.payload.id
                    ? { ...folder, ...(action.payload.changes.name && { name: action.payload.changes.name }), /* apply other changes */ updatedAt: new Date().toISOString() }
                    : folder)}
        case UPDATE_FOLDER_FAILURE:
            return { ...state, updatingLoading: false, updatingError: action.payload }

        case DELETE_FOLDER_REQUEST:
            return { ...state, deletingLoading: true, deletingError: null }
        case DELETE_FOLDER_SUCCESS:
            return { ...state, deletingLoading: false, deletingError: null, folders: state.folders.filter(folder => folder.id !== action.payload.id) }
        case DELETE_FOLDER_FAILURE:
            return { ...state, deletingLoading: false, deletingError: action.payload }
            
    default:
        return state;
    }
}

export default folderReducer;
