// src/services/apiClient.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import store from '../store'; // Your Redux store
import { attemptRefreshAuthToken, logoutUser } from '../store/actions/authActions';
import { RootState } from '../store';

const REST_API_BASE_URL = import.meta.env.VITE_REST_API_BASE_URL;

// Create an Axios instance
const apiClient = axios.create({
  baseURL: REST_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token to headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = (store.getState() as RootState).auth;
    
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
   
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest) {
        return Promise.reject(error);
    }
    

    // Check if it's a 401 error and not a retry request
    // AND that the failing request is not the GraphQL endpoint itself (if refresh calls also use this client, which they don't currently)
    // The check for `originalRequest.url !== '/graphql'` might be too simplistic if your GraphQL endpoint is different
    // or if your REST_API_BASE_URL already includes part of that path.
    // For now, let's assume your refresh token calls go to a different Axios instance or have a full URL.
    const isGraphQLEndpointForRefresh = originalRequest.url === (import.meta.env.VITE_GRAPHQL_API_ENDPOINT); // More robust check if refresh uses this client


    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await store.dispatch(attemptRefreshAuthToken() as any); // Dispatch thunk

        if (newAccessToken && typeof newAccessToken === 'string') {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        } else {
          processQueue(error, null);
          store.dispatch(logoutUser() as any);
          return Promise.reject(error);
        }
      } catch (refreshError: any) {
        processQueue(refreshError as AxiosError, null);
        store.dispatch(logoutUser() as any);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    } else if (error.response?.status === 401 && originalRequest._retry) {
       
        store.dispatch(logoutUser() as any);
        return Promise.reject(error);
    }


    return Promise.reject(error);
  }
);

export default apiClient;
