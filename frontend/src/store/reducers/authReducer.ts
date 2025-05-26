import type { UserProfile } from '../../types/user.types.ts';
import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, REFRESH_TOKEN_SUCCESS } from '../actions/actionTypes';

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: UserProfile | null; 
  loading: boolean;
  error: string | null;
}

const initialAccessToken = localStorage.getItem('accessToken');

let initialUser: UserProfile | null = null;
const storedUser = localStorage.getItem('user');
if (storedUser) {
  try {
    initialUser = JSON.parse(storedUser);
  } catch (error) {
    console.error('Failed to parse user from localStorage:', error);
    localStorage.removeItem('user');
  }
}

const initialState: AuthState = {
  isAuthenticated: !!initialAccessToken,
  accessToken: initialAccessToken,
  user: initialUser,
  loading: false,
  error: null,
};

 // Define action interfaces
 interface LoginRequestAction { type: typeof LOGIN_REQUEST; }
 interface LoginSuccessAction { type: typeof LOGIN_SUCCESS; payload: { accessToken: string; user: UserProfile }; } 
 interface LoginFailureAction { type: typeof LOGIN_FAILURE; payload: string; }
 interface RefreshTokenSuccessAction { type: typeof REFRESH_TOKEN_SUCCESS; payload: { accessToken: string }; }
 interface LogoutAction { type: typeof LOGOUT; }
 
 export type AuthActionTypes = 
   | LoginRequestAction 
   | LoginSuccessAction 
   | LoginFailureAction
   | RefreshTokenSuccessAction
   | LogoutAction;
 
 const authReducer = (state: AuthState = initialState, action: AuthActionTypes): AuthState => {
   switch (action.type) {
     case LOGIN_REQUEST:
       return { ...state, loading: true, error: null };
     case LOGIN_SUCCESS:
       localStorage.setItem('accessToken', action.payload.accessToken);
       localStorage.setItem('user', JSON.stringify(action.payload.user))
       return { ...state, loading: false, isAuthenticated: true, accessToken: action.payload.accessToken,
         user: action.payload.user || null, error: null };
     case LOGIN_FAILURE:
       localStorage.removeItem('accessToken');
       localStorage.removeItem('user');
       return { ...state, loading: false, isAuthenticated: false, error: action.payload, accessToken: null, user: null };
     case REFRESH_TOKEN_SUCCESS:
         localStorage.setItem('accessToken', action.payload.accessToken);
         return { ...state, isAuthenticated: true, accessToken: action.payload.accessToken };
     case LOGOUT:
       localStorage.removeItem('accessToken');
       localStorage.removeItem('user');
       return { ...state, isAuthenticated: false, accessToken: null, user: null, loading: false, error: null };
     default:
       return state;
   }
 };
 
 export default authReducer;
