import { CLEAR_REVOKE_ERROR_FOR_USER, CLEAR_SHARE_ERROR, FETCH_SHARED_USERS_FAILURE, FETCH_SHARED_USERS_REQUEST, FETCH_SHARED_USERS_SUCCESS, REVOKE_ACCESS_FAILURE, REVOKE_ACCESS_REQUEST, REVOKE_ACCESS_SUCCESS, SET_DIALOG_FOLDER_CONTEXT, SHARE_FOLDER_FAILURE, SHARE_FOLDER_REQUEST, SHARE_FOLDER_SUCCESS } from "../actions/actionTypes.ts";

export interface SharedUser {
  userIdToShareWith: string;
  accessLevel: 'read' | 'write';
}

export enum AccessLevel {
    READ = 'read',
    WRITE = 'write',
}

interface FolderSharingState {
  folderIdForDialog: string | null;
  sharedWith: SharedUser[];
  isLoadingSharedWith: boolean;
  loadSharedWithError: string | null;
  isSharing: boolean;
  shareError: string | null;
  revokingStatus: Record<string, { inProgress: boolean; error: string | null }>;
}

export const initialShareFolderState: FolderSharingState = {
  folderIdForDialog: null,
  sharedWith: [],
  isLoadingSharedWith: false,
  loadSharedWithError: null,
  isSharing: false,
  shareError: null,
  revokingStatus: {},
};

interface SetDialogFolderContextAction { type: typeof SET_DIALOG_FOLDER_CONTEXT; payload: string | null; }

interface FetchSharedUsersRequestAction { type: typeof FETCH_SHARED_USERS_REQUEST; payload: { folderId: string }; }
interface FetchSharedUsersSuccessAction { type: typeof FETCH_SHARED_USERS_SUCCESS; payload: { folderId: string, users: SharedUser[] }; }
interface FetchSharedUsersFailureAction { type: typeof FETCH_SHARED_USERS_FAILURE; payload: { folderId: string, error: string }; }

interface ShareFolderRequestAction { type: typeof SHARE_FOLDER_REQUEST; payload: { folderId: string }; }
interface ShareFolderSuccessAction { type: typeof SHARE_FOLDER_SUCCESS; payload: { folderId: string, userIdShared: string, accessLevel: AccessLevel }; }
interface ShareFolderFailureAction { type: typeof SHARE_FOLDER_FAILURE; payload: { folderId: string, error: string }; }
interface ClearShareErrorAction { type: typeof CLEAR_SHARE_ERROR; }

interface RevokeAccessRequestAction { type: typeof REVOKE_ACCESS_REQUEST; payload: { folderId: string, sharedUserId: string }; }
interface RevokeAccessSuccessAction { type: typeof REVOKE_ACCESS_SUCCESS; payload: { folderId: string, revokedUserId: string }; }
interface RevokeAccessFailureAction { type: typeof REVOKE_ACCESS_FAILURE; payload: { folderId: string, sharedUserId: string, error: string }; }
interface ClearRevokeErrorForUserAction { type: typeof CLEAR_REVOKE_ERROR_FOR_USER; payload: string; }

export type ShareFolderActionTypes =
    | ShareFolderRequestAction
    | ShareFolderSuccessAction
    | ShareFolderFailureAction
    | RevokeAccessRequestAction
    | RevokeAccessSuccessAction
    | RevokeAccessFailureAction
    | FetchSharedUsersRequestAction
    | FetchSharedUsersSuccessAction
    | FetchSharedUsersFailureAction
    | SetDialogFolderContextAction
    | ClearShareErrorAction
    | ClearRevokeErrorForUserAction;

const folderSharingReducer = (
  state = initialShareFolderState,
  action: ShareFolderActionTypes
): FolderSharingState => {
  switch (action.type) {
    case SET_DIALOG_FOLDER_CONTEXT:
      return {
        ...initialShareFolderState, // Reset most state when context changes or clears
        folderIdForDialog: action.payload,
        // Keep revokingStatus if needed across quick dialog re-opens, or clear it too:
        // revokingStatus: action.payload ? state.revokingStatus : {}
      };

    case FETCH_SHARED_USERS_REQUEST:
      if (state.folderIdForDialog === action.payload.folderId) {
        return { ...state, isLoadingSharedWith: true, loadSharedWithError: null };
      }
      return state;
    case FETCH_SHARED_USERS_SUCCESS:
      if (state.folderIdForDialog === action.payload.folderId) {
        return { ...state, isLoadingSharedWith: false, sharedWith: action.payload.users };
      }
      return state;
    case FETCH_SHARED_USERS_FAILURE:
      if (state.folderIdForDialog === action.payload.folderId) {
        return { ...state, isLoadingSharedWith: false, loadSharedWithError: action.payload.error };
      }
      return state;

    case SHARE_FOLDER_REQUEST:
      if (state.folderIdForDialog === action.payload.folderId) {
        return { ...state, isSharing: true, shareError: null };
      }
      return state;
    case SHARE_FOLDER_SUCCESS:
       if (state.folderIdForDialog === action.payload.folderId) {
        return { ...state, isSharing: false };
      }
      return state;
    case SHARE_FOLDER_FAILURE:
      if (state.folderIdForDialog === action.payload.folderId) {
        return { ...state, isSharing: false, shareError: action.payload.error };
      }
      return state;
    case CLEAR_SHARE_ERROR:
        return { ...state, shareError: null };

    case REVOKE_ACCESS_REQUEST:
      if (state.folderIdForDialog === action.payload.folderId) {
        return {
          ...state,
          revokingStatus: {
            ...state.revokingStatus,
            [action.payload.sharedUserId]: { inProgress: true, error: null },
          },
        };
      }
      return state;
    case REVOKE_ACCESS_SUCCESS:
      if (state.folderIdForDialog === action.payload.folderId) {
        const newRevokingStatus = { ...state.revokingStatus };
        delete newRevokingStatus[action.payload.revokedUserId];
        // List updated by re-fetch in thunk.
        return { ...state, revokingStatus: newRevokingStatus };
      }
      return state;
    case REVOKE_ACCESS_FAILURE:
      if (state.folderIdForDialog === action.payload.folderId) {
        return {
          ...state,
          revokingStatus: {
            ...state.revokingStatus,
            [action.payload.sharedUserId]: { inProgress: false, error: action.payload.error },
          },
        };
      }
      return state;
    case CLEAR_REVOKE_ERROR_FOR_USER:
        const userIdToClear = action.payload;
        if (state.revokingStatus[userIdToClear]) {
            return {
                ...state,
                revokingStatus: {
                    ...state.revokingStatus,
                    [userIdToClear]: { ...state.revokingStatus[userIdToClear], error: null },
                }
            };
        }
        return state;

    default:
      return state;
  }
};

export default folderSharingReducer;
