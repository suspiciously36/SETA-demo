import { getAllUsers as fetchUsersService, createNewUser as createUserService, deleteUserById as deleteUserService, type PaginatedUsersResponse } from '../../services/userService';
import { DetailedUser, type CreateUserDto } from '../../types/user.types';
import { AppThunk, AppDispatch } from '../index';
import { FETCH_USERS_REQUEST, FETCH_USERS_SUCCESS, FETCH_USERS_FAILURE, CREATE_USER_REQUEST, CREATE_USER_SUCCESS, CREATE_USER_FAILURE, DELETE_USER_REQUEST, DELETE_USER_SUCCESS, DELETE_USER_FAILURE } from './actionTypes';

// Action Creators
export const fetchUsersRequest = () => ({
  type: FETCH_USERS_REQUEST,
} as const);

export const fetchUsersSuccess = (data: PaginatedUsersResponse) => ({
  type: FETCH_USERS_SUCCESS,
  payload: {users: data.data, pagination: data.pagination},
} as const);

export const fetchUsersFailure = (error: string) => ({
  type: FETCH_USERS_FAILURE,
  payload: error,
} as const);

export const createUserRequest = () => ({
  type: CREATE_USER_REQUEST,
} as const);

export const createUserSuccess = (user: DetailedUser) => ({
  type: CREATE_USER_SUCCESS,
  payload: user,
} as const);

export const createUserFailure = (error: string) => ({
  type: CREATE_USER_FAILURE,
  payload: error,
} as const);

export const deleteUserRequest = (userId: string) => ({
  type: DELETE_USER_REQUEST,
  payload: { userId }
} as const);

export const deleteUserSuccess = (userId: string) => ({
  type: DELETE_USER_SUCCESS,
  payload: { userId }
} as const)

export const deleteUserFailure = (userId: string, error: string) => ({
  type: DELETE_USER_FAILURE,
  payload: {userId, error}
} as const)

// Thunk Action for Fetching Users
export const fetchUsers = (page: number = 1, limit: number = 10): AppThunk => async (dispatch: AppDispatch) => {
  dispatch(fetchUsersRequest());
  try {
    const users = await fetchUsersService(page, limit);
    dispatch(fetchUsersSuccess(users));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while fetching users.';
    dispatch(fetchUsersFailure(errorMessage));
  }
};

export const submitNewUser = (userData: CreateUserDto): AppThunk<Promise<DetailedUser | void>> => async (dispatch: AppDispatch) => {
  dispatch(createUserRequest());
  try {
    const newUser = await createUserService(userData);
    dispatch(createUserSuccess(newUser));
    return newUser
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while creating users.';
    dispatch(createUserFailure(errorMessage));
    throw error
  }
};

export const deleteUser = (userId: string, currentPage: number, currentLimit: number): AppThunk<Promise<void>> => async (dispatch: AppDispatch) => {
  dispatch(deleteUserRequest(userId));
  try {
    await deleteUserService(userId);
    dispatch(deleteUserSuccess(userId));
    dispatch(fetchUsers(currentPage, currentLimit));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while deleting user.';
    dispatch(deleteUserFailure(userId, errorMessage));
    throw error
  }
}
