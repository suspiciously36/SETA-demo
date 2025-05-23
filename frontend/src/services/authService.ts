'use client'

import axios from 'axios';
import type { UserProfile, UserRole } from '../types/user.types.ts';
import apiClient from './apiClient.ts';

const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_API_ENDPOINT;
const REST_API_BASE_URL = import.meta.env.VITE_REST_API_BASE_URL; 

// --- GraphQL Related ---

interface LoginMutationVariables {
  email: string;
  password: string;
}

interface LoginResponseData {
  _login: {
    accessToken: string;
  };
}

interface RefreshTokenResponseData {
  _refreshToken: { 
    accessToken: string;
  };
}

interface GraphQLErrorDetail {
  message: string;
  // locations?: [{ line: number; column: number }];
  // path?: string[];
  // extensions?: any;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLErrorDetail[];
}

const checkEndpoints = () => {
  if (!GRAPHQL_ENDPOINT) {
    const msg = 'GraphQL endpoint is not configured. Please set VITE_GRAPHQL_API_ENDPOINT in your .env file.';
    console.error(msg);
    throw new Error(msg);
  }
  if (!REST_API_BASE_URL) {
    const msg = 'REST API base URL is not configured. Please set VITE_REST_API_BASE_URL in your .env file.';
    console.error(msg);
    throw new Error(msg);
  }
};


export const loginWithCredentials = async (variables: LoginMutationVariables): Promise<LoginResponseData['_login']> => {
  checkEndpoints();
  const query = `
    mutation Login {
      _login(input: { email: "${variables.email}", password: "${variables.password}" }) {
        accessToken
      }
    }
  `;

  try {
    const response = await axios.post<GraphQLResponse<LoginResponseData>>(GRAPHQL_ENDPOINT!, {
      query,
      variables,
    }, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    });

    if (response.data.errors && response.data.errors.length > 0) {
      const errorMessage = response.data.errors.map(err => err.message).join(', ');
      throw new Error(errorMessage);
    }
    if (!response.data.data?._login) {
      throw new Error('Login failed: No data returned from _login mutation.');
    }
    return response.data.data._login;
  } catch (error) {
    console.error('GraphQL Login Error:', error);
    if (axios.isAxiosError(error)) {
      const serverErrorMessage = (error.response?.data as any)?.errors?.[0]?.message || (error.response?.data as any)?.message;
      throw new Error(serverErrorMessage || error.message || 'An unknown network error occurred during login.');
    }
    if (error instanceof Error) throw error;
    throw new Error(String(error) || 'An unknown error occurred during login.');
  }
};

export const refreshAuthTokenService = async (): Promise<RefreshTokenResponseData['_refreshToken']> => {
  checkEndpoints();
  const mutation = `
    mutation RefreshUserToken {
      _refreshToken {
        accessToken
      }
    }
  `;
  try {
    const response = await axios.post<GraphQLResponse<RefreshTokenResponseData>>(GRAPHQL_ENDPOINT!, { 
      query: mutation,
    }, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    });

    if (response.data.errors && response.data.errors.length > 0) {
      const errorMessage = response.data.errors.map(err => err.message).join(', ');
      throw new Error(errorMessage);
    }
    if (!response.data.data?._refreshToken) {
      throw new Error('Refresh token failed: No data returned from mutation.');
    }
    return response.data.data._refreshToken;
  } catch (error) {
    console.error('GraphQL Refresh Token Error:', error);
     if (axios.isAxiosError(error)) {
      const serverErrorMessage = (error.response?.data as any)?.errors?.[0]?.message || (error.response?.data as any)?.message;
      throw new Error(serverErrorMessage || error.message || 'Failed to refresh token due to network error.');
    }
    if (error instanceof Error) throw error;
    throw new Error(String(error) || 'An unknown error occurred during token refresh.');
  }
};


// --- REST API Related ---

interface RawUserFromApi {
  id: string;
  username: string;
  email: string;
  role: string; 
}

const validUserRoles: UserRole[] = ['root', 'member', 'manager'];

export const getUserById = async (userId: string, token: string): Promise<UserProfile> => {
  checkEndpoints();
  try {
    const response = await apiClient.get<RawUserFromApi>(`${REST_API_BASE_URL}/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const rawUser = response.data;
    if (!rawUser || typeof rawUser.role !== 'string') {
        throw new Error('User data is invalid or role is missing/not a string.');
    }

    const receivedRole = rawUser.role.toLowerCase() as UserRole;

    if (!validUserRoles.includes(receivedRole)) {
      console.warn(`Invalid role received from API: "${rawUser.role}". Valid roles are: ${validUserRoles.join(', ')}.`);
      throw new Error(`Invalid user role received from API: "${rawUser.role}"`);
  }

    return {
      id: rawUser.id,
      username: rawUser.username,
      email: rawUser.email,
      role: receivedRole,
    };
  } catch (error) {
    console.error(`Error fetching user by ID ${userId}:`, error);
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401) throw new Error('Unauthorized: Invalid or expired token for fetching user details.');
      if (status === 403) throw new Error('Forbidden: You do not have permission to access this user.');
      if (status === 404) throw new Error('User not found.');
      const serverMessage = (error.response?.data as any)?.message;
      throw new Error(serverMessage || `Failed to fetch user data (status ${status}).`);
    }
    if (error instanceof Error) throw error;
    throw new Error(String(error) || 'An unknown error occurred while fetching user data.');
  }
};
