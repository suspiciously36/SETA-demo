import { shareFolderWithUser, revokeFolderShare, fetchSharedUsers as fetchSharedUsersService } from "../../services/folderShareService";
import { showSnackbar } from "./notificationActions.ts";
import type { AppDispatch, AppThunk } from "../index.ts";
import { CLEAR_REVOKE_ERROR_FOR_USER, CLEAR_SHARE_ERROR, FETCH_SHARED_USERS_FAILURE, FETCH_SHARED_USERS_REQUEST, FETCH_SHARED_USERS_SUCCESS, REVOKE_ACCESS_FAILURE, REVOKE_ACCESS_REQUEST, REVOKE_ACCESS_SUCCESS, SET_DIALOG_FOLDER_CONTEXT, SHARE_FOLDER_FAILURE, SHARE_FOLDER_REQUEST, SHARE_FOLDER_SUCCESS } from "./actionTypes.ts";
import type { AccessLevel, SharedUser } from "../reducers/folderShareReducer.ts";

// Action types

export const setDialogFolderContext = (folderId: string | null) => ({
  type: SET_DIALOG_FOLDER_CONTEXT,
  payload: folderId,
});

export const clearShareError = () => ({
    type: CLEAR_SHARE_ERROR,
});

export const clearRevokeErrorForUser = (userId: string) => ({
    type: CLEAR_REVOKE_ERROR_FOR_USER,
    payload: userId,
});

export const shareFolderRequest = (folderId: string) => ({
    type: SHARE_FOLDER_REQUEST,
    payload: folderId
} as const);

export const shareFolderSuccess = (folderId: string, userIdShared: string, accessLevel: AccessLevel) => ({
    type: SHARE_FOLDER_SUCCESS,
    payload: {
        folderId,
        userIdShared,
        accessLevel
    }
} as const);

export const shareFolderFailure = (folderId: string, error: string) => ({
    type: SHARE_FOLDER_FAILURE,
    payload: {
        folderId,
        error
    }
} as const);

export const revokeAccessRequest = (folderId: string, sharedUserId: string) => ({
    type: REVOKE_ACCESS_REQUEST,
    payload: {
        folderId,
        sharedUserId
    }
} as const);

export const revokeAccessSuccess = (folderId: string, sharedUserId: string) => ({
    type: REVOKE_ACCESS_SUCCESS,
    payload: {
        folderId,
        sharedUserId,
    }
} as const);

export const revokeAccessFailure = (folderId: string, sharedUserId: string, error: string) => ({
    type: REVOKE_ACCESS_FAILURE,
    payload: {
        folderId,
        sharedUserId,
        error
    }
} as const);


export const fetchSharedUsersRequest = (folderId: string) => ({
    type: FETCH_SHARED_USERS_REQUEST,
    payload: folderId
} as const);

export const fetchSharedUsersSuccess = (folderId: string, users: SharedUser[]) => ({
    type: FETCH_SHARED_USERS_SUCCESS,
    payload: {
        folderId,
        users
    }
} as const);

export const fetchSharedUsersFailure = (folderId: string, error: string) => ({
    type: FETCH_SHARED_USERS_FAILURE,
    payload: {
        folderId,
        error
    }
} as const);

export const shareFolder = (folderId: string, userIdToShareWith: string, accessLevel: AccessLevel): AppThunk => async (dispatch: AppDispatch) => {
  try {
    await shareFolderWithUser(folderId, { userIdToShareWith, accessLevel });
    dispatch(shareFolderSuccess(folderId, userIdToShareWith, accessLevel));
    dispatch(showSnackbar("Folder shared!", "success"));
  } catch (e: any) {
    dispatch(shareFolderFailure(folderId, e.message || "Failed to share folder."));
    dispatch(showSnackbar(e.message || "Failed to share folder.", "error"));
  }
};

export const revokeShare = (folderId: string, userId: string): AppThunk => async (dispatch: AppDispatch) => {
  try {
    await revokeFolderShare(folderId, userId);
    dispatch(revokeAccessSuccess(folderId, userId));
    dispatch(showSnackbar("Access revoked.", "success"));
  } catch (e: any) {
    dispatch(revokeAccessFailure(folderId, userId, e.message || "Failed to revoke access."));
    dispatch(showSnackbar(e.message || "Failed to revoke access.", "error"));
  }
};

export const fetchFolderPermissions = (folderId: string): AppThunk => async (dispatch: AppDispatch) => {
  dispatch(fetchSharedUsersRequest(folderId));
  try {
    const sharedUsers = await fetchSharedUsersService(folderId);
    dispatch(fetchSharedUsersSuccess(folderId, sharedUsers));
  } catch (e: any) {
    dispatch(fetchSharedUsersFailure(folderId, e.message || "Failed to fetch shared folders."));
    dispatch(showSnackbar(e.message || "Failed to fetch shared folders.", "error"));
  }
}
