import { jwtDecode } from 'jwt-decode';
import { loginWithCredentials, getUserById, refreshAuthTokenService } from '../../services/authService';
import { UserProfile, UserRole } from '../../types/user.types';
import { AppThunk, AppDispatch, type RootState } from '../index'; // Assuming RootState, AppDispatch, AppThunk are exported from store/index.ts
import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, REFRESH_TOKEN_SUCCESS } from './actionTypes';

interface DecodedToken {
  sub: string; 
  exp: number;
  iat: number;
}

// Action Creators
export const loginRequest = () => ({ type: LOGIN_REQUEST } as const);

export const loginSuccess = (
    accessToken: string, 
    user: UserProfile
) => ({
  type: LOGIN_SUCCESS,
  payload: { accessToken, user },
} as const);

export const loginFailure = (error: string) => ({
  type: LOGIN_FAILURE,
  payload: error,
} as const);

export const logoutUserAction = () => ({ type: LOGOUT } as const);

export const refreshTokenSuccess = (accessToken: string, newRefreshToken?: string) => ({
    type: REFRESH_TOKEN_SUCCESS,
    payload: { accessToken, refreshToken: newRefreshToken }
} as const);


// Thunk Action for Login
export const loginUser = (
  loginData: Parameters<typeof loginWithCredentials>[0]
): AppThunk => async (dispatch: AppDispatch, getState) => {
  dispatch(loginRequest());
  try {
    const { accessToken } = await loginWithCredentials(loginData);

    const decodedToken = jwtDecode<DecodedToken>(accessToken);
    const userId = decodedToken.sub; 
    if (!userId) {
        throw new Error('User ID not found in token.');
    }

    const userProfile = await getUserById(userId, accessToken);

    dispatch(loginSuccess(accessToken, userProfile));
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown login error occurred.';
    dispatch(loginFailure(errorMessage));
    throw error; // Re-throw to allow component to catch if needed
  }
};

export const logoutUser = (): AppThunk => (dispatch: AppDispatch) => {
  dispatch(logoutUserAction());
};
// Thunk Action for Refreshing Token
// This would typically be called by an API interceptor when a 401 is received.
export const attemptRefreshAuthToken = (): AppThunk<Promise<string | null>> => async (dispatch: AppDispatch, getState) => {
  try {
      const { accessToken: newAccessToken } = await refreshAuthTokenService();
      
      dispatch(refreshTokenSuccess(newAccessToken));
      return newAccessToken; 
  } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh token.';
      dispatch(loginFailure(errorMessage)); 
      dispatch(logoutUser()); // Force logout if refresh fails critically
      return null; // Indicate failure
  }
};
