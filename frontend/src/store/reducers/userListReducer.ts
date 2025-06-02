import type { PaginatedUsersResponse } from '../../services/userService.ts';
import { DetailedUser } from '../../types/user.types';
import { FETCH_USERS_REQUEST, FETCH_USERS_SUCCESS, FETCH_USERS_FAILURE, CREATE_USER_REQUEST, CREATE_USER_SUCCESS, CREATE_USER_FAILURE, DELETE_USER_REQUEST, DELETE_USER_SUCCESS, DELETE_USER_FAILURE } from '../actions/actionTypes';
import type { PaginationInfo } from './teamReducer.ts';



export interface UserListState {
  users: DetailedUser[];
  loading: boolean;
  error: string | null;
  creatingUserLoading: boolean;
  creatingUserError: string | null;
  deletingUserLoading: Record<string, boolean>;
  deletingUserError: Record<string, string | null>;
 
  pagination: PaginationInfo | null;
}

const initialState: UserListState = {
  users: [],
  loading: false,
  error: null,
  creatingUserLoading: false,
  creatingUserError: null,
  deletingUserLoading: {},
  deletingUserError: {},

  pagination: null
};

interface FetchUsersRequestAction { type: typeof FETCH_USERS_REQUEST; }
interface FetchUsersSuccessAction { type: typeof FETCH_USERS_SUCCESS; payload: PaginatedUsersResponse; } 
interface FetchUsersFailureAction { type: typeof FETCH_USERS_FAILURE; payload: string; }

interface CreateUserRequestAction { type: typeof CREATE_USER_REQUEST; }
interface CreateUserSuccessAction { type: typeof CREATE_USER_SUCCESS; payload: DetailedUser; }
interface CreateUserFailureAction { type: typeof CREATE_USER_FAILURE; payload: string; }

interface DeleteUserRequestAction { type: typeof DELETE_USER_REQUEST; payload: { userId: string } }
interface DeleteUserSuccessAction { type: typeof DELETE_USER_SUCCESS; payload: { userId: string } }
interface DeleteUserFailureAction { type: typeof DELETE_USER_FAILURE; payload: { userId: string, error: string } }

export type UserListActionTypes = 
  | FetchUsersRequestAction
  | FetchUsersSuccessAction
  | FetchUsersFailureAction
  | CreateUserRequestAction
  | CreateUserSuccessAction
  | CreateUserFailureAction
  | DeleteUserRequestAction
  | DeleteUserSuccessAction
  | DeleteUserFailureAction

const userListReducer = (state: UserListState = initialState, action: UserListActionTypes): UserListState => {
            const newTotalRecords = state.pagination ? state.pagination.totalRecords - 1 : 0;
            const newLimit = state.pagination ? state.pagination.limit : 10; 
  switch (action.type) {
    
    //FETCH
    case FETCH_USERS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_USERS_SUCCESS:
      return {
        ...state,
        loading: false,
        users: action.payload.users, 
        pagination: action.payload.pagination,
        error: null,
      };
    case FETCH_USERS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        users: [], 
      };

    //CREATE
    case CREATE_USER_REQUEST:
        return { ...state, creatingUserLoading: true, creatingUserError: null };
    case CREATE_USER_SUCCESS:
        return {
          ...state,
          creatingUserLoading: false,
          creatingUserError: null,
        };
    case CREATE_USER_FAILURE:
        return { ...state, creatingUserLoading: false, creatingUserError: action.payload };

    //DELETE
    case DELETE_USER_REQUEST:
        return { ...state,
                deletingUserLoading: { ...state.deletingUserLoading, [action.payload.userId]: true},
                deletingUserError: {...state.deletingUserError, [action.payload.userId]: null } 
              }
    case DELETE_USER_SUCCESS:
        return { ...state,
                users: state.users.filter((u) => u.id !== action.payload.userId),
                pagination: state.pagination ? {
                  ...state.pagination,
                  totalRecords: newTotalRecords,
                  totalPages: Math.ceil(newTotalRecords / newLimit)
                } : null,
                deletingUserLoading: { ...state.deletingUserLoading, [action.payload.userId]: false },
              }
    case DELETE_USER_FAILURE:
        return { ...state,
                deletingUserLoading: { ...state.deletingUserLoading, [action.payload.userId]: false },
                deletingUserError: { ...state.deletingUserError, [action.payload.userId]: action.payload.error }
        }
    default:
      return state;
  }
};

export default userListReducer;
