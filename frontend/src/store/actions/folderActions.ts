import type {  CreateFolderDto, Folder, UpdateFolderDto } from "../../types/folder.types.ts";
import { 
    getAllUserFolders as fetchFoldersService,
    createNewFolder as createFolderService,
    updateExistingFolder as updateFolderService,
    deleteExistingFolder as deleteFolderService,
    type PaginatedFolderResponse
} from '../../services/folderService'; 
import type { AppDispatch, AppThunk } from "../index.ts";
import { CREATE_FOLDERS_FAILURE, CREATE_FOLDERS_REQUEST, CREATE_FOLDERS_SUCCESS, DELETE_FOLDER_FAILURE, DELETE_FOLDER_REQUEST, DELETE_FOLDER_SUCCESS, FETCH_FOLDERS_FAILURE, FETCH_FOLDERS_REQUEST, FETCH_FOLDERS_SUCCESS, UPDATE_FOLDER_FAILURE, UPDATE_FOLDER_REQUEST, UPDATE_FOLDER_SUCCESS } from "./actionTypes.ts";
import { showSnackbar } from "./notificationActions.ts";

export const fetchFoldersRequest = (page: number) => ({
    type: FETCH_FOLDERS_REQUEST,
    payload: { page }
} as const)

export const fetchFoldersSuccess = (data: PaginatedFolderResponse) => ({
    type: FETCH_FOLDERS_SUCCESS,
    payload: { folders: data.data, pagination: data.pagination }
} as const)

export const fetchFoldersFailure = (error: string) => ({
    type: FETCH_FOLDERS_FAILURE,
    payload: error
} as const)

export const createFoldersRequest = () => ({
    type: CREATE_FOLDERS_REQUEST
} as const)

export const createFoldersSuccess = (folder: Folder) => ({
    type: CREATE_FOLDERS_SUCCESS,
    payload: folder
} as const)

export const createFoldersFailure = (error: string) => ({
    type: CREATE_FOLDERS_FAILURE,
    payload: error
} as const)

export const updateFolderRequest = (folderId: string) => ({
    type: UPDATE_FOLDER_REQUEST,
    payload: { folderId }
} as const)

export const updateFolderSuccess = (folderId: string, changes: UpdateFolderDto) => ({
    type: UPDATE_FOLDER_SUCCESS,
    payload: { id: folderId, changes }
} as const)

export const updateFolderFailure = (error: string) => ({
    type: UPDATE_FOLDER_FAILURE,
    payload: error
} as const)

export const deleteFolderRequest = (folderId: string) => ({
    type: DELETE_FOLDER_REQUEST,
    payload: { folderId }
} as const)

export const deleteFolderSuccess = (folderId: string) => ({
    type: DELETE_FOLDER_SUCCESS,
    payload: { folderId }
} as const)

export const deleteFolderFailure = (folderId: string, error: string) => ({
    type: DELETE_FOLDER_FAILURE,
    payload: { folderId, error }
} as const)

export const fetchUserFolders = (page: number = 1, limit: number = 999 ): AppThunk => async (dispatch: AppDispatch) => {
    dispatch(fetchFoldersRequest(page));
    try {
        const folders = await fetchFoldersService(page, limit)
        dispatch(fetchFoldersSuccess(folders))
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error has occurred while fetching folders";
        dispatch(fetchFoldersFailure(errorMessage))
        dispatch(showSnackbar(errorMessage, "error"))
    }
}

export const submitNewFolder = (folderData: CreateFolderDto): AppThunk => async (dispatch: AppDispatch) => {
    dispatch(createFoldersRequest());
    try {
        const newFolder = await createFolderService(folderData)
        dispatch(createFoldersSuccess(newFolder))
        dispatch(showSnackbar(`Folder "${newFolder.name}" created successfully!`, "success"));
        return newFolder;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error has occurred while creating new folder";
        dispatch(createFoldersFailure(errorMessage))
        dispatch(showSnackbar(errorMessage, "error"))
        throw error;
    }
}

export const submitFolderUpdate = (folderId: string, folderData: UpdateFolderDto): AppThunk<Promise<void>> => async (dispatch: AppDispatch) => {
  dispatch(updateFolderRequest(folderId));
  try {
    await updateFolderService(folderId, folderData);

    dispatch(updateFolderSuccess(folderId, folderData));
    dispatch(showSnackbar(`Folder "${folderData.name || 'Folder'}" updated successfully!`, "success"));

    await dispatch(fetchUserFolders()); 

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while updating the folder.';
    dispatch(updateFolderFailure(errorMessage)); 
    dispatch(showSnackbar(errorMessage, "error"));
    throw error;
  }
}

export const submitFolderDelete = (folderId: string): AppThunk<Promise<void>> => async (dispatch: AppDispatch) => {
    dispatch(deleteFolderRequest(folderId));
    try {
        await deleteFolderService(folderId);
        dispatch(deleteFolderSuccess(folderId));

        dispatch(showSnackbar(`Folder deleted successfully!`, "success"))

        await dispatch(fetchUserFolders())
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while updating the folder.';
        dispatch(showSnackbar(errorMessage, "error"));
        dispatch(updateFolderFailure(errorMessage)); 
        throw error;
    }
}
